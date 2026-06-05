import type { ConversationTarget } from "../../conversation.js";
import { formatModelLabel } from "../../pi/models.js";
import type { ModelPreference, ThinkingLevel } from "../../types.js";
import type { CommandPiSession } from "./types.js";

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

export function createFallbackP2PTarget(openId: string): ConversationTarget {
  return {
    kind: "p2p",
    key: openId,
    receiveIdType: "open_id",
    receiveId: openId,
  };
}

export function getCurrentThinkingLevel(session: { thinkingLevel?: ThinkingLevel | undefined }): ThinkingLevel | undefined {
  return session.thinkingLevel;
}

export function normalizeModelPreference(model: { provider?: string; id?: string } | undefined): ModelPreference | undefined {
  const provider = model?.provider?.trim();
  const id = model?.id?.trim();
  if (!provider || !id) {
    return undefined;
  }
  return { provider, id };
}

export function getCurrentModelLabel(session: { model?: { provider: string; id: string } | undefined }): string | undefined {
  const modelPreference = normalizeModelPreference(session.model);
  if (!modelPreference) {
    return undefined;
  }
  return formatModelLabel(modelPreference.provider, modelPreference.id);
}

export function getLoadedContextFiles(session: CommandPiSession): Array<{ path: string }> {
  return session.resourceLoader?.getAgentsFiles?.().agentsFiles ?? [];
}

export function getLoadedSkills(session: CommandPiSession): Array<{ filePath: string; scope?: string }> {
  const skills = session.resourceLoader?.getSkills?.().skills ?? [];
  return skills.map((skill) => ({
    filePath: skill.filePath,
    scope: skill.sourceInfo?.scope,
  }));
}

export interface ToolConfigSession {
  getAllTools(): Array<{ name: string }>;
  getActiveToolNames(): string[];
  setActiveToolsByName(toolNames: string[]): void;
}

export function getToolConfigSession(session: unknown): ToolConfigSession | null {
  if (
    !session
    || typeof session !== "object"
    || typeof (session as ToolConfigSession).getAllTools !== "function"
    || typeof (session as ToolConfigSession).getActiveToolNames !== "function"
    || typeof (session as ToolConfigSession).setActiveToolsByName !== "function"
  ) {
    return null;
  }

  return session as ToolConfigSession;
}
