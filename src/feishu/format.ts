/** 格式化工具调用信息为可读文本 */
export function formatToolCall(toolName: string, args?: string): string {
  if (args) {
    const shortArgs = args.length > 200 ? args.slice(0, 200) + "..." : args;
    return `🔧 调用工具: ${toolName}\n${shortArgs}`;
  }
  return `🔧 调用工具: ${toolName}`;
}

/** 格式化错误信息 */
export function formatError(error: string): string {
  return `❌ 错误: ${error}`;
}

/** 格式化思考中提示 */
export function formatThinking(): string {
  return "⏳ 正在思考...";
}
