import type { AgentSession } from "@mariozechner/pi-coding-agent";
import type { ImageContent } from "@mariozechner/pi-ai";
import type { ToolCallsDisplayMode } from "../types.js";
import type { ConversationTarget } from "../conversation.js";
import { logger } from "../app/logger.js";
import { BridgeError, withTimeout } from "../app/errors.js";
import { formatModelLabel } from "./models.js";
import {
  sendRenderedMessage,
  sendRenderedMessageToTarget,
  sendDocPreviewCard,
  startStreamingMessage,
  addProcessingReaction,
  removeReaction,
  sendLocalImageMessage,
  type FeishuDocPreviewCardInput,
  type FeishuStreamingMessage,
  type FeishuMessenger,
} from "../feishu/send.js";
import { STOP_MESSAGE } from "../app/stop.js";
import { dispatchGeneratedImagesFromText } from "./generated-images.js";

export interface PromptResult {
  /** 聚合的 assistant 文本 */
  text: string;
  /** 错误信息（如有） */
  error?: string;
  /** 是否为用户主动停止 */
  aborted?: boolean;
  /** 是否已经向用户展示过结果消息 */
  displayed?: boolean;
}

export interface PromptInput {
  text: string;
  displayHeaderText?: string;
  footerLabel?: string;
  includeFooter?: boolean;
  preludeText?: string;
  images?: ImageContent[];
}

/** Pi prompt 空闲超时：连续无活动超过此时间则中断（5 分钟） */
const PROMPT_IDLE_TIMEOUT_MS = 5 * 60 * 1000;
/** Pi prompt 总超时兜底：即使模型一直有活动，总时长也不应超过此值（30 分钟） */
const PROMPT_TOTAL_TIMEOUT_MS = 30 * 60 * 1000;
const STREAMING_UPDATE_INTERVAL_MS = 300;
const MAX_VISIBLE_TOOL_CALLS = 5;
const TOOL_CALL_NAMES_PER_LINE = 3;
const TOOL_SUMMARY_MAX_CHARS = 80;
const TOOL_PROGRESS_SUMMARY_FIELDS = [
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
  "name",
];

function createP2PTarget(openId: string): ConversationTarget {
  return {
    kind: "p2p",
    key: openId,
    receiveIdType: "open_id",
    receiveId: openId,
  };
}

function isStreamingTargetSupported(target: ConversationTarget): boolean {
  return target.kind === "p2p" || target.kind === "group";
}

type PromptMessenger = Pick<
  FeishuMessenger,
  | "sendRenderedMessage"
  | "sendDocPreviewCard"
  | "startStreamingMessage"
  | "addProcessingReaction"
  | "removeReaction"
> & Partial<Pick<FeishuMessenger, "sendRenderedMessageToTarget" | "sendLocalImageMessage">>;

export interface PromptRunner {
  promptSession(
    session: AgentSession,
    promptInput: string | PromptInput,
    openId: string,
    sourceMessageId: string,
    processingReactionType?: string,
    streamingEnabled?: boolean,
    textChunkLimit?: number,
    toolCallsDisplayMode?: ToolCallsDisplayMode | boolean,
    timeoutMs?: number,
    isAbortRequested?: () => boolean,
    conversationTarget?: ConversationTarget,
  ): Promise<PromptResult>;
}

interface SessionReactionEntry {
  messageId: string;
  reactionId: string;
  pendingText?: string;
  deliveredReactionType?: string;
  replySeparator?: string;
  deliveryInFlight?: boolean;
}

const sessionReactionRegistry = new WeakMap<AgentSession, SessionReactionEntry[]>();

export function registerSessionReaction(
  session: AgentSession,
  messageId: string,
  reactionId: string,
  options: {
    pendingText?: string;
    deliveredReactionType?: string;
    replySeparator?: string;
  } = {},
): void {
  const reactions = sessionReactionRegistry.get(session) ?? [];
  reactions.push({ messageId, reactionId, ...options });
  sessionReactionRegistry.set(session, reactions);
}

function takeSessionReactions(session: AgentSession): SessionReactionEntry[] {
  const reactions = sessionReactionRegistry.get(session) ?? [];
  sessionReactionRegistry.delete(session);
  return reactions;
}

function findDeliverableSessionReaction(
  session: AgentSession,
  messageText: string,
): SessionReactionEntry | undefined {
  const reactions = sessionReactionRegistry.get(session) ?? [];
  return reactions.find((reaction) =>
    !reaction.deliveryInFlight
    && Boolean(reaction.deliveredReactionType)
    && reaction.pendingText === messageText
  );
}

interface ToolCallState {
  toolCallId: string;
  toolName: string;
  status: "running" | "done" | "error";
  argsSummary?: string;
  resultSummary?: string;
  showOutputSummary?: boolean;
}

interface ToolCallBuildState {
  contentIndex: number;
  chunks: number;
  chars: number;
  lastLoggedChars: number;
  toolCallId?: string;
  toolName?: string;
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
      toolCallsDisplayMode: ToolCallsDisplayMode | boolean = "off",
      timeoutMs: number = PROMPT_IDLE_TIMEOUT_MS,
      isAbortRequested?: () => boolean,
      conversationTarget?: ConversationTarget,
    ): Promise<PromptResult> {
      const normalizedPrompt = typeof promptInput === "string" ? { text: promptInput } : promptInput;
      let fullText = "";
      let lastError: string | undefined;
      let abortedByUser = false;
      const reactionEntries: Array<{ messageId: string; reactionId: string }> = [];
      let streamingMessage: FeishuStreamingMessage | null = null;
      let streamingBroken = false;
      const preludeText = normalizedPrompt.preludeText ?? "";
      let flushedBody = "";
      let flushedTools = "";
      let pendingTimer: NodeJS.Timeout | null = null;
      let pendingReplySeparator = "";
      let separateNextAssistantText = false;
      let flushChain: Promise<void> = Promise.resolve();
      let reactionUpdateChain: Promise<void> = Promise.resolve();
      let streamingInitAttempted = false;
      const docPreviewMap = new Map<string, FeishuDocPreviewCardInput>();
      const toolCallMap = new Map<string, ToolCallState>();
      const target = conversationTarget ?? createP2PTarget(openId);
      const normalizedToolCallsDisplayMode = normalizeToolCallsDisplayMode(toolCallsDisplayMode);
      const showToolCallsInReply = normalizedToolCallsDisplayMode !== "off";
      const streamingAllowed = streamingEnabled && isStreamingTargetSupported(target);
      const displayHeaderText = normalizedPrompt.displayHeaderText ?? "";
      const footerLabel = normalizedPrompt.footerLabel ?? "";
      const includeFooter = normalizedPrompt.includeFooter ?? true;
      const promptStartedAt = Date.now();
      let textDeltaCount = 0;
      let textDeltaChars = 0;
      let messageEndCount = 0;
      let toolCallStreamStartCount = 0;
      let toolCallStreamEndCount = 0;
      let toolExecutionStartCount = 0;
      let toolExecutionEndCount = 0;
      let toolExecutionErrorCount = 0;
      let lastAssistantStopReason: string | undefined;
      let lastAssistantErrorMessage: string | undefined;
      const toolCallBuildMap = new Map<number, ToolCallBuildState>();

      function formatDisplayBody(text: string = fullText): string {
        return prependMessageHeader(stripLeadingBlankLines(text), displayHeaderText);
      }

      function getPromptDiagnostics() {
        return {
          openId,
          sourceMessageId,
          targetKind: target.kind,
          elapsedMs: Date.now() - promptStartedAt,
          model: formatModelForLog(session.model, session.thinkingLevel),
          contextUsage: summarizeContextUsageForLog(session.getContextUsage()),
          textDeltaCount,
          textDeltaChars,
          visibleTextChars: fullText.length,
          messageEndCount,
          lastAssistantStopReason,
          lastAssistantErrorMessage,
          toolCallStreamStartCount,
          toolCallStreamEndCount,
          toolExecutionStartCount,
          toolExecutionEndCount,
          toolExecutionErrorCount,
          trackedToolCallBuilds: Array.from(toolCallBuildMap.values()).map((state) => ({
            contentIndex: state.contentIndex,
            toolCallId: state.toolCallId,
            toolName: state.toolName,
            chunks: state.chunks,
            chars: state.chars,
          })),
        };
      }

      logger.info("Pi prompt 开始", {
        openId,
        sourceMessageId,
        targetKind: target.kind,
        streamingEnabled,
        streamingAllowed,
        toolCallsDisplayMode: normalizedToolCallsDisplayMode,
        promptChars: normalizedPrompt.text.length,
        imageCount: normalizedPrompt.images?.length ?? 0,
        hasPrelude: Boolean(preludeText),
        model: formatModelForLog(session.model, session.thinkingLevel),
        contextUsage: summarizeContextUsageForLog(session.getContextUsage()),
      });

      try {
        const reactionId = await messenger.addProcessingReaction(sourceMessageId, processingReactionType);
        if (reactionId) {
          reactionEntries.push({ messageId: sourceMessageId, reactionId });
        }
      } catch (err) {
        logger.warn("处理中 reaction 添加失败", { openId, sourceMessageId, error: String(err) });
      }

      async function ensureStreamingMessage(
        initialBody: string = formatDisplayBody(),
        initialTools: string = showToolCallsInReply ? formatToolCallsSection(toolCallMap, normalizedToolCallsDisplayMode) : "",
        initialPrelude: string = preludeText,
      ): Promise<void> {
        if (
          !streamingEnabled ||
          !streamingAllowed ||
          streamingBroken ||
          streamingMessage ||
          streamingInitAttempted ||
          !hasVisibleStreamingContent(initialBody, initialTools, initialPrelude)
        ) {
          return;
        }

        streamingInitAttempted = true;
        try {
          streamingMessage = await messenger.startStreamingMessage(
            target.kind === "p2p" ? openId : target,
            initialBody,
            initialTools,
            initialPrelude,
          );
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
        const toolsSnapshot = showToolCallsInReply ? formatToolCallsSection(toolCallMap, normalizedToolCallsDisplayMode) : "";
        if (!streamingAllowed || streamingBroken || !hasVisibleStreamingContent(formatDisplayBody(), toolsSnapshot, preludeText)) {
          return;
        }
        if (force) {
          const bodySnapshot = formatDisplayBody();
          const forcedToolsSnapshot = showToolCallsInReply ? formatToolCallsSection(toolCallMap, normalizedToolCallsDisplayMode) : "";
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
        nextBody: string = formatDisplayBody(),
        nextTools: string = showToolCallsInReply ? formatToolCallsSection(toolCallMap, normalizedToolCallsDisplayMode) : "",
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

      function queueDeliveredReactionSwitch(messageText: string): void {
        const reaction = findDeliverableSessionReaction(session, messageText);
        if (!reaction?.deliveredReactionType) return;
        if (reaction.replySeparator) {
          pendingReplySeparator = reaction.replySeparator;
        }
        reaction.deliveryInFlight = true;
        reactionUpdateChain = reactionUpdateChain.then(async () => {
          const removed = await messenger.removeReaction(reaction.messageId, reaction.reactionId);
          if (!removed) {
            logger.warn("steering reaction 切换前删除失败", {
              openId,
              sourceMessageId,
              messageId: reaction.messageId,
              reactionId: reaction.reactionId,
            });
            reaction.deliveryInFlight = false;
            return;
          }

          const deliveredReactionId = await messenger.addProcessingReaction(
            reaction.messageId,
            reaction.deliveredReactionType,
          );
          reaction.reactionId = deliveredReactionId ?? "";
          reaction.pendingText = undefined;
        }).catch((error) => {
          reaction.deliveryInFlight = false;
          logger.warn("steering reaction 切换失败", {
            openId,
            sourceMessageId,
            messageId: reaction.messageId,
            error: String(error),
          });
        });
      }

      // 启动初始空闲计时器
      resetIdleTimer();

      if (preludeText) {
        await ensureStreamingMessage("", "", preludeText);
      }

      const unsubscribe = session.subscribe((event) => {
        switch (event.type) {
          case "message_start":
            {
              const messageText = extractUserMessageText(event.message);
              if (messageText) {
                queueDeliveredReactionSwitch(messageText);
              }
            }
            break;
          case "message_update":
            if (event.assistantMessageEvent.type === "text_delta") {
              textDeltaCount += 1;
              textDeltaChars += event.assistantMessageEvent.delta.length;
              if (pendingReplySeparator) {
                fullText += pendingReplySeparator;
                pendingReplySeparator = "";
                separateNextAssistantText = false;
              }
              if (separateNextAssistantText) {
                fullText = appendAssistantSegmentSeparator(fullText, event.assistantMessageEvent.delta);
                separateNextAssistantText = false;
              }
              fullText += event.assistantMessageEvent.delta;
              queueStreamingFlush();
              // 收到新 token，重置空闲计时器
              resetIdleTimer();
            } else {
              const update = event.assistantMessageEvent as Record<string, unknown>;
              const updateType = readStringField(update, "type") ?? "unknown";
              if (updateType === "toolcall_start") {
                const contentIndex = readNumberField(update, "contentIndex") ?? toolCallBuildMap.size;
                const toolCallSummary = summarizeToolCallFromAssistantUpdate(update);
                toolCallStreamStartCount += 1;
                toolCallBuildMap.set(contentIndex, {
                  contentIndex,
                  chunks: 0,
                  chars: 0,
                  lastLoggedChars: 0,
                  toolCallId: toolCallSummary.toolCallId,
                  toolName: toolCallSummary.toolName,
                });
                logger.info("Pi toolcall 生成开始", {
                  ...getPromptDiagnostics(),
                  contentIndex,
                  toolCallId: toolCallSummary.toolCallId,
                  toolName: toolCallSummary.toolName,
                });
              } else if (updateType === "toolcall_delta") {
                const contentIndex = readNumberField(update, "contentIndex") ?? -1;
                const deltaChars = typeof update.delta === "string" ? update.delta.length : 0;
                const toolCallSummary = summarizeToolCallFromAssistantUpdate(update);
                const state = toolCallBuildMap.get(contentIndex) ?? {
                  contentIndex,
                  chunks: 0,
                  chars: 0,
                  lastLoggedChars: 0,
                };
                state.chunks += 1;
                state.chars += deltaChars;
                state.toolCallId = toolCallSummary.toolCallId ?? state.toolCallId;
                state.toolName = toolCallSummary.toolName ?? state.toolName;
                toolCallBuildMap.set(contentIndex, state);

                const shouldLogProgress =
                  state.chunks === 1 ||
                  state.chunks % 50 === 0 ||
                  state.chars - state.lastLoggedChars >= 20_000;
                if (shouldLogProgress) {
                  state.lastLoggedChars = state.chars;
                  logger.info("Pi toolcall 参数生成中", {
                    ...getPromptDiagnostics(),
                    contentIndex,
                    toolCallId: state.toolCallId,
                    toolName: state.toolName,
                    chunks: state.chunks,
                    chars: state.chars,
                  });
                }
              } else if (updateType === "toolcall_end") {
                const contentIndex = readNumberField(update, "contentIndex") ?? -1;
                const toolCallSummary = summarizeToolCallFromAssistantUpdate(update);
                const state = toolCallBuildMap.get(contentIndex);
                toolCallStreamEndCount += 1;
                if (state) {
                  state.toolCallId = toolCallSummary.toolCallId ?? state.toolCallId;
                  state.toolName = toolCallSummary.toolName ?? state.toolName;
                }
                logger.info("Pi toolcall 生成结束", {
                  ...getPromptDiagnostics(),
                  contentIndex,
                  toolCallId: toolCallSummary.toolCallId ?? state?.toolCallId,
                  toolName: toolCallSummary.toolName ?? state?.toolName,
                  argsSummary: toolCallSummary.argsSummary,
                  chunks: state?.chunks,
                  chars: state?.chars,
                });
              } else if (updateType === "error") {
                logger.warn("Pi message_update 返回错误事件", {
                  ...getPromptDiagnostics(),
                  reason: readStringField(update, "reason"),
                  message: summarizeAssistantMessageForLog(update.error),
                });
              } else if (updateType === "done") {
                logger.info("Pi message_update 完成事件", {
                  ...getPromptDiagnostics(),
                  reason: readStringField(update, "reason"),
                });
              } else if (!updateType.startsWith("thinking_")) {
                logger.debug("Pi message_update 非文本事件", {
                  ...getPromptDiagnostics(),
                  updateType,
                });
              }
            }
            break;
          case "message_end":
            {
              messageEndCount += 1;
              const assistantSummary = summarizeAssistantMessageForLog(event.message);
              lastAssistantStopReason = assistantSummary?.stopReason;
              lastAssistantErrorMessage = assistantSummary?.errorMessage;
              logger.info("Pi message_end", {
                ...getPromptDiagnostics(),
                message: assistantSummary,
              });
              const assistantError = extractAssistantErrorMessage(event.message);
              if (assistantError) {
                lastError = assistantError;
                logger.warn("Pi message_end 返回失败消息", {
                  openId,
                  sourceMessageId,
                  error: assistantError,
                });
              }
            }
            break;
          case "agent_end":
            logger.info("Pi agent_end", getPromptDiagnostics());
            break;
          case "auto_retry_start":
            logger.info("Pi prompt 自动重试开始", {
              openId,
              sourceMessageId,
              attempt: event.attempt,
              maxAttempts: event.maxAttempts,
              errorMessage: event.errorMessage,
            });
            break;
          case "auto_retry_end":
            if (event.success) {
              lastError = undefined;
              logger.info("Pi prompt 自动重试成功", {
                openId,
                sourceMessageId,
                attempt: event.attempt,
              });
            } else if (event.finalError) {
              lastError = event.finalError;
              logger.warn("Pi prompt 自动重试结束，最终仍失败", {
                openId,
                sourceMessageId,
                attempt: event.attempt,
                error: event.finalError,
              });
            }
            break;
          case "tool_execution_start":
            toolExecutionStartCount += 1;
            logger.info("Pi tool_execution_start", {
              ...getPromptDiagnostics(),
              toolCallId: event.toolCallId,
              toolName: event.toolName,
              argsSummary: summarizeToolArgs(event.args),
            });
            if (hasVisibleAssistantText(fullText)) {
              separateNextAssistantText = true;
            }
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
            logger.debug("Pi tool_execution_update", {
              ...getPromptDiagnostics(),
              toolCallId: event.toolCallId,
              toolName: event.toolName,
              progressSummary: summarizeToolProgress(event.partialResult),
            });
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
            toolExecutionEndCount += 1;
            if (event.isError) {
              toolExecutionErrorCount += 1;
            }
            logger.info("Pi tool_execution_end", {
              ...getPromptDiagnostics(),
              toolCallId: event.toolCallId,
              toolName: event.toolName,
              isError: event.isError,
              resultSummary: summarizeToolProgress(event.result),
            });
            if (hasVisibleAssistantText(fullText)) {
              separateNextAssistantText = true;
            }
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
          logger.error("Pi prompt 总超时兜底触发", {
            ...getPromptDiagnostics(),
            totalTimeoutMs: PROMPT_TOTAL_TIMEOUT_MS,
          });
          try { await session.abort(); } catch { /* abort 也可能失败 */ }
        } else if (idleTimedOut && !hardTimedOut) {
          // 空闲超时触发：仅在 idleTimedOut=true 且不是总超时的情况下
          lastError = "回复生成超时（长时间无响应）";
          logger.error("Pi prompt 空闲超时", {
            ...getPromptDiagnostics(),
            timeoutMs,
          });
        } else if (isAbortRequested?.()) {
          abortedByUser = true;
          logger.info("Pi prompt 已按用户请求停止", getPromptDiagnostics());
        } else {
          lastError = err instanceof Error ? err.message : String(err);
          logger.error("Pi prompt 执行失败", {
            ...getPromptDiagnostics(),
            error: lastError,
          });
        }
      } finally {
        clearIdleTimer();
        unsubscribe();
        if (pendingTimer) {
          clearTimeout(pendingTimer);
          pendingTimer = null;
        }
        if (
          streamingAllowed &&
          !streamingBroken &&
          hasVisibleStreamingContent(
            formatDisplayBody(),
            showToolCallsInReply ? formatToolCallsSection(toolCallMap, normalizedToolCallsDisplayMode) : "",
            preludeText,
          )
        ) {
          flushChain = flushChain.then(() => flushStreamingState());
        }
        await flushChain;
        await reactionUpdateChain;
        reactionEntries.push(...takeSessionReactions(session));
        for (const { messageId, reactionId } of reactionEntries) {
          if (!reactionId) continue;
          const removed = await messenger.removeReaction(messageId, reactionId);
          if (!removed) {
            logger.warn("reaction 删除失败", { openId, sourceMessageId, messageId, reactionId });
          }
        }
      }

      const displayText =
        lastError && !abortedByUser
          ? (hasVisibleAssistantText(fullText)
              ? `${fullText}\n\n⚠️ 回复中断: ${lastError}`
              : (preludeText ? `⚠️ 回复中断: ${lastError}` : ""))
          : fullText;
      const footer = includeFooter ? formatLabeledFooter(formatPromptFooter(session), footerLabel) : undefined;
      const finalText = appendMessageFooter(formatDisplayBody(displayText), footer);
      const finalToolsText = showToolCallsInReply ? formatToolCallsSection(toolCallMap, normalizedToolCallsDisplayMode) : "";
      const finalOutputText = abortedByUser
        ? (streamingMessage ? STOP_MESSAGE : "")
        : finalText || (streamingMessage ? "已完成，但没有生成可展示的正文。" : "");
      const hasFinalOutput = Boolean(finalOutputText || finalToolsText || preludeText);
      const shouldFinalize =
        (!lastError || hasVisibleAssistantText(fullText) || abortedByUser || Boolean(preludeText)) && hasFinalOutput;
      const suppressFollowupErrorMessage =
        shouldFinalize && Boolean(lastError) && !hasVisibleAssistantText(fullText) && Boolean(preludeText);
      let displayedFinalText = finalOutputText;
      let generatedImagesSent = 0;
      if (shouldFinalize) {
        const imageDispatch = await dispatchGeneratedImagesFromText(
          messenger.sendLocalImageMessage ? { sendLocalImageMessage: messenger.sendLocalImageMessage } : undefined,
          target.kind === "p2p" ? openId : target,
          finalOutputText,
        );
        displayedFinalText = imageDispatch.text;
        generatedImagesSent = imageDispatch.sentCount;
        if (!displayedFinalText && generatedImagesSent && streamingMessage) {
          displayedFinalText = "图片已发送";
        }

        if (displayedFinalText || finalToolsText || preludeText || !generatedImagesSent) {
          await finalizeMessage(
            messenger,
            openId,
            displayedFinalText,
            textChunkLimit,
            finalToolsText,
            preludeText,
            streamingMessage,
            streamingBroken,
            conversationTarget,
          );
        }
      }
      await sendCollectedDocPreviewCards(messenger, openId, docPreviewMap, conversationTarget);

      logger.info("Pi prompt 结果", {
        ...getPromptDiagnostics(),
        hasError: Boolean(lastError),
        error: lastError,
        abortedByUser,
        shouldFinalize,
        streamingBroken,
        streamingMessageCreated: Boolean(streamingMessage),
        finalOutputChars: finalOutputText.length,
        finalToolsChars: finalToolsText.length,
        docPreviewCount: docPreviewMap.size,
      });

      return {
        text: fullText,
        error: abortedByUser ? undefined : lastError,
        ...(abortedByUser ? { aborted: true } : {}),
        ...(suppressFollowupErrorMessage ? { displayed: true } : {}),
      };
    },
  };
}

const defaultPromptRunner = createPromptRunner({
  sendRenderedMessage,
  sendRenderedMessageToTarget,
  sendDocPreviewCard,
  startStreamingMessage,
  addProcessingReaction,
  removeReaction,
  sendLocalImageMessage,
});

export async function promptSession(
  session: AgentSession,
  promptInput: string | PromptInput,
  openId: string,
  sourceMessageId: string,
  processingReactionType?: string,
  streamingEnabled: boolean = false,
  textChunkLimit: number = 2000,
  toolCallsDisplayMode: ToolCallsDisplayMode | boolean = "off",
  timeoutMs: number = PROMPT_IDLE_TIMEOUT_MS,
  isAbortRequested?: () => boolean,
  conversationTarget?: ConversationTarget,
): Promise<PromptResult> {
  return defaultPromptRunner.promptSession(
    session,
    promptInput,
    openId,
    sourceMessageId,
    processingReactionType,
    streamingEnabled,
    textChunkLimit,
    toolCallsDisplayMode,
    timeoutMs,
    isAbortRequested,
    conversationTarget,
  );
}

/** 最终发送飞书消息 */
async function finalizeMessage(
  messenger: Pick<FeishuMessenger, "sendRenderedMessage"> & Partial<Pick<FeishuMessenger, "sendRenderedMessageToTarget">>,
  openId: string,
  fullText: string,
  textChunkLimit: number,
  toolsText: string = "",
  preludeText: string = "",
  streamingMessage?: FeishuStreamingMessage | null,
  streamingBroken: boolean = false,
  conversationTarget?: ConversationTarget,
): Promise<void> {
  if (streamingMessage && !streamingBroken) {
    try {
      await streamingMessage.finish(fullText, textChunkLimit, toolsText, preludeText);
      return;
    } catch (err) {
      logger.error("飞书流式卡片收口失败，回退到最终消息发送", {
        openId,
        error: String(err),
      });
    }
  }
  if (!fullText && !toolsText && !preludeText) return;
  const target = conversationTarget ?? createP2PTarget(openId);
  const text = appendDisplayedSections(fullText, preludeText, toolsText);
  if (conversationTarget && messenger.sendRenderedMessageToTarget) {
    await messenger.sendRenderedMessageToTarget(target, text, textChunkLimit);
    return;
  }
  await messenger.sendRenderedMessage(openId, text, textChunkLimit);
}

async function sendCollectedDocPreviewCards(
  messenger: Pick<FeishuMessenger, "sendDocPreviewCard">,
  openId: string,
  docPreviewMap: ReadonlyMap<string, FeishuDocPreviewCardInput>,
  conversationTarget?: ConversationTarget,
): Promise<void> {
  const recipient = getDocPreviewCardRecipient(openId, conversationTarget);
  if (!recipient) {
    return;
  }

  for (const preview of docPreviewMap.values()) {
    try {
      await messenger.sendDocPreviewCard(recipient, preview);
    } catch (error) {
      logger.warn("飞书文档卡片发送失败，已跳过", {
        openId,
        preview,
        error: String(error),
      });
    }
  }
}

function getDocPreviewCardRecipient(
  openId: string,
  conversationTarget?: ConversationTarget,
): string | ConversationTarget | null {
  if (!conversationTarget || conversationTarget.kind === "p2p") {
    return openId;
  }
  if (conversationTarget.kind === "group") {
    return conversationTarget;
  }
  return null;
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

function extractExplicitToolResultDetails(result: unknown): Record<string, unknown> | undefined {
  if (!result || typeof result !== "object" || Array.isArray(result)) {
    return undefined;
  }

  const details = (result as Record<string, unknown>).details;
  if (details && typeof details === "object" && !Array.isArray(details)) {
    return details as Record<string, unknown>;
  }

  return undefined;
}

function extractUserMessageText(message: unknown): string | undefined {
  if (!message || typeof message !== "object" || Array.isArray(message)) {
    return undefined;
  }

  const record = message as Record<string, unknown>;
  if (record.role !== "user") {
    return undefined;
  }

  const content = record.content;
  if (typeof content === "string") {
    return content;
  }
  if (!Array.isArray(content)) {
    return undefined;
  }

  const text = content
    .map((item) => {
      if (!item || typeof item !== "object" || Array.isArray(item)) {
        return "";
      }
      const part = item as Record<string, unknown>;
      return part.type === "text" && typeof part.text === "string" ? part.text : "";
    })
    .join("");
  return text || undefined;
}

function summarizeAssistantMessageForLog(message: unknown) {
  if (!message || typeof message !== "object" || Array.isArray(message)) {
    return undefined;
  }

  const record = message as Record<string, unknown>;
  const content = record.content;
  const summary = {
    role: readStringField(record, "role"),
    stopReason: readStringField(record, "stopReason"),
    errorMessage: readStringField(record, "errorMessage"),
    responseId: readStringField(record, "responseId"),
    contentTypes: [] as string[],
    textChars: 0,
    toolCallCount: 0,
    toolCalls: [] as Array<{
      toolCallId?: string;
      toolName?: string;
      argsSummary?: string;
    }>,
  };

  if (typeof content === "string") {
    summary.contentTypes.push("text");
    summary.textChars = content.length;
    return summary;
  }

  if (!Array.isArray(content)) {
    return summary;
  }

  for (const item of content) {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      continue;
    }
    const block = item as Record<string, unknown>;
    const type = readStringField(block, "type") ?? "unknown";
    summary.contentTypes.push(type);
    if (type === "text" && typeof block.text === "string") {
      summary.textChars += block.text.length;
    }
    if (type === "toolCall") {
      summary.toolCallCount += 1;
      summary.toolCalls.push(summarizeToolCallBlock(block));
    }
  }

  return summary;
}

function extractAssistantErrorMessage(message: unknown): string | undefined {
  if (!message || typeof message !== "object" || Array.isArray(message)) {
    return undefined;
  }

  const record = message as Record<string, unknown>;
  if (record.role !== "assistant" || record.stopReason !== "error") {
    return undefined;
  }

  return readStringField(record, "errorMessage") ?? "处理失败，请稍后重试";
}

function summarizeToolCallFromAssistantUpdate(
  update: Record<string, unknown>,
): {
  toolCallId?: string;
  toolName?: string;
  argsSummary?: string;
} {
  const direct = summarizeToolCallBlock(update.toolCall);
  if (direct.toolCallId || direct.toolName || direct.argsSummary) {
    return direct;
  }

  const contentIndex = readNumberField(update, "contentIndex");
  const partialToolCall = findToolCallBlockInPartial(update.partial, contentIndex);
  return summarizeToolCallBlock(partialToolCall);
}

function summarizeToolCallBlock(toolCall: unknown): {
  toolCallId?: string;
  toolName?: string;
  argsSummary?: string;
} {
  if (!toolCall || typeof toolCall !== "object" || Array.isArray(toolCall)) {
    return {};
  }

  const record = toolCall as Record<string, unknown>;
  return {
    toolCallId: readStringField(record, "id") ?? readStringField(record, "toolCallId"),
    toolName: readStringField(record, "name") ?? readStringField(record, "toolName"),
    argsSummary: summarizeToolArgs(record.arguments ?? record.args),
  };
}

function findToolCallBlockInPartial(
  partial: unknown,
  contentIndex?: number,
): unknown {
  if (!partial || typeof partial !== "object" || Array.isArray(partial)) {
    return undefined;
  }

  const content = (partial as Record<string, unknown>).content;
  if (!Array.isArray(content)) {
    return undefined;
  }

  if (
    typeof contentIndex === "number" &&
    contentIndex >= 0 &&
    contentIndex < content.length
  ) {
    return content[contentIndex];
  }

  return content.find((item) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      return false;
    }
    return (item as Record<string, unknown>).type === "toolCall";
  });
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

function readNumberField(
  value: Record<string, unknown> | undefined,
  key: string,
): number | undefined {
  const raw = value?.[key];
  return typeof raw === "number" && Number.isFinite(raw) ? raw : undefined;
}

function stripLeadingBlankLines(text: string): string {
  return text.replace(/^(?:[ \t]*\r?\n)+/, "");
}

function hasVisibleAssistantText(text: string): boolean {
  return stripLeadingBlankLines(text).length > 0;
}

function hasVisibleStreamingContent(text: string, toolsText: string, preludeText: string): boolean {
  return hasVisibleAssistantText(text) || hasVisibleToolText(toolsText) || hasVisiblePreludeText(preludeText);
}

function hasVisibleToolText(toolsText: string): boolean {
  return toolsText.trim().length > 0;
}

function hasVisiblePreludeText(preludeText: string): boolean {
  return preludeText.trim().length > 0;
}

function appendMessageFooter(text: string, footer?: string): string {
  if (!text || !footer) return text;
  return text ? `${text}\n\n${footer}` : footer;
}

function prependMessageHeader(text: string, header?: string): string {
  const normalizedHeader = header?.trimEnd() ?? "";
  if (!normalizedHeader) return text;
  return text ? `${normalizedHeader}\n\n${text}` : normalizedHeader;
}

function formatLabeledFooter(footer: string | undefined, label: string): string | undefined {
  if (!footer) return undefined;
  return label ? `${label}${footer}` : footer;
}

function appendToolCallsSection(text: string, toolsText: string): string {
  if (!toolsText) return text;
  return text ? `${text}\n\n${toolsText}` : toolsText;
}

function appendDisplayedSections(text: string, preludeText: string, toolsText: string): string {
  return [text, preludeText, toolsText].filter((section) => Boolean(section)).join("\n\n");
}

function appendAssistantSegmentSeparator(text: string, nextDelta: string): string {
  const normalizedText = text.replace(/[ \t]+$/, "");
  if (!hasVisibleAssistantText(normalizedText) || !nextDelta) {
    return text;
  }

  const missingLineBreaks = Math.max(
    0,
    2 - countTrailingLineBreaks(normalizedText) - countLeadingLineBreaks(nextDelta),
  );
  if (missingLineBreaks === 0) {
    return normalizedText;
  }

  return `${normalizedText}${"\n".repeat(missingLineBreaks)}`;
}

function countTrailingLineBreaks(text: string): number {
  const trailingLineBreaks = text.match(/(?:\r?\n)+$/)?.[0];
  return trailingLineBreaks?.match(/\n/g)?.length ?? 0;
}

function countLeadingLineBreaks(text: string): number {
  const leadingLineBreaks = text.match(/^(?:[ \t]*\r?\n)+/)?.[0];
  return leadingLineBreaks?.match(/\n/g)?.length ?? 0;
}

function formatToolCallsSection(
  toolCallMap: ReadonlyMap<string, ToolCallState>,
  displayMode: ToolCallsDisplayMode,
): string {
  const toolCalls = Array.from(toolCallMap.values()).slice(-MAX_VISIBLE_TOOL_CALLS);
  if (toolCalls.length === 0) return "";

  const lines = [" ---", "**工具调用**"];
  if (displayMode === "name") {
    for (let index = 0; index < toolCalls.length; index += TOOL_CALL_NAMES_PER_LINE) {
      lines.push(
        toolCalls
          .slice(index, index + TOOL_CALL_NAMES_PER_LINE)
          .map((toolCall) => formatToolCallLines(toolCall, displayMode)[0])
          .join(" "),
      );
    }
    return lines.join("\n");
  }

  for (const toolCall of toolCalls) {
    lines.push(...formatToolCallLines(toolCall, displayMode));
  }
  return lines.join("\n");
}

function formatToolCallLines(toolCall: ToolCallState, displayMode: ToolCallsDisplayMode): string[] {
  const toolEmoji = "🛠️";
  if (displayMode === "name") {
    return [`${toolEmoji} ${toolCall.toolName}`];
  }

  const statusLabel = formatToolStatus(toolCall.status);
  const statusText = statusLabel ? ` ${statusLabel}` : "";
  if (toolCall.toolName === "read") {
    const readSummary = toolCall.argsSummary ?? toolCall.resultSummary;
    const readSuffix = readSummary ? ` : ${readSummary}` : "";
    return [`${toolEmoji} ${toolCall.toolName}${readSuffix}`];
  }

  const primarySummary = toolCall.showOutputSummary
    ? (toolCall.argsSummary ?? toolCall.resultSummary)
    : (toolCall.resultSummary ?? toolCall.argsSummary);
  const summary = primarySummary ? `: ${primarySummary}` : "";
  const lines = [`${toolEmoji} ${toolCall.toolName}${statusText}${summary}`];

  if (
    toolCall.showOutputSummary &&
    toolCall.argsSummary &&
    toolCall.resultSummary
  ) {
    lines.push(`📤 output: ${toolCall.resultSummary}`);
  }

  return lines;
}

function normalizeToolCallsDisplayMode(mode: ToolCallsDisplayMode | boolean): ToolCallsDisplayMode {
  if (typeof mode === "boolean") {
    return mode ? "full" : "off";
  }
  return mode;
}

function formatToolStatus(status: ToolCallState["status"]): string {
  switch (status) {
    case "running":
      return "运行中";
    case "done":
      return "";
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
  const explicitDetails = extractExplicitToolResultDetails(result);
  const explicitSummary = summarizeToolDetails(explicitDetails);
  if (explicitSummary) return explicitSummary;

  const contentText = extractToolContentText(result);
  if (contentText) return contentText;

  const details = extractToolResultDetails(result);
  const detailsSummary = summarizeToolDetails(details);
  if (detailsSummary) return detailsSummary;

  return summarizeUnknownValue(details);
}

function summarizeToolDetails(details: Record<string, unknown> | undefined): string | undefined {
  return readPreferredSummaryField(details, TOOL_PROGRESS_SUMMARY_FIELDS);
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
  const direct = readDirectPreferredSummaryField(record, keys);
  if (direct) return direct;

  const nested = readNestedPreferredSummaryField(record, keys);
  if (nested) return nested;

  for (const field of Object.values(record)) {
    if (typeof field === "string" && field.trim()) {
      return normalizeToolSummary(field);
    }
  }

  return undefined;
}

function readDirectPreferredSummaryField(
  record: Record<string, unknown>,
  keys: string[],
): string | undefined {
  for (const key of keys) {
    const field = record[key];
    if (typeof field === "string" && field.trim()) {
      return normalizeToolSummary(field);
    }
  }

  return undefined;
}

function readNestedPreferredSummaryField(
  value: unknown,
  keys: string[],
  depth: number = 0,
): string | undefined {
  if (depth >= 2 || !value || typeof value !== "object") {
    return undefined;
  }

  const values = Array.isArray(value) ? value : Object.values(value);
  for (const field of values) {
    if (!field || typeof field !== "object") {
      continue;
    }

    if (!Array.isArray(field)) {
      const preferred = readDirectPreferredSummaryField(field as Record<string, unknown>, keys);
      if (preferred) return preferred;
    }

    const nested = readNestedPreferredSummaryField(field, keys, depth + 1);
    if (nested) return nested;
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
  session: Pick<AgentSession, "getContextUsage" | "model" | "thinkingLevel">,
): string | undefined {
  const lines = [
    formatContextUsageFooter(session.getContextUsage()),
    formatCurrentModelFooter(session.model, session.thinkingLevel),
  ].filter((line): line is string => Boolean(line));

  return lines.length > 0 ? lines.join(" | ") : undefined;
}

function formatModelForLog(
  model: AgentSession["model"],
  thinkingLevel?: AgentSession["thinkingLevel"],
): { provider: string; id: string; label: string; thinkingLevel?: AgentSession["thinkingLevel"] } | undefined {
  if (!model) {
    return undefined;
  }

  const provider = model.provider?.trim();
  const id = model.id?.trim();
  if (!provider || !id) {
    return undefined;
  }

  return {
    provider,
    id,
    label: formatModelLabel(provider, id),
    ...(thinkingLevel ? { thinkingLevel } : {}),
  };
}

function summarizeContextUsageForLog(
  contextUsage: ReturnType<AgentSession["getContextUsage"]>
): { percent: number; contextWindow: number; usedTokens: number } | undefined {
  if (
    !contextUsage ||
    contextUsage.percent === null ||
    !Number.isFinite(contextUsage.percent) ||
    contextUsage.contextWindow <= 0
  ) {
    return undefined;
  }

  return {
    percent: Number(contextUsage.percent.toFixed(1)),
    contextWindow: contextUsage.contextWindow,
    usedTokens: Math.max(
      0,
      Math.round((contextUsage.contextWindow * contextUsage.percent) / 100),
    ),
  };
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

  const usedTokens = Math.max(
    0,
    Math.round((contextUsage.contextWindow * contextUsage.percent) / 100),
  );

  return `${contextUsage.percent.toFixed(1)}% ${formatCompactTokenCount(usedTokens)}/${formatCompactTokenCount(contextUsage.contextWindow)}`;
}

function formatCurrentModelFooter(
  model: AgentSession["model"],
  thinkingLevel?: AgentSession["thinkingLevel"],
): string | undefined {
  if (!model) {
    return undefined;
  }

  const provider = model.provider?.trim();
  const id = model.id?.trim();
  if (!provider || !id) {
    return undefined;
  }

  const thinkingSuffix = thinkingLevel ? ` ${thinkingLevel}` : "";
  return `模型: ${formatModelLabel(provider, id)}${thinkingSuffix}`;
}

function formatCompactTokenCount(count: number): string {
  if (count < 1000) return count.toString();
  if (count < 10000) return `${(count / 1000).toFixed(1)}k`;
  if (count < 1000000) return `${Math.round(count / 1000)}k`;
  if (count < 10000000) return `${(count / 1000000).toFixed(1)}M`;
  return `${Math.round(count / 1000000)}M`;
}
