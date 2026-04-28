import type { ConversationTarget } from "../conversation.js";
import type { UserIdentity } from "../types.js";

export interface WorkspaceContext {
  identity: UserIdentity;
  conversationTarget?: ConversationTarget;
}

const workspaceIdentityMap = new Map<string, WorkspaceContext>();

export function bindWorkspaceIdentity(
  workspaceDir: string,
  identity: UserIdentity,
  conversationTarget?: ConversationTarget,
): void {
  workspaceIdentityMap.set(workspaceDir, {
    identity: {
      openId: identity.openId,
      userId: identity.userId,
    },
    conversationTarget: conversationTarget ? { ...conversationTarget } : undefined,
  });
}

export function getWorkspaceIdentity(workspaceDir: string): UserIdentity | null {
  return workspaceIdentityMap.get(workspaceDir)?.identity ?? null;
}

export function getWorkspaceContext(workspaceDir: string): WorkspaceContext | null {
  const context = workspaceIdentityMap.get(workspaceDir);
  if (!context) {
    return null;
  }

  return {
    identity: { ...context.identity },
    conversationTarget: context.conversationTarget ? { ...context.conversationTarget } : undefined,
  };
}

export function clearWorkspaceIdentities(): void {
  workspaceIdentityMap.clear();
}
