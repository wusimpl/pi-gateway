import { getLarkClient } from "./client.js";
import { logger } from "../app/logger.js";
import { renderAssistantMessage } from "./render.js";
import { chunkText } from "./text.js";
import { randomUUID } from "node:crypto";
import {
  buildStreamingCardData,
  buildStreamingCardSettings,
  buildStreamingSummary,
  getStreamingBodyElementId,
  getStreamingStatusElementId,
} from "./streaming-card.js";

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
  cardkit: {
    v1: {
      card: {
        create(args: {
          data: {
            type: "card_json";
            data: string;
          };
        }): Promise<{ data?: { card_id?: string | null } }>;
        settings(args: {
          path: { card_id: string };
          data: {
            settings: string;
            uuid?: string;
            sequence: number;
          };
        }): Promise<unknown>;
      };
      cardElement: {
        content(args: {
          path: { card_id: string; element_id: string };
          data: {
            content: string;
            uuid?: string;
            sequence: number;
          };
        }): Promise<unknown>;
      };
    };
  };
}

export interface FeishuStreamingMessage {
  updateStatus(statusText: string): Promise<void>;
  updateBody(text: string): Promise<void>;
  finish(statusText: string, bodyText: string): Promise<void>;
}

export interface FeishuMessenger {
  sendFeishuMessage(openId: string, msgType: FeishuMessageType, content: Record<string, unknown>): Promise<string | null>;
  sendTextMessage(openId: string, text: string): Promise<string | null>;
  sendRenderedMessage(openId: string, text: string, textChunkLimit: number): Promise<void>;
  startStreamingMessage(openId: string, statusText: string, bodyText?: string): Promise<FeishuStreamingMessage | null>;
  addProcessingReaction(messageId: string, reactionType?: string): Promise<string | null>;
  removeReaction(messageId: string, reactionId: string): Promise<boolean>;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function retryRequest<T>(
  operationName: string,
  context: Record<string, unknown>,
  request: () => Promise<T>,
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await request();
    } catch (err) {
      lastError = err;
      const isLastAttempt = attempt === MAX_RETRIES;
      if (isLastAttempt) {
        logger.error(`${operationName}失败（已重试）`, {
          ...context,
          error: String(err),
        });
        break;
      }
      logger.warn(`${operationName}重试 (${attempt + 1}/${MAX_RETRIES})`, {
        ...context,
        error: String(err),
      });
      await sleep(RETRY_DELAY_MS * (attempt + 1));
    }
  }
  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

export function createFeishuMessenger(client: FeishuApiClient): FeishuMessenger {
  async function sendFeishuMessage(
    openId: string,
    msgType: FeishuMessageType,
    content: Record<string, unknown>
  ): Promise<string | null> {
    try {
      const resp = await retryRequest("飞书消息发送", { openId, msgType }, () => client.im.message.create({
        params: { receive_id_type: "open_id" },
        data: {
          receive_id: openId,
          msg_type: msgType,
          content: JSON.stringify(content),
        },
      }));
      const msgId = resp.data?.message_id ?? null;
      logger.debug("飞书消息已发送", { openId, messageId: msgId, msgType });
      return msgId;
    } catch {
      return null;
    }
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

  async function startStreamingMessage(
    openId: string,
    statusText: string,
    bodyText: string = "",
  ): Promise<FeishuStreamingMessage | null> {
    try {
      const createResp = await retryRequest("飞书流式卡片创建", { openId }, () => client.cardkit.v1.card.create({
        data: {
          type: "card_json",
          data: buildStreamingCardData({
            statusText,
            bodyText,
          }),
        },
      }));
      const rawCardId = createResp.data?.card_id ?? null;
      if (!rawCardId) {
        logger.error("飞书流式卡片创建失败：未返回 card_id", { openId });
        return null;
      }
      const cardId = rawCardId;

      const messageId = await sendFeishuMessage(openId, "interactive", {
        type: "card",
        data: {
          card_id: cardId,
        },
      });
      if (!messageId) {
        logger.error("飞书流式卡片发送失败：未返回 message_id", { openId, cardId });
        return null;
      }

      let sequence = 0;
      const nextSequence = () => {
        sequence += 1;
        return sequence;
      };

      async function updateElement(elementId: string, content: string): Promise<void> {
        await retryRequest("飞书流式卡片文本更新", { openId, cardId, elementId }, () =>
          client.cardkit.v1.cardElement.content({
            path: {
              card_id: cardId,
              element_id: elementId,
            },
            data: {
              content,
              sequence: nextSequence(),
              uuid: randomUUID(),
            },
          }));
      }

      async function updateSettings(settings: string): Promise<void> {
        await retryRequest("飞书流式卡片配置更新", { openId, cardId }, () =>
          client.cardkit.v1.card.settings({
            path: {
              card_id: cardId,
            },
            data: {
              settings,
              sequence: nextSequence(),
              uuid: randomUUID(),
            },
          }));
      }

      return {
        updateStatus: (nextStatusText: string) =>
          updateElement(getStreamingStatusElementId(), nextStatusText),
        updateBody: (nextBodyText: string) =>
          updateElement(getStreamingBodyElementId(), nextBodyText),
        async finish(finalStatusText: string, finalBodyText: string): Promise<void> {
          await updateElement(getStreamingStatusElementId(), finalStatusText);
          await updateElement(getStreamingBodyElementId(), finalBodyText);
          await updateSettings(buildStreamingCardSettings({
            streamingMode: false,
            summaryText: buildStreamingSummary(finalBodyText),
          }));
        },
      };
    } catch (err) {
      logger.error("飞书流式卡片初始化失败", { openId, error: String(err) });
      return null;
    }
  }

  async function addProcessingReaction(
    messageId: string,
    reactionType?: string
  ): Promise<string | null> {
    if (!reactionType) return null;

    try {
      const resp = await retryRequest("飞书处理中 reaction 添加", { messageId, reactionType }, () =>
        client.im.messageReaction.create({
          path: { message_id: messageId },
          data: {
            reaction_type: {
              emoji_type: reactionType,
            },
          },
        }));
      const reactionId = resp.data?.reaction_id ?? null;
      logger.debug("飞书处理中 reaction 已添加", { messageId, reactionId, reactionType });
      return reactionId;
    } catch {
      return null;
    }
  }

  async function removeReaction(messageId: string, reactionId: string): Promise<boolean> {
    try {
      await retryRequest("飞书 reaction 删除", { messageId, reactionId }, () =>
        client.im.messageReaction.delete({
          path: {
            message_id: messageId,
            reaction_id: reactionId,
          },
        }));
      logger.debug("飞书 reaction 已删除", { messageId, reactionId });
      return true;
    } catch {
      return false;
    }
  }

  return {
    sendFeishuMessage,
    sendTextMessage,
    sendRenderedMessage,
    startStreamingMessage,
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

export async function startStreamingMessage(
  openId: string,
  statusText: string,
  bodyText: string = "",
): Promise<FeishuStreamingMessage | null> {
  return getDefaultFeishuMessenger().startStreamingMessage(openId, statusText, bodyText);
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
