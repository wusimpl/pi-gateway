import type { Config } from "../config.js";
import type { FeishuMessageEvent } from "../types.js";
import { SUPPORTED_P2P_MESSAGE_TYPES } from "./events.js";
import { logger } from "../app/logger.js";

export type FeishuGroupChatPolicy = "disabled" | "allowlist" | "open";
export type FeishuGroupMessageMode = "mention" | "all";

export type FeishuGroupRoutingConfig = Pick<
  Config,
  "FEISHU_GROUP_CHAT_POLICY" | "FEISHU_GROUP_CHAT_ALLOWLIST" | "FEISHU_GROUP_MESSAGE_MODE" | "FEISHU_BOT_OPEN_ID"
>;

export function isSupportedFeishuMessage(
  event: FeishuMessageEvent,
  config: FeishuGroupRoutingConfig,
): boolean {
  if (!isSupportedMessageType(event)) {
    logger.debug("忽略飞书事件：消息类型暂不支持", {
      chatType: event.message.chatType,
      messageType: event.message.messageType,
      supportedTypes: SUPPORTED_P2P_MESSAGE_TYPES,
    });
    return false;
  }

  if (event.message.chatType === "p2p") {
    return true;
  }

  if (event.message.chatType !== "group") {
    logger.debug("忽略飞书事件：聊天类型暂不支持", { chatType: event.message.chatType });
    return false;
  }

  if (config.FEISHU_GROUP_CHAT_POLICY === "disabled") {
    logger.debug("忽略飞书群消息：群聊功能未开启", { chatId: event.message.chatId });
    return false;
  }

  if (
    config.FEISHU_GROUP_CHAT_POLICY === "allowlist"
    && !config.FEISHU_GROUP_CHAT_ALLOWLIST.includes(event.message.chatId)
  ) {
    logger.debug("忽略飞书群消息：群不在 allowlist", { chatId: event.message.chatId });
    return false;
  }

  if (config.FEISHU_GROUP_MESSAGE_MODE === "all") {
    return true;
  }

  const mentioned = isBotMentioned(event, config.FEISHU_BOT_OPEN_ID);
  if (!mentioned) {
    logger.debug("忽略飞书群消息：mention 模式下未 @ 机器人", { chatId: event.message.chatId });
  }
  return mentioned;
}

export function isBotMentioned(event: FeishuMessageEvent, botOpenId?: string): boolean {
  const normalizedBotOpenId = botOpenId?.trim();
  const mentions = event.message.mentions ?? [];
  if (normalizedBotOpenId) {
    return mentions.some((mention) => mention.id.openId === normalizedBotOpenId);
  }

  return mentions.length > 0 || containsAtToken(event.message.content);
}

function isSupportedMessageType(event: FeishuMessageEvent): boolean {
  return SUPPORTED_P2P_MESSAGE_TYPES.includes(
    event.message.messageType as (typeof SUPPORTED_P2P_MESSAGE_TYPES)[number],
  );
}

function containsAtToken(content: string): boolean {
  try {
    const payload = JSON.parse(content) as unknown;
    return collectStringValues(payload).some((value) => /<at\b|@_/.test(value));
  } catch {
    return /<at\b|@_/.test(content);
  }
}

function collectStringValues(value: unknown): string[] {
  if (typeof value === "string") {
    return [value];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) => collectStringValues(item));
  }

  if (value && typeof value === "object") {
    return Object.values(value as Record<string, unknown>).flatMap((item) => collectStringValues(item));
  }

  return [];
}
