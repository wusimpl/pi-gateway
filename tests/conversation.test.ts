import { describe, expect, it } from "vitest";
import {
  createFeishuConversationTarget,
  createGroupConversationTarget,
  createP2PConversationTarget,
  createThreadConversationTarget,
} from "../src/conversation.js";
import type { FeishuMessageEvent } from "../src/types.js";

describe("conversation target", () => {
  it("私聊 key 继续使用 open_id，保持现有数据兼容", () => {
    expect(createP2PConversationTarget("ou_1")).toEqual({
      kind: "p2p",
      key: "ou_1",
      receiveIdType: "open_id",
      receiveId: "ou_1",
    });
  });

  it("群聊 key 使用 chat_id，回复目标也是 chat_id", () => {
    expect(createGroupConversationTarget("oc_1")).toEqual({
      kind: "group",
      key: "oc_1",
      receiveIdType: "chat_id",
      receiveId: "oc_1",
      chatId: "oc_1",
    });
  });

  it("thread key 使用 chat_id 和 thread_id 组合", () => {
    expect(createThreadConversationTarget("oc_1", "omt_1")).toEqual({
      kind: "thread",
      key: "oc_1:omt_1",
      receiveIdType: "chat_id",
      receiveId: "oc_1",
      chatId: "oc_1",
      threadId: "omt_1",
    });
  });

  it("能从飞书私聊事件生成会话目标", () => {
    expect(createFeishuConversationTarget(baseEvent({ chatType: "p2p" }))).toMatchObject({
      kind: "p2p",
      key: "ou_1",
      receiveIdType: "open_id",
      receiveId: "ou_1",
    });
  });

  it("能从飞书群聊事件生成会话目标", () => {
    expect(createFeishuConversationTarget(baseEvent({ chatType: "group" }))).toMatchObject({
      kind: "group",
      key: "oc_1",
      receiveIdType: "chat_id",
      receiveId: "oc_1",
      chatId: "oc_1",
    });
  });
});

function baseEvent(input: { chatType: "p2p" | "group"; threadId?: string }): FeishuMessageEvent {
  return {
    sender: {
      senderId: { openId: "ou_1", userId: "u_1", unionId: "on_1" },
      senderType: "user",
      tenantKey: "tk",
    },
    message: {
      messageId: "om_1",
      chatId: "oc_1",
      chatType: input.chatType,
      threadId: input.threadId,
      messageType: "text",
      content: '{"text":"hello"}',
      createTime: "123",
    },
  };
}
