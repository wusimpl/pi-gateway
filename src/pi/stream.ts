import type { AgentSession } from "@mariozechner/pi-coding-agent";
import type { ImageContent } from "@mariozechner/pi-ai";
import { logger } from "../app/logger.js";
import {
  sendRenderedMessage,
  startStreamingMessage,
  addProcessingReaction,
  removeReaction,
  type FeishuStreamingMessage,
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
const STREAMING_UPDATE_INTERVAL_MS = 300;

type PromptMessenger = Pick<
  FeishuMessenger,
  "sendRenderedMessage" | "startStreamingMessage" | "addProcessingReaction" | "removeReaction"
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
      streamingEnabled: boolean = false,
      textChunkLimit: number = 2000,
      timeoutMs: number = PROMPT_TIMEOUT_MS
    ): Promise<PromptResult> {
      const normalizedPrompt = typeof promptInput === "string" ? { text: promptInput } : promptInput;
      let fullText = "";
      let lastError: string | undefined;
      let reactionId: string | null = null;
      let streamingMessage: FeishuStreamingMessage | null = null;
      let streamingBroken = false;
      let latestStatus = formatStreamStatusThinking();
      let activeToolName: string | null = null;
      let flushedStatus = "";
      let flushedBody = "";
      let pendingTimer: NodeJS.Timeout | null = null;
      let flushChain: Promise<void> = Promise.resolve();
      let streamingInitAttempted = false;

      try {
        reactionId = await messenger.addProcessingReaction(sourceMessageId, processingReactionType);
      } catch (err) {
        logger.warn("处理中 reaction 添加失败", { openId, sourceMessageId, error: String(err) });
      }

      async function ensureStreamingMessage(
        initialStatus: string = latestStatus,
        initialBody: string = stripLeadingBlankLines(fullText),
      ): Promise<void> {
        if (
          !streamingEnabled ||
          streamingBroken ||
          streamingMessage ||
          streamingInitAttempted ||
          !hasVisibleAssistantText(fullText)
        ) {
          return;
        }

        streamingInitAttempted = true;
        try {
          streamingMessage = await messenger.startStreamingMessage(
            openId,
            initialStatus,
            initialBody,
          );
          if (streamingMessage) {
            flushedStatus = initialStatus;
            flushedBody = initialBody;
          }
        } catch (err) {
          logger.warn("飞书流式卡片初始化失败，回退到最终消息发送", {
            openId,
            sourceMessageId,
            error: String(err),
          });
        }
      }

      function queueStreamingFlush(force: boolean = false): void {
        if (!streamingEnabled || streamingBroken || !hasVisibleAssistantText(fullText)) return;
        if (force) {
          const statusSnapshot = latestStatus;
          const bodySnapshot = stripLeadingBlankLines(fullText);
          if (pendingTimer) {
            clearTimeout(pendingTimer);
            pendingTimer = null;
          }
          flushChain = flushChain.then(() => flushStreamingState(statusSnapshot, bodySnapshot));
          return;
        }
        if (pendingTimer) return;
        pendingTimer = setTimeout(() => {
          pendingTimer = null;
          flushChain = flushChain.then(() => flushStreamingState());
        }, STREAMING_UPDATE_INTERVAL_MS);
      }

      async function flushStreamingState(
        nextStatus: string = latestStatus,
        nextBody: string = stripLeadingBlankLines(fullText),
      ): Promise<void> {
        if (streamingBroken) return;
        await ensureStreamingMessage(nextStatus, nextBody);
        if (!streamingMessage) return;
        if (nextBody === flushedBody && nextStatus === flushedStatus) {
          return;
        }

        try {
          if (nextStatus !== flushedStatus) {
            await streamingMessage.updateStatus(nextStatus);
            flushedStatus = nextStatus;
          }
          if (nextBody !== flushedBody) {
            await streamingMessage.updateBody(nextBody);
            flushedBody = nextBody;
          }
        } catch (err) {
          streamingBroken = true;
          logger.error("飞书流式卡片更新失败，回退到最终消息发送", {
            openId,
            sourceMessageId,
            error: String(err),
          });
        }
      }

      const unsubscribe = session.subscribe((event) => {
        switch (event.type) {
          case "message_update":
            if (event.assistantMessageEvent.type === "text_delta") {
              fullText += event.assistantMessageEvent.delta;
              if (!activeToolName) {
                latestStatus = formatStreamStatusGenerating();
              }
              queueStreamingFlush();
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
            activeToolName = event.toolName;
            latestStatus = formatStreamStatusToolRunning(event.toolName);
            queueStreamingFlush(true);
            break;
          case "tool_execution_end":
            logger.debug("Pi tool_execution_end", {
              toolName: event.toolName,
              isError: event.isError,
            });
            activeToolName = null;
            latestStatus = hasVisibleAssistantText(fullText)
              ? formatStreamStatusGenerating()
              : formatStreamStatusThinking();
            queueStreamingFlush(true);
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
        if (pendingTimer) {
          clearTimeout(pendingTimer);
          pendingTimer = null;
        }
        if (streamingEnabled && !streamingBroken && hasVisibleAssistantText(fullText)) {
          flushChain = flushChain.then(() => flushStreamingState());
        }
        await flushChain;
        if (reactionId) {
          const removed = await messenger.removeReaction(sourceMessageId, reactionId);
          if (!removed) {
            logger.warn("处理中 reaction 删除失败", { openId, sourceMessageId, reactionId });
          }
        }
      }

      const displayText = lastError && hasVisibleAssistantText(fullText)
        ? `${fullText}\n\n⚠️ 回复中断: ${lastError}`
        : fullText;
      const contextUsageFooter = formatContextUsageFooter(session.getContextUsage());
      const finalText = appendMessageFooter(stripLeadingBlankLines(displayText), contextUsageFooter);
      const finalOutputText = finalText || (streamingMessage ? "已完成，但没有生成可展示的正文。" : "");
      const finalStatus = lastError
        ? formatStreamStatusInterrupted()
        : formatStreamStatusCompleted();
      if (!lastError || hasVisibleAssistantText(fullText)) {
        await finalizeMessage(
          messenger,
          openId,
          finalOutputText,
          textChunkLimit,
          streamingMessage,
          streamingBroken,
          finalStatus,
        );
      }

      return {
        text: fullText,
        error: lastError,
      };
    },
  };
}

const defaultPromptRunner = createPromptRunner({
  sendRenderedMessage,
  startStreamingMessage,
  addProcessingReaction,
  removeReaction,
});

export async function promptSession(
  session: AgentSession,
  promptInput: string | PromptInput,
  openId: string,
  sourceMessageId: string,
  processingReactionType?: string,
  streamingEnabled: boolean = false,
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
  textChunkLimit: number,
  streamingMessage?: FeishuStreamingMessage | null,
  streamingBroken: boolean = false,
  finalStatusText: string = formatStreamStatusCompleted(),
): Promise<void> {
  if (streamingMessage && !streamingBroken) {
    try {
      await streamingMessage.finish(finalStatusText, fullText, textChunkLimit);
      return;
    } catch (err) {
      logger.error("飞书流式卡片收口失败，回退到最终消息发送", {
        openId,
        error: String(err),
      });
    }
  }
  if (!fullText) return;
  await messenger.sendRenderedMessage(openId, fullText, textChunkLimit);
}

function stripLeadingBlankLines(text: string): string {
  return text.replace(/^(?:[ \t]*\r?\n)+/, "");
}

function hasVisibleAssistantText(text: string): boolean {
  return stripLeadingBlankLines(text).length > 0;
}

function appendMessageFooter(text: string, footer?: string): string {
  if (!text || !footer) return text;
  return text ? `${text}\n\n${footer}` : footer;
}

function formatStreamStatusThinking(): string {
  return "⏳ 正在思考...";
}

function formatStreamStatusGenerating(): string {
  return "✍️ 正在生成回复...";
}

function formatStreamStatusToolRunning(toolName?: string): string {
  return toolName ? `🔧 正在调用工具：\`${toolName}\`` : "🔧 正在调用工具...";
}

function formatStreamStatusCompleted(): string {
  return "✅ 已完成";
}

function formatStreamStatusInterrupted(): string {
  return "⚠️ 已中断";
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
