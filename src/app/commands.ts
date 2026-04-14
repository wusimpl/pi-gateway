import type { AvailableModelInfo } from "../pi/models.js";
import { logger } from "./logger.js";

/** 桥接层命令列表（不含斜杠） */
const BRIDGE_COMMANDS = ["new", "reset", "status", "model", "models"] as const;
export type BridgeCommandName = (typeof BRIDGE_COMMANDS)[number];

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
  availableModels?: Array<Pick<AvailableModelInfo, "id" | "label" | "name">>;
  requestedProvider?: string;
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
      return "✅ 已创建新会话";
    case "reset":
      return "✅ 已重置会话";
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
        lines.push("", "切换：/model <provider/model>", "查看可用模型：/models");
        return lines.join("\n");
      }

      const lines = [`✅ 已切到模型: ${context.currentModel ?? normalized.args.trim()}`];
      if (context.previousModel && context.previousModel !== context.currentModel) {
        lines.push(`上一个模型: ${context.previousModel}`);
      }
      lines.push("", "查看当前模型：/model", "查看可用模型：/models");
      return lines.join("\n");
    }
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
        "",
        ...models.map(formatAvailableModelLine),
        "",
        "切换：/model <provider/model>",
      ];
      if (!provider) {
        lines.push("按 provider 查看：/models <provider>");
      }
      return lines.join("\n");
    }
    default:
      return "";
  }
}

function formatAvailableModelLine(model: Pick<AvailableModelInfo, "id" | "label" | "name">): string {
  const suffix = model.name && model.name !== model.id ? ` · ${model.name}` : "";
  return `- ${model.label}${suffix}`;
}
