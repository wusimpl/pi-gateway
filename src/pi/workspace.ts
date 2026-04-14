import { mkdir } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import type { UserIdentity } from "../types.js";

const DEFAULT_WORKSPACE_ROOT = join(homedir(), "code", "pi-workspace");

export interface WorkspaceService {
  getWorkspaceRoot(): string;
  getUserWorkspaceDir(identity: UserIdentity): string;
  ensureUserWorkspace(identity: UserIdentity): Promise<string>;
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

  return {
    getWorkspaceRoot: () => root,
    getUserWorkspaceDir,
    ensureUserWorkspace,
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
