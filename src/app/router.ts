import type { FeishuMessageEvent } from "../types.js";
import { logger } from "./logger.js";
import { isDuplicate, acquireLock, releaseLock } from "./state.js";
import { parseBridgeCommand, handleBridgeCommand } from "./commands.js";
import { parseMessageEvent, isP2PTextMessage, extractTextContent } from "../feishu/events.js";
import { sendTextMessage } from "../feishu/send.js";
import { formatError } from "../feishu/format.js";
import { getOrCreateActiveSession, createNewSession, touchSession } from "../pi/sessions.js";
import { readUserState } from "../storage/users.js";
import { promptSession } from "../pi/stream.js";
import type { Config } from "../config.js";
import { getUserWorkspaceDir } from "../pi/workspace.js";

let config: Config;
const MESSAGE_LOG_PREVIEW_LIMIT = 30;

export function initRouter(cfg: Config): void {
  config = cfg;
}

/**
 * 飞书入站消息主路由
 */
export async function handleFeishuMessage(data: Record<string, unknown>): Promise<void> {
  // 1. 解析事件
  const event = parseMessageEvent(data);
  if (!event) return;

  // 2. 过滤：仅私聊文本
  if (!isP2PTextMessage(event)) return;

  const identity = {
    openId: event.sender.senderId.openId,
    userId: event.sender.senderId.userId,
  };
  const openId = identity.openId;
  const messageId = event.message.messageId;
  const text = extractTextContent(event.message.content).trim();

  if (!text) return;

  logger.info("收到私聊消息", {
    openId,
    messageId,
    textLen: text.length,
    text: truncateForLog(text, MESSAGE_LOG_PREVIEW_LIMIT),
  });
  logger.debug("消息内容", { openId, text: truncateForLog(text, MESSAGE_LOG_PREVIEW_LIMIT) });

  // 3. 去重
  if (isDuplicate(messageId)) {
    logger.debug("重复消息已忽略", { openId, messageId });
    return;
  }

  // 4. 命令分流
  const bridgeCommand = parseBridgeCommand(text);
  if (bridgeCommand) {
    await handleBridgeCommandFlow(identity, bridgeCommand);
    return;
  }

  // 5. 普通消息 -> Pi
  await handleUserPrompt(identity, messageId, text);
}

function truncateForLog(text: string, limit: number): string {
  return Array.from(text).slice(0, limit).join("");
}

/** 处理桥接层命令 */
async function handleBridgeCommandFlow(
  identity: { openId: string; userId?: string },
  command: "new" | "reset" | "status"
): Promise<void> {
  const openId = identity.openId;
  try {
    if (command === "new" || command === "reset") {
      const sessionState = await createNewSession(identity);
      const reply = handleBridgeCommand(command, {
        openId,
        sessionId: sessionState.activeSessionId,
        workspaceDir: getUserWorkspaceDir(identity),
      });
      await sendTextMessage(openId, reply);
    } else if (command === "status") {
      const sessionState = await getOrCreateActiveSession(identity);
      const userState = await readUserState(openId);
      const reply = handleBridgeCommand(command, {
        openId,
        sessionId: sessionState.activeSessionId,
        createdAt: userState?.createdAt,
        piSessionFile: userState?.piSessionFile,
        workspaceDir: getUserWorkspaceDir(identity),
      });
      await sendTextMessage(openId, reply);
    }
  } catch (err) {
    logger.error("桥接层命令处理失败", { openId, command, error: String(err) });
    await sendTextMessage(openId, formatError("命令处理失败，请稍后重试"));
  }
}

/** 处理普通用户消息 -> Pi prompt */
async function handleUserPrompt(
  identity: { openId: string; userId?: string },
  messageId: string,
  text: string
): Promise<void> {
  const openId = identity.openId;
  // 获取运行锁
  if (!acquireLock(openId, messageId)) {
    logger.info("用户消息因已有处理中任务被忽略", { openId, messageId });
    return;
  }

  try {
    // 获取或创建 session
    const { activeSessionId, piSession } = await getOrCreateActiveSession(identity);

    const logCtx = { openId, sessionId: activeSessionId, messageId };

    // 调用 Pi prompt（可选添加 reaction 表示处理中，完成后发送最终回复）
    const result = await promptSession(
      piSession,
      text,
      openId,
      messageId,
      config.FEISHU_PROCESSING_REACTION_TYPE,
      config.STREAMING_ENABLED,
      config.TEXT_CHUNK_LIMIT
    );

    // 分块发送回复（stream.ts 中已处理，此处仅处理无文本时的错误场景）
    if (result.error && !result.text) {
      await sendTextMessage(openId, formatError(result.error));
    }

    // 更新活跃时间
    await touchSession(openId, messageId);
    logger.info("Pi prompt 完成", logCtx);
  } catch (err) {
    logger.error("Pi prompt 处理失败", { openId, messageId, error: String(err) });
    await sendTextMessage(openId, formatError("处理失败，请稍后重试或使用 /new 新建会话"));
  } finally {
    releaseLock(openId);
  }
}
