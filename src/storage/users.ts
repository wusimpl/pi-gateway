import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { UserState } from "../types.js";
import { logger } from "../app/logger.js";

let dataDir = "./data";

export function setDataDir(dir: string) {
  dataDir = dir;
}

function userDir(openId: string): string {
  return join(dataDir, "users", openId);
}

function statePath(openId: string): string {
  return join(userDir(openId), "state.json");
}

function sessionsDir(openId: string): string {
  return join(userDir(openId), "sessions");
}

/** 确保目录存在 */
async function ensureDir(dir: string): Promise<void> {
  await mkdir(dir, { recursive: true });
}

/** 读取用户状态，不存在则返回 null */
export async function readUserState(openId: string): Promise<UserState | null> {
  try {
    const raw = await readFile(statePath(openId), "utf-8");
    return JSON.parse(raw) as UserState;
  } catch {
    return null;
  }
}

/** 写入用户状态 */
export async function writeUserState(openId: string, state: UserState): Promise<void> {
  const dir = userDir(openId);
  await ensureDir(dir);
  await ensureDir(sessionsDir(openId));
  await writeFile(statePath(openId), JSON.stringify(state, null, 2), "utf-8");
  logger.debug("用户状态已写入", { openId, activeSessionId: state.activeSessionId });
}

/** 创建新的用户状态（首次私聊时调用） */
export async function createUserState(openId: string, sessionId: string): Promise<UserState> {
  const now = new Date().toISOString();
  const state: UserState = {
    activeSessionId: sessionId,
    createdAt: now,
    updatedAt: now,
    lastActiveAt: now,
  };
  await writeUserState(openId, state);
  logger.info("新用户状态已创建", { openId, sessionId });
  return state;
}

/** 更新用户的活跃 session */
export async function switchActiveSession(openId: string, sessionId: string): Promise<UserState> {
  const state = await readUserState(openId);
  if (!state) {
    return createUserState(openId, sessionId);
  }
  const now = new Date().toISOString();
  state.activeSessionId = sessionId;
  state.updatedAt = now;
  state.lastActiveAt = now;
  await writeUserState(openId, state);
  logger.info("活跃 session 已切换", { openId, sessionId });
  return state;
}

/** 更新 lastActiveAt 与 lastMessageId */
export async function touchUserState(
  openId: string,
  messageId: string
): Promise<void> {
  const state = await readUserState(openId);
  if (!state) {
    logger.warn("touchUserState: 用户状态不存在", { openId });
    return;
  }
  const now = new Date().toISOString();
  state.lastActiveAt = now;
  state.updatedAt = now;
  state.lastMessageId = messageId;
  await writeUserState(openId, state);
}

/** 确保用户目录存在 */
export async function ensureUserDir(openId: string): Promise<void> {
  await ensureDir(userDir(openId));
  await ensureDir(sessionsDir(openId));
}
