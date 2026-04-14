import { getLarkClient } from "./client.js";
import { logger } from "../app/logger.js";
import { renderAssistantMessage } from "./render.js";
import { chunkText } from "./text.js";

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1000;

export { chunkText } from "./text.js";

export type FeishuMessageType = "text" | "post" | "interactive";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 发送飞书消息到私聊（含短重试）
 * @param openId 接收者的 open_id
 * @param msgType 消息类型
 * @param content 消息内容对象
 * @returns message_id 或 null
 */
export async function sendFeishuMessage(
  openId: string,
  msgType: FeishuMessageType,
  content: Record<string, unknown>
): Promise<string | null> {
  const client = getLarkClient();
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const resp = await client.im.message.create({
        params: { receive_id_type: "open_id" },
        data: {
          receive_id: openId,
          msg_type: msgType,
          content: JSON.stringify(content),
        },
      });
      const msgId = resp.data?.message_id ?? null;
      logger.debug("飞书消息已发送", { openId, messageId: msgId, msgType });
      return msgId;
    } catch (err: any) {
      const isLastAttempt = attempt === MAX_RETRIES;
      if (isLastAttempt) {
        logger.error("飞书消息发送失败（已重试）", { openId, msgType, error: String(err) });
        return null;
      }
      logger.warn(`飞书消息发送重试 (${attempt + 1}/${MAX_RETRIES})`, {
        openId,
        msgType,
        error: String(err),
      });
      await sleep(RETRY_DELAY_MS * (attempt + 1));
    }
  }
  return null;
}

/**
 * 发送文本消息到飞书私聊（含短重试）
 * @param openId 接收者的 open_id
 * @param text 文本内容
 * @returns message_id 或 null
 */
export async function sendTextMessage(
  openId: string,
  text: string
): Promise<string | null> {
  return sendFeishuMessage(openId, "text", { text });
}

/**
 * 按 Markdown/文本内容自动渲染并发送飞书消息。
 */
export async function sendRenderedMessage(
  openId: string,
  text: string,
  textChunkLimit: number
): Promise<void> {
  const messages = renderAssistantMessage(text, textChunkLimit);
  for (const message of messages) {
    await sendFeishuMessage(openId, message.msgType, message.content);
  }
}

/**
 * 给指定消息添加处理中 reaction。
 * @param messageId 用户原始消息 ID
 * @returns reaction_id 或 null
 */
export async function addProcessingReaction(
  messageId: string,
  reactionType?: string
): Promise<string | null> {
  if (!reactionType) return null;

  const client = getLarkClient();
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const resp = await client.im.messageReaction.create({
        path: { message_id: messageId },
        data: {
          reaction_type: {
            emoji_type: reactionType,
          },
        },
      });
      const reactionId = resp.data?.reaction_id ?? null;
      logger.debug("飞书处理中 reaction 已添加", { messageId, reactionId, reactionType });
      return reactionId;
    } catch (err: any) {
      const isLastAttempt = attempt === MAX_RETRIES;
      if (isLastAttempt) {
        logger.error("飞书处理中 reaction 添加失败（已重试）", {
          messageId,
          reactionType,
          error: String(err),
        });
        return null;
      }
      logger.warn(`飞书处理中 reaction 添加重试 (${attempt + 1}/${MAX_RETRIES})`, {
        messageId,
        reactionType,
        error: String(err),
      });
      await sleep(RETRY_DELAY_MS * (attempt + 1));
    }
  }
  return null;
}

/**
 * 删除指定消息上的处理中 reaction。
 * @param messageId 用户原始消息 ID
 * @param reactionId reaction ID
 * @returns 是否成功
 */
export async function removeReaction(messageId: string, reactionId: string): Promise<boolean> {
  const client = getLarkClient();
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      await client.im.messageReaction.delete({
        path: {
          message_id: messageId,
          reaction_id: reactionId,
        },
      });
      logger.debug("飞书 reaction 已删除", { messageId, reactionId });
      return true;
    } catch (err: any) {
      const isLastAttempt = attempt === MAX_RETRIES;
      if (isLastAttempt) {
        logger.error("飞书 reaction 删除失败（已重试）", { messageId, reactionId, error: String(err) });
        return false;
      }
      logger.warn(`飞书 reaction 删除重试 (${attempt + 1}/${MAX_RETRIES})`, {
        messageId,
        reactionId,
        error: String(err),
      });
      await sleep(RETRY_DELAY_MS * (attempt + 1));
    }
  }
  return false;
}
