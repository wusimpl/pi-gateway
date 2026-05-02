import { logger } from "./logger.js";

/** 默认锁超时时间：10 分钟 */
const LOCK_TIMEOUT_MS = 10 * 60 * 1000;
const DEDUP_TTL_MS = 5 * 60 * 1000; // 5 分钟

export type StopRequestResult = "not_running" | "requested" | "already_requested";

export interface RuntimeStateStore {
  acquireLock(openId: string, messageId: string): boolean;
  releaseLock(openId: string): void;
  isLocked(openId: string): boolean;
  hasActiveLocks(): boolean;
  beginRestartDrain(): "started" | "busy" | "already_draining";
  cancelRestartDrain(): void;
  isDraining(): boolean;
  setAbortHandler(
    openId: string,
    messageId: string,
    abortHandler: () => Promise<void>,
  ): Promise<boolean>;
  requestStop(openId: string, messageId?: string): Promise<StopRequestResult>;
  isStopRequested(openId: string, messageId?: string): boolean;
  isDuplicate(messageId: string): boolean;
  clearAllState(): void;
}

/** 锁内部结构 */
interface LockEntry {
  lockedAt: number;
  messageId: string;
  timer: NodeJS.Timeout;
  abortHandler?: () => Promise<void>;
  stopRequested: boolean;
}

function triggerAbort(
  abortHandler: () => Promise<void>,
  logContext: Record<string, unknown>,
  logLabel: string,
): void {
  void abortHandler().catch((err) => {
    logger.warn(logLabel, {
      ...logContext,
      error: String(err),
    });
  });
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
  let draining = false;

  function cleanupExpiredLock(openId: string): void {
    const lock = userLocks.get(openId);
    if (lock && Date.now() - lock.lockedAt > lockTimeoutMs) {
      clearTimeout(lock.timer);
      userLocks.delete(openId);
      logger.warn("运行锁已超时，强制释放", { openId, lockedAt: lock.lockedAt, messageId: lock.messageId });
    }
  }

  function cleanupAllExpiredLocks(): void {
    for (const openId of userLocks.keys()) {
      cleanupExpiredLock(openId);
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
    if (draining) {
      return false;
    }

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

    userLocks.set(openId, {
      lockedAt,
      messageId,
      timer,
      stopRequested: false,
    });
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

  function hasActiveLocks(): boolean {
    cleanupAllExpiredLocks();
    return userLocks.size > 0;
  }

  function beginRestartDrain(): "started" | "busy" | "already_draining" {
    if (draining) {
      return "already_draining";
    }

    cleanupAllExpiredLocks();
    if (userLocks.size > 0) {
      return "busy";
    }

    draining = true;
    logger.info("网关已进入排空状态，拒绝新的任务");
    return "started";
  }

  function cancelRestartDrain(): void {
    if (!draining) {
      return;
    }

    draining = false;
    logger.warn("网关排空状态已取消，恢复接收新任务");
  }

  function isDraining(): boolean {
    return draining;
  }

  async function setAbortHandler(
    openId: string,
    messageId: string,
    abortHandler: () => Promise<void>,
  ): Promise<boolean> {
    cleanupExpiredLock(openId);
    const lock = userLocks.get(openId);
    if (!lock || lock.messageId !== messageId) {
      return false;
    }

    lock.abortHandler = abortHandler;
    if (!lock.stopRequested) {
      return false;
    }

    triggerAbort(
      abortHandler,
      { openId, messageId },
      "补挂中断处理器后停止任务失败",
    );
    return true;
  }

  async function requestStop(openId: string, messageId?: string): Promise<StopRequestResult> {
    cleanupExpiredLock(openId);
    const lock = userLocks.get(openId);
    if (!lock || !matchesStopMessageId(lock.messageId, messageId)) {
      return "not_running";
    }

    if (lock.stopRequested) {
      return "already_requested";
    }

    lock.stopRequested = true;
    if (!lock.abortHandler) {
      logger.info("已登记停止请求，等待任务挂载中断处理器", {
        openId,
        messageId: lock.messageId,
      });
      return "requested";
    }

    triggerAbort(
      lock.abortHandler,
      { openId, messageId: lock.messageId },
      "停止当前任务失败",
    );

    return "requested";
  }

  function matchesStopMessageId(lockMessageId: string, requestedMessageId?: string): boolean {
    if (!requestedMessageId) {
      return true;
    }
    if (requestedMessageId.endsWith(":")) {
      return lockMessageId.startsWith(requestedMessageId);
    }
    return lockMessageId === requestedMessageId;
  }

  function isStopRequested(openId: string, messageId?: string): boolean {
    cleanupExpiredLock(openId);
    const lock = userLocks.get(openId);
    if (!lock) {
      return false;
    }
    if (messageId && lock.messageId !== messageId) {
      return false;
    }
    return lock.stopRequested;
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
    draining = false;
    logger.info("所有运行时状态已清理");
  }

  return {
    acquireLock,
    releaseLock,
    isLocked,
    hasActiveLocks,
    beginRestartDrain,
    cancelRestartDrain,
    isDraining,
    setAbortHandler,
    requestStop,
    isStopRequested,
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

export function hasActiveLocks(): boolean {
  return defaultRuntimeStateStore.hasActiveLocks();
}

export function beginRestartDrain(): "started" | "busy" | "already_draining" {
  return defaultRuntimeStateStore.beginRestartDrain();
}

export function cancelRestartDrain(): void {
  defaultRuntimeStateStore.cancelRestartDrain();
}

export function isDraining(): boolean {
  return defaultRuntimeStateStore.isDraining();
}

export async function setAbortHandler(
  openId: string,
  messageId: string,
  abortHandler: () => Promise<void>,
): Promise<boolean> {
  return defaultRuntimeStateStore.setAbortHandler(openId, messageId, abortHandler);
}

export async function requestStop(openId: string, messageId?: string): Promise<StopRequestResult> {
  return defaultRuntimeStateStore.requestStop(openId, messageId);
}

export function isStopRequested(openId: string, messageId?: string): boolean {
  return defaultRuntimeStateStore.isStopRequested(openId, messageId);
}

export function isDuplicate(messageId: string): boolean {
  return defaultRuntimeStateStore.isDuplicate(messageId);
}

export function clearAllState(): void {
  defaultRuntimeStateStore.clearAllState();
}
