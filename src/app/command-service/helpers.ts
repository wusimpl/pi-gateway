import type { ConversationTarget } from "../../conversation.js";

export function dedupeToolNames(toolNames: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const toolName of toolNames) {
    if (seen.has(toolName)) {
      continue;
    }
    seen.add(toolName);
    result.push(toolName);
  }
  return result;
}

export function getCurrentGroupChatId(conversationTarget?: ConversationTarget): string | undefined {
  if (!conversationTarget) {
    return undefined;
  }
  return conversationTarget.kind === "group" || conversationTarget.kind === "thread"
    ? conversationTarget.chatId
    : undefined;
}
