import { logger } from "./logger.js";

/** 默认锁超时时间：10 分钟 */
const LOCK_TIMEOUT_MS = 10 * 60 * 1000;

/** 锁内部结构 */
interface LockEntry {
  lockedAt: number;
  messageId: string;
  timer: NodeJS.Timeout;
}

/** 单用户运行锁 */
const userLocks = new Map<string, LockEntry>();

/** 检查并清理过期锁（内部统一逻辑） */
function cleanupExpiredLock(openId: string): void {
  const lock = userLocks.get(openId);
  if (lock && Date.now() - lock.lockedAt > LOCK_TIMEOUT_MS) {
    clearTimeout(lock.timer);
    userLocks.delete(openId);
    logger.warn("运行锁已超时，强制释放", { openId, lockedAt: lock.lockedAt, messageId: lock.messageId });
  }
}

export function acquireLock(openId: string, messageId: string): boolean {
  cleanupExpiredLock(openId);

  if (userLocks.has(openId)) {
    return false; // 已锁且未超时
  }

  // 设置超时自动释放的定时器（使用 lockedAt 作为额外防 ABA 校验）
  const lockedAt = Date.now();
  const timer = setTimeout(() => {
    const lock = userLocks.get(openId);
    // 同时校验 messageId 和 lockedAt，防止旧定时器误删新锁
    if (lock && lock.messageId === messageId && lock.lockedAt === lockedAt) {
      userLocks.delete(openId);
      logger.warn("运行锁超时自动释放", { openId, messageId });
    }
  }, LOCK_TIMEOUT_MS);
  timer.unref();

  userLocks.set(openId, { lockedAt, messageId, timer });
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
  cleanupExpiredLock(openId);
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
  // 清理所有定时器，避免关停后旧定时器误删
  for (const [, lock] of userLocks) {
    clearTimeout(lock.timer);
  }
  userLocks.clear();
  dedupMap.clear();
  logger.info("所有运行时状态已清理");
}
