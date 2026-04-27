import type { FeishuMessageEvent } from "./types.js";

export type ConversationTargetKind = "p2p" | "group" | "thread";
export type ConversationReceiveIdType = "open_id" | "chat_id";

export interface ConversationTarget {
  kind: ConversationTargetKind;
  key: string;
  receiveIdType: ConversationReceiveIdType;
  receiveId: string;
  chatId?: string;
  threadId?: string;
}

export function createP2PConversationTarget(openId: string): ConversationTarget | null {
  const normalizedOpenId = openId.trim();
  if (!normalizedOpenId) {
    return null;
  }

  return {
    kind: "p2p",
    key: normalizedOpenId,
    receiveIdType: "open_id",
    receiveId: normalizedOpenId,
  };
}

export function createGroupConversationTarget(chatId: string): ConversationTarget | null {
  const normalizedChatId = chatId.trim();
  if (!normalizedChatId) {
    return null;
  }

  return {
    kind: "group",
    key: normalizedChatId,
    receiveIdType: "chat_id",
    receiveId: normalizedChatId,
    chatId: normalizedChatId,
  };
}

export function createThreadConversationTarget(chatId: string, threadId: string): ConversationTarget | null {
  const normalizedChatId = chatId.trim();
  const normalizedThreadId = threadId.trim();
  if (!normalizedChatId || !normalizedThreadId) {
    return null;
  }

  return {
    kind: "thread",
    key: `${normalizedChatId}:${normalizedThreadId}`,
    receiveIdType: "chat_id",
    receiveId: normalizedChatId,
    chatId: normalizedChatId,
    threadId: normalizedThreadId,
  };
}

export function createFeishuConversationTarget(event: FeishuMessageEvent): ConversationTarget | null {
  if (event.message.chatType === "p2p") {
    return createP2PConversationTarget(event.sender.senderId.openId);
  }

  return createGroupConversationTarget(event.message.chatId);
}

export function getConversationTargetKey(
  conversationTarget: Pick<ConversationTarget, "key"> | null | undefined,
  fallbackKey: string,
): string {
  const key = conversationTarget?.key.trim();
  return key || fallbackKey;
}
