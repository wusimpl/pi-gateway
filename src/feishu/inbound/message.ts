import { getLarkClient } from "../client.js";
import type { FeishuQuotedMessage } from "./types.js";

interface FeishuMessageMention {
  key?: string;
  name?: string;
}

interface FeishuMessageItem {
  message_id?: string;
  msg_type?: string;
  body?: {
    content?: string;
  };
  mentions?: FeishuMessageMention[];
}

export interface FeishuMessageClient {
  im: {
    message: {
      get(args: {
        params?: {
          user_id_type?: "user_id" | "union_id" | "open_id";
        };
        path: {
          message_id: string;
        };
      }): Promise<{
        data?: {
          items?: FeishuMessageItem[];
        };
      }>;
    };
  };
}

export function createFeishuMessageReader(client: FeishuMessageClient) {
  return (messageId: string) => readFeishuQuotedMessage(messageId, client);
}

export async function readFeishuQuotedMessage(
  messageId: string,
  client: FeishuMessageClient = getLarkClient() as unknown as FeishuMessageClient,
): Promise<FeishuQuotedMessage | null> {
  const response = await client.im.message.get({
    params: {
      user_id_type: "open_id",
    },
    path: {
      message_id: messageId,
    },
  });

  const item = response.data?.items?.[0];
  if (!item?.message_id || !item.msg_type) {
    return null;
  }

  return {
    messageId: item.message_id,
    messageType: item.msg_type,
    text: formatQuotedMessageText(item.msg_type, item.body?.content ?? "", item.mentions ?? []),
  };
}

function formatQuotedMessageText(
  messageType: string,
  rawContent: string,
  mentions: FeishuMessageMention[],
): string {
  switch (messageType) {
    case "text": {
      const text = replaceMentionTokens(extractTextValue(rawContent), mentions).trim();
      return text || "【文本消息】";
    }
    case "post": {
      const text = flattenPostMessage(rawContent, mentions);
      return text || "【富文本消息】";
    }
    case "image":
      return "【图片消息】";
    case "audio": {
      const payload = parseContentObject(rawContent);
      const duration = asOptionalNumber(payload.duration);
      return duration ? `【语音消息，时长 ${duration}ms】` : "【语音消息】";
    }
    case "media": {
      const payload = parseContentObject(rawContent);
      const fileName = asString(payload.file_name ?? payload.fileName);
      const duration = asOptionalNumber(payload.duration);
      const parts = ["【视频消息"];
      if (fileName) parts.push(`：${fileName}`);
      if (duration) parts.push(`，时长 ${duration}ms`);
      parts.push("】");
      return parts.join("");
    }
    case "file":
    case "folder": {
      const payload = parseContentObject(rawContent);
      const fileName = asString(payload.file_name ?? payload.fileName);
      return fileName ? `【文件消息：${fileName}】` : "【文件消息】";
    }
    case "interactive":
      return flattenInteractiveMessage(rawContent) || "【卡片消息】";
    case "share_chat":
      return "【分享群名片】";
    case "share_user":
      return "【分享个人名片】";
    case "sticker":
      return "【表情包消息】";
    default:
      return flattenGenericTextPayload(rawContent) || `【${messageType}消息】`;
  }
}

function extractTextValue(content: string): string {
  const payload = parseContentObject(content);
  const text = payload.text;
  return typeof text === "string" ? text : content;
}

function flattenPostMessage(rawContent: string, mentions: FeishuMessageMention[]): string {
  const payload = unwrapLocalizedPostPayload(parseContentObject(rawContent));
  const title = asString(payload.title);
  const paragraphs = Array.isArray(payload.content) ? payload.content : [];
  const lines = paragraphs
    .map((paragraph) => flattenPostParagraph(paragraph, mentions))
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

function flattenPostParagraph(paragraph: unknown, mentions: FeishuMessageMention[]): string {
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
      case "at":
        return resolveMentionText(asString(record?.user_id ?? record?.userId), mentions);
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
        return flattenGenericTextPayload(JSON.stringify(node));
    }
  });

  return parts.join("").trim();
}

function flattenInteractiveMessage(rawContent: string): string {
  const payload = parseContentObject(rawContent);
  const body = asRecord(payload.body);
  const elements = Array.isArray(body?.elements) ? body.elements : [];
  const lines = elements.flatMap((element) => flattenInteractiveElement(element));
  return lines.map((line) => line.trim()).filter(Boolean).join("\n").trim();
}

function flattenInteractiveElement(element: unknown): string[] {
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
      return flattenInteractiveTable(record);
    case "img":
      return ["【图片】"];
    case "hr":
      return ["---"];
    default:
      return [];
  }
}

function flattenInteractiveTable(table: Record<string, unknown> | null): string[] {
  const columns = Array.isArray(table?.columns) ? table.columns.map((column) => asRecord(column)) : [];
  const rows = Array.isArray(table?.rows) ? table.rows.map((row) => asRecord(row)) : [];
  const columnKeys = columns.map((column, index) => asString(column?.name) || `col_${index}`);
  const headers = columns.map((column, index) => asString(column?.display_name) || asString(column?.name) || `列${index + 1}`);
  const lines: string[] = [];

  if (headers.some(Boolean)) {
    lines.push(headers.join(" | "));
  }

  for (const row of rows) {
    if (!row) continue;
    const cells = columnKeys.map((key) => stringifyInteractiveTableCell(row[key]));
    if (cells.some(Boolean)) {
      lines.push(cells.join(" | "));
    }
  }

  return lines;
}

function stringifyInteractiveTableCell(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) {
    return value.map((item) => stringifyInteractiveTableCell(item)).filter(Boolean).join(", ");
  }
  return "";
}

function flattenGenericTextPayload(rawContent: string): string {
  const payload = parseContentObject(rawContent);
  const fragments = collectTextFragments(payload).map((fragment) => fragment.trim()).filter(Boolean);
  return fragments.join("\n").trim();
}

function collectTextFragments(value: unknown): string[] {
  if (typeof value === "string") {
    return [value];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) => collectTextFragments(item));
  }

  if (!value || typeof value !== "object") {
    return [];
  }

  return Object.values(value as Record<string, unknown>).flatMap((item) => collectTextFragments(item));
}

function replaceMentionTokens(text: string, mentions: FeishuMessageMention[]): string {
  return mentions.reduce((result, mention) => {
    const key = asString(mention.key);
    if (!key) return result;
    const name = asString(mention.name);
    return result.replaceAll(key, name ? `@${name}` : key);
  }, text);
}

function resolveMentionText(userId: string, mentions: FeishuMessageMention[]): string {
  const matched = mentions.find((mention) => mention.key === userId);
  const name = asString(matched?.name);
  if (name) {
    return `@${name}`;
  }
  return userId || "@某人";
}

function parseContentObject(content: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(content);
    return typeof parsed === "object" && parsed !== null ? (parsed as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : null;
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function asOptionalNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}
