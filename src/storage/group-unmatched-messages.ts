import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { FeishuInboundMessage } from "../feishu/inbound/types.js";
import { logger } from "../app/logger.js";

const DEFAULT_MAX_MESSAGES = 20;
const MAX_TEXT_CHARS = 2000;

export type PersistedGroupUnmatchedMessage = FeishuInboundMessage;

export interface GroupUnmatchedMessageStore {
  append(chatId: string, message: PersistedGroupUnmatchedMessage): Promise<number>;
  drain(chatId: string): Promise<PersistedGroupUnmatchedMessage[]>;
  clear(chatId: string): Promise<void>;
  count(chatId: string): Promise<number>;
}

export function createGroupUnmatchedMessageStore(
  dataDir: string,
  options: { maxMessages?: number } = {},
): GroupUnmatchedMessageStore {
  const maxMessages = options.maxMessages ?? DEFAULT_MAX_MESSAGES;

  function conversationDir(chatId: string): string {
    return join(dataDir, "conversations", encodeURIComponent(chatId));
  }

  function unmatchedMessagesPath(chatId: string): string {
    return join(conversationDir(chatId), "unmatched-messages.json");
  }

  async function ensureConversationDir(chatId: string): Promise<void> {
    await mkdir(conversationDir(chatId), { recursive: true });
  }

  async function readMessages(chatId: string): Promise<PersistedGroupUnmatchedMessage[]> {
    try {
      const raw = await readFile(unmatchedMessagesPath(chatId), "utf-8");
      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) {
        return [];
      }
      return parsed
        .map((item) => normalizePersistedMessage(item))
        .filter((item): item is PersistedGroupUnmatchedMessage => Boolean(item));
    } catch {
      return [];
    }
  }

  async function writeMessages(chatId: string, messages: PersistedGroupUnmatchedMessage[]): Promise<void> {
    await ensureConversationDir(chatId);
    await writeFile(unmatchedMessagesPath(chatId), JSON.stringify(messages, null, 2), "utf-8");
  }

  async function append(chatId: string, message: PersistedGroupUnmatchedMessage): Promise<number> {
    const normalized = normalizePersistedMessage(message);
    if (!normalized) {
      return count(chatId);
    }

    const messages = await readMessages(chatId);
    const deduped = messages.filter((item) => item.messageId !== normalized.messageId);
    deduped.push(normalized);
    const retained = deduped.slice(-maxMessages);
    await writeMessages(chatId, retained);
    logger.debug("未触发群消息已暂存", {
      chatId,
      messageId: normalized.messageId,
      messageType: normalized.messageType,
      count: retained.length,
    });
    return retained.length;
  }

  async function drain(chatId: string): Promise<PersistedGroupUnmatchedMessage[]> {
    const messages = await readMessages(chatId);
    await clear(chatId);
    if (messages.length > 0) {
      logger.debug("未触发群消息已取出并清空", { chatId, count: messages.length });
    }
    return messages;
  }

  async function clear(chatId: string): Promise<void> {
    try {
      await rm(unmatchedMessagesPath(chatId), { force: true });
    } catch {
      // ignore
    }
  }

  async function count(chatId: string): Promise<number> {
    return (await readMessages(chatId)).length;
  }

  return {
    append,
    drain,
    clear,
    count,
  };
}

function normalizePersistedMessage(value: unknown): PersistedGroupUnmatchedMessage | null {
  if (!isRecord(value)) {
    return null;
  }

  const kind = asString(value.kind);
  if (kind !== "text" && kind !== "image" && kind !== "audio" && kind !== "file") {
    return null;
  }

  const base = normalizeMessageBase(value);
  if (!base) {
    return null;
  }

  if (kind === "text") {
    const messageType = asString(value.messageType);
    if (messageType !== "text" && messageType !== "post") {
      return null;
    }
    const text = truncateText(asString(value.text).trim(), MAX_TEXT_CHARS);
    if (!text) {
      return null;
    }
    const embeddedImages = normalizeEmbeddedImages(value.embeddedImages);
    return {
      ...base,
      kind,
      messageType,
      text,
      ...(embeddedImages.length > 0 ? { embeddedImages } : {}),
    };
  }

  if (kind === "image") {
    const imageKey = asString(value.imageKey).trim();
    if (!imageKey) {
      return null;
    }
    return {
      ...base,
      kind,
      messageType: "image",
      imageKey,
    };
  }

  if (kind === "audio") {
    const fileKey = asString(value.fileKey).trim();
    if (!fileKey) {
      return null;
    }
    return {
      ...base,
      kind,
      messageType: "audio",
      fileKey,
      ...(typeof value.durationMs === "number" && Number.isFinite(value.durationMs) ? { durationMs: value.durationMs } : {}),
    };
  }

  const fileKey = asString(value.fileKey).trim();
  if (!fileKey) {
    return null;
  }
  const fileName = asString(value.fileName).trim();
  return {
    ...base,
    kind,
    messageType: "file",
    fileKey,
    ...(fileName ? { fileName: truncateText(fileName, 300) } : {}),
  };
}

function normalizeMessageBase(value: Record<string, unknown>) {
  const identity = isRecord(value.identity) ? value.identity : null;
  const conversationTarget = isRecord(value.conversationTarget) ? value.conversationTarget : null;
  const openId = asString(identity?.openId).trim();
  const messageId = asString(value.messageId).trim();
  const createTime = asString(value.createTime).trim();
  const rawContent = truncateText(asString(value.rawContent), MAX_TEXT_CHARS);

  if (!openId || !messageId || !conversationTarget) {
    return null;
  }

  const normalizedTarget = normalizeConversationTarget(conversationTarget);
  if (!normalizedTarget) {
    return null;
  }

  return {
    identity: {
      openId,
      ...(asString(identity?.userId).trim() ? { userId: asString(identity?.userId).trim() } : {}),
      ...(asString(identity?.name).trim() ? { name: truncateText(asString(identity?.name).trim(), 120) } : {}),
    },
    conversationTarget: normalizedTarget,
    messageId,
    ...(asString(value.rootMessageId).trim() ? { rootMessageId: asString(value.rootMessageId).trim() } : {}),
    ...(asString(value.parentMessageId).trim() ? { parentMessageId: asString(value.parentMessageId).trim() } : {}),
    ...(asString(value.threadId).trim() ? { threadId: asString(value.threadId).trim() } : {}),
    createTime,
    rawContent,
  };
}

function normalizeConversationTarget(value: Record<string, unknown>) {
  const kind = asString(value.kind);
  const key = asString(value.key).trim();
  const receiveIdType = asString(value.receiveIdType);
  const receiveId = asString(value.receiveId).trim();
  if ((kind !== "group" && kind !== "thread") || !key || receiveIdType !== "chat_id" || !receiveId) {
    return null;
  }

  return {
    kind,
    key,
    receiveIdType,
    receiveId,
    ...(asString(value.chatId).trim() ? { chatId: asString(value.chatId).trim() } : {}),
    ...(kind === "thread" && asString(value.threadId).trim() ? { threadId: asString(value.threadId).trim() } : {}),
  } as PersistedGroupUnmatchedMessage["conversationTarget"];
}

function normalizeEmbeddedImages(value: unknown): Array<{ placeholder: string; imageKey: string }> {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (!isRecord(item)) {
        return null;
      }
      const placeholder = asString(item.placeholder).trim();
      const imageKey = asString(item.imageKey).trim();
      return placeholder && imageKey ? { placeholder, imageKey } : null;
    })
    .filter((item): item is { placeholder: string; imageKey: string } => Boolean(item));
}

function truncateText(text: string, limit: number): string {
  const chars = Array.from(text);
  return chars.length > limit ? `${chars.slice(0, limit).join("")}…` : text;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}
