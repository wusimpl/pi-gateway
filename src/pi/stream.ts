import type { AgentSession } from "@mariozechner/pi-coding-agent";
import { logger } from "../app/logger.js";
import { sendTextMessage, updateTextMessage, chunkText } from "../feishu/send.js";
import { formatThinking } from "../feishu/format.js";

export interface PromptResult {
  /** 聚合的 assistant 文本 */
  text: string;
  /** 错误信息（如有） */
  error?: string;
}

/** 流式回复的节流间隔（毫秒） */
const STREAM_THROTTLE_MS = 1500;
/** 单条飞书消息文本上限 */
const FEISHU_MSG_LIMIT = 4000;

/**
 * 调用 Pi session.prompt()，流式更新飞书消息
 *
 * 策略：
 * 1. 先发送一条 "正在思考..." 占位消息
 * 2. 订阅 Pi 流式事件，按节流间隔更新同一条消息
 * 3. 完成后最终更新一次完整内容
 * 4. 如果 update 失败，退化为完成后一次性发送
 */
export async function promptSession(
  session: AgentSession,
  text: string,
  openId: string,
  streamingEnabled: boolean = true,
  textChunkLimit: number = 2000
): Promise<PromptResult> {
  let fullText = "";
  let lastError: string | undefined;
  let placeholderMsgId: string | null = null;

  // 1. 发送占位消息
  placeholderMsgId = await sendTextMessage(openId, formatThinking());

  if (!streamingEnabled || !placeholderMsgId) {
    // 非流式模式或占位消息发送失败 -> 退化为一次性
    return await promptNonStreaming(session, text, openId, placeholderMsgId);
  }

  // 2. 流式模式
  let lastUpdateTime = 0;
  let updateFailed = false;

  const unsubscribe = session.subscribe((event) => {
    switch (event.type) {
      case "message_update":
        if (event.assistantMessageEvent.type === "text_delta") {
          fullText += event.assistantMessageEvent.delta;

          // 节流更新飞书消息
          const now = Date.now();
          if (now - lastUpdateTime >= STREAM_THROTTLE_MS && !updateFailed) {
            lastUpdateTime = now;
            const displayText = fullText.slice(0, FEISHU_MSG_LIMIT);
            updateTextMessage(placeholderMsgId!, displayText).then((ok) => {
              if (!ok) updateFailed = true;
            });
          }
        }
        break;
      case "message_end":
        logger.debug("Pi message_end");
        break;
      case "agent_end":
        logger.debug("Pi agent_end");
        break;
      case "tool_execution_start":
        logger.debug("Pi tool_execution_start", { toolName: event.toolName });
        break;
      case "tool_execution_end":
        logger.debug("Pi tool_execution_end", {
          toolName: event.toolName,
          isError: event.isError,
        });
        break;
      default:
        logger.debug("Pi event", { type: event.type });
    }
  });

  try {
    await session.prompt(text);
  } catch (err) {
    lastError = err instanceof Error ? err.message : String(err);
    logger.error("Pi prompt 执行失败", { error: lastError });
  } finally {
    unsubscribe();
  }

  // 3. 最终更新：完整文本
  if (placeholderMsgId && fullText.length > 0) {
    if (fullText.length > FEISHU_MSG_LIMIT) {
      // 超长文本：先更新占位消息为第一块，再追加后续分块
      const chunks = chunkText(fullText, textChunkLimit);
      const firstChunk = chunks[0];
      const updateOk = await updateTextMessage(placeholderMsgId, firstChunk);
      if (!updateOk) {
        // update 失败 -> 退化为一次性发送
        await sendFallbackChunks(openId, chunks);
      } else {
        // 追加后续分块
        for (let i = 1; i < chunks.length; i++) {
          await sendTextMessage(openId, chunks[i]);
        }
      }
    } else {
      // 正常长度：更新占位消息
      const updateOk = await updateTextMessage(placeholderMsgId, fullText);
      if (!updateOk) {
        // update 失败 -> 退化为一次性发送
        await sendTextMessage(openId, fullText);
      }
    }
  }

  return {
    text: fullText,
    error: lastError,
  };
}

/** 非流式模式：完成后一次性发送 */
async function promptNonStreaming(
  session: AgentSession,
  text: string,
  openId: string,
  placeholderMsgId: string | null
): Promise<PromptResult> {
  let fullText = "";
  let lastError: string | undefined;

  const unsubscribe = session.subscribe((event) => {
    if (event.type === "message_update" && event.assistantMessageEvent.type === "text_delta") {
      fullText += event.assistantMessageEvent.delta;
    }
  });

  try {
    await session.prompt(text);
  } catch (err) {
    lastError = err instanceof Error ? err.message : String(err);
    logger.error("Pi prompt 执行失败", { error: lastError });
  } finally {
    unsubscribe();
  }

  // 发送完整回复
  if (fullText) {
    // 如果有占位消息，先更新它
    if (placeholderMsgId) {
      const ok = await updateTextMessage(placeholderMsgId, fullText.slice(0, FEISHU_MSG_LIMIT));
      if (!ok) {
        await sendTextMessage(openId, fullText);
      }
    } else {
      await sendTextMessage(openId, fullText);
    }
  }

  return { text: fullText, error: lastError };
}

/** 退化为分块发送 */
async function sendFallbackChunks(openId: string, chunks: string[]): Promise<void> {
  for (const chunk of chunks) {
    await sendTextMessage(openId, chunk);
  }
}
