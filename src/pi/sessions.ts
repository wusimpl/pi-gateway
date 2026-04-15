import type { AgentSession } from "@mariozechner/pi-coding-agent";
import type { PiRuntime } from "./runtime.js";
import { createPiSession, continueRecentPiSession, openPiSession } from "./runtime.js";
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
import type { UserIdentity } from "../types.js";

interface SessionResult {
  activeSessionId: string;
  piSession: AgentSession;
}

export interface SessionService {
  getOrCreateActiveSession(identity: UserIdentity): Promise<SessionResult>;
  createNewSession(identity: UserIdentity): Promise<SessionResult>;
  touchSession(openId: string, messageId: string): Promise<void>;
  disposeAllSessions(): void;
}

interface SessionServiceDeps {
  runtime: Pick<PiRuntime, "createPiSession" | "continueRecentPiSession" | "openPiSession">;
  userStateStore: Pick<
    UserStateStore,
    "readUserState" | "writeUserState" | "createUserState" | "touchUserState" | "userSessionsDir"
  >;
  workspaceService: Pick<WorkspaceService, "ensureUserWorkspace">;
}

export function createSessionService(deps: SessionServiceDeps): SessionService {
  /** 内存中缓存的 Pi session 实例（open_id -> session） */
  const sessionCache = new Map<string, AgentSession>();

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
        const workspaceDir = await deps.workspaceService.ensureUserWorkspace(identity);
        const session = await deps.runtime.openPiSession(state.piSessionFile, workspaceDir);
        sessionCache.set(openId, session);
        logger.info("Pi session 从指定文件恢复", {
          openId,
          sessionId: state.activeSessionId,
          sessionFile: state.piSessionFile,
        });
        return { activeSessionId: state.activeSessionId, piSession: session };
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
        const workspaceDir = await deps.workspaceService.ensureUserWorkspace(identity);
        const result = await deps.runtime.continueRecentPiSession(workspaceDir, sessionDir);
        if (result) {
          sessionCache.set(openId, result.session);
          state.piSessionFile = result.session.sessionFile ?? undefined;
          await deps.userStateStore.writeUserState(openId, state);
          logger.info("Pi session 从用户目录最近会话恢复", {
            openId,
            sessionId: state.activeSessionId,
            sessionFile: result.session.sessionFile,
          });
          return { activeSessionId: state.activeSessionId, piSession: result.session };
        }
      } catch (err) {
        logger.warn("Pi session 用户目录恢复失败，将创建新 session", { openId, error: String(err) });
      }
    }

    return doCreateNewSession(identity);
  }

  async function createNewSession(identity: UserIdentity): Promise<SessionResult> {
    const openId = identity.openId;

    const oldSession = sessionCache.get(openId);
    if (oldSession) {
      try {
        oldSession.dispose();
      } catch {
        // 忽略 dispose 错误
      }
      sessionCache.delete(openId);
    }

    return doCreateNewSession(identity);
  }

  async function doCreateNewSession(identity: UserIdentity): Promise<SessionResult> {
    const openId = identity.openId;
    const sessionDir = deps.userStateStore.userSessionsDir(openId);
    const workspaceDir = await deps.workspaceService.ensureUserWorkspace(identity);
    const piSession = await deps.runtime.createPiSession(workspaceDir, sessionDir);
    const newSessionId = generateSessionId();

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

  async function touchSession(openId: string, messageId: string): Promise<void> {
    await deps.userStateStore.touchUserState(openId, messageId);
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
    logger.info("所有 Pi session 已清理");
  }

  return {
    getOrCreateActiveSession,
    createNewSession,
    touchSession,
    disposeAllSessions,
  };
}

/**
 * 生成 session ID，附带毫秒和随机后缀，避免同一秒内 /new 连点时覆盖旧会话状态。
 */
function generateSessionId(): string {
  const now = new Date();
  const pad = (n: number, width = 2) => n.toString().padStart(width, "0");
  const randomSuffix = Math.random().toString(36).slice(2, 8);
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}${pad(now.getMilliseconds(), 3)}-${randomSuffix}`;
}

function getDefaultSessionService(): SessionService {
  return createSessionService({
    runtime: {
      createPiSession: (...args) => createPiSession(...args),
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

export async function touchSession(openId: string, messageId: string): Promise<void> {
  return ensureDefaultSessionService().touchSession(openId, messageId);
}

export function disposeAllSessions(): void {
  ensureDefaultSessionService().disposeAllSessions();
}
