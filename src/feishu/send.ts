import { getLarkClient } from "./client.js";
import { logger } from "../app/logger.js";

const FEISHU_TEXT_LIMIT = 4000; // 飞书单条消息文本上限（字符）

/**
 * 发送文本消息到飞书私聊
 * @param openId 接收者的 open_id
 * @param text 文本内容
 * @returns message_id 或 null
 */
export async function sendTextMessage(
  openId: string,
  text: string
): Promise<string | null> {
  const client = getLarkClient();
  try {
    const resp = await client.im.message.create({
      params: { receive_id_type: "open_id" },
      data: {
        receive_id: openId,
        msg_type: "text",
        content: JSON.stringify({ text }),
      },
    });
    const msgId = resp.data?.message_id ?? null;
    logger.debug("飞书消息已发送", { openId, messageId: msgId });
    return msgId;
  } catch (err) {
    logger.error("飞书消息发送失败", { openId, error: String(err) });
    return null;
  }
}

/**
 * 更新飞书消息内容
 * @param messageId 要更新的消息 ID
 * @param text 新文本内容
 * @returns 是否成功
 */
export async function updateTextMessage(
  messageId: string,
  text: string
): Promise<boolean> {
  const client = getLarkClient();
  try {
    await client.im.message.patch({
      path: { message_id: messageId },
      data: {
        content: JSON.stringify({ text }),
      },
    });
    logger.debug("飞书消息已更新", { messageId });
    return true;
  } catch (err) {
    logger.error("飞书消息更新失败", { messageId, error: String(err) });
    return false;
  }
}

/**
 * 将长文本按飞书限制分块
 */
export function chunkText(text: string, limit: number = FEISHU_TEXT_LIMIT): string[] {
  if (text.length <= limit) return [text];

  const chunks: string[] = [];
  let remaining = text;
  while (remaining.length > 0) {
    if (remaining.length <= limit) {
      chunks.push(remaining);
      break;
    }
    // 优先在换行符处分割
    let splitAt = remaining.lastIndexOf("\n", limit);
    if (splitAt <= 0 || splitAt > limit) {
      // 没有换行符，直接在 limit 处分割
      splitAt = limit;
    }
    chunks.push(remaining.slice(0, splitAt));
    remaining = remaining.slice(splitAt);
    if (remaining.startsWith("\n")) {
      remaining = remaining.slice(1);
    }
  }

  return chunks;
}
