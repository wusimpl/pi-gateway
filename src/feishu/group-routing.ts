import type { Config } from "../config.js";
import type { FeishuMessageEvent } from "../types.js";
import { SUPPORTED_P2P_MESSAGE_TYPES } from "./events.js";
import { logger } from "../app/logger.js";

export type FeishuGroupChatPolicy = "disabled" | "allowlist" | "open";
export type FeishuGroupMessageMode = "mention" | "all" | "keyword";
export type FeishuMessageRoutingDecision = "route" | "capture_unmatched" | "ignore";

export type FeishuGroupRoutingConfig = Pick<
  Config,
  | "FEISHU_GROUP_CHAT_POLICY"
  | "FEISHU_GROUP_CHAT_ALLOWLIST"
  | "FEISHU_GROUP_MESSAGE_MODE"
  | "FEISHU_GROUP_MESSAGE_KEYWORDS"
  | "FEISHU_GROUP_UNMATCHED_MESSAGE_POLICY"
  | "FEISHU_BOT_OPEN_ID"
>;

export function isSupportedFeishuMessage(
  event: FeishuMessageEvent,
  config: FeishuGroupRoutingConfig,
): boolean {
  return getFeishuMessageRoutingDecision(event, config) === "route";
}

export function getFeishuMessageRoutingDecision(
  event: FeishuMessageEvent,
  config: FeishuGroupRoutingConfig,
): FeishuMessageRoutingDecision {
  if (!isSupportedMessageType(event)) {
    logger.debug("忽略飞书事件：消息类型暂不支持", {
      chatType: event.message.chatType,
      messageType: event.message.messageType,
      supportedTypes: SUPPORTED_P2P_MESSAGE_TYPES,
    });
    return "ignore";
  }

  if (event.message.chatType === "p2p") {
    return "route";
  }

  if (event.message.chatType !== "group") {
    logger.debug("忽略飞书事件：聊天类型暂不支持", { chatType: event.message.chatType });
    return "ignore";
  }

  if (config.FEISHU_GROUP_CHAT_POLICY === "disabled") {
    logger.debug("忽略飞书群消息：群聊功能未开启", { chatId: event.message.chatId });
    return "ignore";
  }

  if (
    config.FEISHU_GROUP_CHAT_POLICY === "allowlist"
    && !config.FEISHU_GROUP_CHAT_ALLOWLIST.includes(event.message.chatId)
  ) {
    logger.debug("忽略飞书群消息：群不在 allowlist", { chatId: event.message.chatId });
    return "ignore";
  }

  if (config.FEISHU_GROUP_MESSAGE_MODE === "all") {
    return "route";
  }

  const mentioned = isBotMentioned(event, config.FEISHU_BOT_OPEN_ID);
  if (config.FEISHU_GROUP_MESSAGE_MODE === "keyword") {
    const matchedKeyword = containsConfiguredKeyword(event, config.FEISHU_GROUP_MESSAGE_KEYWORDS);
    if (mentioned || matchedKeyword) {
      return "route";
    }

    return getUnmatchedGroupMessageDecision(event, config, "keyword 模式下未 @ 机器人且未命中关键词");
  }

  if (mentioned) {
    return "route";
  }

  return getUnmatchedGroupMessageDecision(event, config, "mention 模式下未 @ 机器人");
}

function getUnmatchedGroupMessageDecision(
  event: FeishuMessageEvent,
  config: FeishuGroupRoutingConfig,
  reason: string,
): FeishuMessageRoutingDecision {
  if (
    config.FEISHU_GROUP_CHAT_POLICY === "allowlist"
    && config.FEISHU_GROUP_UNMATCHED_MESSAGE_POLICY === "capture"
  ) {
    logger.debug(`暂存飞书群消息：${reason}`, { chatId: event.message.chatId });
    return "capture_unmatched";
  }

  logger.debug(`忽略飞书群消息：${reason}`, { chatId: event.message.chatId });
  return "ignore";
}

export function isBotMentioned(event: FeishuMessageEvent, botOpenId?: string): boolean {
  const normalizedBotOpenId = botOpenId?.trim();
  if (!normalizedBotOpenId) {
    return false;
  }

  const mentions = event.message.mentions ?? [];
  return mentions.some((mention) => mention.id.openId === normalizedBotOpenId);
}

function isSupportedMessageType(event: FeishuMessageEvent): boolean {
  return SUPPORTED_P2P_MESSAGE_TYPES.includes(
    event.message.messageType as (typeof SUPPORTED_P2P_MESSAGE_TYPES)[number],
  );
}

function containsConfiguredKeyword(event: FeishuMessageEvent, keywords: string[]): boolean {
  const normalizedKeywords = keywords
    .map((keyword) => keyword.trim().toLowerCase())
    .filter(Boolean);
  if (normalizedKeywords.length === 0) {
    return false;
  }

  const normalizedMessageText = buildSearchableMessageText(event).toLowerCase();
  return normalizedKeywords.some((keyword) => matchesKeyword(normalizedMessageText, keyword));
}

function buildSearchableMessageText(event: FeishuMessageEvent): string {
  const mentions = event.message.mentions ?? [];
  const mentionMap = new Map(
    mentions
      .map((mention) => {
        const key = mention.key?.trim();
        if (!key) return null;
        const name = mention.name?.trim();
        return [key, name ? `@${name}` : key] as const;
      })
      .filter((entry): entry is readonly [string, string] => Boolean(entry)),
  );

  const content = parseMessageContent(event.message.content);
  const text = collectStringValues(content)
    .map((value) => replaceMentionKeys(value, mentionMap))
    .join(" ")
    .trim();

  if (!text) {
    return mentions.map((mention) => mention.name?.trim()).filter(Boolean).join(" ");
  }

  return text;
}

function parseMessageContent(content: string): unknown {
  try {
    return JSON.parse(content) as unknown;
  } catch {
    return content;
  }
}

function replaceMentionKeys(text: string, mentionMap: ReadonlyMap<string, string>): string {
  let replaced = text;
  for (const [key, value] of mentionMap.entries()) {
    replaced = replaced.replaceAll(key, value);
  }
  return replaced;
}

function matchesKeyword(normalizedMessageText: string, normalizedKeyword: string): boolean {
  if (!normalizedKeyword) {
    return false;
  }

  if (isAsciiKeyword(normalizedKeyword)) {
    const escapedKeyword = escapeRegExp(normalizedKeyword);
    return new RegExp(`(^|[^a-z0-9_-])${escapedKeyword}(?=$|[^a-z0-9_-])`).test(normalizedMessageText);
  }

  return normalizedMessageText.includes(normalizedKeyword);
}

function isAsciiKeyword(keyword: string): boolean {
  return /^[a-z0-9][a-z0-9_-]*$/.test(keyword);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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
