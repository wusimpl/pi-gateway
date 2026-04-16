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
const MAX_VISIBLE_TOOL_CALLS = 5;
const TOOL_SUMMARY_MAX_CHARS = 80;

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
    showToolCallsInReply?: boolean,
    timeoutMs?: number,
    isAbortRequested?: () => boolean,
  ): Promise<PromptResult>;
}

interface ToolCallState {
  toolCallId: string;
  toolName: string;
  status: "running" | "done" | "error";
  argsSummary?: string;
  resultSummary?: string;
  showOutputSummary?: boolean;
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
    showToolCallsInReply: boolean = false,
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
      let flushedTools = "";
      let pendingTimer: NodeJS.Timeout | null = null;
      let flushChain: Promise<void> = Promise.resolve();
      let streamingInitAttempted = false;
      const docPreviewMap = new Map<string, FeishuDocPreviewCardInput>();
      const toolCallMap = new Map<string, ToolCallState>();

      try {
        reactionId = await messenger.addProcessingReaction(sourceMessageId, processingReactionType);
      } catch (err) {
        logger.warn("处理中 reaction 添加失败", { openId, sourceMessageId, error: String(err) });
      }

      async function ensureStreamingMessage(
        initialBody: string = stripLeadingBlankLines(fullText),
        initialTools: string = showToolCallsInReply ? formatToolCallsSection(toolCallMap) : "",
      ): Promise<void> {
        if (
          !streamingEnabled ||
          streamingBroken ||
          streamingMessage ||
          streamingInitAttempted ||
          !hasVisibleStreamingContent(fullText, initialTools)
        ) {
          return;
        }

        streamingInitAttempted = true;
        try {
          streamingMessage = await messenger.startStreamingMessage(openId, initialBody, initialTools);
          if (streamingMessage) {
            flushedBody = initialBody;
            flushedTools = initialTools;
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
        const toolsSnapshot = showToolCallsInReply ? formatToolCallsSection(toolCallMap) : "";
        if (!streamingEnabled || streamingBroken || !hasVisibleStreamingContent(fullText, toolsSnapshot)) return;
        if (force) {
          const bodySnapshot = stripLeadingBlankLines(fullText);
          const forcedToolsSnapshot = showToolCallsInReply ? formatToolCallsSection(toolCallMap) : "";
          if (pendingTimer) {
            clearTimeout(pendingTimer);
            pendingTimer = null;
          }
          flushChain = flushChain.then(() => flushStreamingState(bodySnapshot, forcedToolsSnapshot));
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
        nextTools: string = showToolCallsInReply ? formatToolCallsSection(toolCallMap) : "",
      ): Promise<void> {
        if (streamingBroken) return;
        await ensureStreamingMessage(nextBody, nextTools);
        if (!streamingMessage) return;
        if (nextBody === flushedBody && nextTools === flushedTools) {
          return;
        }

        try {
          if (nextBody !== flushedBody) {
            await streamingMessage.updateBody(nextBody);
            flushedBody = nextBody;
          }
          if (nextTools !== flushedTools) {
            await streamingMessage.updateTools(nextTools);
            flushedTools = nextTools;
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
            if (showToolCallsInReply) {
              toolCallMap.set(event.toolCallId, {
                toolCallId: event.toolCallId,
                toolName: event.toolName,
                status: "running",
                argsSummary: summarizeToolArgs(event.args),
                showOutputSummary: hasNamedSummaryField(event.args, "command"),
              });
              queueStreamingFlush(true);
            }
            // 工具调用开始也说明模型在活跃，重置空闲计时器
            resetIdleTimer();
            break;
          case "tool_execution_update":
            if (showToolCallsInReply) {
              const toolCall = toolCallMap.get(event.toolCallId);
              if (toolCall) {
                toolCall.resultSummary = summarizeToolProgress(event.partialResult) ?? toolCall.resultSummary;
                queueStreamingFlush(!hasVisibleAssistantText(fullText));
              }
            }
            resetIdleTimer();
            break;
          case "tool_execution_end":
            logger.debug("Pi tool_execution_end", {
              toolName: event.toolName,
              isError: event.isError,
            });
            if (showToolCallsInReply) {
              const toolCall = toolCallMap.get(event.toolCallId);
              if (toolCall) {
                toolCall.status = event.isError ? "error" : "done";
                toolCall.resultSummary = summarizeToolProgress(event.result) ?? toolCall.resultSummary;
                queueStreamingFlush(true);
              }
            }
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
        if (
          streamingEnabled &&
          !streamingBroken &&
          hasVisibleStreamingContent(
            fullText,
            showToolCallsInReply ? formatToolCallsSection(toolCallMap) : "",
          )
        ) {
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
      const finalToolsText = showToolCallsInReply ? formatToolCallsSection(toolCallMap) : "";
      const finalOutputText = abortedByUser
        ? (streamingMessage ? STOP_MESSAGE : "")
        : finalText || (streamingMessage ? "已完成，但没有生成可展示的正文。" : "");
      const hasFinalOutput = Boolean(finalOutputText || finalToolsText);
      if ((!lastError || hasVisibleAssistantText(fullText) || abortedByUser) && hasFinalOutput) {
        await finalizeMessage(
          messenger,
          openId,
          finalOutputText,
          textChunkLimit,
          finalToolsText,
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
  showToolCallsInReply: boolean = false,
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
    showToolCallsInReply,
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
  toolsText: string = "",
  streamingMessage?: FeishuStreamingMessage | null,
  streamingBroken: boolean = false,
): Promise<void> {
  if (streamingMessage && !streamingBroken) {
    try {
      await streamingMessage.finish(fullText, textChunkLimit, toolsText);
      return;
    } catch (err) {
      logger.error("飞书流式卡片收口失败，回退到最终消息发送", {
        openId,
        error: String(err),
      });
    }
  }
  if (!fullText && !toolsText) return;
  await messenger.sendRenderedMessage(openId, appendToolCallsSection(fullText, toolsText), textChunkLimit);
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

function hasVisibleStreamingContent(text: string, toolsText: string): boolean {
  return hasVisibleAssistantText(text) || hasVisibleToolText(toolsText);
}

function hasVisibleToolText(toolsText: string): boolean {
  return toolsText.trim().length > 0;
}

function appendMessageFooter(text: string, footer?: string): string {
  if (!text || !footer) return text;
  return text ? `${text}\n\n${footer}` : footer;
}

function appendToolCallsSection(text: string, toolsText: string): string {
  if (!toolsText) return text;
  return text ? `${text}\n\n${toolsText}` : toolsText;
}

function formatToolCallsSection(toolCallMap: ReadonlyMap<string, ToolCallState>): string {
  const toolCalls = Array.from(toolCallMap.values()).slice(-MAX_VISIBLE_TOOL_CALLS);
  if (toolCalls.length === 0) return "";

  const lines = [" ---", "**工具调用**"];
  for (const toolCall of toolCalls) {
    lines.push(...formatToolCallLines(toolCall));
  }
  return lines.join("\n");
}

function formatToolCallLines(toolCall: ToolCallState): string[] {
  const statusLabel = formatToolStatus(toolCall.status);
  const primarySummary = toolCall.showOutputSummary
    ? (toolCall.argsSummary ?? toolCall.resultSummary)
    : (toolCall.resultSummary ?? toolCall.argsSummary);
  const summary = primarySummary ? `: ${primarySummary}` : "";
  const lines = [`${toolCall.toolName} ${statusLabel}${summary}`];

  if (
    toolCall.showOutputSummary &&
    toolCall.argsSummary &&
    toolCall.resultSummary
  ) {
    lines.push(`output: ${toolCall.resultSummary}`);
  }

  return lines;
}

function formatToolStatus(status: ToolCallState["status"]): string {
  switch (status) {
    case "running":
      return "运行中";
    case "done":
      return "完成";
    case "error":
      return "失败";
  }
}

function summarizeToolArgs(args: unknown): string | undefined {
  const preferred = readPreferredSummaryField(args, [
    "command",
    "filePath",
    "path",
    "url",
    "query",
    "prompt",
    "title",
    "name",
  ]);
  if (preferred) return preferred;
  return summarizeUnknownValue(args);
}

function summarizeToolProgress(result: unknown): string | undefined {
  const contentText = extractToolContentText(result);
  if (contentText) return contentText;

  const details = extractToolResultDetails(result);
  const preferred = readPreferredSummaryField(details, [
    "message",
    "summary",
    "result",
    "output",
    "title",
    "document_url",
    "document_id",
    "file_name",
    "file_path",
    "path",
  ]);
  if (preferred) return preferred;

  return summarizeUnknownValue(details);
}

function extractToolContentText(result: unknown): string | undefined {
  if (!result || typeof result !== "object" || Array.isArray(result)) {
    return undefined;
  }

  const raw = result as Record<string, unknown>;
  const content = raw.content;
  if (!Array.isArray(content)) {
    return undefined;
  }

  for (const item of content) {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      continue;
    }

    const text = (item as Record<string, unknown>).text;
    if (typeof text === "string" && text.trim()) {
      return normalizeToolSummary(text);
    }
  }

  return undefined;
}

function readPreferredSummaryField(
  value: unknown,
  keys: string[],
): string | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }

  const record = value as Record<string, unknown>;
  for (const key of keys) {
    const field = record[key];
    if (typeof field === "string" && field.trim()) {
      return normalizeToolSummary(field);
    }
  }

  for (const field of Object.values(record)) {
    if (typeof field === "string" && field.trim()) {
      return normalizeToolSummary(field);
    }
  }

  return undefined;
}

function hasNamedSummaryField(value: unknown, key: string): boolean {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const field = (value as Record<string, unknown>)[key];
  return typeof field === "string" && Boolean(field.trim());
}

function summarizeUnknownValue(value: unknown): string | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }
  if (typeof value === "string") {
    return normalizeToolSummary(value);
  }

  try {
    return normalizeToolSummary(JSON.stringify(value));
  } catch {
    return undefined;
  }
}

function normalizeToolSummary(text: string): string | undefined {
  const normalized = text
    .replace(/\r\n/g, "\n")
    .replace(/\s+/g, " ")
    .trim();
  if (!normalized) return undefined;
  if (normalized.length <= TOOL_SUMMARY_MAX_CHARS) {
    return normalized;
  }
  return `${normalized.slice(0, TOOL_SUMMARY_MAX_CHARS - 3)}...`;
}

function formatPromptFooter(
  session: Pick<AgentSession, "getContextUsage" | "model">,
): string | undefined {
  const lines = [
    formatContextUsageFooter(session.getContextUsage()),
    formatCurrentModelFooter(session.model),
  ].filter((line): line is string => Boolean(line));

  return lines.length > 0 ? lines.join(" | ") : undefined;
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
