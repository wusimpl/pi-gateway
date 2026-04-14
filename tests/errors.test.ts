import { describe, it, expect } from "vitest";
import { getUserMessage, BridgeError, withTimeout } from "../src/app/errors.js";

describe("getUserMessage", () => {
  it("BridgeError 应返回对应分类的用户提示", () => {
    const err = new BridgeError("test", "pi_prompt_timeout");
    expect(getUserMessage(err)).toContain("超时");
  });

  it("非 BridgeError 应返回未知错误提示", () => {
    expect(getUserMessage(new Error("something"))).toContain("未知错误");
  });

  it("所有分类都应有对应提示", () => {
    const categories = [
      "feishu_api_temp",
      "feishu_auth",
      "pi_init",
      "pi_prompt_timeout",
      "pi_prompt_error",
      "pi_stream_interrupt",
      "storage_error",
      "unknown",
    ] as const;
    for (const cat of categories) {
      const err = new BridgeError("test", cat);
      const msg = getUserMessage(err);
      expect(msg.length).toBeGreaterThan(0);
    }
  });
});

describe("withTimeout", () => {
  it("正常完成应返回结果", async () => {
    const result = await withTimeout(Promise.resolve("ok"), 1000);
    expect(result).toBe("ok");
  });

  it("超时应抛出 BridgeError", async () => {
    const slow = new Promise<string>((resolve) => setTimeout(() => resolve("late"), 5000));
    await expect(withTimeout(slow, 50, "test timeout")).rejects.toThrow("test timeout");
  });

  it("原始错误应透传", async () => {
    const fail = Promise.reject(new Error("original"));
    await expect(withTimeout(fail, 1000)).rejects.toThrow("original");
  });
});
