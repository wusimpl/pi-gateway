import { beforeEach, describe, expect, it, vi } from "vitest";
import { resolveFeishuBotOpenId } from "../src/feishu/bot-info.js";

const mocks = vi.hoisted(() => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("../src/app/logger.js", () => ({
  logger: mocks.logger,
}));

describe("resolveFeishuBotOpenId", () => {
  beforeEach(() => {
    mocks.logger.info.mockClear();
    mocks.logger.warn.mockClear();
  });

  it("应通过飞书 bot info API 自动获取机器人 open_id", async () => {
    const client = {
      request: vi.fn().mockResolvedValue({
        code: 0,
        msg: "ok",
        bot: {
          open_id: "ou_bot_1",
          app_name: "Pi",
        },
      }),
    };

    await expect(resolveFeishuBotOpenId(client)).resolves.toBe("ou_bot_1");
    expect(client.request).toHaveBeenCalledWith({
      url: "/open-apis/bot/v3/info",
      method: "GET",
    });
    expect(mocks.logger.info).toHaveBeenCalledWith("飞书机器人 open_id 已自动解析", {
      botOpenId: "ou_bot_1",
      appName: "Pi",
    });
  });

  it("API 返回异常时应返回 undefined", async () => {
    const client = {
      request: vi.fn().mockResolvedValue({ code: 999, msg: "failed" }),
    };

    await expect(resolveFeishuBotOpenId(client)).resolves.toBeUndefined();
    expect(mocks.logger.warn).toHaveBeenCalledWith(
      "获取飞书机器人 open_id 失败，群聊 @ 机器人触发将不可用",
      { code: 999, msg: "failed" },
    );
  });

  it("请求失败时应返回 undefined", async () => {
    const client = {
      request: vi.fn().mockRejectedValue(new Error("network failed")),
    };

    await expect(resolveFeishuBotOpenId(client)).resolves.toBeUndefined();
    expect(mocks.logger.warn).toHaveBeenCalledWith(
      "获取飞书机器人 open_id 失败，群聊 @ 机器人触发将不可用",
      { error: "Error: network failed" },
    );
  });
});
