import { describe, it, expect } from "vitest";
import { parseMessageEvent, isP2PTextMessage, extractTextContent } from "../src/feishu/events.js";
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
  });

  it("缺少 openId 应返回 null", () => {
    const data = {
      sender: { senderId: { userId: "uid_123", unionId: "on_123" } },
      message: { messageId: "om_123", chatType: "p2p", messageType: "text", content: "{}", createTime: "" },
    };
    expect(parseMessageEvent(data as Record<string, unknown>)).toBeNull();
  });

  it("缺少 messageId 应返回 null", () => {
    const data = {
      sender: { senderId: { openId: "ou_123", userId: "uid_123", unionId: "on_123" }, senderType: "user", tenantKey: "tk" },
      message: { chatType: "p2p", messageType: "text", content: "{}", createTime: "" },
    };
    expect(parseMessageEvent(data as Record<string, unknown>)).toBeNull();
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
