import { describe, expect, it, vi } from "vitest";
import { createFeishuSenderNameResolver } from "../src/feishu/user-context.js";

describe("createFeishuSenderNameResolver", () => {
  it("按 open_id 解析飞书用户名并缓存结果", async () => {
    let currentTime = 1000;
    const get = vi.fn().mockResolvedValue({
      data: {
        user: {
          name: "Andy",
        },
      },
    });
    const resolveSenderName = createFeishuSenderNameResolver(
      { contact: { user: { get } } },
      { now: () => currentTime, successTtlMs: 1000 },
    );

    await expect(resolveSenderName({ openId: "ou_1" })).resolves.toBe("Andy");
    await expect(resolveSenderName({ openId: "ou_1" })).resolves.toBe("Andy");

    expect(get).toHaveBeenCalledTimes(1);
    expect(get).toHaveBeenCalledWith({
      path: { user_id: "ou_1" },
      params: { user_id_type: "open_id" },
    });

    currentTime = 2500;
    await expect(resolveSenderName({ openId: "ou_1" })).resolves.toBe("Andy");
    expect(get).toHaveBeenCalledTimes(2);
  });

  it("解析失败时短时间缓存降级结果", async () => {
    let currentTime = 1000;
    const get = vi.fn().mockRejectedValue(new Error("permission denied"));
    const resolveSenderName = createFeishuSenderNameResolver(
      { contact: { user: { get } } },
      { now: () => currentTime, failureTtlMs: 1000 },
    );

    await expect(resolveSenderName({ openId: "ou_1" })).resolves.toBeNull();
    await expect(resolveSenderName({ openId: "ou_1" })).resolves.toBeNull();

    expect(get).toHaveBeenCalledTimes(1);

    currentTime = 2500;
    await expect(resolveSenderName({ openId: "ou_1" })).resolves.toBeNull();
    expect(get).toHaveBeenCalledTimes(2);
  });
});
