import { mkdir } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import type { UserIdentity } from "../types.js";

const DEFAULT_WORKSPACE_ROOT = join(homedir(), "code", "pi-workspace");

let workspaceRoot = DEFAULT_WORKSPACE_ROOT;

export function setWorkspaceRoot(root: string): void {
  workspaceRoot = root;
}

export function getWorkspaceRoot(): string {
  return workspaceRoot;
}

export function getUserWorkspaceDir(identity: UserIdentity): string {
  const userKey = sanitizeWorkspaceSegment(identity.userId || identity.openId);
  return join(workspaceRoot, userKey);
}

export async function ensureUserWorkspace(identity: UserIdentity): Promise<string> {
  const dir = getUserWorkspaceDir(identity);
  await mkdir(dir, { recursive: true });
  return dir;
}

function sanitizeWorkspaceSegment(value: string): string {
  const normalized = value.trim().replace(/[^a-zA-Z0-9._-]/g, "_");
  return normalized.length > 0 ? normalized : "unknown-user";
}
