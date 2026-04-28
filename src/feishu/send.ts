import { createReadStream, type ReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { basename, extname } from "node:path";
import { getLarkClient } from "./client.js";
import { logger } from "../app/logger.js";
import { renderAssistantMessage } from "./render.js";
import { chunkText } from "./text.js";
import { randomUUID } from "node:crypto";
import {
  buildFinalStreamingCardData,
  buildStreamingCardData,
  buildStreamingCardSettings,
  buildStreamingSummary,
  getStreamingBodyElementId,
  getStreamingToolsElementId,
} from "./streaming-card.js";
import {
  buildFeishuDocPreviewCardContent,
  resolveFeishuDocPreviewCardInput,
  type FeishuDocPreviewCardInput,
} from "./doc-preview-card.js";
import type { FeishuWebDomain } from "./doc-links.js";
import {
  type QuotedMessageStore,
  writeQuotedMessage as writeDefaultQuotedMessage,
} from "../storage/quoted-messages.js";
import type { ConversationReceiveIdType, ConversationTarget } from "../conversation.js";

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1000;
const MAX_FEISHU_FILE_SIZE_BYTES = 30 * 1024 * 1024;
// 飞书会把“旧文本是新文本前缀”的更新做成打字机效果；工具区用零宽字符打断前缀关系，保持即时上屏。
const INSTANT_TOOL_UPDATE_SEED = "\u200D";
const INSTANT_TOOL_UPDATE_MARKERS = ["\u200B", "\u200C"];

export { chunkText } from "./text.js";

export type FeishuMessageType = "text" | "post" | "interactive" | "file";
export type FeishuUploadFileType = "opus" | "mp4" | "pdf" | "doc" | "xls" | "ppt" | "stream";

export interface SendLocalFileInput {
  path: string;
  fileName?: string;
}

export interface SentFeishuFile {
  fileKey: string;
  fileName: string;
  fileType: FeishuUploadFileType;
  messageId: string | null;
}

export interface FeishuApiClient {
  im: {
    file: {
      create(args: {
        data: {
          file_type: FeishuUploadFileType;
          file_name: string;
          duration?: number;
          file: Buffer | ReadStream;
        };
      }): Promise<{ file_key?: string | null } | null>;
    };
    message: {
      create(args: {
        params: { receive_id_type: ConversationReceiveIdType };
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
        update(args: {
          path: { card_id: string };
          data: {
            card: {
              type: "card_json";
              data: string;
            };
            uuid?: string;
            sequence: number;
          };
        }): Promise<unknown>;
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
  updateBody(text: string): Promise<void>;
  updateTools(text: string): Promise<void>;
  finish(bodyText: string, textChunkLimit: number, toolsText?: string, preludeText?: string): Promise<void>;
}

export type { FeishuDocPreviewCardInput } from "./doc-preview-card.js";
export type FeishuMessageRecipient = string | ConversationTarget;

export interface FeishuMessenger {
  sendFeishuMessage(openId: string, msgType: FeishuMessageType, content: Record<string, unknown>): Promise<string | null>;
  sendFeishuMessageToTarget(
    target: ConversationTarget,
    msgType: FeishuMessageType,
    content: Record<string, unknown>,
  ): Promise<string | null>;
  sendTextMessage(openId: string, text: string): Promise<string | null>;
  sendTextMessageToTarget(target: ConversationTarget, text: string): Promise<string | null>;
  sendRenderedMessage(openId: string, text: string, textChunkLimit: number): Promise<void>;
  sendRenderedMessageToTarget(target: ConversationTarget, text: string, textChunkLimit: number): Promise<void>;
  sendLocalFileMessage(openId: string, input: SendLocalFileInput): Promise<SentFeishuFile>;
  sendDocPreviewCard(target: FeishuMessageRecipient, input: FeishuDocPreviewCardInput): Promise<string | null>;
  startStreamingMessage(
    target: FeishuMessageRecipient,
    bodyText?: string,
    toolsText?: string,
    preludeText?: string,
  ): Promise<FeishuStreamingMessage | null>;
  addProcessingReaction(messageId: string, reactionType?: string): Promise<string | null>;
  removeReaction(messageId: string, reactionId: string): Promise<boolean>;
}

function createP2PTarget(openId: string): ConversationTarget {
  return {
    kind: "p2p",
    key: openId,
    receiveIdType: "open_id",
    receiveId: openId,
  };
}

function resolveMessageTarget(target: FeishuMessageRecipient): ConversationTarget {
  return typeof target === "string" ? createP2PTarget(target) : target;
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

export function createFeishuMessenger(
  client: FeishuApiClient,
  options?: {
    feishuDomain?: FeishuWebDomain;
    quotedMessageStore?: Pick<QuotedMessageStore, "writeQuotedMessage">;
  },
): FeishuMessenger {
  const feishuDomain = options?.feishuDomain ?? "feishu";
  const quotedMessageStore = options?.quotedMessageStore ?? {
    writeQuotedMessage: writeDefaultQuotedMessage,
  };

  async function sendFeishuMessageToTarget(
    target: ConversationTarget,
    msgType: FeishuMessageType,
    content: Record<string, unknown>
  ): Promise<string | null> {
    try {
      const resp = await retryRequest("飞书消息发送", {
        receiveIdType: target.receiveIdType,
        receiveId: target.receiveId,
        msgType,
      }, () => client.im.message.create({
        params: { receive_id_type: target.receiveIdType },
        data: {
          receive_id: target.receiveId,
          msg_type: msgType,
          content: JSON.stringify(content),
        },
      }));
      const msgId = resp.data?.message_id ?? null;
      if (msgId) {
        await cacheQuotedMessage(
          quotedMessageStore,
          msgId,
          msgType,
          extractQuotedTextFromOutgoingMessage(msgType, content),
        );
      }
      logger.debug("飞书消息已发送", {
        receiveIdType: target.receiveIdType,
        receiveId: target.receiveId,
        messageId: msgId,
        msgType,
      });
      return msgId;
    } catch {
      return null;
    }
  }

  async function sendFeishuMessage(
    openId: string,
    msgType: FeishuMessageType,
    content: Record<string, unknown>
  ): Promise<string | null> {
    return sendFeishuMessageToTarget(createP2PTarget(openId), msgType, content);
  }

  async function sendTextMessageToTarget(
    target: ConversationTarget,
    text: string,
  ): Promise<string | null> {
    return sendFeishuMessageToTarget(target, "text", { text });
  }

  async function sendTextMessage(
    openId: string,
    text: string
  ): Promise<string | null> {
    return sendTextMessageToTarget(createP2PTarget(openId), text);
  }

  async function sendRenderedMessageToTarget(
    target: ConversationTarget,
    text: string,
    textChunkLimit: number
  ): Promise<void> {
    const normalized = text.replace(/\r\n/g, "\n").trimEnd();
    if (!normalized) {
      return;
    }

    const messages = renderAssistantMessage(normalized, textChunkLimit);
    for (const message of messages) {
      const messageId = await sendFeishuMessageToTarget(target, message.msgType, message.content);
      if (messageId) {
        continue;
      }

      if (message.msgType !== "interactive") {
        continue;
      }

      logger.warn("飞书卡片发送失败，回退为文本消息", {
        receiveIdType: target.receiveIdType,
        receiveId: target.receiveId,
      });
      for (const chunk of chunkText(normalized, textChunkLimit)) {
        await sendFeishuMessageToTarget(target, "text", { text: chunk });
      }
      return;
    }
  }

  async function sendRenderedMessage(
    openId: string,
    text: string,
    textChunkLimit: number
  ): Promise<void> {
    return sendRenderedMessageToTarget(createP2PTarget(openId), text, textChunkLimit);
  }

  async function sendLocalFileMessage(
    openId: string,
    input: SendLocalFileInput,
  ): Promise<SentFeishuFile> {
    const fileStats = await stat(input.path);
    if (!fileStats.isFile()) {
      throw new Error(`要发送的路径不是文件: ${input.path}`);
    }
    if (fileStats.size <= 0) {
      throw new Error(`飞书不允许发送空文件: ${input.path}`);
    }
    if (fileStats.size > MAX_FEISHU_FILE_SIZE_BYTES) {
      throw new Error(`文件超过飞书 30MB 限制: ${input.path}`);
    }

    const fileName = input.fileName?.trim() || basename(input.path);
    if (!fileName) {
      throw new Error(`无法确定文件名: ${input.path}`);
    }

    const fileType = inferFeishuUploadFileType(fileName);
    const uploadResp = await retryRequest("飞书文件上传", { openId, path: input.path, fileName, fileType }, () =>
      client.im.file.create({
        data: {
          file_type: fileType,
          file_name: fileName,
          file: createReadStream(input.path),
        },
      }));
    const fileKey = uploadResp?.file_key?.trim();
    if (!fileKey) {
      throw new Error(`飞书文件上传成功但未返回 file_key: ${input.path}`);
    }

    const messageId = await sendFeishuMessage(openId, "file", { file_key: fileKey });
    if (!messageId) {
      throw new Error(`飞书文件消息发送失败: ${fileName}`);
    }

    logger.debug("飞书文件已发送", { openId, path: input.path, fileName, fileKey, messageId });
    return {
      fileKey,
      fileName,
      fileType,
      messageId,
    };
  }

  async function sendDocPreviewCard(
    targetOrOpenId: FeishuMessageRecipient,
    input: FeishuDocPreviewCardInput,
  ): Promise<string | null> {
    const target = resolveMessageTarget(targetOrOpenId);
    const resolved = resolveFeishuDocPreviewCardInput(input, feishuDomain);
    if (!resolved) {
      logger.warn("飞书文档卡片跳过：缺少可用文档链接", {
        receiveIdType: target.receiveIdType,
        receiveId: target.receiveId,
        input,
      });
      return null;
    }

    return sendFeishuMessageToTarget(
      target,
      "interactive",
      buildFeishuDocPreviewCardContent(resolved),
    );
  }

  async function startStreamingMessage(
    targetOrOpenId: FeishuMessageRecipient,
    bodyText: string = "",
    toolsText: string = "",
    preludeText: string = "",
  ): Promise<FeishuStreamingMessage | null> {
    const target = resolveMessageTarget(targetOrOpenId);
    const logContext = {
      receiveIdType: target.receiveIdType,
      receiveId: target.receiveId,
    };
    try {
      const hasInitialToolsText = toolsText.trim().length > 0;
      const createResp = await retryRequest("飞书流式卡片创建", logContext, () => client.cardkit.v1.card.create({
        data: {
          type: "card_json",
          data: buildStreamingCardData({
            preludeText,
            bodyText,
            toolsText: hasInitialToolsText ? INSTANT_TOOL_UPDATE_SEED : toolsText,
          }),
        },
      }));
      const rawCardId = createResp.data?.card_id ?? null;
      if (!rawCardId) {
        logger.error("飞书流式卡片创建失败：未返回 card_id", logContext);
        return null;
      }
      const cardId = rawCardId;

      const messageId = await sendFeishuMessageToTarget(target, "interactive", {
        type: "card",
        data: {
          card_id: cardId,
        },
      });
      if (!messageId) {
        logger.error("飞书流式卡片发送失败：未返回 message_id", { ...logContext, cardId });
        return null;
      }

      let sequence = 0;
      let currentBodyText = bodyText;
      let currentToolsText = "";
      let toolsSeeded = hasInitialToolsText;
      let toolsUpdateRevision = 0;
      const nextSequence = () => {
        sequence += 1;
        return sequence;
      };

      async function updateElement(elementId: string, content: string): Promise<void> {
        await retryRequest("飞书流式卡片文本更新", { ...logContext, cardId, elementId }, () =>
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
        await retryRequest("飞书流式卡片配置更新", { ...logContext, cardId }, () =>
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

      async function updateCard(cardData: string): Promise<void> {
        await retryRequest("飞书流式卡片整卡更新", { ...logContext, cardId }, () =>
          client.cardkit.v1.card.update({
            path: {
              card_id: cardId,
            },
            data: {
              card: {
                type: "card_json",
                data: cardData,
              },
              sequence: nextSequence(),
              uuid: randomUUID(),
            },
          }));
      }

      async function updateToolsElement(nextToolsText: string): Promise<void> {
        if (nextToolsText.trim() && !toolsSeeded) {
          await updateElement(getStreamingToolsElementId(), INSTANT_TOOL_UPDATE_SEED);
          toolsSeeded = true;
        }
        await updateElement(getStreamingToolsElementId(), markInstantToolUpdate(nextToolsText, toolsUpdateRevision));
        toolsUpdateRevision += 1;
        currentToolsText = nextToolsText;
      }

      if (hasInitialToolsText) {
        await updateToolsElement(toolsText);
      }

      return {
        async updateBody(nextBodyText: string): Promise<void> {
          await updateElement(getStreamingBodyElementId(), nextBodyText);
          currentBodyText = nextBodyText;
        },
        async updateTools(nextToolsText: string): Promise<void> {
          await updateToolsElement(nextToolsText);
        },
        async finish(
          finalBodyText: string,
          textChunkLimit: number,
          toolsText: string = "",
          finalPreludeText: string = preludeText,
        ): Promise<void> {
          const finalText = appendDisplayedSections(finalBodyText, finalPreludeText, toolsText);
          await cacheQuotedMessage(
            quotedMessageStore,
            messageId,
            "interactive",
            finalText.trim(),
          );

          const summaryText = buildStreamingSummary(finalBodyText || finalPreludeText || toolsText);
          const renderedMessages = renderAssistantMessage(finalText, textChunkLimit);
          if (renderedMessages.length === 1 && renderedMessages[0].msgType === "interactive") {
            await updateCard(buildFinalStreamingCardData({
              finalMessage: renderedMessages[0],
              summaryText,
            }));
            return;
          }

          if (
            renderedMessages.length === 1
            && renderedMessages[0]
            && (
              (!finalBodyText.trim() && currentBodyText.trim())
              || (!toolsText.trim() && currentToolsText.trim())
            )
          ) {
            await updateCard(buildFinalStreamingCardData({
              finalMessage: renderedMessages[0],
              summaryText,
            }));
            return;
          }

          if (finalBodyText !== currentBodyText && finalBodyText.trim()) {
            await updateElement(getStreamingBodyElementId(), finalBodyText);
            currentBodyText = finalBodyText;
          }
          if (toolsText !== currentToolsText && toolsText.trim()) {
            await updateToolsElement(toolsText);
          }
          await updateSettings(buildStreamingCardSettings({
            streamingMode: false,
            summaryText,
          }));
        },
      };
    } catch (err) {
      logger.error("飞书流式卡片初始化失败", { ...logContext, error: String(err) });
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
    sendFeishuMessageToTarget,
    sendTextMessage,
    sendTextMessageToTarget,
    sendRenderedMessage,
    sendRenderedMessageToTarget,
    sendLocalFileMessage,
    sendDocPreviewCard,
    startStreamingMessage,
    addProcessingReaction,
    removeReaction,
  };
}

function getDefaultFeishuMessenger(): FeishuMessenger {
  return createFeishuMessenger(getLarkClient() as unknown as FeishuApiClient);
}

function markInstantToolUpdate(content: string, revision: number): string {
  if (!content) return content;
  const marker = INSTANT_TOOL_UPDATE_MARKERS[revision % INSTANT_TOOL_UPDATE_MARKERS.length];
  const firstLineBreak = content.indexOf("\n");
  if (firstLineBreak < 0) {
    return `${marker}${content}`;
  }
  return `${content.slice(0, firstLineBreak + 1)}${marker}${content.slice(firstLineBreak + 1)}`;
}

export async function sendFeishuMessage(
  openId: string,
  msgType: FeishuMessageType,
  content: Record<string, unknown>
): Promise<string | null> {
  return getDefaultFeishuMessenger().sendFeishuMessage(openId, msgType, content);
}

export async function sendFeishuMessageToTarget(
  target: ConversationTarget,
  msgType: FeishuMessageType,
  content: Record<string, unknown>,
): Promise<string | null> {
  return getDefaultFeishuMessenger().sendFeishuMessageToTarget(target, msgType, content);
}

export async function sendTextMessage(
  openId: string,
  text: string
): Promise<string | null> {
  return getDefaultFeishuMessenger().sendTextMessage(openId, text);
}

export async function sendTextMessageToTarget(
  target: ConversationTarget,
  text: string,
): Promise<string | null> {
  return getDefaultFeishuMessenger().sendTextMessageToTarget(target, text);
}

export async function sendRenderedMessage(
  openId: string,
  text: string,
  textChunkLimit: number
): Promise<void> {
  return getDefaultFeishuMessenger().sendRenderedMessage(openId, text, textChunkLimit);
}

export async function sendRenderedMessageToTarget(
  target: ConversationTarget,
  text: string,
  textChunkLimit: number,
): Promise<void> {
  return getDefaultFeishuMessenger().sendRenderedMessageToTarget(target, text, textChunkLimit);
}

export async function sendLocalFileMessage(
  openId: string,
  input: SendLocalFileInput,
): Promise<SentFeishuFile> {
  return getDefaultFeishuMessenger().sendLocalFileMessage(openId, input);
}

export async function sendDocPreviewCard(
  target: FeishuMessageRecipient,
  input: FeishuDocPreviewCardInput,
): Promise<string | null> {
  return getDefaultFeishuMessenger().sendDocPreviewCard(target, input);
}

export async function startStreamingMessage(
  target: FeishuMessageRecipient,
  bodyText: string = "",
  toolsText: string = "",
  preludeText: string = "",
): Promise<FeishuStreamingMessage | null> {
  return getDefaultFeishuMessenger().startStreamingMessage(target, bodyText, toolsText, preludeText);
}

function appendDisplayedSections(
  bodyText: string,
  preludeText: string,
  toolsText: string,
): string {
  return [bodyText, preludeText, toolsText].filter((section) => Boolean(section)).join("\n\n");
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

function inferFeishuUploadFileType(fileName: string): FeishuUploadFileType {
  switch (extname(fileName).toLowerCase()) {
    case ".opus":
      return "opus";
    case ".mp4":
      return "mp4";
    case ".pdf":
      return "pdf";
    case ".doc":
    case ".docx":
      return "doc";
    case ".xls":
    case ".xlsx":
    case ".csv":
      return "xls";
    case ".ppt":
    case ".pptx":
      return "ppt";
    default:
      return "stream";
  }
}

async function cacheQuotedMessage(
  quotedMessageStore: Pick<QuotedMessageStore, "writeQuotedMessage">,
  messageId: string,
  messageType: string,
  text: string | null,
): Promise<void> {
  const normalizedText = text?.trim();
  if (!normalizedText) {
    return;
  }

  try {
    await quotedMessageStore.writeQuotedMessage({
      messageId,
      messageType,
      text: normalizedText,
    });
  } catch (error) {
    logger.warn("Quoted message cache write failed", {
      messageId,
      messageType,
      error: String(error),
    });
  }
}

function extractQuotedTextFromOutgoingMessage(
  msgType: FeishuMessageType,
  content: Record<string, unknown>,
): string | null {
  switch (msgType) {
    case "text":
      return asString(content.text).trim() || null;
    case "interactive":
      return flattenOutgoingInteractiveMessage(content);
    default:
      return null;
  }
}

function flattenOutgoingInteractiveMessage(content: Record<string, unknown>): string | null {
  const cardType = asString(content.type);
  if (cardType === "card") {
    return null;
  }

  const header = asRecord(content.header);
  const title = asRecord(header?.title);
  const titleText = asString(title?.content).trim();
  const body = asRecord(content.body);
  const elements = Array.isArray(body?.elements) ? body.elements : [];
  const lines = elements.flatMap((element) => flattenOutgoingInteractiveElement(element));
  const text = [titleText, ...lines].map((line) => line.trim()).filter(Boolean).join("\n").trim();
  return text || null;
}

function flattenOutgoingInteractiveElement(element: unknown): string[] {
  const record = asRecord(element);
  const tag = asString(record?.tag);

  switch (tag) {
    case "markdown":
    case "plain_text":
    case "lark_md": {
      const content = asString(record?.content ?? record?.text);
      return content ? [content] : [];
    }
    case "table":
      return flattenOutgoingInteractiveTable(record);
    case "img":
      return ["【图片】"];
    case "hr":
      return ["---"];
    default:
      return [];
  }
}

function flattenOutgoingInteractiveTable(table: Record<string, unknown> | null): string[] {
  const columns = Array.isArray(table?.columns) ? table.columns.map((column) => asRecord(column)) : [];
  const rows = Array.isArray(table?.rows) ? table.rows.map((row) => asRecord(row)) : [];
  const columnKeys = columns.map((column, index) => asString(column?.name) || `col_${index}`);
  const headers = columns
    .map((column, index) => asString(column?.display_name) || asString(column?.name) || `列${index + 1}`)
    .filter(Boolean);
  const lines: string[] = [];

  if (headers.length > 0) {
    lines.push(headers.join(" | "));
  }

  for (const row of rows) {
    if (!row) continue;
    const cells = columnKeys.map((key) => stringifyOutgoingInteractiveCell(row[key]));
    if (cells.some(Boolean)) {
      lines.push(cells.join(" | "));
    }
  }

  return lines;
}

function stringifyOutgoingInteractiveCell(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) {
    return value.map((item) => stringifyOutgoingInteractiveCell(item)).filter(Boolean).join(", ");
  }
  return "";
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : null;
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}
