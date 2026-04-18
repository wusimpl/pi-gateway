import { homedir } from "node:os";
import type { AvailableModelInfo } from "../pi/models.js";
import { logger } from "./logger.js";
import { RESTART_MESSAGE } from "./restart.js";
import { STOP_MESSAGE } from "./stop.js";

/** 桥接层命令列表（不含斜杠） */
const BRIDGE_COMMANDS = [
  "new",
  "reset",
  "status",
  "context",
  "skills",
  "model",
  "models",
  "sessions",
  "resume",
  "stop",
  "next",
  "restart",
  "cron",
  "stt",
  "stream",
  "reaction",
] as const;
export type BridgeCommandName = (typeof BRIDGE_COMMANDS)[number];

interface BridgeContextFile {
  path: string;
}

interface BridgeSkillInfo {
  filePath: string;
  scope?: string;
}

interface BridgeListedSession {
  order: number;
  sessionId: string;
  isActive: boolean;
  name?: string;
  firstMessage?: string;
  messageCount: number;
  updatedAt?: string;
}

export interface BridgeCommand {
  name: BridgeCommandName;
  args: string;
}

interface BridgeCommandContext {
  openId?: string;
  sessionId?: string;
  createdAt?: string;
  piSessionFile?: string;
  workspaceDir?: string;
  currentModel?: string;
  previousModel?: string;
  availableModelCount?: number;
  availableModels?: Array<Pick<AvailableModelInfo, "order" | "id" | "label" | "name">>;
  requestedProvider?: string;
  contextFiles?: BridgeContextFile[];
  skills?: BridgeSkillInfo[];
  sessions?: BridgeListedSession[];
  sessionsPage?: number;
  sessionsTotalPages?: number;
  sessionsTotalCount?: number;
}

/**
 * 解析用户消息，判断是否为桥接层命令
 * 返回 null 表示不是桥接层命令，应透传给 Pi
 */
export function parseBridgeCommand(text: string): BridgeCommand | null {
  const trimmed = text.trim();
  if (!trimmed.startsWith("/")) {
    return null;
  }

  const body = trimmed.slice(1);
  const firstWhitespace = body.search(/\s/);
  const rawName = firstWhitespace === -1 ? body : body.slice(0, firstWhitespace);
  const args = firstWhitespace === -1 ? "" : body.slice(firstWhitespace).trim();

  if (!BRIDGE_COMMANDS.includes(rawName as BridgeCommandName)) {
    return null;
  }

  return {
    name: rawName as BridgeCommandName,
    args,
  };
}

/** 处理桥接层命令，返回回复文本 */
export function handleBridgeCommand(
  command: BridgeCommandName | BridgeCommand,
  context: BridgeCommandContext,
): string {
  const normalized = typeof command === "string" ? { name: command, args: "" } : command;
  logger.info("桥接层命令", {
    command: normalized.name,
    openId: context.openId,
    sessionId: context.sessionId,
    args: normalized.args,
  });

  switch (normalized.name) {
    case "new":
      return formatSessionCommandReply("✅ 已创建新会话", context.currentModel);
    case "reset":
      return formatSessionCommandReply("✅ 已重置会话", context.currentModel);
    case "status": {
      const lines = [`📋 当前会话: ${context.sessionId ?? "unknown"}`];
      if (context.currentModel) lines.push(`🤖 当前模型: ${context.currentModel}`);
      if (context.createdAt) lines.push(`🕐 创建时间: ${context.createdAt}`);
      if (context.piSessionFile) {
        // 仅展示文件名，避免泄露服务端目录结构
        const fileName = context.piSessionFile.split(/[\/\\]/).pop() ?? context.piSessionFile;
        lines.push(`📁 Session: ${fileName}`);
      }
      if (context.workspaceDir) {
        lines.push(`🧰 Workspace: ${context.workspaceDir}`);
      }
      return lines.join("\n");
    }
    case "model": {
      const argText = normalized.args.trim().toLowerCase();
      if (!argText || argText === "status") {
        const lines = [`🤖 当前模型: ${context.currentModel ?? "未知"}`];
        if (typeof context.availableModelCount === "number") {
          lines.push(`✅ 当前可用模型: ${context.availableModelCount} 个`);
        }
        lines.push("", "切换：/model <序号> 或 /model <provider/model>", "查看可用模型：/models");
        return lines.join("\n");
      }

      const lines = [`✅ 已切到模型: ${context.currentModel ?? normalized.args.trim()}`];
      if (context.previousModel && context.previousModel !== context.currentModel) {
        lines.push(`上一个模型: ${context.previousModel}`);
      }
      lines.push("", "查看当前模型：/model", "查看可用模型：/models");
      return lines.join("\n");
    }
    case "context":
      return formatContextReply(context.contextFiles ?? []);
    case "skills":
      return formatSkillsReply(context.skills ?? []);
    case "models": {
      const models = context.availableModels ?? [];
      const provider = context.requestedProvider?.trim();

      if (models.length === 0) {
        if (provider) {
          return `provider ${provider} 下面没有当前可用模型。\n\n用 /models 看全部当前可用模型。`;
        }
        return "当前环境里没有可用模型，请先检查 API Key 或 OAuth 配置。";
      }

      const lines = [
        provider
          ? `📚 当前可用模型（${provider}，${models.length} 个）`
          : `📚 当前可用模型（${models.length} 个）`,
        "只显示当前环境真的能用的模型。",
        "序号跟总列表一致，可直接用 /model <序号> 切换。",
        "",
        ...models.map(formatAvailableModelLine),
        "",
        "切换：/model <序号> 或 /model <provider/model>",
      ];
      if (!provider) {
        lines.push("按 provider 查看：/models <provider>");
      }
      return lines.join("\n");
    }
    case "sessions":
      return formatSessionsReply(context.sessions ?? [], {
        page: context.sessionsPage ?? 1,
        totalPages: context.sessionsTotalPages ?? 1,
        totalCount: context.sessionsTotalCount ?? (context.sessions?.length ?? 0),
      });
    case "resume":
      return formatSessionCommandReply(`✅ 已切换到会话: ${context.sessionId ?? "unknown"}`, context.currentModel);
    case "stop":
      return STOP_MESSAGE;
    case "next":
      return "用法：/next <要排到当前任务后处理的内容>";
    case "restart":
      return RESTART_MESSAGE;
    case "stt":
    case "stream":
    case "reaction":
      return "";
    default:
      return "";
  }
}

function formatAvailableModelLine(model: Pick<AvailableModelInfo, "order" | "id" | "label" | "name">): string {
  const suffix = model.name && model.name !== model.id ? ` · ${model.name}` : "";
  return `${model.order}. ${model.label}${suffix}`;
}

function formatSessionCommandReply(message: string, currentModel?: string): string {
  if (!currentModel) {
    return message;
  }
  return `${message}\n🤖 当前模型: ${currentModel}`;
}

function formatSessionsReply(
  sessions: BridgeListedSession[],
  meta: {
    page: number;
    totalPages: number;
    totalCount: number;
  },
): string {
  if (meta.totalCount === 0) {
    return "当前还没有可恢复的历史会话。";
  }

  return [
    `📚 最近会话（第 ${meta.page}/${meta.totalPages} 页，共 ${meta.totalCount} 个）`,
    "用 /resume <序号> 切换。翻页：/sessions -n <页码>。",
    "",
    "| 序号 | 会话 | 消息 | 时间 |",
    "| --- | --- | --- | --- |",
    ...formatSessionRows(sessions),
  ].join("\n");
}

function formatSessionRows(sessions: BridgeListedSession[]): string[] {
  return sessions.map((session) => {
    const title = escapeMarkdownTableCell(getSessionDisplayTitle(session));
    const messageCount = Math.max(0, session.messageCount);
    const ageLabel = formatSessionAge(session.updatedAt);
    return `| ${session.order} | ${title} | ${messageCount} | ${ageLabel} |`;
  });
}

function getSessionDisplayTitle(session: BridgeListedSession): string {
  const source = session.name?.trim() || session.firstMessage?.trim() || session.sessionId;
  const normalized = source.replace(/[\x00-\x1f\x7f]/g, " ").replace(/\s+/g, " ").trim();
  return normalized || session.sessionId;
}

function formatSessionAge(updatedAt?: string): string {
  if (!updatedAt) {
    return "--";
  }

  const updated = new Date(updatedAt);
  if (Number.isNaN(updated.getTime())) {
    return "--";
  }

  const diffMs = Date.now() - updated.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffMins < 1) return "now";
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo`;
  return `${Math.floor(diffDays / 365)}y`;
}

function escapeMarkdownTableCell(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/\|/g, "\\|");
}

function formatContextReply(contextFiles: BridgeContextFile[]): string {
  const lines = ["[Context]"];
  if (contextFiles.length === 0) {
    lines.push("  (none)");
    return lines.join("\n");
  }

  lines.push(...contextFiles.map((file) => `  ${formatDisplayPath(file.path)}`));
  return lines.join("\n");
}

function formatSkillsReply(skills: BridgeSkillInfo[]): string {
  const lines = ["[Skills]"];
  if (skills.length === 0) {
    lines.push("  (none)");
    return lines.join("\n");
  }

  const groupedSkills = groupSkillsByScope(skills);
  for (const [scope, items] of groupedSkills) {
    lines.push(`  ${scope}`);
    lines.push(...items.map((skill) => `    ${formatSkillDirectoryPath(skill.filePath)}`));
  }
  return lines.join("\n");
}

function formatSkillDirectoryPath(filePath: string): string {
  const normalizedPath = filePath.replace(/\\/g, "/");
  if (normalizedPath.endsWith("/SKILL.md")) {
    return formatDisplayPath(normalizedPath.slice(0, -"/SKILL.md".length));
  }
  return formatDisplayPath(filePath);
}

function groupSkillsByScope(skills: BridgeSkillInfo[]): Array<[string, BridgeSkillInfo[]]> {
  const scopeOrder = new Map([
    ["user", 0],
    ["project", 1],
    ["temporary", 2],
  ]);
  const grouped = new Map<string, BridgeSkillInfo[]>();

  for (const skill of skills) {
    const scope = skill.scope?.trim() || "unknown";
    const items = grouped.get(scope) ?? [];
    items.push(skill);
    grouped.set(scope, items);
  }

  return Array.from(grouped.entries()).sort(([left], [right]) => {
    const leftOrder = scopeOrder.get(left) ?? Number.MAX_SAFE_INTEGER;
    const rightOrder = scopeOrder.get(right) ?? Number.MAX_SAFE_INTEGER;
    if (leftOrder !== rightOrder) {
      return leftOrder - rightOrder;
    }
    return left.localeCompare(right);
  });
}

function formatDisplayPath(filePath: string): string {
  const normalizedPath = filePath.replace(/\\/g, "/");
  const normalizedHome = homedir().replace(/\\/g, "/");
  if (normalizedPath === normalizedHome) {
    return "~";
  }
  if (normalizedPath.startsWith(`${normalizedHome}/`)) {
    return `~${normalizedPath.slice(normalizedHome.length)}`;
  }
  return normalizedPath;
}
