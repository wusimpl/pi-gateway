import { beforeEach, describe, expect, it, vi } from "vitest";
import { createMessageRouter } from "../src/app/router.js";
import { createRuntimeConfigStore } from "../src/app/runtime-config.js";

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
      handleUnauthorizedBridgeCommand: vi.fn().mockResolvedValue(undefined),
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
      FEISHU_OWNER_OPEN_IDS: [],
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
      FEISHU_GROUP_MESSAGE_KEYWORDS: [],
      FEISHU_OWNER_OPEN_IDS: [],
    });
    const router = createMessageRouter(deps as any);

    await router.handleFeishuMessage({});

    expect(deps.promptService.handleUserPrompt).toHaveBeenCalledWith(
      { openId: "ou_1", userId: "u_1" },
      expect.objectContaining({ conversationTarget: groupTarget }),
    );
  });

  it("keyword 模式命中关键词时应把群消息交给 prompt", async () => {
    const deps = createDeps({
      FEISHU_GROUP_CHAT_POLICY: "open",
      FEISHU_GROUP_CHAT_ALLOWLIST: [],
      FEISHU_GROUP_MESSAGE_MODE: "keyword",
      FEISHU_GROUP_MESSAGE_KEYWORDS: ["hello"],
      FEISHU_OWNER_OPEN_IDS: [],
    });
    const router = createMessageRouter(deps as any);

    await router.handleFeishuMessage({});

    expect(deps.promptService.handleUserPrompt).toHaveBeenCalledWith(
      { openId: "ou_1", userId: "u_1" },
      expect.objectContaining({ conversationTarget: groupTarget }),
    );
  });

  it("keyword 模式下以关键词开头的命令应按命令处理", async () => {
    const deps = createDeps({
      FEISHU_GROUP_CHAT_POLICY: "open",
      FEISHU_GROUP_CHAT_ALLOWLIST: [],
      FEISHU_GROUP_MESSAGE_MODE: "keyword",
      FEISHU_GROUP_MESSAGE_KEYWORDS: ["pi"],
      FEISHU_OWNER_OPEN_IDS: ["ou_1"],
    });
    deps.parseMessageEvent.mockReturnValue({
      ...groupEvent,
      message: {
        ...groupEvent.message,
        content: '{"text":"pi /new"}',
      },
    } as any);
    deps.normalizeFeishuInboundMessage.mockReturnValue({
      kind: "text",
      identity: { openId: "ou_1", userId: "u_1" },
      conversationTarget: groupTarget,
      messageId: "om_group_keyword_command",
      messageType: "text",
      createTime: "123",
      rawContent: '{"text":"pi /new"}',
      text: "pi /new",
    });
    const router = createMessageRouter(deps as any);

    await router.handleFeishuMessage({});

    expect(deps.commandService.handleBridgeCommand).toHaveBeenCalledWith(
      { openId: "ou_1", userId: "u_1" },
      { name: "new", args: "" },
      groupTarget,
    );
    expect(deps.promptService.handleUserPrompt).not.toHaveBeenCalled();
  });

  it("keyword 模式下关键词不在开头时不应把文本里的命令当命令", async () => {
    const deps = createDeps({
      FEISHU_GROUP_CHAT_POLICY: "open",
      FEISHU_GROUP_CHAT_ALLOWLIST: [],
      FEISHU_GROUP_MESSAGE_MODE: "keyword",
      FEISHU_GROUP_MESSAGE_KEYWORDS: ["pi"],
      FEISHU_OWNER_OPEN_IDS: ["ou_1"],
    });
    deps.parseMessageEvent.mockReturnValue({
      ...groupEvent,
      message: {
        ...groupEvent.message,
        content: '{"text":"hello pi /new"}',
      },
    } as any);
    deps.normalizeFeishuInboundMessage.mockReturnValue({
      kind: "text",
      identity: { openId: "ou_1", userId: "u_1" },
      conversationTarget: groupTarget,
      messageId: "om_group_keyword_prompt",
      messageType: "text",
      createTime: "123",
      rawContent: '{"text":"hello pi /new"}',
      text: "hello pi /new",
    });
    const router = createMessageRouter(deps as any);

    await router.handleFeishuMessage({});

    expect(deps.commandService.handleBridgeCommand).not.toHaveBeenCalled();
    expect(deps.promptService.handleUserPrompt).toHaveBeenCalledWith(
      { openId: "ou_1", userId: "u_1" },
      expect.objectContaining({ text: "hello pi /new" }),
    );
  });

  it("keyword 模式未配置关键词时仍允许 @ 机器人执行群命令", async () => {
    const deps = createDeps({
      FEISHU_GROUP_CHAT_POLICY: "open",
      FEISHU_GROUP_CHAT_ALLOWLIST: [],
      FEISHU_GROUP_MESSAGE_MODE: "keyword",
      FEISHU_GROUP_MESSAGE_KEYWORDS: [],
      FEISHU_BOT_OPEN_ID: "ou_bot_1",
      FEISHU_OWNER_OPEN_IDS: ["ou_1"],
    });
    deps.parseMessageEvent.mockReturnValue({
      ...groupEvent,
      message: {
        ...groupEvent.message,
        content: '{"text":"@Pi /group mode mention"}',
        mentions: [{ key: "@_user_1", id: { openId: "ou_bot_1" }, name: "Pi" }],
      },
    } as any);
    deps.normalizeFeishuInboundMessage.mockReturnValue({
      kind: "text",
      identity: { openId: "ou_1", userId: "u_1" },
      conversationTarget: groupTarget,
      messageId: "om_group_mention_command",
      messageType: "text",
      createTime: "123",
      rawContent: '{"text":"/group mode mention"}',
      text: "/group mode mention",
    });
    const router = createMessageRouter(deps as any);

    await router.handleFeishuMessage({});

    expect(deps.commandService.handleBridgeCommand).toHaveBeenCalledWith(
      { openId: "ou_1", userId: "u_1" },
      { name: "group", args: "mode mention" },
      groupTarget,
    );
  });

  it("群聊普通成员只能执行公开命令", async () => {
    const deps = createDeps({
      FEISHU_GROUP_CHAT_POLICY: "open",
      FEISHU_GROUP_CHAT_ALLOWLIST: [],
      FEISHU_GROUP_MESSAGE_MODE: "all",
      FEISHU_OWNER_OPEN_IDS: [],
    });
    deps.normalizeFeishuInboundMessage.mockReturnValue({
      kind: "text",
      identity: { openId: "ou_1", userId: "u_1" },
      conversationTarget: groupTarget,
      messageId: "om_group_1",
      messageType: "text",
      createTime: "123",
      rawContent: '{"text":"/new"}',
      text: "/new",
    });
    const router = createMessageRouter(deps as any);

    await router.handleFeishuMessage({});

    expect(deps.commandService.handleUnauthorizedBridgeCommand).toHaveBeenCalledWith(
      { openId: "ou_1", userId: "u_1" },
      { name: "new", args: "" },
      groupTarget,
    );
    expect(deps.commandService.handleBridgeCommand).not.toHaveBeenCalled();
  });

  it("群聊 owner 可以执行 owner-only 命令", async () => {
    const deps = createDeps({
      FEISHU_GROUP_CHAT_POLICY: "open",
      FEISHU_GROUP_CHAT_ALLOWLIST: [],
      FEISHU_GROUP_MESSAGE_MODE: "all",
      FEISHU_OWNER_OPEN_IDS: ["ou_1"],
    });
    deps.normalizeFeishuInboundMessage.mockReturnValue({
      kind: "text",
      identity: { openId: "ou_1", userId: "u_1" },
      conversationTarget: groupTarget,
      messageId: "om_group_1",
      messageType: "text",
      createTime: "123",
      rawContent: '{"text":"/new"}',
      text: "/new",
    });
    const router = createMessageRouter(deps as any);

    await router.handleFeishuMessage({});

    expect(deps.commandService.handleBridgeCommand).toHaveBeenCalledWith(
      { openId: "ou_1", userId: "u_1" },
      { name: "new", args: "" },
      groupTarget,
    );
    expect(deps.commandService.handleUnauthorizedBridgeCommand).not.toHaveBeenCalled();
  });

  it("群聊普通成员可以执行 /tools /skills /status", async () => {
    const deps = createDeps({
      FEISHU_GROUP_CHAT_POLICY: "open",
      FEISHU_GROUP_CHAT_ALLOWLIST: [],
      FEISHU_GROUP_MESSAGE_MODE: "all",
      FEISHU_OWNER_OPEN_IDS: [],
    });
    const router = createMessageRouter(deps as any);

    for (const command of ["/tools", "/skills", "/status"]) {
      deps.commandService.handleBridgeCommand.mockClear();
      deps.commandService.handleUnauthorizedBridgeCommand.mockClear();
      deps.normalizeFeishuInboundMessage.mockReturnValue({
        kind: "text",
        identity: { openId: "ou_1", userId: "u_1" },
        conversationTarget: groupTarget,
        messageId: `om_group_${command}`,
        messageType: "text",
        createTime: "123",
        rawContent: JSON.stringify({ text: command }),
        text: command,
      });

      await router.handleFeishuMessage({});

      expect(deps.commandService.handleBridgeCommand).toHaveBeenCalled();
      expect(deps.commandService.handleUnauthorizedBridgeCommand).not.toHaveBeenCalled();
    }
  });

  it("群聊普通成员不能修改 /tools", async () => {
    const deps = createDeps({
      FEISHU_GROUP_CHAT_POLICY: "open",
      FEISHU_GROUP_CHAT_ALLOWLIST: [],
      FEISHU_GROUP_MESSAGE_MODE: "all",
      FEISHU_OWNER_OPEN_IDS: [],
    });
    const router = createMessageRouter(deps as any);

    for (const command of ["/tools on read", "/tools off read", "/tools set read", "/tools reset"]) {
      deps.commandService.handleBridgeCommand.mockClear();
      deps.commandService.handleUnauthorizedBridgeCommand.mockClear();
      deps.normalizeFeishuInboundMessage.mockReturnValue({
        kind: "text",
        identity: { openId: "ou_1", userId: "u_1" },
        conversationTarget: groupTarget,
        messageId: `om_group_tools_${command.replace(/\W+/g, "_")}`,
        messageType: "text",
        createTime: "123",
        rawContent: JSON.stringify({ text: command }),
        text: command,
      });

      await router.handleFeishuMessage({});

      expect(deps.commandService.handleBridgeCommand).not.toHaveBeenCalled();
      expect(deps.commandService.handleUnauthorizedBridgeCommand).toHaveBeenCalled();
    }
  });

  it("运行时切换群聊配置后，router 应立刻按新配置生效", async () => {
    const runtimeConfig = createRuntimeConfigStore({
      FEISHU_GROUP_CHAT_POLICY: "disabled",
      FEISHU_GROUP_CHAT_ALLOWLIST: [],
      FEISHU_GROUP_MESSAGE_MODE: "mention",
      FEISHU_GROUP_MESSAGE_KEYWORDS: [],
    });
    const deps = createDeps({
      FEISHU_GROUP_CHAT_POLICY: "disabled",
      FEISHU_GROUP_CHAT_ALLOWLIST: [],
      FEISHU_GROUP_MESSAGE_MODE: "mention",
      FEISHU_GROUP_MESSAGE_KEYWORDS: [],
      FEISHU_OWNER_OPEN_IDS: [],
    });
    const router = createMessageRouter({
      ...(deps as any),
      runtimeConfig,
    });

    runtimeConfig.setGroupChatPolicy("open");
    runtimeConfig.setGroupMessageMode("all");
    await router.handleFeishuMessage({});

    expect(deps.promptService.handleUserPrompt).toHaveBeenCalledWith(
      { openId: "ou_1", userId: "u_1" },
      expect.objectContaining({ conversationTarget: groupTarget }),
    );

    deps.promptService.handleUserPrompt.mockClear();
    runtimeConfig.setGroupChatPolicy("disabled");
    await router.handleFeishuMessage({});

    expect(deps.promptService.handleUserPrompt).not.toHaveBeenCalled();
  });
});
