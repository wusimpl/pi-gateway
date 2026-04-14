import type { AgentSession } from "@mariozechner/pi-coding-agent";
import { createPiSession, continueRecentPiSession } from "./runtime.js";
import {
  readUserState,
  createUserState,
  switchActiveSession,
  touchUserState,
} from "../storage/users.js";
import { logger } from "../app/logger.js";

/** 内存中缓存的 Pi session 实例（open_id -> session） */
const sessionCache = new Map<string, AgentSession>();

interface SessionResult {
  activeSessionId: string;
  piSession: AgentSession;
}

/**
 * 获取或创建用户活跃 session
 * - 如果内存中有缓存 -> 直接返回
 * - 如果存储中有状态且 Pi session 可恢复 -> 恢复
 * - 否则 -> 创建全新 session
 */
export async function getOrCreateActiveSession(openId: string): Promise<SessionResult> {
  // 1. 检查内存缓存
  const cached = sessionCache.get(openId);
  if (cached) {
    const state = await readUserState(openId);
    return {
      activeSessionId: state?.activeSessionId ?? "unknown",
      piSession: cached,
    };
  }

  // 2. 检查持久化状态，尝试恢复
  const state = await readUserState(openId);
  if (state?.activeSessionId && state.piSessionFile) {
    try {
      // 使用 Pi SDK 的 continueRecent 恢复最近的 session
      const result = await continueRecentPiSession(process.cwd());
      if (result) {
        sessionCache.set(openId, result.session);
        logger.info("Pi session 从持久化恢复", {
          openId,
          sessionId: state.activeSessionId,
        });
        return { activeSessionId: state.activeSessionId, piSession: result.session };
      }
    } catch (err) {
      logger.warn("Pi session 恢复失败，将创建新 session", { openId, error: String(err) });
    }
  }

  // 3. 创建全新 session
  return await doCreateNewSession(openId);
}

/**
 * 为用户创建新 session（/new 或 /reset 时调用）
 */
export async function createNewSession(openId: string): Promise<SessionResult> {
  // 清除旧缓存
  const oldSession = sessionCache.get(openId);
  if (oldSession) {
    try {
      oldSession.dispose();
    } catch {
      // 忽略 dispose 错误
    }
    sessionCache.delete(openId);
  }

  return await doCreateNewSession(openId);
}

/** 内部：创建全新 session 并更新存储 */
async function doCreateNewSession(openId: string): Promise<SessionResult> {
  const piSession = await createPiSession(process.cwd());
  const newSessionId = generateSessionId();

  // 在用户状态中记录 Pi session 文件路径
  const existing = await readUserState(openId);
  if (existing) {
    existing.activeSessionId = newSessionId;
    existing.piSessionFile = piSession.sessionFile ?? undefined;
    existing.updatedAt = new Date().toISOString();
    existing.lastActiveAt = new Date().toISOString();
    const { writeUserState } = await import("../storage/users.js");
    await writeUserState(openId, existing);
  } else {
    const state = await createUserState(openId, newSessionId);
    // 追加 piSessionFile
    state.piSessionFile = piSession.sessionFile ?? undefined;
    const { writeUserState } = await import("../storage/users.js");
    await writeUserState(openId, state);
  }

  sessionCache.set(openId, piSession);
  logger.info("新 session 已创建", { openId, sessionId: newSessionId });
  return { activeSessionId: newSessionId, piSession };
}

/** 更新用户活跃时间 */
export async function touchSession(openId: string, messageId: string): Promise<void> {
  await touchUserState(openId, messageId);
}

/** 生成 session ID: YYYYMMDD-HHMMSS 格式 */
function generateSessionId(): string {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
}

/** 清理所有缓存的 session（关停时使用） */
export function disposeAllSessions(): void {
  for (const [openId, session] of sessionCache) {
    try {
      session.dispose();
    } catch {
      // 忽略
    }
  }
  sessionCache.clear();
  logger.info("所有 Pi session 已清理");
}
