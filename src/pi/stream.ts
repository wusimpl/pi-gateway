import type { AgentSession } from "@mariozechner/pi-coding-agent";
import type { ImageContent } from "@mariozechner/pi-ai";
import { logger } from "../app/logger.js";
import { sendRenderedMessage, sendTextMessage, addProcessingReaction, removeReaction } from "../feishu/send.js";
import { BridgeError, withTimeout } from "../app/errors.js";

export interface PromptResult {
  /** 聚合的 assistant 文本 */
  text: string;
  /** 错误信息（如有） */
  error?: string;
}

export interface PromptInput {
  text: string;
  images?: ImageContent[];
}

/** Pi prompt 默认超时（5 分钟） */
const PROMPT_TIMEOUT_MS = 5 * 60 * 1000;

/**
 * 调用 Pi session.prompt()，结束后发送飞书消息。
 *
 * 策略：
 * 1. 先给用户原始消息加一个 reaction，表示网关已接收并开始处理
 * 2. 订阅 Pi 流式事件，仅在内存中聚合完整文本
 * 3. 完成后移除 reaction，并发送最终文本
 * 4. 超时保护：超过 PROMPT_TIMEOUT_MS 自动中断
 */
export async function promptSession(
  session: AgentSession,
  promptInput: string | PromptInput,
  openId: string,
  sourceMessageId: string,
  processingReactionType?: string,
  _streamingEnabled: boolean = true,
  textChunkLimit: number = 2000,
  timeoutMs: number = PROMPT_TIMEOUT_MS
): Promise<PromptResult> {
  const normalizedPrompt = typeof promptInput === "string" ? { text: promptInput } : promptInput;
  let fullText = "";
  let lastError: string | undefined;
  let reactionId: string | null = null;

  try {
    reactionId = await addProcessingReaction(sourceMessageId, processingReactionType);
  } catch (err) {
    logger.warn("处理中 reaction 添加失败", { openId, sourceMessageId, error: String(err) });
  }

  const unsubscribe = session.subscribe((event) => {
    switch (event.type) {
      case "message_update":
        if (event.assistantMessageEvent.type === "text_delta") {
          fullText += event.assistantMessageEvent.delta;
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
    const promptOptions = normalizedPrompt.images?.length ? { images: normalizedPrompt.images } : undefined;
    await withTimeout(session.prompt(normalizedPrompt.text, promptOptions), timeoutMs, "Pi prompt 超时");
  } catch (err) {
    if (err instanceof BridgeError && err.category === "pi_prompt_timeout") {
      lastError = err.message;
      logger.error("Pi prompt 超时", { openId, timeoutMs });
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
    if (reactionId) {
      const removed = await removeReaction(sourceMessageId, reactionId);
      if (!removed) {
        logger.warn("处理中 reaction 删除失败", { openId, sourceMessageId, reactionId });
      }
    }
  }

  const displayText = lastError && fullText
    ? `${fullText}\n\n⚠️ 回复中断: ${lastError}`
    : fullText;
  await finalizeMessage(openId, stripLeadingBlankLines(displayText), textChunkLimit);

  return {
    text: fullText,
    error: lastError,
  };
}

/** 最终发送飞书消息 */
async function finalizeMessage(
  openId: string,
  fullText: string,
  textChunkLimit: number
): Promise<void> {
  if (!fullText) return;
  await sendRenderedMessage(openId, fullText, textChunkLimit);
}

function stripLeadingBlankLines(text: string): string {
  return text.replace(/^(?:[ \t]*\r?\n)+/, "");
}
