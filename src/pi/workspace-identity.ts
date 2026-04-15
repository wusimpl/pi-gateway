import type { UserIdentity } from "../types.js";

const workspaceIdentityMap = new Map<string, UserIdentity>();

export function bindWorkspaceIdentity(workspaceDir: string, identity: UserIdentity): void {
  workspaceIdentityMap.set(workspaceDir, {
    openId: identity.openId,
    userId: identity.userId,
  });
}

export function getWorkspaceIdentity(workspaceDir: string): UserIdentity | null {
  return workspaceIdentityMap.get(workspaceDir) ?? null;
}

export function clearWorkspaceIdentities(): void {
  workspaceIdentityMap.clear();
}
