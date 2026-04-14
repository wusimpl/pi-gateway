import { logger } from "./logger.js";

/** 桥接层命令列表（不含斜杠） */
const BRIDGE_COMMANDS = ["new", "reset", "status"] as const;
export type BridgeCommand = (typeof BRIDGE_COMMANDS)[number];

/**
 * 解析用户消息，判断是否为桥接层命令
 * 返回 null 表示不是桥接层命令，应透传给 Pi
 */
export function parseBridgeCommand(text: string): BridgeCommand | null {
  const trimmed = text.trim();
  for (const cmd of BRIDGE_COMMANDS) {
    if (trimmed === `/${cmd}`) {
      return cmd;
    }
  }
  return null;
}

/** 处理桥接层命令，返回回复文本 */
export function handleBridgeCommand(
  command: BridgeCommand,
  context: {
    openId: string;
    sessionId: string;
    createdAt?: string;
    piSessionFile?: string;
    workspaceDir?: string;
  }
): string {
  logger.info("桥接层命令", { command, openId: context.openId, sessionId: context.sessionId });
  switch (command) {
    case "new":
      return "✅ 已创建新会话";
    case "reset":
      return "✅ 已重置会话";
    case "status": {
      const lines = [`📋 当前会话: ${context.sessionId}`];
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
    default:
      return "";
  }
}
