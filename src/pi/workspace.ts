import { mkdir } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import type { ConversationTarget } from "../conversation.js";
import type { UserIdentity } from "../types.js";

const DEFAULT_WORKSPACE_ROOT = join(homedir(), "code", "pi-workspace");

export interface WorkspaceService {
  getWorkspaceRoot(): string;
  getUserWorkspaceDir(identity: UserIdentity): string;
  ensureUserWorkspace(identity: UserIdentity): Promise<string>;
  getConversationWorkspaceDir(identity: UserIdentity, target: ConversationTarget): string;
  ensureConversationWorkspace(identity: UserIdentity, target: ConversationTarget): Promise<string>;
}

export function createWorkspaceService(root: string = DEFAULT_WORKSPACE_ROOT): WorkspaceService {
  function getUserWorkspaceDir(identity: UserIdentity): string {
    const userKey = sanitizeWorkspaceSegment(identity.userId || identity.openId);
    return join(root, userKey);
  }

  async function ensureUserWorkspace(identity: UserIdentity): Promise<string> {
    const dir = getUserWorkspaceDir(identity);
    await mkdir(dir, { recursive: true });
    return dir;
  }

  function getConversationWorkspaceDir(identity: UserIdentity, target: ConversationTarget): string {
    if (target.kind === "p2p") {
      return getUserWorkspaceDir(identity);
    }

    return join(root, "conversations", sanitizeWorkspaceSegment(target.key));
  }

  async function ensureConversationWorkspace(identity: UserIdentity, target: ConversationTarget): Promise<string> {
    const dir = getConversationWorkspaceDir(identity, target);
    await mkdir(dir, { recursive: true });
    return dir;
  }

  return {
    getWorkspaceRoot: () => root,
    getUserWorkspaceDir,
    ensureUserWorkspace,
    getConversationWorkspaceDir,
    ensureConversationWorkspace,
  };
}

function sanitizeWorkspaceSegment(value: string): string {
  const normalized = value.trim().replace(/[^a-zA-Z0-9._-]/g, "_");
  return normalized.length > 0 ? normalized : "unknown-user";
}

let defaultWorkspaceService = createWorkspaceService();

export function setWorkspaceRoot(root: string): void {
  defaultWorkspaceService = createWorkspaceService(root);
}

export function getWorkspaceRoot(): string {
  return defaultWorkspaceService.getWorkspaceRoot();
}

export function getUserWorkspaceDir(identity: UserIdentity): string {
  return defaultWorkspaceService.getUserWorkspaceDir(identity);
}

export async function ensureUserWorkspace(identity: UserIdentity): Promise<string> {
  return defaultWorkspaceService.ensureUserWorkspace(identity);
}

export function getConversationWorkspaceDir(identity: UserIdentity, target: ConversationTarget): string {
  return defaultWorkspaceService.getConversationWorkspaceDir(identity, target);
}

export async function ensureConversationWorkspace(identity: UserIdentity, target: ConversationTarget): Promise<string> {
  return defaultWorkspaceService.ensureConversationWorkspace(identity, target);
}
