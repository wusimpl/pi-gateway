import { homedir } from "node:os";
import type { AvailableModelInfo } from "../pi/models.js";
import { logger } from "./logger.js";
import { RESTART_MESSAGE } from "./restart.js";
import { STOP_MESSAGE } from "./stop.js";

/** 桥接层命令列表（不含斜杠） */
const BRIDGE_COMMANDS = ["new", "reset", "status", "context", "skills", "model", "models", "stop", "restart"] as const;
export type BridgeCommandName = (typeof BRIDGE_COMMANDS)[number];

interface BridgeContextFile {
  path: string;
}

interface BridgeSkillInfo {
  filePath: string;
  scope?: string;
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
    case "stop":
      return STOP_MESSAGE;
    case "restart":
      return RESTART_MESSAGE;
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
    lines.push(...items.map((skill) => `    ${formatDisplayPath(skill.filePath)}`));
  }
  return lines.join("\n");
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
