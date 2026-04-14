import { logger } from "./logger.js";

/** 默认锁超时时间：10 分钟 */
const LOCK_TIMEOUT_MS = 10 * 60 * 1000;
const DEDUP_TTL_MS = 5 * 60 * 1000; // 5 分钟

export interface RuntimeStateStore {
  acquireLock(openId: string, messageId: string): boolean;
  releaseLock(openId: string): void;
  isLocked(openId: string): boolean;
  isDuplicate(messageId: string): boolean;
  clearAllState(): void;
}

/** 锁内部结构 */
interface LockEntry {
  lockedAt: number;
  messageId: string;
  timer: NodeJS.Timeout;
}

export function createRuntimeStateStore(options?: {
  lockTimeoutMs?: number;
  dedupTtlMs?: number;
}): RuntimeStateStore {
  const lockTimeoutMs = options?.lockTimeoutMs ?? LOCK_TIMEOUT_MS;
  const dedupTtlMs = options?.dedupTtlMs ?? DEDUP_TTL_MS;

  /** 单用户运行锁 */
  const userLocks = new Map<string, LockEntry>();
  /** 消息去重窗口 */
  const dedupMap = new Map<string, number>();

  function cleanupExpiredLock(openId: string): void {
    const lock = userLocks.get(openId);
    if (lock && Date.now() - lock.lockedAt > lockTimeoutMs) {
      clearTimeout(lock.timer);
      userLocks.delete(openId);
      logger.warn("运行锁已超时，强制释放", { openId, lockedAt: lock.lockedAt, messageId: lock.messageId });
    }
  }

  function cleanupExpiredDedup(now: number): void {
    for (const [id, ts] of dedupMap) {
      if (now - ts > dedupTtlMs) {
        dedupMap.delete(id);
      }
    }
  }

  function acquireLock(openId: string, messageId: string): boolean {
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
    }, lockTimeoutMs);
    timer.unref();

    userLocks.set(openId, { lockedAt, messageId, timer });
    logger.debug("锁已获取", { openId, messageId });
    return true;
  }

  function releaseLock(openId: string): void {
    const lock = userLocks.get(openId);
    if (lock) {
      clearTimeout(lock.timer);
      userLocks.delete(openId);
      logger.debug("锁已释放", { openId });
    }
  }

  function isLocked(openId: string): boolean {
    cleanupExpiredLock(openId);
    return userLocks.has(openId);
  }

  function isDuplicate(messageId: string): boolean {
    const now = Date.now();
    cleanupExpiredDedup(now);
    if (dedupMap.has(messageId)) {
      return true;
    }
    dedupMap.set(messageId, now);
    return false;
  }

  function clearAllState(): void {
    for (const [, lock] of userLocks) {
      clearTimeout(lock.timer);
    }
    userLocks.clear();
    dedupMap.clear();
    logger.info("所有运行时状态已清理");
  }

  return {
    acquireLock,
    releaseLock,
    isLocked,
    isDuplicate,
    clearAllState,
  };
}

const defaultRuntimeStateStore = createRuntimeStateStore();

export function acquireLock(openId: string, messageId: string): boolean {
  return defaultRuntimeStateStore.acquireLock(openId, messageId);
}

export function releaseLock(openId: string): void {
  defaultRuntimeStateStore.releaseLock(openId);
}

export function isLocked(openId: string): boolean {
  return defaultRuntimeStateStore.isLocked(openId);
}

export function isDuplicate(messageId: string): boolean {
  return defaultRuntimeStateStore.isDuplicate(messageId);
}

export function clearAllState(): void {
  defaultRuntimeStateStore.clearAllState();
}
