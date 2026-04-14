import {
  AuthStorage,
  ModelRegistry,
  SessionManager,
  createAgentSession,
  type AgentSession,
} from "@mariozechner/pi-coding-agent";
import { logger } from "../app/logger.js";

let authStorage: AuthStorage;
let modelRegistry: ModelRegistry;

export function initPiRuntime(): void {
  authStorage = AuthStorage.create();
  modelRegistry = ModelRegistry.create(authStorage);
  logger.info("Pi 运行时初始化完成");
}

export function getAuthStorage(): AuthStorage {
  return authStorage;
}

export function getModelRegistry(): ModelRegistry {
  return modelRegistry;
}

/**
 * 创建一个新的 Pi 持久 session
 * @param cwd 工作目录
 * @param sessionDir session 存储目录
 */
export async function createPiSession(
  cwd: string,
  sessionDir?: string
): Promise<AgentSession> {
  const sessionManager = SessionManager.create(cwd, sessionDir);
  const { session } = await createAgentSession({
    cwd,
    sessionManager,
    authStorage,
    modelRegistry,
  });
  logger.info("Pi session 已创建", {
    sessionId: session.sessionId,
    sessionFile: session.sessionFile,
  });
  return session;
}

/**
 * 恢复最近一个 Pi session
 * @param cwd 工作目录
 * @param sessionDir session 存储目录
 */
export async function continueRecentPiSession(
  cwd: string,
  sessionDir?: string
): Promise<{ session: AgentSession; fallbackMessage?: string } | null> {
  try {
    const sessionManager = SessionManager.continueRecent(cwd, sessionDir);
    const { session, modelFallbackMessage } = await createAgentSession({
      cwd,
      sessionManager,
      authStorage,
      modelRegistry,
    });
    logger.info("Pi session 已恢复", {
      sessionId: session.sessionId,
      sessionFile: session.sessionFile,
    });
    return { session, fallbackMessage: modelFallbackMessage };
  } catch (err) {
    logger.warn("Pi session 恢复失败，将创建新 session", { error: String(err) });
    return null;
  }
}

/**
 * 打开指定 session 文件
 */
export async function openPiSession(
  sessionFile: string,
  cwd: string,
): Promise<AgentSession> {
  const sessionManager = SessionManager.open(sessionFile);
  const { session } = await createAgentSession({
    cwd,
    sessionManager,
    authStorage,
    modelRegistry,
  });
  logger.info("Pi session 已打开", {
    sessionId: session.sessionId,
    sessionFile: session.sessionFile,
  });
  return session;
}
