import type { FeishuMessageEvent } from "../types.js";
import { logger } from "../app/logger.js";

export const SUPPORTED_P2P_MESSAGE_TYPES = ["text", "post", "image", "audio", "file"] as const;

/**
 * 从飞书事件 payload 中提取消息事件数据
 * 返回 null 表示解析失败
 */
export function parseMessageEvent(data: Record<string, unknown>): FeishuMessageEvent | null {
  try {
    const payload = (data.event ?? data) as Record<string, unknown>;
    const normalized = normalizeMessageEvent(payload);
    const event = normalized as FeishuMessageEvent;

    if (!event.sender?.senderId?.openId) {
      logger.debug("忽略飞书事件：缺少 sender.senderId.openId", {
        topLevelKeys: Object.keys(data),
        payloadKeys: Object.keys(payload),
        senderKeys: getObjectKeys(payload.sender),
      });
      return null;
    }

    if (!event.message?.messageId) {
      logger.debug("忽略飞书事件：缺少 message.messageId", {
        topLevelKeys: Object.keys(data),
        payloadKeys: Object.keys(payload),
        messageKeys: getObjectKeys(payload.message),
      });
      return null;
    }

    if (!event.message?.chatType) {
      logger.debug("忽略飞书事件：缺少 message.chatType", {
        topLevelKeys: Object.keys(data),
        payloadKeys: Object.keys(payload),
        messageKeys: getObjectKeys(payload.message),
      });
      return null;
    }

    return event;
  } catch (err) {
    logger.error("解析飞书事件失败", { error: String(err) });
    return null;
  }
}

function normalizeMessageEvent(payload: Record<string, unknown>): Partial<FeishuMessageEvent> {
  const sender = asRecord(payload.sender);
  const senderId = asRecord(sender?.sender_id ?? sender?.senderId);
  const message = asRecord(payload.message);

  return {
    sender: {
      senderId: {
        openId: asString(senderId?.open_id ?? senderId?.openId),
        userId: asString(senderId?.user_id ?? senderId?.userId),
        unionId: asString(senderId?.union_id ?? senderId?.unionId),
      },
      senderType: asString(sender?.sender_type ?? sender?.senderType),
      tenantKey: asString(sender?.tenant_key ?? sender?.tenantKey),
    },
    message: {
      messageId: asString(message?.message_id ?? message?.messageId),
      rootId: asOptionalString(message?.root_id ?? message?.rootId),
      parentId: asOptionalString(message?.parent_id ?? message?.parentId),
      threadId: asOptionalString(message?.thread_id ?? message?.threadId),
      chatId: asString(message?.chat_id ?? message?.chatId),
      chatType: asString(message?.chat_type ?? message?.chatType) as "p2p" | "group",
      messageType: asString(message?.message_type ?? message?.messageType),
      content: asString(message?.content),
      createTime: asString(message?.create_time ?? message?.createTime),
    },
  };
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : null;
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function asOptionalString(value: unknown): string | undefined {
  return typeof value === "string" && value ? value : undefined;
}

function getObjectKeys(value: unknown): string[] {
  return typeof value === "object" && value !== null ? Object.keys(value as Record<string, unknown>) : [];
}

/** 过滤：仅保留私聊文本消息 */
export function isP2PTextMessage(event: FeishuMessageEvent): boolean {
  const matched = event.message.chatType === "p2p" && event.message.messageType === "text";

  if (!matched) {
    logger.debug("忽略飞书事件：不是私聊文本消息", {
      chatType: event.message.chatType,
      messageType: event.message.messageType,
    });
  }

  return matched;
}

/** 过滤：仅保留当前网关支持的私聊消息 */
export function isSupportedP2PMessage(event: FeishuMessageEvent): boolean {
  const matched =
    event.message.chatType === "p2p" &&
    SUPPORTED_P2P_MESSAGE_TYPES.includes(
      event.message.messageType as (typeof SUPPORTED_P2P_MESSAGE_TYPES)[number],
    );

  if (!matched) {
    logger.debug("忽略飞书事件：不是支持的私聊消息", {
      chatType: event.message.chatType,
      messageType: event.message.messageType,
      supportedTypes: SUPPORTED_P2P_MESSAGE_TYPES,
    });
  }

  return matched;
}

/** 从消息 content JSON 中提取纯文本 */
export function extractTextContent(content: string): string {
  try {
    const parsed = JSON.parse(content);
    return parsed.text ?? content;
  } catch {
    return content;
  }
}
