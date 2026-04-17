import type { FeishuMessageEvent } from "../../types.js";
import type { FeishuInboundMessage } from "./types.js";

export function normalizeFeishuInboundMessage(event: FeishuMessageEvent): FeishuInboundMessage | null {
  const base = {
    identity: {
      openId: event.sender.senderId.openId,
      userId: event.sender.senderId.userId || undefined,
    },
    messageId: event.message.messageId,
    rootMessageId: event.message.rootId,
    parentMessageId: event.message.parentId,
    threadId: event.message.threadId,
    createTime: event.message.createTime,
    rawContent: event.message.content,
  };

  switch (event.message.messageType) {
    case "text": {
      const text = extractTextValue(event.message.content).trim();
      if (!text) {
        return null;
      }
      return {
        ...base,
        kind: "text",
        messageType: "text",
        text,
      };
    }
    case "post": {
      const text = flattenPostMessage(event.message.content).trim();
      if (!text) {
        return null;
      }
      return {
        ...base,
        kind: "text",
        messageType: "post",
        text,
      };
    }
    case "image": {
      const payload = parseContentObject(event.message.content);
      const imageKey = asString(payload.image_key ?? payload.imageKey);
      if (!imageKey) {
        return null;
      }
      return {
        ...base,
        kind: "image",
        messageType: "image",
        imageKey,
      };
    }
    case "audio": {
      const payload = parseContentObject(event.message.content);
      const fileKey = asString(payload.file_key ?? payload.fileKey);
      if (!fileKey) {
        return null;
      }
      return {
        ...base,
        kind: "audio",
        messageType: "audio",
        fileKey,
        durationMs: asOptionalNumber(payload.duration),
      };
    }
    case "file": {
      const payload = parseContentObject(event.message.content);
      const fileKey = asString(payload.file_key ?? payload.fileKey);
      if (!fileKey) {
        return null;
      }
      const fileName = asString(payload.file_name ?? payload.fileName).trim();
      return {
        ...base,
        kind: "file",
        messageType: "file",
        fileKey,
        fileName: fileName || undefined,
      };
    }
    default:
      return null;
  }
}

function extractTextValue(content: string): string {
  const payload = parseContentObject(content);
  const text = payload.text;
  return typeof text === "string" ? text : content;
}

function flattenPostMessage(rawContent: string): string {
  const payload = unwrapLocalizedPostPayload(parseContentObject(rawContent));
  const title = asString(payload.title);
  const paragraphs = Array.isArray(payload.content) ? payload.content : [];
  const lines = paragraphs
    .map((paragraph) => flattenPostParagraph(paragraph))
    .filter((line): line is string => Boolean(line));

  return [title, ...lines].filter(Boolean).join("\n").trim();
}

function unwrapLocalizedPostPayload(payload: Record<string, unknown>): Record<string, unknown> {
  if (looksLikePostPayload(payload)) {
    return payload;
  }

  const preferredLocales = ["zh_cn", "zh_hk", "zh_tw", "en_us", "ja_jp"];
  for (const locale of preferredLocales) {
    const localized = asRecord(payload[locale]);
    if (localized && looksLikePostPayload(localized)) {
      return localized;
    }
  }

  for (const value of Object.values(payload)) {
    const localized = asRecord(value);
    if (localized && looksLikePostPayload(localized)) {
      return localized;
    }
  }

  return payload;
}

function looksLikePostPayload(payload: Record<string, unknown>): boolean {
  return typeof payload.title === "string" || Array.isArray(payload.content);
}

function flattenPostParagraph(paragraph: unknown): string {
  if (!Array.isArray(paragraph)) {
    return "";
  }

  const parts = paragraph.map((node) => {
    const record = asRecord(node);
    const tag = asString(record?.tag);

    switch (tag) {
      case "text":
        return asString(record?.text);
      case "a": {
        const text = asString(record?.text);
        const href = asString(record?.href);
        return text && href ? `${text} (${href})` : text || href;
      }
      case "at": {
        const userId = asString(record?.user_id ?? record?.userId);
        return userId ? `@${userId}` : "@提及";
      }
      case "img":
        return "【图片】";
      case "media":
        return "【视频】";
      case "emotion":
        return asString(record?.emoji_type ?? record?.emojiType)
          ? `:${asString(record?.emoji_type ?? record?.emojiType)}:`
          : "【表情】";
      case "hr":
        return "---";
      case "code_block": {
        const code = asString(record?.text);
        const language = asString(record?.language);
        if (!code) return language ? `【代码块 ${language}】` : "【代码块】";
        return language ? `【代码块 ${language}】\n${code}` : `【代码块】\n${code}`;
      }
      default:
        return "";
    }
  });

  return parts.join("").trim();
}

function parseContentObject(content: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(content);
    return typeof parsed === "object" && parsed !== null ? (parsed as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : null;
}

function asOptionalNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}
