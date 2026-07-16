import type { Config } from "../../config.js";
import type { PersistedGroupRoutingConfig } from "../../storage/group-settings.js";
import type { PersistedP2PRoutingConfig } from "../../storage/p2p-settings.js";
import { SUPER_ADMIN_OPEN_ID } from "../access-control.js";

type GroupChatPolicy = Config["FEISHU_GROUP_CHAT_POLICY"];
type GroupMessageMode = Config["FEISHU_GROUP_MESSAGE_MODE"];
type GroupUnmatchedMessagePolicy = Config["FEISHU_GROUP_UNMATCHED_MESSAGE_POLICY"];

export function buildToolStatusList(allToolNames: string[], activeToolNames: string[]): Array<{ name: string; enabled: boolean }> {
  const activeToolNameSet = new Set(activeToolNames);
  return allToolNames.map((name) => ({
    name,
    enabled: activeToolNameSet.has(name),
  }));
}

export function formatToolsActionReply(
  action: "on" | "off" | "set" | "reset",
  changedTools: string[],
  activeTools: string[],
  allToolNames: string[],
): string {
  const actionLabel = action === "on"
    ? "已启用 tools。"
    : action === "off"
      ? "已禁用 tools。"
      : action === "set"
        ? "已更新 tools。"
        : "已恢复默认 tools。";
  const lines = [`✅ ${actionLabel}`];
  if (changedTools.length > 0) {
    lines.push(`变更：${changedTools.join(", ")}`);
  }
  lines.push(`当前启用（${activeTools.length}/${allToolNames.length}）：${activeTools.join(", ") || "（无）"}`, "", "查看详情：/tools");
  return lines.join("\n");
}

export function formatP2PSettingsReply(settings: PersistedP2PRoutingConfig, summary?: string): string {
  const lines: string[] = [];
  if (summary) {
    lines.push(summary, "");
  }

  lines.push(
    "🔐 私聊设置",
    `私聊策略：${settings.FEISHU_P2P_CHAT_POLICY}`,
    `白名单：${settings.FEISHU_P2P_CHAT_ALLOWLIST.length} 个`,
    `super admin：${SUPER_ADMIN_OPEN_ID}`,
    "",
    "策略：/p2p policy all|whitelist",
    "白名单：/p2p allowlist show|add|remove",
  );

  if (settings.FEISHU_P2P_CHAT_POLICY === "whitelist" && settings.FEISHU_P2P_CHAT_ALLOWLIST.length === 0) {
    lines.push("", "提醒：当前是 whitelist，但白名单为空；除 super admin 外其他私聊都会被忽略。");
  }

  return lines.join("\n");
}

export function formatP2PAllowlistReply(allowlist: string[], summary?: string): string {
  const lines: string[] = [];
  if (summary) {
    lines.push(summary, "");
  }

  lines.push(`📋 私聊白名单（${allowlist.length}）`);
  if (allowlist.length === 0) {
    lines.push("（空）");
  } else {
    lines.push(...allowlist.map((openId, index) => `${index + 1}. ${openId}`));
  }

  lines.push(
    "",
    `super admin：${SUPER_ADMIN_OPEN_ID}（永远允许，不需要加入白名单）`,
    "添加：/p2p allowlist add <open_id...>",
    "移除：/p2p allowlist remove <open_id...>",
  );
  return lines.join("\n");
}

export function formatGroupSettingsForReply(settings: PersistedGroupRoutingConfig): {
  policy: GroupChatPolicy;
  mode: GroupMessageMode;
  keywords: string[];
  unmatchedPolicy: GroupUnmatchedMessagePolicy;
} {
  return {
    policy: settings.FEISHU_GROUP_CHAT_POLICY,
    mode: settings.FEISHU_GROUP_MESSAGE_MODE,
    keywords: settings.FEISHU_GROUP_MESSAGE_KEYWORDS,
    unmatchedPolicy: settings.FEISHU_GROUP_UNMATCHED_MESSAGE_POLICY,
  };
}

export function formatGroupSettingsReply(
  settings: {
    policy: GroupChatPolicy;
    mode: GroupMessageMode;
    keywords: string[];
    unmatchedPolicy: GroupUnmatchedMessagePolicy;
  },
  currentChatId?: string,
  summary?: string,
): string {
  const lines: string[] = [];
  if (summary) {
    lines.push(summary, "");
  }

  lines.push(
    "👥 群聊设置",
    `群聊开关：${settings.policy}`,
    `触发方式：${settings.mode}`,
    `未触发消息：${settings.unmatchedPolicy}`,
    `关键词：${settings.keywords.length > 0 ? settings.keywords.map(formatGroupKeywordForDisplay).join(" ") : "（无）"}`,
  );
  if (currentChatId) {
    lines.push(`当前群：${currentChatId}`);
  }

  const warning = formatGroupSettingsWarning(settings);
  if (warning) {
    lines.push("", warning);
  }

  lines.push(
    "",
    "切换群聊开关：/group policy disabled|allowlist|open",
    "切换触发方式：/group mode mention|all|keyword",
    "查看关键词：/group keywords show",
    "设置未触发消息：/group unmatched capture|ignore",
  );
  return lines.join("\n");
}

export function formatGroupAllowlistReply(
  allowlist: string[],
  summary?: string,
): string {
  const lines: string[] = [];
  if (summary) {
    lines.push(summary, "");
  }

  lines.push(`📋 群白名单（${allowlist.length}）`);
  if (allowlist.length === 0) {
    lines.push("（空）");
  } else {
    lines.push(...allowlist.map((chatId, index) => `${index + 1}. ${chatId}`));
  }

  lines.push(
    "",
    "添加：/group allowlist add <chat_id...>",
    "移除：/group allowlist remove <chat_id...>",
  );
  return lines.join("\n");
}

export function formatGroupKeywordsReply(keywords: string[], summary?: string): string {
  const lines: string[] = [];
  if (summary) {
    lines.push(summary, "");
  }

  lines.push(`🏷️ 群关键词（${keywords.length}）`);
  if (keywords.length === 0) {
    lines.push("（空）");
  } else {
    lines.push(keywords.map(formatGroupKeywordForDisplay).join(" "));
  }
  lines.push("", "设置：/group keywords set <关键词...>", "清空：/group keywords clear");
  return lines.join("\n");
}

export function formatGroupKeywordForDisplay(keyword: string): string {
  return /\s/.test(keyword) ? `"${keyword}"` : keyword;
}

function formatGroupSettingsWarning(settings: {
  policy: GroupChatPolicy;
  mode: GroupMessageMode;
  keywords: string[];
  unmatchedPolicy: GroupUnmatchedMessagePolicy;
}): string | undefined {
  if (settings.mode === "keyword" && settings.keywords.length === 0) {
    return "提醒：还没设置关键词，普通消息不会触发；@ 机器人仍可使用。";
  }

  if (settings.policy === "open" && settings.unmatchedPolicy === "capture") {
    return "提醒：未触发消息暂存只在 allowlist 群生效，open 模式下不会暂存。";
  }

  return undefined;
}

export function appendRecentHistory(
  baseReply: string,
  session: {
    messages?: Array<{
      role?: string;
      content?: unknown;
      stopReason?: string;
      errorMessage?: string;
    }>;
    state?: {
      messages?: Array<{
        role?: string;
        content?: unknown;
        stopReason?: string;
        errorMessage?: string;
      }>;
    };
  },
): string {
  const historyText = formatRecentHistory(session);
  if (!historyText) {
    return baseReply;
  }
  return `${baseReply}\n\n历史消息：\n${historyText}`;
}

function formatRecentHistory(session: {
  messages?: Array<{
    role?: string;
    content?: unknown;
    stopReason?: string;
    errorMessage?: string;
  }>;
  state?: {
    messages?: Array<{
      role?: string;
      content?: unknown;
      stopReason?: string;
      errorMessage?: string;
    }>;
  };
}): string {
  const messages = session.messages ?? session.state?.messages ?? [];
  if (messages.length === 0) {
    return "";
  }

  const turns: Array<{ user: string; assistant?: string }> = [];
  for (const message of messages) {
    if (message.role === "user") {
      const userText = summarizeUserMessage(message.content);
      if (userText) {
        turns.push({ user: userText });
      }
      continue;
    }

    if (message.role !== "assistant" || turns.length === 0) {
      continue;
    }

    const assistantText = summarizeAssistantMessage(message.content, message.stopReason, message.errorMessage);
    if (!assistantText) {
      continue;
    }

    turns[turns.length - 1]!.assistant = assistantText;
  }

  const recentTurns = turns.slice(-2);
  if (recentTurns.length === 0) {
    return "";
  }

  return recentTurns
    .map((turn) => `user input: ${turn.user}\nmodel output: ${turn.assistant ?? "（无模型输出）"}`)
    .join("\n\n");
}

function summarizeUserMessage(content: unknown): string {
  if (typeof content === "string") {
    return truncateHistoryText(extractUserHistoryText(content) || "（空输入）");
  }

  if (!Array.isArray(content)) {
    return "（空输入）";
  }

  const pieces: string[] = [];
  for (const item of content) {
    if (!item || typeof item !== "object") {
      continue;
    }

    if ("type" in item && item.type === "text" && typeof item.text === "string") {
      const normalized = extractUserHistoryText(item.text);
      if (normalized) {
        pieces.push(normalized);
      }
      continue;
    }

    if ("type" in item && item.type === "image" && pieces[pieces.length - 1] !== "[图片]") {
      pieces.push("[图片]");
    }
  }

  return truncateHistoryText(pieces.join(" ").trim() || "（空输入）");
}

function summarizeAssistantMessage(content: unknown, stopReason?: string, errorMessage?: string): string {
  const text = collectMessageContentText(content, { includeImages: false });
  const statusText = summarizeAssistantStopReason(stopReason, errorMessage);
  if (text && statusText) {
    return appendHistoryStatus(text, statusText);
  }

  return text ? truncateHistoryText(text) : statusText;
}

function summarizeMessageContent(content: unknown, options: { includeImages: boolean }): string {
  const text = collectMessageContentText(content, options);
  return text ? truncateHistoryText(text) : "";
}

function collectMessageContentText(content: unknown, options: { includeImages: boolean }): string {
  if (typeof content === "string") {
    return normalizeHistoryText(content);
  }

  if (!Array.isArray(content)) {
    return "";
  }

  const pieces: string[] = [];
  for (const item of content) {
    if (!item || typeof item !== "object") {
      continue;
    }

    if ("type" in item && item.type === "text" && typeof item.text === "string") {
      const normalized = normalizeHistoryText(item.text);
      if (normalized) {
        pieces.push(normalized);
      }
      continue;
    }

    if (options.includeImages && "type" in item && item.type === "image") {
      pieces.push("[图片]");
    }
  }

  return pieces.join(" ").trim();
}

function normalizeHistoryText(text: string): string {
  return text.replace(/[\x00-\x1f\x7f]/g, " ").replace(/\s+/g, " ").trim();
}

function extractUserHistoryText(text: string): string {
  const normalized = text.replace(/\r\n/g, "\n").trim();
  if (!normalized) {
    return "";
  }

  const quotedMessage = extractQuotedCurrentMessage(normalized);
  if (quotedMessage !== null) {
    return extractUserHistoryText(quotedMessage) || "（回复了一条消息）";
  }

  const audioTranscript = extractAudioTranscript(normalized);
  if (audioTranscript !== null) {
    return audioTranscript || "[语音]";
  }

  if (isImagePrompt(normalized)) {
    return "[图片]";
  }

  return normalizeHistoryText(normalized);
}

function extractQuotedCurrentMessage(text: string): string | null {
  const prefix = "用户这次是在回复一条之前的消息。\n被引用消息：\n";
  const marker = "\n\n用户这次的新消息：\n";
  if (!text.startsWith(prefix)) {
    return null;
  }

  const markerIndex = text.indexOf(marker);
  if (markerIndex === -1) {
    return null;
  }

  return text.slice(markerIndex + marker.length).trim();
}

function extractAudioTranscript(text: string): string | null {
  const prefix = "用户发来了一段语音，音频已保存到本地：";
  if (!text.startsWith(prefix)) {
    return null;
  }

  for (const marker of ["\n以下是语音转写结果：\n", "\n以下是本地转写结果：\n"]) {
    const markerIndex = text.indexOf(marker);
    if (markerIndex !== -1) {
      return normalizeHistoryText(text.slice(markerIndex + marker.length));
    }
  }

  return "";
}

function isImagePrompt(text: string): boolean {
  return (
    text.startsWith("用户发来了一张图片，图片已保存到本地：") &&
    text.includes("\n请直接查看图片内容并继续对话；如果用户没写额外说明，就先简短描述图片里有什么。")
  );
}

function summarizeAssistantStopReason(stopReason?: string, errorMessage?: string): string {
  if (stopReason === "error") {
    const normalizedError = normalizeHistoryText(errorMessage ?? "");
    return normalizedError ? `（回复中断：${normalizedError}）` : "（回复中断）";
  }

  if (stopReason === "aborted") {
    const normalizedError = normalizeHistoryText(errorMessage ?? "");
    return normalizedError ? `（已停止：${normalizedError}）` : "（已停止）";
  }

  return "";
}

function appendHistoryStatus(text: string, statusText: string, maxLength = 160): string {
  if (!statusText) {
    return truncateHistoryText(text, maxLength);
  }

  const remainingLength = maxLength - statusText.length - 1;
  if (remainingLength <= 0) {
    return truncateHistoryText(statusText, maxLength);
  }

  return `${truncateHistoryText(text, remainingLength)} ${statusText}`;
}

function truncateHistoryText(text: string, maxLength = 160): string {
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.slice(0, maxLength - 1).trimEnd()}…`;
}
