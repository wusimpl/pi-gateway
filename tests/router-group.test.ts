import { beforeEach, describe, expect, it, vi } from "vitest";
import { createMessageRouter } from "../src/app/router.js";

const groupEvent = {
  sender: { senderId: { openId: "ou_1", userId: "u_1", unionId: "on_1" }, senderType: "user", tenantKey: "tk" },
  message: {
    messageId: "om_group_1",
    chatId: "oc_1",
    chatType: "group",
    messageType: "text",
    content: '{"text":"hello"}',
    createTime: "123",
  },
} as const;

const groupTarget = {
  kind: "group",
  key: "oc_1",
  receiveIdType: "chat_id",
  receiveId: "oc_1",
  chatId: "oc_1",
} as const;

function createDeps(config: Record<string, unknown>) {
  return {
    stateStore: { isDuplicate: vi.fn(() => false) },
    commandService: {
      handleBridgeCommand: vi.fn().mockResolvedValue(undefined),
      handleUnsupportedSlashCommand: vi.fn().mockResolvedValue(undefined),
    },
    promptService: {
      handleUserPrompt: vi.fn().mockResolvedValue(undefined),
      queueRunningPrompt: vi.fn().mockResolvedValue("not_running"),
    },
    parseMessageEvent: vi.fn(() => groupEvent as any),
    normalizeFeishuInboundMessage: vi.fn(() => ({
      kind: "text",
      identity: { openId: "ou_1", userId: "u_1" },
      conversationTarget: groupTarget,
      messageId: "om_group_1",
      messageType: "text",
      createTime: "123",
      rawContent: '{"text":"hello"}',
      text: "hello",
    })),
    config,
  };
}

describe("createMessageRouter 群聊入口", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("默认 disabled 时应忽略群聊消息", async () => {
    const deps = createDeps({
      FEISHU_GROUP_CHAT_POLICY: "disabled",
      FEISHU_GROUP_CHAT_ALLOWLIST: [],
      FEISHU_GROUP_MESSAGE_MODE: "mention",
    });
    const router = createMessageRouter(deps as any);

    await router.handleFeishuMessage({});

    expect(deps.promptService.handleUserPrompt).not.toHaveBeenCalled();
    expect(deps.normalizeFeishuInboundMessage).not.toHaveBeenCalled();
  });

  it("all 模式应把群消息交给 prompt 并保留群目标", async () => {
    const deps = createDeps({
      FEISHU_GROUP_CHAT_POLICY: "open",
      FEISHU_GROUP_CHAT_ALLOWLIST: [],
      FEISHU_GROUP_MESSAGE_MODE: "all",
    });
    const router = createMessageRouter(deps as any);

    await router.handleFeishuMessage({});

    expect(deps.promptService.handleUserPrompt).toHaveBeenCalledWith(
      { openId: "ou_1", userId: "u_1" },
      expect.objectContaining({ conversationTarget: groupTarget }),
    );
  });
});
