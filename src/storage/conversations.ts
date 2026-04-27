import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { logger } from "../app/logger.js";
import type { UserState } from "../types.js";

export interface ConversationStateStore {
  conversationSessionsDir(conversationKey: string): string;
  readConversationState(conversationKey: string): Promise<UserState | null>;
  writeConversationState(conversationKey: string, state: UserState): Promise<void>;
  createConversationState(conversationKey: string, sessionId: string): Promise<UserState>;
  touchConversationState(conversationKey: string, messageId: string): Promise<void>;
  ensureConversationDir(conversationKey: string): Promise<void>;
}

export function createConversationStateStore(dataDir: string): ConversationStateStore {
  function conversationDir(conversationKey: string): string {
    return join(dataDir, "conversations", encodeURIComponent(conversationKey));
  }

  function statePath(conversationKey: string): string {
    return join(conversationDir(conversationKey), "state.json");
  }

  function sessionsDir(conversationKey: string): string {
    return join(conversationDir(conversationKey), "sessions");
  }

  async function ensureDir(dir: string): Promise<void> {
    await mkdir(dir, { recursive: true });
  }

  async function readConversationState(conversationKey: string): Promise<UserState | null> {
    try {
      const raw = await readFile(statePath(conversationKey), "utf-8");
      return JSON.parse(raw) as UserState;
    } catch {
      return null;
    }
  }

  async function writeConversationState(conversationKey: string, state: UserState): Promise<void> {
    await ensureDir(conversationDir(conversationKey));
    await ensureDir(sessionsDir(conversationKey));
    await writeFile(statePath(conversationKey), JSON.stringify(state, null, 2), "utf-8");
    logger.debug("会话目标状态已写入", { conversationKey, activeSessionId: state.activeSessionId });
  }

  async function createConversationState(conversationKey: string, sessionId: string): Promise<UserState> {
    const now = new Date().toISOString();
    const state: UserState = {
      activeSessionId: sessionId,
      createdAt: now,
      updatedAt: now,
      lastActiveAt: now,
    };
    await writeConversationState(conversationKey, state);
    logger.info("新会话目标状态已创建", { conversationKey, sessionId });
    return state;
  }

  async function touchConversationState(conversationKey: string, messageId: string): Promise<void> {
    const state = await readConversationState(conversationKey);
    if (!state) {
      logger.warn("touchConversationState: 会话目标状态不存在", { conversationKey });
      return;
    }
    const now = new Date().toISOString();
    state.lastActiveAt = now;
    state.updatedAt = now;
    state.lastMessageId = messageId;
    await writeConversationState(conversationKey, state);
  }

  async function ensureConversationDir(conversationKey: string): Promise<void> {
    await ensureDir(conversationDir(conversationKey));
    await ensureDir(sessionsDir(conversationKey));
  }

  return {
    conversationSessionsDir: sessionsDir,
    readConversationState,
    writeConversationState,
    createConversationState,
    touchConversationState,
    ensureConversationDir,
  };
}
