import type { AgentSession } from "@mariozechner/pi-coding-agent";
import { logger } from "../app/logger.js";
import { sendTextMessage, updateTextMessage, chunkText } from "../feishu/send.js";
import { formatThinking } from "../feishu/format.js";
import { BridgeError, withTimeout } from "../app/errors.js";

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
/** Pi prompt 默认超时（5 分钟） */
const PROMPT_TIMEOUT_MS = 5 * 60 * 1000;

/**
 * 调用 Pi session.prompt()，流式更新飞书消息
 *
 * 策略：
 * 1. 先发送一条 "正在思考..." 占位消息
 * 2. 订阅 Pi 流式事件，按节流间隔更新同一条消息
 * 3. 完成后最终更新一次完整内容
 * 4. 如果 update 失败，退化为完成后一次性发送
 * 5. 超时保护：超过 PROMPT_TIMEOUT_MS 自动中断
 */
export async function promptSession(
  session: AgentSession,
  text: string,
  openId: string,
  streamingEnabled: boolean = true,
  textChunkLimit: number = 2000,
  timeoutMs: number = PROMPT_TIMEOUT_MS
): Promise<PromptResult> {
  let fullText = "";
  let lastError: string | undefined;
  let placeholderMsgId: string | null = null;

  // 1. 发送占位消息
  try {
    placeholderMsgId = await sendTextMessage(openId, formatThinking());
  } catch (err) {
    logger.warn("占位消息发送失败", { openId, error: String(err) });
  }

  if (!streamingEnabled || !placeholderMsgId) {
    // 非流式模式或占位消息发送失败 -> 退化为一次性
    return await promptNonStreaming(session, text, openId, placeholderMsgId, timeoutMs);
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
    // 带超时的 prompt
    await withTimeout(session.prompt(text), timeoutMs, "Pi prompt 超时");
  } catch (err) {
    if (err instanceof BridgeError && err.category === "pi_prompt_timeout") {
      lastError = err.message;
      logger.error("Pi prompt 超时", { openId, timeoutMs });
      // 尝试 abort 当前操作
      try {
        await session.abort();
      } catch {
        // abort 也可能失败
      }
    } else {
      lastError = err instanceof Error ? err.message : String(err);
      logger.error("Pi prompt 执行失败", { error: lastError });
    }
  } finally {
    unsubscribe();
  }

  // 3. 最终更新：完整文本
  await finalizeMessage(openId, placeholderMsgId, fullText, textChunkLimit, updateFailed);

  return {
    text: fullText,
    error: lastError,
  };
}

/** 最终更新飞书消息 */
async function finalizeMessage(
  openId: string,
  placeholderMsgId: string | null,
  fullText: string,
  textChunkLimit: number,
  updateFailed: boolean
): Promise<void> {
  if (!fullText) return;

  if (fullText.length > FEISHU_MSG_LIMIT) {
    // 超长文本：更新占位消息为第一块，追加后续分块
    const chunks = chunkText(fullText, textChunkLimit);
    const firstChunk = chunks[0];
    if (placeholderMsgId && !updateFailed) {
      const ok = await updateTextMessage(placeholderMsgId, firstChunk);
      if (!ok) {
        await sendFallbackChunks(openId, chunks);
        return;
      }
    } else {
      await sendFallbackChunks(openId, chunks);
      return;
    }
    // 追加后续分块
    for (let i = 1; i < chunks.length; i++) {
      await sendTextMessage(openId, chunks[i]);
    }
  } else {
    // 正常长度：更新占位消息
    if (placeholderMsgId && !updateFailed) {
      const ok = await updateTextMessage(placeholderMsgId, fullText);
      if (!ok) {
        await sendTextMessage(openId, fullText);
      }
    } else {
      await sendTextMessage(openId, fullText);
    }
  }
}

/** 非流式模式：完成后一次性发送 */
async function promptNonStreaming(
  session: AgentSession,
  text: string,
  openId: string,
  placeholderMsgId: string | null,
  timeoutMs: number
): Promise<PromptResult> {
  let fullText = "";
  let lastError: string | undefined;

  const unsubscribe = session.subscribe((event) => {
    if (event.type === "message_update" && event.assistantMessageEvent.type === "text_delta") {
      fullText += event.assistantMessageEvent.delta;
    }
  });

  try {
    await withTimeout(session.prompt(text), timeoutMs, "Pi prompt 超时");
  } catch (err) {
    if (err instanceof BridgeError && err.category === "pi_prompt_timeout") {
      lastError = err.message;
      try { await session.abort(); } catch {}
    } else {
      lastError = err instanceof Error ? err.message : String(err);
    }
    logger.error("Pi prompt 执行失败", { error: lastError });
  } finally {
    unsubscribe();
  }

  await finalizeMessage(openId, placeholderMsgId, fullText, FEISHU_MSG_LIMIT, false);

  return { text: fullText, error: lastError };
}

/** 退化为分块发送 */
async function sendFallbackChunks(openId: string, chunks: string[]): Promise<void> {
  for (const chunk of chunks) {
    await sendTextMessage(openId, chunk);
  }
}
