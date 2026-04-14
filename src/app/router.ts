import type { FeishuMessageEvent } from "../types.js";
import { logger } from "./logger.js";
import { isDuplicate, acquireLock, releaseLock, isLocked } from "./state.js";
import { parseBridgeCommand, handleBridgeCommand, type BridgeCommand } from "./commands.js";
import { parseMessageEvent, isSupportedP2PMessage } from "../feishu/events.js";
import { sendRenderedMessage, sendTextMessage } from "../feishu/send.js";
import { formatError } from "../feishu/format.js";
import { getOrCreateActiveSession, createNewSession, touchSession } from "../pi/sessions.js";
import { readUserState } from "../storage/users.js";
import { promptSession } from "../pi/stream.js";
import type { Config } from "../config.js";
import { getUserWorkspaceDir } from "../pi/workspace.js";
import { normalizeFeishuInboundMessage } from "../feishu/inbound/normalize.js";
import { prepareFeishuPromptInput } from "../feishu/inbound/transform.js";
import type { FeishuInboundMessage } from "../feishu/inbound/types.js";
import {
  filterAvailableModels,
  findAvailableModel,
  formatModelLabel,
  listAvailableModels,
} from "../pi/models.js";

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

  // 2. 过滤：仅私聊支持的消息
  if (!isSupportedP2PMessage(event)) return;

  const message = normalizeFeishuInboundMessage(event);
  if (!message) return;

  const identity = message.identity;
  const openId = identity.openId;
  const messageId = message.messageId;

  logger.info("收到私聊消息", {
    openId,
    messageId,
    messageType: message.messageType,
    ...buildMessageLogPayload(message),
  });
  logger.debug("消息内容", {
    openId,
    messageType: message.messageType,
    ...buildMessageLogPayload(message),
  });

  // 3. 去重
  if (isDuplicate(messageId)) {
    logger.debug("重复消息已忽略", { openId, messageId });
    return;
  }

  // 4. 命令分流
  const bridgeCommand = message.kind === "text" ? parseBridgeCommand(message.text) : null;
  if (bridgeCommand) {
    await handleBridgeCommandFlow(identity, bridgeCommand);
    return;
  }

  // 5. 普通消息 -> Pi
  await handleUserPrompt(identity, message);
}

function truncateForLog(text: string, limit: number): string {
  return Array.from(text).slice(0, limit).join("");
}

/** 处理桥接层命令 */
async function handleBridgeCommandFlow(
  identity: { openId: string; userId?: string },
  command: BridgeCommand,
): Promise<void> {
  const openId = identity.openId;
  try {
    if (command.name === "new" || command.name === "reset") {
      const sessionState = await createNewSession(identity);
      const reply = handleBridgeCommand(command, {
        openId,
        sessionId: sessionState.activeSessionId,
        workspaceDir: getUserWorkspaceDir(identity),
        currentModel: getCurrentModelLabel(sessionState.piSession),
      });
      await sendCommandReply(openId, reply);
    } else if (command.name === "status") {
      const sessionState = await getOrCreateActiveSession(identity);
      const userState = await readUserState(openId);
      const reply = handleBridgeCommand(command, {
        openId,
        sessionId: sessionState.activeSessionId,
        createdAt: userState?.createdAt,
        piSessionFile: userState?.piSessionFile,
        workspaceDir: getUserWorkspaceDir(identity),
        currentModel: getCurrentModelLabel(sessionState.piSession),
      });
      await sendCommandReply(openId, reply);
    } else if (command.name === "models") {
      const availableModels = await listAvailableModels();
      const filteredModels = filterAvailableModels(availableModels, command.args);
      const reply = handleBridgeCommand(command, {
        openId,
        requestedProvider: command.args,
        availableModels: filteredModels,
      });
      await sendCommandReply(openId, reply);
    } else if (command.name === "model") {
      await handleModelCommand(identity, command);
    }
  } catch (err) {
    logger.error("桥接层命令处理失败", { openId, command: command.name, args: command.args, error: String(err) });
    await sendTextMessage(openId, formatError("命令处理失败，请稍后重试"));
  }
}

/** 处理普通用户消息 -> Pi prompt */
async function handleUserPrompt(
  identity: { openId: string; userId?: string },
  message: FeishuInboundMessage,
): Promise<void> {
  const openId = identity.openId;
  const messageId = message.messageId;
  // 获取运行锁
  if (!acquireLock(openId, messageId)) {
    logger.info("用户消息因已有处理中任务被忽略", { openId, messageId });
    return;
  }

  try {
    // 获取或创建 session
    const { activeSessionId, piSession } = await getOrCreateActiveSession(identity);
    const promptInput = await prepareFeishuPromptInput(message, piSession, {
      workspaceDir: getUserWorkspaceDir(identity),
      ollamaBaseUrl: config.FEISHU_MEDIA_OLLAMA_BASE_URL,
      ocrModel: config.FEISHU_MEDIA_OCR_MODEL,
      audioTranscribeScript: config.FEISHU_AUDIO_TRANSCRIBE_SCRIPT,
      audioLanguage: config.FEISHU_AUDIO_TRANSCRIBE_LANGUAGE,
    });

    const logCtx = { openId, sessionId: activeSessionId, messageId };

    // 调用 Pi prompt（可选添加 reaction 表示处理中，完成后发送最终回复）
    const result = await promptSession(
      piSession,
      promptInput,
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

function buildMessageLogPayload(message: FeishuInboundMessage): Record<string, number | string> {
  switch (message.kind) {
    case "text":
      return {
        textLen: message.text.length,
        text: truncateForLog(message.text, MESSAGE_LOG_PREVIEW_LIMIT),
      };
    case "image":
      return {
        imageKey: message.imageKey,
      };
    case "audio":
      return {
        fileKey: message.fileKey,
        durationMs: message.durationMs ?? 0,
      };
  }
}

async function handleModelCommand(
  identity: { openId: string; userId?: string },
  command: BridgeCommand,
): Promise<void> {
  const openId = identity.openId;
  const argText = command.args.trim();

  if (!argText || argText.toLowerCase() === "status") {
    const sessionState = await getOrCreateActiveSession(identity);
    const availableModels = await listAvailableModels();
    const reply = handleBridgeCommand(command, {
      openId,
      currentModel: getCurrentModelLabel(sessionState.piSession),
      availableModelCount: availableModels.length,
    });
    await sendCommandReply(openId, reply);
    return;
  }

  if (isLocked(openId)) {
    await sendTextMessage(openId, "当前还有任务在跑，等这条回复结束后再切模型。");
    return;
  }

  const targetModel = await findAvailableModel(argText);
  if (!targetModel) {
    await sendTextMessage(
      openId,
      "没找到这个可用模型，或者它现在还不能用。\n\n用 /models 看当前环境真的能跑的模型。",
    );
    return;
  }

  const sessionState = await getOrCreateActiveSession(identity);
  const previousModel = getCurrentModelLabel(sessionState.piSession);
  await sessionState.piSession.setModel(targetModel.model);

  const reply = handleBridgeCommand(command, {
    openId,
    currentModel: getCurrentModelLabel(sessionState.piSession) ?? formatModelLabel(targetModel.provider, targetModel.id),
    previousModel,
  });
  await sendCommandReply(openId, reply);
}

function getCurrentModelLabel(session: { model?: { provider: string; id: string } | undefined }): string | undefined {
  if (!session.model) {
    return undefined;
  }
  return formatModelLabel(session.model.provider, session.model.id);
}

async function sendCommandReply(openId: string, text: string): Promise<void> {
  await sendRenderedMessage(openId, text, config.TEXT_CHUNK_LIMIT);
}
