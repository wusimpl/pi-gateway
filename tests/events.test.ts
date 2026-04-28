import { describe, it, expect } from "vitest";
import { parseMessageEvent, isP2PTextMessage, isSupportedP2PMessage, extractTextContent } from "../src/feishu/events.js";
import { isSupportedFeishuMessage } from "../src/feishu/group-routing.js";
import type { FeishuMessageEvent } from "../src/types.js";

describe("parseMessageEvent", () => {
  it("应正确解析合法事件", () => {
    const data: FeishuMessageEvent = {
      sender: {
        senderId: { openId: "ou_123", userId: "uid_123", unionId: "on_123" },
        senderType: "user",
        tenantKey: "tk_123",
      },
      message: {
        messageId: "om_123",
        rootId: "om_root_123",
        parentId: "om_parent_123",
        threadId: "omt_123",
        chatId: "oc_123",
        chatType: "p2p",
        messageType: "text",
        content: '{"text":"hello"}',
        createTime: "1234567890",
      },
    };
    const result = parseMessageEvent(data as unknown as Record<string, unknown>);
    expect(result).not.toBeNull();
    expect(result!.sender.senderId.openId).toBe("ou_123");
    expect(result!.message.messageId).toBe("om_123");
    expect(result!.message.parentId).toBe("om_parent_123");
    expect(result!.message.rootId).toBe("om_root_123");
    expect(result!.message.threadId).toBe("omt_123");
  });

  it("缺少 openId 应返回 null", () => {
    const data = {
      sender: { senderId: { userId: "uid_123", unionId: "on_123" } },
      message: { messageId: "om_123", chatType: "p2p", messageType: "text", content: "{}", createTime: "" },
    };
    expect(parseMessageEvent(data as Record<string, unknown>)).toBeNull();
  });

  it("应支持飞书原始 snake_case 事件", () => {
    const data = {
      sender: {
        sender_id: { open_id: "ou_456", user_id: "uid_456", union_id: "on_456" },
        sender_type: "user",
        tenant_key: "tk_456",
      },
      message: {
        message_id: "om_456",
        root_id: "om_root_456",
        parent_id: "om_parent_456",
        thread_id: "omt_456",
        chat_id: "oc_456",
        chat_type: "p2p",
        message_type: "text",
        content: '{"text":"hello"}',
        mentions: [
          {
            key: "@_user_1",
            id: { open_id: "ou_bot_1", user_id: "u_bot_1" },
            name: "Pi",
            tenant_key: "tk_456",
          },
        ],
        create_time: "1234567890",
      },
    };
    const result = parseMessageEvent(data as Record<string, unknown>);
    expect(result).not.toBeNull();
    expect(result!.sender.senderId.userId).toBe("uid_456");
    expect(result!.message.messageId).toBe("om_456");
    expect(result!.message.parentId).toBe("om_parent_456");
    expect(result!.message.rootId).toBe("om_root_456");
    expect(result!.message.threadId).toBe("omt_456");
    expect(result!.message.mentions).toEqual([
      {
        key: "@_user_1",
        id: { openId: "ou_bot_1", userId: "u_bot_1" },
        name: "Pi",
        tenantKey: "tk_456",
      },
    ]);
  });

  it("缺少 messageId 应返回 null", () => {
    const data = {
      sender: { senderId: { openId: "ou_123", userId: "uid_123", unionId: "on_123" }, senderType: "user", tenantKey: "tk" },
      message: { chatType: "p2p", messageType: "text", content: "{}", createTime: "" },
    };
    expect(parseMessageEvent(data as Record<string, unknown>)).toBeNull();
  });
});

describe("isSupportedFeishuMessage", () => {
  const baseEvent: FeishuMessageEvent = {
    sender: { senderId: { openId: "ou_1", userId: "u1", unionId: "on1" }, senderType: "user", tenantKey: "tk" },
    message: { messageId: "om_1", chatId: "oc_1", chatType: "group", messageType: "text", content: "{}", createTime: "" },
  };
  const baseConfig = {
    FEISHU_GROUP_CHAT_POLICY: "open" as const,
    FEISHU_GROUP_CHAT_ALLOWLIST: [],
    FEISHU_GROUP_MESSAGE_MODE: "mention" as const,
    FEISHU_GROUP_MESSAGE_KEYWORDS: [],
    FEISHU_BOT_OPEN_ID: "ou_bot_1",
  };

  it("默认 disabled 时应忽略群聊消息", () => {
    expect(isSupportedFeishuMessage(baseEvent, {
      ...baseConfig,
      FEISHU_GROUP_CHAT_POLICY: "disabled",
    })).toBe(false);
  });

  it("allowlist 模式应只放行允许的群", () => {
    expect(isSupportedFeishuMessage(baseEvent, {
      ...baseConfig,
      FEISHU_GROUP_CHAT_POLICY: "allowlist",
      FEISHU_GROUP_CHAT_ALLOWLIST: ["oc_2"],
    })).toBe(false);
    expect(isSupportedFeishuMessage(baseEvent, {
      ...baseConfig,
      FEISHU_GROUP_CHAT_POLICY: "allowlist",
      FEISHU_GROUP_CHAT_ALLOWLIST: ["oc_1"],
      FEISHU_GROUP_MESSAGE_MODE: "all",
    })).toBe(true);
  });

  it("mention 模式应要求 @ 机器人", () => {
    expect(isSupportedFeishuMessage(baseEvent, baseConfig)).toBe(false);
    expect(isSupportedFeishuMessage({
      ...baseEvent,
      message: {
        ...baseEvent.message,
        mentions: [{ key: "@_user_1", id: { openId: "ou_bot_1" }, name: "Pi" }],
      },
    }, baseConfig)).toBe(true);
  });

  it("all 模式应放行普通群消息", () => {
    expect(isSupportedFeishuMessage(baseEvent, {
      ...baseConfig,
      FEISHU_GROUP_MESSAGE_MODE: "all",
    })).toBe(true);
  });

  it("keyword 模式应按完整英文词匹配，避免误触发", () => {
    expect(isSupportedFeishuMessage({
      ...baseEvent,
      message: {
        ...baseEvent.message,
        content: '{"text":"topic 里这个词不该触发"}',
      },
    }, {
      ...baseConfig,
      FEISHU_GROUP_MESSAGE_MODE: "keyword",
      FEISHU_GROUP_MESSAGE_KEYWORDS: ["pi"],
    })).toBe(false);

    expect(isSupportedFeishuMessage({
      ...baseEvent,
      message: {
        ...baseEvent.message,
        content: '{"text":"Pi，帮我看下这个报错"}',
      },
    }, {
      ...baseConfig,
      FEISHU_GROUP_MESSAGE_MODE: "keyword",
      FEISHU_GROUP_MESSAGE_KEYWORDS: ["pi"],
    })).toBe(true);
  });

  it("keyword 模式应支持中文短语匹配", () => {
    expect(isSupportedFeishuMessage({
      ...baseEvent,
      message: {
        ...baseEvent.message,
        content: '{"text":"请小助手帮我整理这段讨论"}',
      },
    }, {
      ...baseConfig,
      FEISHU_GROUP_MESSAGE_MODE: "keyword",
      FEISHU_GROUP_MESSAGE_KEYWORDS: ["小助手"],
    })).toBe(true);
  });

  it("keyword 模式未配置关键词时应忽略消息", () => {
    expect(isSupportedFeishuMessage({
      ...baseEvent,
      message: {
        ...baseEvent.message,
        content: '{"text":"Pi 帮我看下"}',
      },
    }, {
      ...baseConfig,
      FEISHU_GROUP_MESSAGE_MODE: "keyword",
      FEISHU_GROUP_MESSAGE_KEYWORDS: [],
    })).toBe(false);
  });
});

describe("isP2PTextMessage", () => {
  const baseEvent: FeishuMessageEvent = {
    sender: { senderId: { openId: "ou_1", userId: "u1", unionId: "on1" }, senderType: "user", tenantKey: "tk" },
    message: { messageId: "om_1", chatId: "oc_1", chatType: "p2p", messageType: "text", content: "{}", createTime: "" },
  };

  it("私聊文本消息应返回 true", () => {
    expect(isP2PTextMessage(baseEvent)).toBe(true);
  });

  it("群聊消息应返回 false", () => {
    expect(isP2PTextMessage({ ...baseEvent, message: { ...baseEvent.message, chatType: "group" } })).toBe(false);
  });

  it("非文本消息应返回 false", () => {
    expect(isP2PTextMessage({ ...baseEvent, message: { ...baseEvent.message, messageType: "image" } })).toBe(false);
  });
});

describe("isSupportedP2PMessage", () => {
  const baseEvent: FeishuMessageEvent = {
    sender: { senderId: { openId: "ou_1", userId: "u1", unionId: "on1" }, senderType: "user", tenantKey: "tk" },
    message: { messageId: "om_1", chatId: "oc_1", chatType: "p2p", messageType: "text", content: "{}", createTime: "" },
  };

  it("私聊文本消息应返回 true", () => {
    expect(isSupportedP2PMessage(baseEvent)).toBe(true);
  });

  it("私聊图片消息应返回 true", () => {
    expect(isSupportedP2PMessage({ ...baseEvent, message: { ...baseEvent.message, messageType: "image" } })).toBe(true);
  });

  it("私聊富文本消息应返回 true", () => {
    expect(isSupportedP2PMessage({ ...baseEvent, message: { ...baseEvent.message, messageType: "post" } })).toBe(true);
  });

  it("私聊语音消息应返回 true", () => {
    expect(isSupportedP2PMessage({ ...baseEvent, message: { ...baseEvent.message, messageType: "audio" } })).toBe(true);
  });

  it("私聊文件消息应返回 true", () => {
    expect(isSupportedP2PMessage({ ...baseEvent, message: { ...baseEvent.message, messageType: "file" } })).toBe(true);
  });

  it("不支持的消息类型应返回 false", () => {
    expect(isSupportedP2PMessage({ ...baseEvent, message: { ...baseEvent.message, messageType: "sticker" } })).toBe(false);
  });
});

describe("extractTextContent", () => {
  it("应从 JSON 中提取 text 字段", () => {
    expect(extractTextContent('{"text":"hello world"}')).toBe("hello world");
  });

  it("非 JSON 内容应原样返回", () => {
    expect(extractTextContent("plain text")).toBe("plain text");
  });

  it("JSON 缺少 text 字段应返回原始字符串", () => {
    expect(extractTextContent('{"foo":"bar"}')).toBe('{"foo":"bar"}');
  });
});
