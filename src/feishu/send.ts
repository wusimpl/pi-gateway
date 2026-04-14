import { getLarkClient } from "./client.js";
import { logger } from "../app/logger.js";
import { renderAssistantMessage } from "./render.js";
import { chunkText } from "./text.js";

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1000;

export { chunkText } from "./text.js";

export type FeishuMessageType = "text" | "post" | "interactive";

export interface FeishuApiClient {
  im: {
    message: {
      create(args: {
        params: { receive_id_type: "open_id" };
        data: {
          receive_id: string;
          msg_type: FeishuMessageType;
          content: string;
        };
      }): Promise<{ data?: { message_id?: string | null } }>;
    };
    messageReaction: {
      create(args: {
        path: { message_id: string };
        data: { reaction_type: { emoji_type: string } };
      }): Promise<{ data?: { reaction_id?: string | null } }>;
      delete(args: {
        path: { message_id: string; reaction_id: string };
      }): Promise<unknown>;
    };
  };
}

export interface FeishuMessenger {
  sendFeishuMessage(openId: string, msgType: FeishuMessageType, content: Record<string, unknown>): Promise<string | null>;
  sendTextMessage(openId: string, text: string): Promise<string | null>;
  sendRenderedMessage(openId: string, text: string, textChunkLimit: number): Promise<void>;
  addProcessingReaction(messageId: string, reactionType?: string): Promise<string | null>;
  removeReaction(messageId: string, reactionId: string): Promise<boolean>;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function createFeishuMessenger(client: FeishuApiClient): FeishuMessenger {
  async function sendFeishuMessage(
    openId: string,
    msgType: FeishuMessageType,
    content: Record<string, unknown>
  ): Promise<string | null> {
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

  async function sendTextMessage(
    openId: string,
    text: string
  ): Promise<string | null> {
    return sendFeishuMessage(openId, "text", { text });
  }

  async function sendRenderedMessage(
    openId: string,
    text: string,
    textChunkLimit: number
  ): Promise<void> {
    const messages = renderAssistantMessage(text, textChunkLimit);
    for (const message of messages) {
      await sendFeishuMessage(openId, message.msgType, message.content);
    }
  }

  async function addProcessingReaction(
    messageId: string,
    reactionType?: string
  ): Promise<string | null> {
    if (!reactionType) return null;

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

  async function removeReaction(messageId: string, reactionId: string): Promise<boolean> {
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

  return {
    sendFeishuMessage,
    sendTextMessage,
    sendRenderedMessage,
    addProcessingReaction,
    removeReaction,
  };
}

function getDefaultFeishuMessenger(): FeishuMessenger {
  return createFeishuMessenger(getLarkClient() as unknown as FeishuApiClient);
}

export async function sendFeishuMessage(
  openId: string,
  msgType: FeishuMessageType,
  content: Record<string, unknown>
): Promise<string | null> {
  return getDefaultFeishuMessenger().sendFeishuMessage(openId, msgType, content);
}

export async function sendTextMessage(
  openId: string,
  text: string
): Promise<string | null> {
  return getDefaultFeishuMessenger().sendTextMessage(openId, text);
}

export async function sendRenderedMessage(
  openId: string,
  text: string,
  textChunkLimit: number
): Promise<void> {
  return getDefaultFeishuMessenger().sendRenderedMessage(openId, text, textChunkLimit);
}

export async function addProcessingReaction(
  messageId: string,
  reactionType?: string
): Promise<string | null> {
  return getDefaultFeishuMessenger().addProcessingReaction(messageId, reactionType);
}

export async function removeReaction(messageId: string, reactionId: string): Promise<boolean> {
  return getDefaultFeishuMessenger().removeReaction(messageId, reactionId);
}
