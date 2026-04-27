import type { AgentSession, SessionInfo } from "@mariozechner/pi-coding-agent";
import type { PiRuntime } from "./runtime.js";
import { createPiSession, continueRecentPiSession, openPiSession, listPiSessions } from "./runtime.js";
import {
  getDataDir,
  readUserState,
  writeUserState,
  createUserState,
  touchUserState,
  userSessionsDir,
  type UserStateStore,
} from "../storage/users.js";
import {
  createConversationStateStore,
  type ConversationStateStore,
} from "../storage/conversations.js";
import { logger } from "../app/logger.js";
import { ensureConversationWorkspace, ensureUserWorkspace, type WorkspaceService } from "./workspace.js";
import { bindWorkspaceIdentity, clearWorkspaceIdentities } from "./workspace-identity.js";
import type { ThinkingLevel, UserIdentity, UserState } from "../types.js";
import type { ConversationTarget } from "../conversation.js";
import { getConversationTargetKey } from "../conversation.js";

interface SessionResult {
  activeSessionId: string;
  piSession: AgentSession;
}

const TOOLS_CONFIG_ENTRY_TYPE = "tools-config";
const defaultToolNamesBySession = new WeakMap<AgentSession, string[]>();

export interface ListedSession {
  order: number;
  sessionId: string;
  sessionFile: string;
  isActive: boolean;
  cwd?: string;
  name?: string;
  firstMessage?: string;
  messageCount: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface SessionService {
  getOrCreateActiveSession(identity: UserIdentity): Promise<SessionResult>;
  getOrCreateActiveSessionForTarget(identity: UserIdentity, target: ConversationTarget): Promise<SessionResult>;
  createNewSession(identity: UserIdentity): Promise<SessionResult>;
  createNewSessionForTarget(identity: UserIdentity, target: ConversationTarget): Promise<SessionResult>;
  listSessions(identity: UserIdentity): Promise<ListedSession[]>;
  listSessionsForTarget(identity: UserIdentity, target: ConversationTarget): Promise<ListedSession[]>;
  resumeSession(identity: UserIdentity, ref: string): Promise<SessionResult>;
  resumeSessionForTarget(identity: UserIdentity, target: ConversationTarget, ref: string): Promise<SessionResult>;
  readSessionState(identity: UserIdentity, target?: ConversationTarget): Promise<UserState | null>;
  writeSessionState(identity: UserIdentity, target: ConversationTarget | undefined, state: UserState): Promise<void>;
  touchSession(openId: string, messageId: string): Promise<void>;
  touchSessionForTarget(identity: UserIdentity, target: ConversationTarget, messageId: string): Promise<void>;
  disposeAllSessions(): void;
}

interface SessionServiceDeps {
  runtime: Pick<PiRuntime, "createPiSession" | "listPiSessions" | "continueRecentPiSession" | "openPiSession">;
  userStateStore: Pick<
    UserStateStore,
    "readUserState" | "writeUserState" | "createUserState" | "touchUserState" | "userSessionsDir"
  >;
  conversationStateStore?: Pick<
    ConversationStateStore,
    | "readConversationState"
    | "writeConversationState"
    | "createConversationState"
    | "touchConversationState"
    | "conversationSessionsDir"
  >;
  workspaceService: Pick<WorkspaceService, "ensureUserWorkspace" | "ensureConversationWorkspace">;
}

interface SessionScope {
  key: string;
  cacheKey: string;
  kind: ConversationTarget["kind"];
  readState(): Promise<UserState | null>;
  writeState(state: UserState): Promise<void>;
  createState(sessionId: string): Promise<UserState>;
  touchState(messageId: string): Promise<void>;
  sessionsDir(): string;
  ensureWorkspace(): Promise<string>;
}

export function createSessionService(deps: SessionServiceDeps): SessionService {
  /** 内存中缓存的 Pi session 实例（conversation key -> session） */
  const sessionCache = new Map<string, AgentSession>();

  async function ensureWorkspaceForIdentity(identity: UserIdentity): Promise<string> {
    const workspaceDir = await deps.workspaceService.ensureUserWorkspace(identity);
    bindWorkspaceIdentity(workspaceDir, identity);
    return workspaceDir;
  }

  async function ensureWorkspaceForTarget(identity: UserIdentity, target: ConversationTarget): Promise<string> {
    const workspaceDir = await deps.workspaceService.ensureConversationWorkspace(identity, target);
    bindWorkspaceIdentity(workspaceDir, identity);
    return workspaceDir;
  }

  function resolveScope(identity: UserIdentity, target?: ConversationTarget): SessionScope {
    if (!target || target.kind === "p2p") {
      const openId = identity.openId;
      return {
        key: openId,
        cacheKey: openId,
        kind: "p2p",
        readState: () => deps.userStateStore.readUserState(openId),
        writeState: (state) => deps.userStateStore.writeUserState(openId, state),
        createState: (sessionId) => deps.userStateStore.createUserState(openId, sessionId),
        touchState: (messageId) => deps.userStateStore.touchUserState(openId, messageId),
        sessionsDir: () => deps.userStateStore.userSessionsDir(openId),
        ensureWorkspace: () => ensureWorkspaceForIdentity(identity),
      };
    }

    const conversationStateStore = deps.conversationStateStore;
    if (!conversationStateStore) {
      throw new Error("CONVERSATION_STATE_STORE_REQUIRED");
    }

    const conversationKey = getConversationTargetKey(target, identity.openId);
    return {
      key: conversationKey,
      cacheKey: conversationKey,
      kind: target.kind,
      readState: () => conversationStateStore.readConversationState(conversationKey),
      writeState: (state) => conversationStateStore.writeConversationState(conversationKey, state),
      createState: (sessionId) => conversationStateStore.createConversationState(conversationKey, sessionId),
      touchState: (messageId) => conversationStateStore.touchConversationState(conversationKey, messageId),
      sessionsDir: () => conversationStateStore.conversationSessionsDir(conversationKey),
      ensureWorkspace: () => ensureWorkspaceForTarget(identity, target),
    };
  }

  async function getOrCreateActiveSession(identity: UserIdentity): Promise<SessionResult> {
    return getOrCreateActiveSessionForTargetInternal(identity);
  }

  async function getOrCreateActiveSessionForTarget(
    identity: UserIdentity,
    target: ConversationTarget,
  ): Promise<SessionResult> {
    return getOrCreateActiveSessionForTargetInternal(identity, target);
  }

  async function getOrCreateActiveSessionForTargetInternal(
    identity: UserIdentity,
    target?: ConversationTarget,
  ): Promise<SessionResult> {
    const scope = resolveScope(identity, target);

    const cached = sessionCache.get(scope.cacheKey);
    if (cached) {
      const state = await scope.readState();
      return {
        activeSessionId: state?.activeSessionId ?? "unknown",
        piSession: cached,
      };
    }

    const state = await scope.readState();
    if (state?.activeSessionId && state.piSessionFile) {
      try {
        const workspaceDir = await scope.ensureWorkspace();
        const session = await deps.runtime.openPiSession(state.piSessionFile, workspaceDir);
        applySavedToolSelection(session);
        applyUserPreferences(session, state?.thinkingLevel);
        const activeSessionId = session.sessionId;
        sessionCache.set(scope.cacheKey, session);
        if (state.activeSessionId !== activeSessionId || state.piSessionFile !== session.sessionFile) {
          state.activeSessionId = activeSessionId;
          state.piSessionFile = session.sessionFile ?? undefined;
          state.updatedAt = new Date().toISOString();
          await scope.writeState(state);
        }
        logger.info("Pi session 从指定文件恢复", {
          sessionScope: scope.key,
          scopeKind: scope.kind,
          sessionId: activeSessionId,
          sessionFile: session.sessionFile ?? state.piSessionFile,
        });
        return { activeSessionId, piSession: session };
      } catch (err) {
        logger.warn("Pi session 指定文件恢复失败，尝试最近会话兜底", {
          sessionScope: scope.key,
          scopeKind: scope.kind,
          sessionFile: state.piSessionFile,
          error: String(err),
        });
      }
    }

    if (state?.activeSessionId) {
      try {
        const sessionDir = scope.sessionsDir();
        const workspaceDir = await scope.ensureWorkspace();
        const result = await deps.runtime.continueRecentPiSession(workspaceDir, sessionDir);
        if (result) {
          applySavedToolSelection(result.session);
          applyUserPreferences(result.session, state?.thinkingLevel);
          const activeSessionId = result.session.sessionId;
          sessionCache.set(scope.cacheKey, result.session);
          state.activeSessionId = activeSessionId;
          state.piSessionFile = result.session.sessionFile ?? undefined;
          await scope.writeState(state);
          logger.info("Pi session 从用户目录最近会话恢复", {
            sessionScope: scope.key,
            scopeKind: scope.kind,
            sessionId: activeSessionId,
            sessionFile: result.session.sessionFile,
          });
          return { activeSessionId, piSession: result.session };
        }
      } catch (err) {
        logger.warn("Pi session 用户目录恢复失败，将创建新 session", {
          sessionScope: scope.key,
          scopeKind: scope.kind,
          error: String(err),
        });
      }
    }

    return doCreateNewSession(identity, scope);
  }

  async function createNewSession(identity: UserIdentity): Promise<SessionResult> {
    return createNewSessionForTargetInternal(identity);
  }

  async function createNewSessionForTarget(
    identity: UserIdentity,
    target: ConversationTarget,
  ): Promise<SessionResult> {
    return createNewSessionForTargetInternal(identity, target);
  }

  async function createNewSessionForTargetInternal(
    identity: UserIdentity,
    target?: ConversationTarget,
  ): Promise<SessionResult> {
    const scope = resolveScope(identity, target);
    disposeCachedSession(scope.cacheKey);
    return doCreateNewSession(identity, scope);
  }

  async function doCreateNewSession(identity: UserIdentity, scope: SessionScope): Promise<SessionResult> {
    const sessionDir = scope.sessionsDir();
    const workspaceDir = await scope.ensureWorkspace();
    const piSession = await deps.runtime.createPiSession(workspaceDir, sessionDir);
    const existing = await scope.readState();
    applySavedToolSelection(piSession);
    applyUserPreferences(piSession, existing?.thinkingLevel);
    const newSessionId = piSession.sessionId;
    if (existing) {
      existing.activeSessionId = newSessionId;
      existing.piSessionFile = piSession.sessionFile ?? undefined;
      existing.updatedAt = new Date().toISOString();
      existing.lastActiveAt = new Date().toISOString();
      await scope.writeState(existing);
    } else {
      const state = await scope.createState(newSessionId);
      state.piSessionFile = piSession.sessionFile ?? undefined;
      await scope.writeState(state);
    }

    sessionCache.set(scope.cacheKey, piSession);
    logger.info("新 session 已创建", {
      sessionScope: scope.key,
      scopeKind: scope.kind,
      openId: identity.openId,
      userId: identity.userId,
      sessionId: newSessionId,
      workspaceDir,
    });
    return { activeSessionId: newSessionId, piSession };
  }

  async function listSessions(identity: UserIdentity): Promise<ListedSession[]> {
    return listSessionsForTargetInternal(identity);
  }

  async function listSessionsForTarget(
    identity: UserIdentity,
    target: ConversationTarget,
  ): Promise<ListedSession[]> {
    return listSessionsForTargetInternal(identity, target);
  }

  async function listSessionsForTargetInternal(
    identity: UserIdentity,
    target?: ConversationTarget,
  ): Promise<ListedSession[]> {
    const scope = resolveScope(identity, target);
    const workspaceDir = await scope.ensureWorkspace();
    const sessionDir = scope.sessionsDir();
    const listed = await deps.runtime.listPiSessions(workspaceDir, sessionDir);
    const state = await scope.readState();

    return listed.map((session, index) => ({
      order: index + 1,
      sessionId: session.id,
      sessionFile: session.path,
      isActive: state?.activeSessionId === session.id || state?.piSessionFile === session.path,
      cwd: session.cwd || undefined,
      name: session.name || undefined,
      firstMessage: session.firstMessage || undefined,
      messageCount: session.messageCount,
      createdAt: session.created?.toISOString(),
      updatedAt: session.modified?.toISOString(),
    }));
  }

  async function resumeSession(identity: UserIdentity, ref: string): Promise<SessionResult> {
    return resumeSessionForTargetInternal(identity, undefined, ref);
  }

  async function resumeSessionForTarget(
    identity: UserIdentity,
    target: ConversationTarget,
    ref: string,
  ): Promise<SessionResult> {
    return resumeSessionForTargetInternal(identity, target, ref);
  }

  async function resumeSessionForTargetInternal(
    identity: UserIdentity,
    target: ConversationTarget | undefined,
    ref: string,
  ): Promise<SessionResult> {
    const scope = resolveScope(identity, target);
    const normalizedRef = ref.trim();
    if (!normalizedRef) {
      throw new Error("RESUME_REF_REQUIRED");
    }

    const sessions = await listSessionsForTargetInternal(identity, target);
    const targetSession = resolveTargetSession(sessions, normalizedRef);
    if (!targetSession) {
      throw new Error("RESUME_SESSION_NOT_FOUND");
    }

    const workspaceDir = await scope.ensureWorkspace();
    disposeCachedSession(scope.cacheKey);

    const piSession = await deps.runtime.openPiSession(targetSession.sessionFile, workspaceDir);
    const state = await scope.readState();
    applySavedToolSelection(piSession);
    applyUserPreferences(piSession, state?.thinkingLevel);
    const activeSessionId = piSession.sessionId;
    sessionCache.set(scope.cacheKey, piSession);

    const now = new Date().toISOString();
    if (state) {
      state.activeSessionId = activeSessionId;
      state.piSessionFile = piSession.sessionFile ?? targetSession.sessionFile;
      state.updatedAt = now;
      state.lastActiveAt = now;
      await scope.writeState(state);
    } else {
      const created = await scope.createState(activeSessionId);
      created.piSessionFile = piSession.sessionFile ?? targetSession.sessionFile;
      created.updatedAt = now;
      created.lastActiveAt = now;
      await scope.writeState(created);
    }

    logger.info("Pi session 已切换到历史会话", {
      sessionScope: scope.key,
      scopeKind: scope.kind,
      sessionId: activeSessionId,
      sessionFile: piSession.sessionFile ?? targetSession.sessionFile,
    });
    return {
      activeSessionId,
      piSession,
    };
  }

  async function touchSession(openId: string, messageId: string): Promise<void> {
    await deps.userStateStore.touchUserState(openId, messageId);
  }

  async function readSessionState(identity: UserIdentity, target?: ConversationTarget): Promise<UserState | null> {
    const scope = resolveScope(identity, target);
    return scope.readState();
  }

  async function writeSessionState(
    identity: UserIdentity,
    target: ConversationTarget | undefined,
    state: UserState,
  ): Promise<void> {
    const scope = resolveScope(identity, target);
    await scope.writeState(state);
  }

  async function touchSessionForTarget(
    identity: UserIdentity,
    target: ConversationTarget,
    messageId: string,
  ): Promise<void> {
    const scope = resolveScope(identity, target);
    await scope.touchState(messageId);
  }

  function disposeCachedSession(cacheKey: string): void {
    const oldSession = sessionCache.get(cacheKey);
    if (!oldSession) {
      return;
    }

    try {
      oldSession.dispose();
    } catch {
      // 忽略 dispose 错误
    }
    sessionCache.delete(cacheKey);
  }

  function disposeAllSessions(): void {
    for (const [, session] of sessionCache) {
      try {
        session.dispose();
      } catch {
        // 忽略
      }
    }
    sessionCache.clear();
    clearWorkspaceIdentities();
    logger.info("所有 Pi session 已清理");
  }

  return {
    getOrCreateActiveSession,
    getOrCreateActiveSessionForTarget,
    createNewSession,
    createNewSessionForTarget,
    listSessions,
    listSessionsForTarget,
    resumeSession,
    resumeSessionForTarget,
    readSessionState,
    writeSessionState,
    touchSession,
    touchSessionForTarget,
    disposeAllSessions,
  };
}

function applyUserPreferences(
  session: AgentSession,
  thinkingLevel?: ThinkingLevel,
): void {
  if (!thinkingLevel || typeof session.setThinkingLevel !== "function") {
    return;
  }

  session.setThinkingLevel(thinkingLevel);
}

function resolveTargetSession(sessions: ListedSession[], ref: string): ListedSession | null {
  if (/^\d+$/.test(ref)) {
    const order = Number(ref);
    return sessions.find((session) => session.order === order) ?? null;
  }

  const exact = sessions.find((session) => session.sessionId === ref);
  if (exact) {
    return exact;
  }

  const matches = sessions.filter((session) => session.sessionId.startsWith(ref));
  if (matches.length === 1) {
    return matches[0];
  }

  return null;
}

function getDefaultSessionService(): SessionService {
  return createSessionService({
    runtime: {
      createPiSession: (...args) => createPiSession(...args),
      listPiSessions: (...args) => listPiSessions(...args),
      continueRecentPiSession: (...args) => continueRecentPiSession(...args),
      openPiSession: (...args) => openPiSession(...args),
    },
    userStateStore: {
      readUserState: (...args) => readUserState(...args),
      writeUserState: (...args) => writeUserState(...args),
      createUserState: (...args) => createUserState(...args),
      touchUserState: (...args) => touchUserState(...args),
      userSessionsDir: (...args) => userSessionsDir(...args),
    },
    conversationStateStore: createConversationStateStore(getDataDir()),
    workspaceService: {
      ensureUserWorkspace: (...args) => ensureUserWorkspace(...args),
      ensureConversationWorkspace: (...args) => ensureConversationWorkspace(...args),
    },
  });
}

let defaultSessionService: SessionService | null = null;

function ensureDefaultSessionService(): SessionService {
  if (!defaultSessionService) {
    defaultSessionService = getDefaultSessionService();
  }
  return defaultSessionService;
}

export async function getOrCreateActiveSession(identity: UserIdentity): Promise<SessionResult> {
  return ensureDefaultSessionService().getOrCreateActiveSession(identity);
}

export async function getOrCreateActiveSessionForTarget(
  identity: UserIdentity,
  target: ConversationTarget,
): Promise<SessionResult> {
  return ensureDefaultSessionService().getOrCreateActiveSessionForTarget(identity, target);
}

export async function createNewSession(identity: UserIdentity): Promise<SessionResult> {
  return ensureDefaultSessionService().createNewSession(identity);
}

export async function createNewSessionForTarget(
  identity: UserIdentity,
  target: ConversationTarget,
): Promise<SessionResult> {
  return ensureDefaultSessionService().createNewSessionForTarget(identity, target);
}

export async function listSessions(identity: UserIdentity): Promise<ListedSession[]> {
  return ensureDefaultSessionService().listSessions(identity);
}

export async function listSessionsForTarget(
  identity: UserIdentity,
  target: ConversationTarget,
): Promise<ListedSession[]> {
  return ensureDefaultSessionService().listSessionsForTarget(identity, target);
}

export async function resumeSession(identity: UserIdentity, ref: string): Promise<SessionResult> {
  return ensureDefaultSessionService().resumeSession(identity, ref);
}

export async function resumeSessionForTarget(
  identity: UserIdentity,
  target: ConversationTarget,
  ref: string,
): Promise<SessionResult> {
  return ensureDefaultSessionService().resumeSessionForTarget(identity, target, ref);
}

export async function readSessionState(
  identity: UserIdentity,
  target?: ConversationTarget,
): Promise<UserState | null> {
  return ensureDefaultSessionService().readSessionState(identity, target);
}

export async function writeSessionState(
  identity: UserIdentity,
  target: ConversationTarget | undefined,
  state: UserState,
): Promise<void> {
  return ensureDefaultSessionService().writeSessionState(identity, target, state);
}

export async function touchSession(openId: string, messageId: string): Promise<void> {
  return ensureDefaultSessionService().touchSession(openId, messageId);
}

export async function touchSessionForTarget(
  identity: UserIdentity,
  target: ConversationTarget,
  messageId: string,
): Promise<void> {
  return ensureDefaultSessionService().touchSessionForTarget(identity, target, messageId);
}

export function disposeAllSessions(): void {
  ensureDefaultSessionService().disposeAllSessions();
}

export function getSessionDefaultToolNames(session: AgentSession): string[] {
  if (typeof session.getActiveToolNames !== "function") {
    return [];
  }
  return [...(defaultToolNamesBySession.get(session) ?? session.getActiveToolNames())];
}

export function persistSessionToolSelection(session: AgentSession): void {
  if (typeof session.getActiveToolNames !== "function" || typeof session.sessionManager?.appendCustomEntry !== "function") {
    return;
  }
  session.sessionManager.appendCustomEntry(TOOLS_CONFIG_ENTRY_TYPE, {
    enabledTools: session.getActiveToolNames(),
  });
}

function applySavedToolSelection(session: AgentSession): void {
  if (
    typeof session.getActiveToolNames !== "function"
    || typeof session.getAllTools !== "function"
    || typeof session.sessionManager?.getBranch !== "function"
    || typeof session.setActiveToolsByName !== "function"
  ) {
    return;
  }

  if (!defaultToolNamesBySession.has(session)) {
    defaultToolNamesBySession.set(session, [...session.getActiveToolNames()]);
  }

  const allToolNames = new Set(session.getAllTools().map((tool) => tool.name));
  let savedTools: string[] | undefined;

  for (const entry of session.sessionManager.getBranch()) {
    if (entry.type !== "custom" || entry.customType !== TOOLS_CONFIG_ENTRY_TYPE) {
      continue;
    }

    const enabledTools = entry.data && typeof entry.data === "object" ? (entry.data as { enabledTools?: unknown }).enabledTools : undefined;
    if (Array.isArray(enabledTools)) {
      savedTools = enabledTools.filter((tool): tool is string => typeof tool === "string");
    }
  }

  if (!savedTools) {
    return;
  }

  session.setActiveToolsByName(savedTools.filter((tool) => allToolNames.has(tool)));
}
