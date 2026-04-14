import type { FeishuMessageEvent } from "../types.js";
import { logger } from "../app/logger.js";

/**
 * 从飞书事件 payload 中提取消息事件数据
 * 返回 null 表示解析失败
 */
export function parseMessageEvent(data: Record<string, unknown>): FeishuMessageEvent | null {
  try {
    const event = data as unknown as FeishuMessageEvent;
    // 基本校验
    if (!event.sender?.senderId?.openId) return null;
    if (!event.message?.messageId) return null;
    if (!event.message?.chatType) return null;
    return event;
  } catch (err) {
    logger.error("解析飞书事件失败", { error: String(err) });
    return null;
  }
}

/** 过滤：仅保留私聊文本消息 */
export function isP2PTextMessage(event: FeishuMessageEvent): boolean {
  return event.message.chatType === "p2p" && event.message.messageType === "text";
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
