import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import {
  acquireLock,
  releaseLock,
  isLocked,
  hasActiveLocks,
  isDuplicate,
  clearAllState,
  requestStop,
  setAbortHandler,
  isStopRequested,
} from "../src/app/state.js";

describe("运行锁", () => {
  beforeEach(() => {
    clearAllState();
  });

  it("首次获取锁应成功", () => {
    expect(acquireLock("ou_user1", "msg_1")).toBe(true);
  });

  it("同一用户重复获取锁应失败", () => {
    acquireLock("ou_user1", "msg_1");
    expect(acquireLock("ou_user1", "msg_2")).toBe(false);
  });

  it("不同用户获取锁应成功", () => {
    acquireLock("ou_user1", "msg_1");
    expect(acquireLock("ou_user2", "msg_2")).toBe(true);
  });

  it("释放锁后可重新获取", () => {
    acquireLock("ou_user1", "msg_1");
    releaseLock("ou_user1");
    expect(acquireLock("ou_user1", "msg_2")).toBe(true);
  });

  it("释放未持有的锁不应报错", () => {
    expect(() => releaseLock("ou_nonexistent")).not.toThrow();
  });

  it("isLocked 应反映锁状态", () => {
    expect(isLocked("ou_user1")).toBe(false);
    acquireLock("ou_user1", "msg_1");
    expect(isLocked("ou_user1")).toBe(true);
    releaseLock("ou_user1");
    expect(isLocked("ou_user1")).toBe(false);
  });

  it("hasActiveLocks 应反映全局是否仍有任务在跑", () => {
    expect(hasActiveLocks()).toBe(false);
    acquireLock("ou_user1", "msg_1");
    expect(hasActiveLocks()).toBe(true);
    releaseLock("ou_user1");
    expect(hasActiveLocks()).toBe(false);
  });

  it("clearAllState 应清理所有锁和定时器", () => {
    acquireLock("ou_user1", "msg_1");
    acquireLock("ou_user2", "msg_2");
    clearAllState();
    expect(isLocked("ou_user1")).toBe(false);
    expect(isLocked("ou_user2")).toBe(false);
    // 清理后应可重新获取锁
    expect(acquireLock("ou_user1", "msg_3")).toBe(true);
  });
});

describe("消息去重", () => {
  beforeEach(() => {
    clearAllState();
  });

  it("首次消息不应判定为重复", () => {
    expect(isDuplicate("msg_1")).toBe(false);
  });

  it("同一 message_id 再次判定为重复", () => {
    isDuplicate("msg_1");
    expect(isDuplicate("msg_1")).toBe(true);
  });

  it("不同 message_id 不应判定为重复", () => {
    isDuplicate("msg_1");
    expect(isDuplicate("msg_2")).toBe(false);
  });
});

describe("停止当前任务", () => {
  beforeEach(() => {
    clearAllState();
  });

  it("没有运行中的任务时，/stop 应返回 not_running", async () => {
    await expect(requestStop("ou_user1")).resolves.toBe("not_running");
  });

  it("挂上中断处理器后，应能触发停止", async () => {
    const abortHandler = vi.fn().mockResolvedValue(undefined);
    acquireLock("ou_user1", "msg_1");
    await expect(setAbortHandler("ou_user1", "msg_1", abortHandler)).resolves.toBe(false);

    await expect(requestStop("ou_user1")).resolves.toBe("requested");
    expect(abortHandler).toHaveBeenCalledTimes(1);
    expect(isStopRequested("ou_user1", "msg_1")).toBe(true);
  });

  it("停止请求先到时，补挂中断处理器应立即执行", async () => {
    const abortHandler = vi.fn().mockResolvedValue(undefined);
    acquireLock("ou_user1", "msg_1");

    await expect(requestStop("ou_user1")).resolves.toBe("requested");
    await expect(setAbortHandler("ou_user1", "msg_1", abortHandler)).resolves.toBe(true);

    expect(abortHandler).toHaveBeenCalledTimes(1);
  });

  it("重复停止时应返回 already_requested", async () => {
    const abortHandler = vi.fn().mockResolvedValue(undefined);
    acquireLock("ou_user1", "msg_1");
    await setAbortHandler("ou_user1", "msg_1", abortHandler);

    await expect(requestStop("ou_user1")).resolves.toBe("requested");
    await expect(requestStop("ou_user1")).resolves.toBe("already_requested");
    expect(abortHandler).toHaveBeenCalledTimes(1);
  });

  it("停止请求不该等中断逻辑跑完", async () => {
    let releaseAbort: (() => void) | undefined;
    const abortHandler = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          releaseAbort = resolve;
        }),
    );
    acquireLock("ou_user1", "msg_1");
    await setAbortHandler("ou_user1", "msg_1", abortHandler);

    await expect(requestStop("ou_user1")).resolves.toBe("requested");
    expect(abortHandler).toHaveBeenCalledTimes(1);

    releaseAbort?.();
  });

  it("先收到停止，再补挂中断处理器时，也不该等中断逻辑跑完", async () => {
    let releaseAbort: (() => void) | undefined;
    const abortHandler = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          releaseAbort = resolve;
        }),
    );
    acquireLock("ou_user1", "msg_1");

    await expect(requestStop("ou_user1")).resolves.toBe("requested");
    await expect(setAbortHandler("ou_user1", "msg_1", abortHandler)).resolves.toBe(true);
    expect(abortHandler).toHaveBeenCalledTimes(1);

    releaseAbort?.();
  });
});
