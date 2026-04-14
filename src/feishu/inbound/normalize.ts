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
    default:
      return null;
  }
}

function extractTextValue(content: string): string {
  const payload = parseContentObject(content);
  const text = payload.text;
  return typeof text === "string" ? text : content;
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

function asOptionalNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}
