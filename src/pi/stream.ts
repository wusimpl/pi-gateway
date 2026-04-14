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
  /** 是否为用户主动停止 */
  aborted?: boolean;
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
    isAbortRequested?: () => boolean,
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
      timeoutMs: number = PROMPT_TIMEOUT_MS,
      isAbortRequested?: () => boolean,
    ): Promise<PromptResult> {
      const normalizedPrompt = typeof promptInput === "string" ? { text: promptInput } : promptInput;
      let fullText = "";
      let lastError: string | undefined;
      let abortedByUser = false;
      let reactionId: string | null = null;
      let streamingMessage: FeishuStreamingMessage | null = null;
      let streamingBroken = false;
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
          streamingMessage = await messenger.startStreamingMessage(openId, initialBody);
          if (streamingMessage) {
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
          const bodySnapshot = stripLeadingBlankLines(fullText);
          if (pendingTimer) {
            clearTimeout(pendingTimer);
            pendingTimer = null;
          }
          flushChain = flushChain.then(() => flushStreamingState(bodySnapshot));
          return;
        }
        if (pendingTimer) return;
        pendingTimer = setTimeout(() => {
          pendingTimer = null;
          flushChain = flushChain.then(() => flushStreamingState());
        }, STREAMING_UPDATE_INTERVAL_MS);
      }

      async function flushStreamingState(
        nextBody: string = stripLeadingBlankLines(fullText),
      ): Promise<void> {
        if (streamingBroken) return;
        await ensureStreamingMessage(nextBody);
        if (!streamingMessage) return;
        if (nextBody === flushedBody) {
          return;
        }

        try {
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
        } else if (isAbortRequested?.()) {
          abortedByUser = true;
          logger.info("Pi prompt 已按用户请求停止", { openId, sourceMessageId });
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

      const displayText =
        lastError && !abortedByUser && hasVisibleAssistantText(fullText)
          ? `${fullText}\n\n⚠️ 回复中断: ${lastError}`
          : fullText;
      const contextUsageFooter = formatContextUsageFooter(session.getContextUsage());
      const finalText = appendMessageFooter(stripLeadingBlankLines(displayText), contextUsageFooter);
      const finalOutputText = abortedByUser
        ? finalText
        : finalText || (streamingMessage ? "已完成，但没有生成可展示的正文。" : "");
      if ((!lastError || hasVisibleAssistantText(fullText) || abortedByUser) && finalOutputText) {
        await finalizeMessage(
          messenger,
          openId,
          finalOutputText,
          textChunkLimit,
          streamingMessage,
          streamingBroken,
        );
      }

      return {
        text: fullText,
        error: abortedByUser ? undefined : lastError,
        ...(abortedByUser ? { aborted: true } : {}),
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
  timeoutMs: number = PROMPT_TIMEOUT_MS,
  isAbortRequested?: () => boolean,
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
    isAbortRequested,
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
): Promise<void> {
  if (streamingMessage && !streamingBroken) {
    try {
      await streamingMessage.finish(fullText, textChunkLimit);
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
