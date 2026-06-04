import { describe, expect, it, vi } from "vitest";
import { createMessageRouter } from "../src/app/router.js";
import { SUPER_ADMIN_OPEN_ID } from "../src/app/access-control.js";

function createP2PEvent(openId: string, messageId = "om_p2p_1") {
  return {
    sender: { senderId: { openId, userId: `u_${openId}`, unionId: `on_${openId}` }, senderType: "user", tenantKey: "tk" },
    message: {
      messageId,
      chatId: "oc_p2p_1",
      chatType: "p2p",
      messageType: "text",
      content: '{"text":"hello"}',
      createTime: "123",
    },
  } as const;
}

function createDeps(openId: string, options: {
  config?: Record<string, unknown>;
  persisted?: Record<string, unknown> | null;
} = {}) {
  const event = createP2PEvent(openId);
  return {
    stateStore: { isDuplicate: vi.fn(() => false) },
    commandService: {
      handleBridgeCommand: vi.fn().mockResolvedValue(undefined),
      handleUnsupportedSlashCommand: vi.fn().mockResolvedValue(undefined),
      handleUnauthorizedBridgeCommand: vi.fn().mockResolvedValue(undefined),
    },
    promptService: {
      handleUserPrompt: vi.fn().mockResolvedValue(undefined),
      queueRunningPrompt: vi.fn().mockResolvedValue("not_running"),
    },
    parseMessageEvent: vi.fn(() => event as any),
    normalizeFeishuInboundMessage: vi.fn(() => ({
      kind: "text",
      identity: { openId, userId: `u_${openId}` },
      conversationTarget: {
        kind: "p2p",
        key: openId,
        receiveIdType: "open_id",
        receiveId: openId,
      },
      messageId: event.message.messageId,
      messageType: "text",
      createTime: "123",
      rawContent: '{"text":"hello"}',
      text: "hello",
    })),
    config: options.config ?? {
      FEISHU_P2P_CHAT_POLICY: "all",
      FEISHU_P2P_CHAT_ALLOWLIST: [],
      FEISHU_OWNER_OPEN_IDS: [],
    },
    p2pSettingsStore: options.persisted === undefined ? undefined : {
      readP2PRoutingConfig: vi.fn().mockResolvedValue(options.persisted),
    },
  };
}

describe("createMessageRouter 私聊准入", () => {
  it("默认 all 应允许私聊", async () => {
    const deps = createDeps("ou_1");
    const router = createMessageRouter(deps as any);

    await router.handleFeishuMessage({});

    expect(deps.promptService.handleUserPrompt).toHaveBeenCalled();
  });

  it("whitelist 模式应忽略不在白名单的私聊", async () => {
    const deps = createDeps("ou_1", {
      config: {
        FEISHU_P2P_CHAT_POLICY: "whitelist",
        FEISHU_P2P_CHAT_ALLOWLIST: ["ou_2"],
        FEISHU_OWNER_OPEN_IDS: [],
      },
    });
    const router = createMessageRouter(deps as any);

    await router.handleFeishuMessage({});

    expect(deps.normalizeFeishuInboundMessage).not.toHaveBeenCalled();
    expect(deps.promptService.handleUserPrompt).not.toHaveBeenCalled();
  });

  it("持久化配置应优先于 .env 默认配置", async () => {
    const deps = createDeps("ou_1", {
      config: {
        FEISHU_P2P_CHAT_POLICY: "all",
        FEISHU_P2P_CHAT_ALLOWLIST: [],
        FEISHU_OWNER_OPEN_IDS: [],
      },
      persisted: {
        FEISHU_P2P_CHAT_POLICY: "whitelist",
        FEISHU_P2P_CHAT_ALLOWLIST: ["ou_2"],
      },
    });
    const router = createMessageRouter(deps as any);

    await router.handleFeishuMessage({});

    expect(deps.promptService.handleUserPrompt).not.toHaveBeenCalled();
  });

  it("super admin 即使不在白名单也应允许私聊", async () => {
    const deps = createDeps(SUPER_ADMIN_OPEN_ID, {
      config: {
        FEISHU_P2P_CHAT_POLICY: "whitelist",
        FEISHU_P2P_CHAT_ALLOWLIST: [],
        FEISHU_OWNER_OPEN_IDS: [],
      },
    });
    const router = createMessageRouter(deps as any);

    await router.handleFeishuMessage({});

    expect(deps.promptService.handleUserPrompt).toHaveBeenCalled();
  });
});
