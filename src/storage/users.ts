import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { UserState } from "../types.js";
import { logger } from "../app/logger.js";

export interface UserStateStore {
  getDataDir(): string;
  userSessionsDir(openId: string): string;
  readUserState(openId: string): Promise<UserState | null>;
  writeUserState(openId: string, state: UserState): Promise<void>;
  createUserState(openId: string, sessionId: string): Promise<UserState>;
  switchActiveSession(openId: string, sessionId: string): Promise<UserState>;
  touchUserState(openId: string, messageId: string): Promise<void>;
  ensureUserDir(openId: string): Promise<void>;
}

export function createUserStateStore(dataDir: string): UserStateStore {
  function userDir(openId: string): string {
    return join(dataDir, "users", openId);
  }

  function statePath(openId: string): string {
    return join(userDir(openId), "state.json");
  }

  function sessionsDir(openId: string): string {
    return join(userDir(openId), "sessions");
  }

  async function ensureDir(dir: string): Promise<void> {
    await mkdir(dir, { recursive: true });
  }

  async function readUserState(openId: string): Promise<UserState | null> {
    try {
      const raw = await readFile(statePath(openId), "utf-8");
      return JSON.parse(raw) as UserState;
    } catch {
      return null;
    }
  }

  async function writeUserState(openId: string, state: UserState): Promise<void> {
    const dir = userDir(openId);
    await ensureDir(dir);
    await ensureDir(sessionsDir(openId));
    await writeFile(statePath(openId), JSON.stringify(state, null, 2), "utf-8");
    logger.debug("用户状态已写入", { openId, activeSessionId: state.activeSessionId });
  }

  async function createUserState(openId: string, sessionId: string): Promise<UserState> {
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

  async function switchActiveSession(openId: string, sessionId: string): Promise<UserState> {
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

  async function touchUserState(openId: string, messageId: string): Promise<void> {
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

  async function ensureUserDir(openId: string): Promise<void> {
    await ensureDir(userDir(openId));
    await ensureDir(sessionsDir(openId));
  }

  return {
    getDataDir: () => dataDir,
    userSessionsDir: sessionsDir,
    readUserState,
    writeUserState,
    createUserState,
    switchActiveSession,
    touchUserState,
    ensureUserDir,
  };
}

let defaultUserStateStore = createUserStateStore("./data");

export function setDataDir(dir: string) {
  defaultUserStateStore = createUserStateStore(dir);
}

export function getDataDir(): string {
  return defaultUserStateStore.getDataDir();
}

/** 获取用户 session 存储目录路径（供外部模块使用） */
export function userSessionsDir(openId: string): string {
  return defaultUserStateStore.userSessionsDir(openId);
}

/** 读取用户状态，不存在则返回 null */
export async function readUserState(openId: string): Promise<UserState | null> {
  return defaultUserStateStore.readUserState(openId);
}

/** 写入用户状态 */
export async function writeUserState(openId: string, state: UserState): Promise<void> {
  await defaultUserStateStore.writeUserState(openId, state);
}

/** 创建新的用户状态（首次私聊时调用） */
export async function createUserState(openId: string, sessionId: string): Promise<UserState> {
  return defaultUserStateStore.createUserState(openId, sessionId);
}

/** 更新用户的活跃 session */
export async function switchActiveSession(openId: string, sessionId: string): Promise<UserState> {
  return defaultUserStateStore.switchActiveSession(openId, sessionId);
}

/** 更新 lastActiveAt 与 lastMessageId */
export async function touchUserState(
  openId: string,
  messageId: string
): Promise<void> {
  await defaultUserStateStore.touchUserState(openId, messageId);
}

/** 确保用户目录存在 */
export async function ensureUserDir(openId: string): Promise<void> {
  await defaultUserStateStore.ensureUserDir(openId);
}
