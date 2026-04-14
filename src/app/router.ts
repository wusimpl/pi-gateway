import type { FeishuMessageEvent } from "../types.js";
import { logger } from "./logger.js";
import { isDuplicate, acquireLock, releaseLock } from "./state.js";
import { parseBridgeCommand, handleBridgeCommand } from "./commands.js";
import { parseMessageEvent, isP2PTextMessage, extractTextContent } from "../feishu/events.js";
import { sendTextMessage, chunkText } from "../feishu/send.js";
import { formatThinking, formatError } from "../feishu/format.js";
import { getOrCreateActiveSession, createNewSession } from "../pi/sessions.js";
import { promptSession } from "../pi/stream.js";
import type { Config } from "../config.js";

let config: Config;

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

  const openId = event.sender.senderId.openId;
  const messageId = event.message.messageId;
  const text = extractTextContent(event.message.content).trim();

  if (!text) return;

  logger.info("收到私聊消息", { openId, messageId, textLen: text.length });
  logger.debug("消息内容", { openId, text: text.slice(0, 100) });

  // 3. 去重
  if (isDuplicate(messageId)) {
    logger.debug("重复消息已忽略", { openId, messageId });
    return;
  }

  // 4. 命令分流
  const bridgeCommand = parseBridgeCommand(text);
  if (bridgeCommand) {
    await handleBridgeCommandFlow(openId, bridgeCommand);
    return;
  }

  // 5. 普通消息 -> Pi
  await handleUserPrompt(openId, messageId, text);
}

/** 处理桥接层命令 */
async function handleBridgeCommandFlow(
  openId: string,
  command: "new" | "reset" | "status"
): Promise<void> {
  try {
    if (command === "new" || command === "reset") {
      // 创建新 session
      const sessionState = await createNewSession(openId);
      await sendTextMessage(openId, "✅ 已创建新会话");
      logger.info("桥接层命令: 创建新会话", { openId, command });
    } else if (command === "status") {
      const sessionState = await getOrCreateActiveSession(openId);
      const reply = `📋 当前会话: ${sessionState.activeSessionId}`;
      await sendTextMessage(openId, reply);
    }
  } catch (err) {
    logger.error("桥接层命令处理失败", { openId, command, error: String(err) });
    await sendTextMessage(openId, formatError("命令处理失败，请稍后重试"));
  }
}

/** 处理普通用户消息 -> Pi prompt */
async function handleUserPrompt(
  openId: string,
  messageId: string,
  text: string
): Promise<void> {
  // 获取运行锁
  if (!acquireLock(openId, messageId)) {
    await sendTextMessage(openId, "⏳ 上一条消息仍在处理中，请稍后或使用 /new 新建会话");
    return;
  }

  try {
    // 获取或创建 session
    const { activeSessionId, piSession } = await getOrCreateActiveSession(openId);

    // 发送"正在思考"提示
    await sendTextMessage(openId, formatThinking());

    // 调用 Pi prompt
    const result = await promptSession(piSession, text);

    // 分块发送回复
    if (result.text) {
      const chunks = chunkText(result.text, config.TEXT_CHUNK_LIMIT);
      for (const chunk of chunks) {
        await sendTextMessage(openId, chunk);
      }
    }

    if (result.error) {
      // 流式中断时发送已聚合的内容 + 中断提示
      const interruptMsg = result.text
        ? `\n\n⚠️ 回复中断: ${result.error}`
        : formatError(result.error);
      await sendTextMessage(openId, interruptMsg);
    }
  } catch (err) {
    logger.error("Pi prompt 处理失败", { openId, messageId, error: String(err) });
    await sendTextMessage(openId, formatError("处理失败，请稍后重试或使用 /new 新建会话"));
  } finally {
    releaseLock(openId);
  }
}
