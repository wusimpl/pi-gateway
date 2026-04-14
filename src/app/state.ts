import { logger } from "./logger.js";

/** 单用户运行锁 */
const userLocks = new Map<string, { lockedAt: number; messageId: string }>();

export function acquireLock(openId: string, messageId: string): boolean {
  const existing = userLocks.get(openId);
  if (existing) {
    return false; // 已锁
  }
  userLocks.set(openId, { lockedAt: Date.now(), messageId });
  logger.debug("锁已获取", { openId, messageId });
  return true;
}

export function releaseLock(openId: string): void {
  const existed = userLocks.delete(openId);
  if (existed) {
    logger.debug("锁已释放", { openId });
  }
}

export function isLocked(openId: string): boolean {
  return userLocks.has(openId);
}

/** 消息去重窗口 */
const dedupMap = new Map<string, number>();
const DEDUP_TTL_MS = 5 * 60 * 1000; // 5 分钟

export function isDuplicate(messageId: string): boolean {
  if (dedupMap.has(messageId)) {
    return true;
  }
  dedupMap.set(messageId, Date.now());
  return false;
}

/** 定期清理过期的去重记录 */
setInterval(() => {
  const now = Date.now();
  for (const [id, ts] of dedupMap) {
    if (now - ts > DEDUP_TTL_MS) {
      dedupMap.delete(id);
    }
  }
}, 60_000).unref();

/** 清理所有运行时状态（关停时使用） */
export function clearAllState(): void {
  userLocks.clear();
  dedupMap.clear();
  logger.info("所有运行时状态已清理");
}
