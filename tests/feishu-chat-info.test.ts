import { beforeEach, describe, expect, it, vi } from "vitest";
import { createFeishuChatInfoService } from "../src/feishu/chat-info.js";

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

describe("createFeishuChatInfoService", () => {
  beforeEach(() => {
    mocks.logger.warn.mockClear();
  });

  it("应通过飞书群信息接口获取 owner open_id", async () => {
    const client = {
      im: {
        chat: {
          get: vi.fn().mockResolvedValue({
            data: {
              owner_id: "ou_owner_1",
              owner_id_type: "open_id",
            },
          }),
        },
      },
    };
    const service = createFeishuChatInfoService(client);

    await expect(service.getGroupOwnerOpenId("oc_1")).resolves.toBe("ou_owner_1");
    expect(client.im.chat.get).toHaveBeenCalledWith({
      path: { chat_id: "oc_1" },
      params: { user_id_type: "open_id" },
    });
  });

  it("同一群 owner 查询应使用缓存", async () => {
    let now = 1000;
    const client = {
      im: {
        chat: {
          get: vi.fn().mockResolvedValue({
            data: { owner_id: "ou_owner_1" },
          }),
        },
      },
    };
    const service = createFeishuChatInfoService(client, {
      ownerCacheTtlMs: 1000,
      now: () => now,
    });

    await expect(service.getGroupOwnerOpenId("oc_1")).resolves.toBe("ou_owner_1");
    now = 1500;
    await expect(service.isGroupOwner("oc_1", { openId: "ou_owner_1" })).resolves.toBe(true);

    expect(client.im.chat.get).toHaveBeenCalledTimes(1);
  });

  it("缓存过期后应重新查询", async () => {
    let now = 1000;
    const client = {
      im: {
        chat: {
          get: vi.fn()
            .mockResolvedValueOnce({ data: { owner_id: "ou_owner_1" } })
            .mockResolvedValueOnce({ data: { owner_id: "ou_owner_2" } }),
        },
      },
    };
    const service = createFeishuChatInfoService(client, {
      ownerCacheTtlMs: 1000,
      now: () => now,
    });

    await expect(service.getGroupOwnerOpenId("oc_1")).resolves.toBe("ou_owner_1");
    now = 2500;
    await expect(service.getGroupOwnerOpenId("oc_1")).resolves.toBe("ou_owner_2");

    expect(client.im.chat.get).toHaveBeenCalledTimes(2);
  });

  it("接口失败时不应放行群主权限", async () => {
    const client = {
      im: {
        chat: {
          get: vi.fn().mockRejectedValue(new Error("network failed")),
        },
      },
    };
    const service = createFeishuChatInfoService(client);

    await expect(service.isGroupOwner("oc_1", { openId: "ou_owner_1" })).resolves.toBe(false);
    expect(mocks.logger.warn).toHaveBeenCalledWith(
      "获取飞书群聊 owner 失败，群主权限判断将不通过",
      { chatId: "oc_1", error: "Error: network failed" },
    );
  });
});
