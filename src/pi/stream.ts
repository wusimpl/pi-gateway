import type { AgentSession } from "@mariozechner/pi-coding-agent";
import type { ImageContent } from "@mariozechner/pi-ai";
import { logger } from "../app/logger.js";
import {
  sendRenderedMessage,
  addProcessingReaction,
  removeReaction,
  type FeishuMessenger,
} from "../feishu/send.js";
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

type PromptMessenger = Pick<
  FeishuMessenger,
  "sendRenderedMessage" | "addProcessingReaction" | "removeReaction"
>;

export interface PromptRunner {
  promptSession(
    session: AgentSession,
    promptInput: string | PromptInput,
    openId: string,
    sourceMessageId: string,
    processingReactionType?: string,
    streamingEnabled?: boolean,
    textChunkLimit?: number,
    timeoutMs?: number,
  ): Promise<PromptResult>;
}

export function createPromptRunner(messenger: PromptMessenger): PromptRunner {
  return {
    async promptSession(
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
        reactionId = await messenger.addProcessingReaction(sourceMessageId, processingReactionType);
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
          const removed = await messenger.removeReaction(sourceMessageId, reactionId);
          if (!removed) {
            logger.warn("处理中 reaction 删除失败", { openId, sourceMessageId, reactionId });
          }
        }
      }

      const displayText = lastError && fullText
        ? `${fullText}\n\n⚠️ 回复中断: ${lastError}`
        : fullText;
      const contextUsageFooter = formatContextUsageFooter(session.getContextUsage());
      const finalText = appendMessageFooter(stripLeadingBlankLines(displayText), contextUsageFooter);
      await finalizeMessage(messenger, openId, finalText, textChunkLimit);

      return {
        text: fullText,
        error: lastError,
      };
    },
  };
}

const defaultPromptRunner = createPromptRunner({
  sendRenderedMessage,
  addProcessingReaction,
  removeReaction,
});

export async function promptSession(
  session: AgentSession,
  promptInput: string | PromptInput,
  openId: string,
  sourceMessageId: string,
  processingReactionType?: string,
  streamingEnabled: boolean = true,
  textChunkLimit: number = 2000,
  timeoutMs: number = PROMPT_TIMEOUT_MS
): Promise<PromptResult> {
  return defaultPromptRunner.promptSession(
    session,
    promptInput,
    openId,
    sourceMessageId,
    processingReactionType,
    streamingEnabled,
    textChunkLimit,
    timeoutMs,
  );
}

/** 最终发送飞书消息 */
async function finalizeMessage(
  messenger: Pick<FeishuMessenger, "sendRenderedMessage">,
  openId: string,
  fullText: string,
  textChunkLimit: number
): Promise<void> {
  if (!fullText) return;
  await messenger.sendRenderedMessage(openId, fullText, textChunkLimit);
}

function stripLeadingBlankLines(text: string): string {
  return text.replace(/^(?:[ \t]*\r?\n)+/, "");
}

function appendMessageFooter(text: string, footer?: string): string {
  if (!text || !footer) return text;
  return text ? `${text}\n\n${footer}` : footer;
}

function formatContextUsageFooter(
  contextUsage: ReturnType<AgentSession["getContextUsage"]>
): string | undefined {
  if (!contextUsage || contextUsage.percent === null) {
    return undefined;
  }

  if (!Number.isFinite(contextUsage.percent) || contextUsage.contextWindow <= 0) {
    return undefined;
  }

  return `${contextUsage.percent.toFixed(1)}%/${formatCompactTokenCount(contextUsage.contextWindow)}`;
}

function formatCompactTokenCount(count: number): string {
  if (count < 1000) return count.toString();
  if (count < 10000) return `${(count / 1000).toFixed(1)}k`;
  if (count < 1000000) return `${Math.round(count / 1000)}k`;
  if (count < 10000000) return `${(count / 1000000).toFixed(1)}M`;
  return `${Math.round(count / 1000000)}M`;
}
