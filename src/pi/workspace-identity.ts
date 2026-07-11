import type { ConversationTarget } from "../conversation.js";
import type { UserIdentity } from "../types.js";

export interface WorkspaceContext {
  identity: UserIdentity;
  conversationTarget?: ConversationTarget;
}

const workspaceIdentityMap = new Map<string, WorkspaceContext>();
let sessionIdentityMap = new WeakMap<object, WorkspaceContext>();

function createWorkspaceContext(
  identity: UserIdentity,
  conversationTarget?: ConversationTarget,
): WorkspaceContext {
  return {
    identity: {
      openId: identity.openId,
      userId: identity.userId,
    },
    conversationTarget: conversationTarget ? { ...conversationTarget } : undefined,
  };
}

function copyWorkspaceContext(context: WorkspaceContext): WorkspaceContext {
  return createWorkspaceContext(context.identity, context.conversationTarget);
}

export function bindWorkspaceIdentity(
  workspaceDir: string,
  identity: UserIdentity,
  conversationTarget?: ConversationTarget,
): void {
  workspaceIdentityMap.set(workspaceDir, createWorkspaceContext(identity, conversationTarget));
}

export function bindSessionIdentity(
  session: object,
  identity: UserIdentity,
  conversationTarget?: ConversationTarget,
): void {
  const context = createWorkspaceContext(identity, conversationTarget);
  sessionIdentityMap.set(session, context);

  const sessionManager = "sessionManager" in session ? session.sessionManager : undefined;
  if (sessionManager && typeof sessionManager === "object") {
    sessionIdentityMap.set(sessionManager, context);
  }
}

export function getWorkspaceIdentity(workspaceDir: string): UserIdentity | null {
  return workspaceIdentityMap.get(workspaceDir)?.identity ?? null;
}

export function getWorkspaceContext(
  workspaceDir: string,
  sessionOrManager?: object,
): WorkspaceContext | null {
  const context = sessionOrManager
    ? sessionIdentityMap.get(sessionOrManager) ?? workspaceIdentityMap.get(workspaceDir)
    : workspaceIdentityMap.get(workspaceDir);
  if (!context) {
    return null;
  }

  return copyWorkspaceContext(context);
}

export function clearWorkspaceIdentities(): void {
  workspaceIdentityMap.clear();
  sessionIdentityMap = new WeakMap<object, WorkspaceContext>();
}
