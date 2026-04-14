import { logger } from "./logger.js";

/** 桥接层命令列表 */
const BRIDGE_COMMANDS = ["/new", "/reset", "/status"] as const;
export type BridgeCommand = (typeof BRIDGE_COMMANDS)[number];

/**
 * 解析用户消息，判断是否为桥接层命令
 * 返回 null 表示不是桥接层命令，应透传给 Pi
 */
export function parseBridgeCommand(text: string): BridgeCommand | null {
  const trimmed = text.trim();
  for (const cmd of BRIDGE_COMMANDS) {
    if (trimmed === cmd) {
      return cmd;
    }
  }
  return null;
}

/** 处理桥接层命令，返回回复文本 */
export function handleBridgeCommand(
  command: BridgeCommand,
  context: { openId: string; sessionId: string }
): string {
  switch (command) {
    case "/new":
    case "/reset":
      // 实际的 session 切换在 router 中处理，这里只返回确认文本
      // 注意：这里暂时返回占位文本，实际切换逻辑在 router 中
      logger.info("桥接层命令", { command, openId: context.openId });
      return command === "/new"
        ? "✅ 已创建新会话"
        : "✅ 已重置会话";
    case "/status":
      return `📋 当前会话: ${context.sessionId}`;
    default:
      return "";
  }
}
