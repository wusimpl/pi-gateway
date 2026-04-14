import { describe, it, expect, beforeEach, vi } from "vitest";
import { acquireLock, releaseLock, isLocked, isDuplicate, clearAllState } from "../src/app/state.js";

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
