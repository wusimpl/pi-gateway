import { logger } from "./logger.js";

/** 默认锁超时时间：10 分钟 */
const LOCK_TIMEOUT_MS = 10 * 60 * 1000;

/** 单用户运行锁 */
const userLocks = new Map<string, { lockedAt: number; messageId: string; timer: NodeJS.Timeout }>();

export function acquireLock(openId: string, messageId: string): boolean {
  const existing = userLocks.get(openId);
  if (existing) {
    // 检查是否已超时，超时则强制释放
    if (Date.now() - existing.lockedAt > LOCK_TIMEOUT_MS) {
      logger.warn("运行锁已超时，强制释放", { openId, lockedAt: existing.lockedAt, messageId: existing.messageId });
      clearTimeout(existing.timer);
      userLocks.delete(openId);
    } else {
      return false; // 已锁且未超时
    }
  }
  // 设置超时自动释放的定时器
  const timer = setTimeout(() => {
    const lock = userLocks.get(openId);
    if (lock?.messageId === messageId) {
      userLocks.delete(openId);
      logger.warn("运行锁超时自动释放", { openId, messageId });
    }
  }, LOCK_TIMEOUT_MS);
  timer.unref();
  userLocks.set(openId, { lockedAt: Date.now(), messageId, timer });
  logger.debug("锁已获取", { openId, messageId });
  return true;
}

export function releaseLock(openId: string): void {
  const lock = userLocks.get(openId);
  if (lock) {
    clearTimeout(lock.timer);
    userLocks.delete(openId);
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
