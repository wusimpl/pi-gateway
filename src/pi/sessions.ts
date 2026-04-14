import type { AgentSession } from "@mariozechner/pi-coding-agent";
import { createPiSession, continueRecentPiSession } from "./runtime.js";
import { readUserState, createUserState, switchActiveSession } from "../storage/users.js";
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
 * - 如果存储中有状态 -> 尝试恢复 Pi session
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
  if (state?.activeSessionId) {
    try {
      const result = await continueRecentPiSession(process.cwd());
      if (result) {
        sessionCache.set(openId, result.session);
        return { activeSessionId: state.activeSessionId, piSession: result.session };
      }
    } catch (err) {
      logger.warn("Pi session 恢复失败，将创建新 session", { openId, error: String(err) });
    }
  }

  // 3. 创建全新 session
  const newSessionId = generateSessionId();
  const piSession = await createPiSession(process.cwd());
  await createUserState(openId, newSessionId);
  sessionCache.set(openId, piSession);

  logger.info("为新用户创建 session", { openId, sessionId: newSessionId });
  return { activeSessionId: newSessionId, piSession };
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
  }

  // 创建新 Pi session
  const piSession = await createPiSession(process.cwd());
  const newSessionId = generateSessionId();

  // 更新用户状态
  await switchActiveSession(openId, newSessionId);
  sessionCache.set(openId, piSession);

  logger.info("用户创建新 session", { openId, sessionId: newSessionId });
  return { activeSessionId: newSessionId, piSession };
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
