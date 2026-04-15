import type { AgentSession } from "@mariozechner/pi-coding-agent";
import type { ImageContent } from "@mariozechner/pi-ai";
import { logger } from "../app/logger.js";
import { BridgeError, withTimeout } from "../app/errors.js";
import { formatModelLabel } from "./models.js";
import {
  sendRenderedMessage,
  sendDocPreviewCard,
  startStreamingMessage,
  addProcessingReaction,
  removeReaction,
  type FeishuDocPreviewCardInput,
  type FeishuStreamingMessage,
  type FeishuMessenger,
} from "../feishu/send.js";
import { STOP_MESSAGE } from "../app/stop.js";

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

/** Pi prompt 空闲超时：连续无活动超过此时间则中断（5 分钟） */
const PROMPT_IDLE_TIMEOUT_MS = 5 * 60 * 1000;
/** Pi prompt 总超时兜底：即使模型一直有活动，总时长也不应超过此值（30 分钟） */
const PROMPT_TOTAL_TIMEOUT_MS = 30 * 60 * 1000;
const STREAMING_UPDATE_INTERVAL_MS = 300;

type PromptMessenger = Pick<
  FeishuMessenger,
  | "sendRenderedMessage"
  | "sendDocPreviewCard"
  | "startStreamingMessage"
  | "addProcessingReaction"
  | "removeReaction"
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
      timeoutMs: number = PROMPT_IDLE_TIMEOUT_MS,
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
      const docPreviewMap = new Map<string, FeishuDocPreviewCardInput>();

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

      // ---- 双层超时机制 ----
      // 1. 空闲超时（idle timeout）：连续无活动超过 timeoutMs 则中断
      //    每次收到 text_delta / tool_execution 事件时重置
      // 2. 总超时兜底（hard timeout）：即使一直有活动，总时长也不超过 PROMPT_TOTAL_TIMEOUT_MS
      //    防止 session.abort() 无法终止 prompt 导致永远卡住
      let idleTimer: NodeJS.Timeout | null = null;
      let idleTimedOut = false;
      let hardTimedOut = false;

      function resetIdleTimer(): void {
        if (idleTimer) clearTimeout(idleTimer);
        idleTimer = setTimeout(() => {
          idleTimedOut = true;
          try { session.abort(); } catch { /* abort 可能失败 */ }
        }, timeoutMs);
        if (typeof idleTimer.unref === "function") {
          idleTimer.unref();
        }
      }

      function clearIdleTimer(): void {
        if (idleTimer) {
          clearTimeout(idleTimer);
          idleTimer = null;
        }
      }

      // 启动初始空闲计时器
      resetIdleTimer();

      const unsubscribe = session.subscribe((event) => {
        switch (event.type) {
          case "message_update":
            if (event.assistantMessageEvent.type === "text_delta") {
              fullText += event.assistantMessageEvent.delta;
              queueStreamingFlush();
              // 收到新 token，重置空闲计时器
              resetIdleTimer();
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
            // 工具调用开始也说明模型在活跃，重置空闲计时器
            resetIdleTimer();
            break;
          case "tool_execution_end":
            logger.debug("Pi tool_execution_end", {
              toolName: event.toolName,
              isError: event.isError,
            });
            collectDocPreviewCardInput(docPreviewMap, event.toolName, event.result, event.isError);
            // 工具调用结束也说明模型在活跃，重置空闲计时器
            resetIdleTimer();
            break;
          default:
            logger.debug("Pi event", { type: event.type });
        }
      });

      try {
        const promptOptions = normalizedPrompt.images?.length ? { images: normalizedPrompt.images } : undefined;
        // 使用 withTimeout 做总超时兜底，防止 abort 失败导致永远卡住
        await withTimeout(
          session.prompt(normalizedPrompt.text, promptOptions),
          PROMPT_TOTAL_TIMEOUT_MS,
          "Pi prompt 总超时",
        );
      } catch (err) {
        if (err instanceof BridgeError && err.category === "pi_prompt_timeout") {
          // 总超时兜底触发（极罕见）
          hardTimedOut = true;
          lastError = "处理超时，请稍后重试或使用 /new 新建会话";
          logger.error("Pi prompt 总超时兜底触发", { openId, totalTimeoutMs: PROMPT_TOTAL_TIMEOUT_MS });
          try { await session.abort(); } catch { /* abort 也可能失败 */ }
        } else if (idleTimedOut && !hardTimedOut) {
          // 空闲超时触发：仅在 idleTimedOut=true 且不是总超时的情况下
          lastError = "回复生成超时（长时间无响应）";
          logger.error("Pi prompt 空闲超时", { openId, timeoutMs });
        } else if (isAbortRequested?.()) {
          abortedByUser = true;
          logger.info("Pi prompt 已按用户请求停止", { openId, sourceMessageId });
        } else {
          lastError = err instanceof Error ? err.message : String(err);
          logger.error("Pi prompt 执行失败", { error: lastError });
        }
      } finally {
        clearIdleTimer();
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
      const footer = formatPromptFooter(session);
      const finalText = appendMessageFooter(stripLeadingBlankLines(displayText), footer);
      const finalOutputText = abortedByUser
        ? (streamingMessage ? STOP_MESSAGE : "")
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
      await sendCollectedDocPreviewCards(messenger, openId, docPreviewMap);

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
  sendDocPreviewCard,
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
  timeoutMs: number = PROMPT_IDLE_TIMEOUT_MS,
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

async function sendCollectedDocPreviewCards(
  messenger: Pick<FeishuMessenger, "sendDocPreviewCard">,
  openId: string,
  docPreviewMap: ReadonlyMap<string, FeishuDocPreviewCardInput>,
): Promise<void> {
  for (const preview of docPreviewMap.values()) {
    try {
      await messenger.sendDocPreviewCard(openId, preview);
    } catch (error) {
      logger.warn("飞书文档卡片发送失败，已跳过", {
        openId,
        preview,
        error: String(error),
      });
    }
  }
}

function collectDocPreviewCardInput(
  docPreviewMap: Map<string, FeishuDocPreviewCardInput>,
  toolName: string,
  result: unknown,
  isError: boolean,
): void {
  if (isError) {
    return;
  }

  const operation = resolveDocPreviewOperation(toolName);
  if (!operation) {
    return;
  }

  const details = extractToolResultDetails(result);
  const documentId = readStringField(details, "document_id");
  const documentUrl = readStringField(details, "document_url");
  if (!documentId && !documentUrl) {
    return;
  }

  const mapKey = documentId ?? documentUrl!;
  const existing = docPreviewMap.get(mapKey);
  docPreviewMap.set(mapKey, {
    documentId: documentId ?? existing?.documentId,
    documentUrl: documentUrl ?? existing?.documentUrl,
    title: readStringField(details, "title") ?? existing?.title,
    operation: mergeDocPreviewOperation(existing?.operation, operation),
  });
}

function resolveDocPreviewOperation(
  toolName: string,
): FeishuDocPreviewCardInput["operation"] | undefined {
  switch (toolName) {
    case "feishu_doc_create":
      return "created";
    case "feishu_doc_append":
    case "feishu_doc_replace":
    case "feishu_doc_delete_blocks":
      return "updated";
    default:
      return undefined;
  }
}

function mergeDocPreviewOperation(
  existing: FeishuDocPreviewCardInput["operation"] | undefined,
  incoming: FeishuDocPreviewCardInput["operation"] | undefined,
): FeishuDocPreviewCardInput["operation"] | undefined {
  if (existing === "created" || incoming === "created") {
    return "created";
  }
  return incoming ?? existing;
}

function extractToolResultDetails(result: unknown): Record<string, unknown> | undefined {
  if (!result || typeof result !== "object" || Array.isArray(result)) {
    return undefined;
  }

  const raw = result as Record<string, unknown>;
  const details = raw.details;
  if (details && typeof details === "object" && !Array.isArray(details)) {
    return details as Record<string, unknown>;
  }

  return raw;
}

function readStringField(
  value: Record<string, unknown> | undefined,
  key: string,
): string | undefined {
  const raw = value?.[key];
  if (typeof raw !== "string") {
    return undefined;
  }

  const trimmed = raw.trim();
  return trimmed || undefined;
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

function formatPromptFooter(
  session: Pick<AgentSession, "getContextUsage" | "model">,
): string | undefined {
  const lines = [
    formatContextUsageFooter(session.getContextUsage()),
    formatCurrentModelFooter(session.model),
  ].filter((line): line is string => Boolean(line));

  return lines.length > 0 ? lines.join("\n") : undefined;
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

function formatCurrentModelFooter(
  model: AgentSession["model"],
): string | undefined {
  if (!model) {
    return undefined;
  }

  const provider = model.provider?.trim();
  const id = model.id?.trim();
  if (!provider || !id) {
    return undefined;
  }

  return `模型: ${formatModelLabel(provider, id)}`;
}

function formatCompactTokenCount(count: number): string {
  if (count < 1000) return count.toString();
  if (count < 10000) return `${(count / 1000).toFixed(1)}k`;
  if (count < 1000000) return `${Math.round(count / 1000)}k`;
  if (count < 10000000) return `${(count / 1000000).toFixed(1)}M`;
  return `${Math.round(count / 1000000)}M`;
}
