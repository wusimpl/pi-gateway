import type { AgentSession, SessionInfo } from "@mariozechner/pi-coding-agent";
import type { PiRuntime } from "./runtime.js";
import { createPiSession, continueRecentPiSession, openPiSession, listPiSessions } from "./runtime.js";
import {
  readUserState,
  writeUserState,
  createUserState,
  touchUserState,
  userSessionsDir,
  type UserStateStore,
} from "../storage/users.js";
import { logger } from "../app/logger.js";
import { ensureUserWorkspace, type WorkspaceService } from "./workspace.js";
import { bindWorkspaceIdentity, clearWorkspaceIdentities } from "./workspace-identity.js";
import type { UserIdentity } from "../types.js";

interface SessionResult {
  activeSessionId: string;
  piSession: AgentSession;
}

export interface ListedSession {
  order: number;
  sessionId: string;
  sessionFile: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SessionService {
  getOrCreateActiveSession(identity: UserIdentity): Promise<SessionResult>;
  createNewSession(identity: UserIdentity): Promise<SessionResult>;
  listSessions(identity: UserIdentity): Promise<ListedSession[]>;
  resumeSession(identity: UserIdentity, ref: string): Promise<SessionResult>;
  touchSession(openId: string, messageId: string): Promise<void>;
  disposeAllSessions(): void;
}

interface SessionServiceDeps {
  runtime: Pick<PiRuntime, "createPiSession" | "listPiSessions" | "continueRecentPiSession" | "openPiSession">;
  userStateStore: Pick<
    UserStateStore,
    "readUserState" | "writeUserState" | "createUserState" | "touchUserState" | "userSessionsDir"
  >;
  workspaceService: Pick<WorkspaceService, "ensureUserWorkspace">;
}

export function createSessionService(deps: SessionServiceDeps): SessionService {
  /** 内存中缓存的 Pi session 实例（open_id -> session） */
  const sessionCache = new Map<string, AgentSession>();

  async function ensureWorkspaceForIdentity(identity: UserIdentity): Promise<string> {
    const workspaceDir = await deps.workspaceService.ensureUserWorkspace(identity);
    bindWorkspaceIdentity(workspaceDir, identity);
    return workspaceDir;
  }

  async function getOrCreateActiveSession(identity: UserIdentity): Promise<SessionResult> {
    const openId = identity.openId;

    const cached = sessionCache.get(openId);
    if (cached) {
      const state = await deps.userStateStore.readUserState(openId);
      return {
        activeSessionId: state?.activeSessionId ?? "unknown",
        piSession: cached,
      };
    }

    const state = await deps.userStateStore.readUserState(openId);
    if (state?.activeSessionId && state.piSessionFile) {
      try {
        const workspaceDir = await ensureWorkspaceForIdentity(identity);
        const session = await deps.runtime.openPiSession(state.piSessionFile, workspaceDir);
        const activeSessionId = session.sessionId;
        sessionCache.set(openId, session);
        if (state.activeSessionId !== activeSessionId || state.piSessionFile !== session.sessionFile) {
          state.activeSessionId = activeSessionId;
          state.piSessionFile = session.sessionFile ?? undefined;
          state.updatedAt = new Date().toISOString();
          await deps.userStateStore.writeUserState(openId, state);
        }
        logger.info("Pi session 从指定文件恢复", {
          openId,
          sessionId: activeSessionId,
          sessionFile: session.sessionFile ?? state.piSessionFile,
        });
        return { activeSessionId, piSession: session };
      } catch (err) {
        logger.warn("Pi session 指定文件恢复失败，尝试最近会话兜底", {
          openId,
          sessionFile: state.piSessionFile,
          error: String(err),
        });
      }
    }

    if (state?.activeSessionId) {
      try {
        const sessionDir = deps.userStateStore.userSessionsDir(openId);
        const workspaceDir = await ensureWorkspaceForIdentity(identity);
        const result = await deps.runtime.continueRecentPiSession(workspaceDir, sessionDir);
        if (result) {
          const activeSessionId = result.session.sessionId;
          sessionCache.set(openId, result.session);
          state.activeSessionId = activeSessionId;
          state.piSessionFile = result.session.sessionFile ?? undefined;
          await deps.userStateStore.writeUserState(openId, state);
          logger.info("Pi session 从用户目录最近会话恢复", {
            openId,
            sessionId: activeSessionId,
            sessionFile: result.session.sessionFile,
          });
          return { activeSessionId, piSession: result.session };
        }
      } catch (err) {
        logger.warn("Pi session 用户目录恢复失败，将创建新 session", { openId, error: String(err) });
      }
    }

    return doCreateNewSession(identity);
  }

  async function createNewSession(identity: UserIdentity): Promise<SessionResult> {
    const openId = identity.openId;

    disposeCachedSession(openId);

    return doCreateNewSession(identity);
  }

  async function doCreateNewSession(identity: UserIdentity): Promise<SessionResult> {
    const openId = identity.openId;
    const sessionDir = deps.userStateStore.userSessionsDir(openId);
    const workspaceDir = await ensureWorkspaceForIdentity(identity);
    const piSession = await deps.runtime.createPiSession(workspaceDir, sessionDir);
    const newSessionId = piSession.sessionId;

    const existing = await deps.userStateStore.readUserState(openId);
    if (existing) {
      existing.activeSessionId = newSessionId;
      existing.piSessionFile = piSession.sessionFile ?? undefined;
      existing.updatedAt = new Date().toISOString();
      existing.lastActiveAt = new Date().toISOString();
      await deps.userStateStore.writeUserState(openId, existing);
    } else {
      const state = await deps.userStateStore.createUserState(openId, newSessionId);
      state.piSessionFile = piSession.sessionFile ?? undefined;
      await deps.userStateStore.writeUserState(openId, state);
    }

    sessionCache.set(openId, piSession);
    logger.info("新 session 已创建", {
      openId,
      userId: identity.userId,
      sessionId: newSessionId,
      workspaceDir,
    });
    return { activeSessionId: newSessionId, piSession };
  }

  async function listSessions(identity: UserIdentity): Promise<ListedSession[]> {
    const openId = identity.openId;
    const workspaceDir = await ensureWorkspaceForIdentity(identity);
    const sessionDir = deps.userStateStore.userSessionsDir(openId);
    const listed = await deps.runtime.listPiSessions(workspaceDir, sessionDir);
    const state = await deps.userStateStore.readUserState(openId);

    return listed.map((session, index) => ({
      order: index + 1,
      sessionId: session.id,
      sessionFile: session.path,
      isActive: state?.activeSessionId === session.id || state?.piSessionFile === session.path,
      createdAt: session.created?.toISOString(),
      updatedAt: session.modified?.toISOString(),
    }));
  }

  async function resumeSession(identity: UserIdentity, ref: string): Promise<SessionResult> {
    const openId = identity.openId;
    const normalizedRef = ref.trim();
    if (!normalizedRef) {
      throw new Error("RESUME_REF_REQUIRED");
    }

    const sessions = await listSessions(identity);
    const target = resolveTargetSession(sessions, normalizedRef);
    if (!target) {
      throw new Error("RESUME_SESSION_NOT_FOUND");
    }

    const workspaceDir = await ensureWorkspaceForIdentity(identity);
    disposeCachedSession(openId);

    const piSession = await deps.runtime.openPiSession(target.sessionFile, workspaceDir);
    const activeSessionId = piSession.sessionId;
    sessionCache.set(openId, piSession);

    const now = new Date().toISOString();
    const state = await deps.userStateStore.readUserState(openId);
    if (state) {
      state.activeSessionId = activeSessionId;
      state.piSessionFile = piSession.sessionFile ?? target.sessionFile;
      state.updatedAt = now;
      state.lastActiveAt = now;
      await deps.userStateStore.writeUserState(openId, state);
    } else {
      const created = await deps.userStateStore.createUserState(openId, activeSessionId);
      created.piSessionFile = piSession.sessionFile ?? target.sessionFile;
      created.updatedAt = now;
      created.lastActiveAt = now;
      await deps.userStateStore.writeUserState(openId, created);
    }

    logger.info("Pi session 已切换到历史会话", {
      openId,
      sessionId: activeSessionId,
      sessionFile: piSession.sessionFile ?? target.sessionFile,
    });
    return {
      activeSessionId,
      piSession,
    };
  }

  async function touchSession(openId: string, messageId: string): Promise<void> {
    await deps.userStateStore.touchUserState(openId, messageId);
  }

  function disposeCachedSession(openId: string): void {
    const oldSession = sessionCache.get(openId);
    if (!oldSession) {
      return;
    }

    try {
      oldSession.dispose();
    } catch {
      // 忽略 dispose 错误
    }
    sessionCache.delete(openId);
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
    createNewSession,
    listSessions,
    resumeSession,
    touchSession,
    disposeAllSessions,
  };
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
    workspaceService: {
      ensureUserWorkspace: (...args) => ensureUserWorkspace(...args),
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

export async function createNewSession(identity: UserIdentity): Promise<SessionResult> {
  return ensureDefaultSessionService().createNewSession(identity);
}

export async function listSessions(identity: UserIdentity): Promise<ListedSession[]> {
  return ensureDefaultSessionService().listSessions(identity);
}

export async function resumeSession(identity: UserIdentity, ref: string): Promise<SessionResult> {
  return ensureDefaultSessionService().resumeSession(identity, ref);
}

export async function touchSession(openId: string, messageId: string): Promise<void> {
  return ensureDefaultSessionService().touchSession(openId, messageId);
}

export function disposeAllSessions(): void {
  ensureDefaultSessionService().disposeAllSessions();
}
