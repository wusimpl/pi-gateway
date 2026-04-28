import type { Config } from "../config.js";
import { formatError } from "../feishu/format.js";
import { readFeishuQuotedMessage } from "../feishu/inbound/message.js";
import { downloadFeishuResource } from "../feishu/inbound/resource.js";
import { prepareFeishuPromptInput } from "../feishu/inbound/transform.js";
import type { FeishuInboundMessage, FeishuMediaProcessingOptions, PreparedPromptInput } from "../feishu/inbound/types.js";
import type { FeishuMessenger } from "../feishu/send.js";
import { registerSessionReaction, type PromptRunner } from "../pi/stream.js";
import type { SessionService } from "../pi/sessions.js";
import type { WorkspaceService } from "../pi/workspace.js";
import type { QuotedMessageStore } from "../storage/quoted-messages.js";
import { readQuotedMessage as readCachedQuotedMessage } from "../storage/quoted-messages.js";
import type { UserIdentity, UserState } from "../types.js";
import type { UserStateStore } from "../storage/users.js";
import type { DeferredCronRunService } from "../cron/deferred-run.js";
import { getConversationTargetKey, type ConversationTarget } from "../conversation.js";
import { logger } from "./logger.js";
import type { RuntimeStateStore } from "./state.js";
import type { RuntimeConfigStore } from "./runtime-config.js";

export interface PromptService {
  handleUserPrompt(identity: UserIdentity, message: FeishuInboundMessage): Promise<void>;
  queueRunningPrompt(
    identity: UserIdentity,
    message: FeishuInboundMessage,
    behavior: RunningPromptBehavior,
  ): Promise<RunningPromptQueueResult>;
}

export type RunningPromptBehavior = "steer" | "followUp";
export type RunningPromptQueueResult = "queued" | "not_running" | "unsupported";

const QUEUED_PROMPT_DELIVERED_REACTION_TYPE = "GoGoGo";
const STEER_REPLY_SEPARATOR = "\n\n ---\n**继续处理你刚发来的消息**\n";

interface PromptServiceDeps {
  config: Pick<
    Config,
    | "FEISHU_MEDIA_OLLAMA_BASE_URL"
    | "FEISHU_MEDIA_OCR_MODEL"
    | "FEISHU_AUDIO_TRANSCRIBE_PROVIDER"
    | "FEISHU_AUDIO_TRANSCRIBE_SCRIPT"
    | "FEISHU_AUDIO_TRANSCRIBE_LANGUAGE"
    | "FEISHU_AUDIO_TRANSCRIBE_SENSEVOICE_PYTHON"
    | "FEISHU_AUDIO_TRANSCRIBE_SENSEVOICE_MODEL"
    | "FEISHU_AUDIO_TRANSCRIBE_SENSEVOICE_DEVICE"
    | "FEISHU_AUDIO_TRANSCRIBE_DOUBAO_API_KEY"
    | "FEISHU_PROCESSING_REACTION_TYPE"
    | "STREAMING_ENABLED"
    | "TEXT_CHUNK_LIMIT"
  > & Partial<Pick<Config, "FEISHU_STEERING_REACTION_TYPE">>;
  runtimeState: Pick<
    RuntimeStateStore,
    "acquireLock" | "releaseLock" | "setAbortHandler" | "isStopRequested" | "isDraining"
  >;
  sessionService: Pick<SessionService, "getOrCreateActiveSession" | "touchSession"> &
    Partial<Pick<SessionService, "getOrCreateActiveSessionForTarget" | "touchSessionForTarget" | "readSessionState">>;
  userStateStore?: Pick<UserStateStore, "readUserState">;
  workspaceService: Pick<WorkspaceService, "getUserWorkspaceDir"> &
    Partial<Pick<WorkspaceService, "getConversationWorkspaceDir">>;
  promptRunner: Pick<PromptRunner, "promptSession">;
  messenger: Pick<FeishuMessenger, "sendTextMessage"> &
    Partial<Pick<FeishuMessenger, "sendTextMessageToTarget" | "addProcessingReaction">>;
  quotedMessageStore?: Pick<QuotedMessageStore, "readQuotedMessage">;
  downloadResource?: typeof downloadFeishuResource;
  readQuotedMessage?: typeof readFeishuQuotedMessage;
  preparePromptInput?: typeof prepareFeishuPromptInput;
  runtimeConfig?: Pick<
    RuntimeConfigStore,
    | "getAudioTranscribeProvider"
    | "getStreamingEnabled"
    | "getProcessingReactionType"
    | "getSteeringReactionType"
  >;
  deferredCronRunService?: Pick<DeferredCronRunService, "flush">;
  resolveSenderName?: (identity: UserIdentity, conversationTarget: ConversationTarget) => Promise<string | null>;
}

export function createPromptService(deps: PromptServiceDeps): PromptService {
  const preparePromptInput = deps.preparePromptInput ?? prepareFeishuPromptInput;
  const readQuotedMessage = deps.readQuotedMessage ?? readFeishuQuotedMessage;
  const quotedMessageStore = deps.quotedMessageStore ?? {
    readQuotedMessage: readCachedQuotedMessage,
  };

  function buildPromptPreparationOptions(
    identity: UserIdentity,
    conversationTarget?: ConversationTarget,
  ): FeishuMediaProcessingOptions {
    const audioTranscribeProvider = deps.runtimeConfig
      ? deps.runtimeConfig.getAudioTranscribeProvider()
      : deps.config.FEISHU_AUDIO_TRANSCRIBE_PROVIDER;

    return {
      workspaceDir: getWorkspaceDir(identity, conversationTarget),
      ollamaBaseUrl: deps.config.FEISHU_MEDIA_OLLAMA_BASE_URL,
      ocrModel: deps.config.FEISHU_MEDIA_OCR_MODEL,
      audioTranscribeProvider,
      audioTranscribeScript: deps.config.FEISHU_AUDIO_TRANSCRIBE_SCRIPT,
      audioLanguage: deps.config.FEISHU_AUDIO_TRANSCRIBE_LANGUAGE,
      audioTranscribeSenseVoicePython: deps.config.FEISHU_AUDIO_TRANSCRIBE_SENSEVOICE_PYTHON,
      audioTranscribeSenseVoiceModel: deps.config.FEISHU_AUDIO_TRANSCRIBE_SENSEVOICE_MODEL,
      audioTranscribeSenseVoiceDevice: deps.config.FEISHU_AUDIO_TRANSCRIBE_SENSEVOICE_DEVICE,
      audioTranscribeDoubaoApiKey: deps.config.FEISHU_AUDIO_TRANSCRIBE_DOUBAO_API_KEY,
    };
  }

  function getWorkspaceDir(identity: UserIdentity, conversationTarget?: ConversationTarget): string {
    if (conversationTarget && conversationTarget.kind !== "p2p" && deps.workspaceService.getConversationWorkspaceDir) {
      return deps.workspaceService.getConversationWorkspaceDir(identity, conversationTarget);
    }
    return deps.workspaceService.getUserWorkspaceDir(identity);
  }

  async function getActiveSession(identity: UserIdentity, conversationTarget?: ConversationTarget) {
    if (conversationTarget && conversationTarget.kind !== "p2p" && deps.sessionService.getOrCreateActiveSessionForTarget) {
      return deps.sessionService.getOrCreateActiveSessionForTarget(identity, conversationTarget);
    }
    return deps.sessionService.getOrCreateActiveSession(identity);
  }

  async function readTargetState(
    identity: UserIdentity,
    conversationTarget?: ConversationTarget,
  ): Promise<UserState | null | undefined> {
    if (conversationTarget && conversationTarget.kind !== "p2p" && deps.sessionService.readSessionState) {
      return deps.sessionService.readSessionState(identity, conversationTarget);
    }
    return deps.userStateStore?.readUserState(identity.openId);
  }

  async function touchSession(
    identity: UserIdentity,
    conversationTarget: ConversationTarget | undefined,
    messageId: string,
  ): Promise<void> {
    if (conversationTarget && conversationTarget.kind !== "p2p" && deps.sessionService.touchSessionForTarget) {
      await deps.sessionService.touchSessionForTarget(identity, conversationTarget, messageId);
      return;
    }
    await deps.sessionService.touchSession(identity.openId, messageId);
  }

  async function sendTextReply(
    identity: UserIdentity,
    conversationTarget: ConversationTarget | undefined,
    text: string,
  ): Promise<void> {
    if (conversationTarget && conversationTarget.kind !== "p2p" && deps.messenger.sendTextMessageToTarget) {
      await deps.messenger.sendTextMessageToTarget(conversationTarget, text);
      return;
    }
    await deps.messenger.sendTextMessage(identity.openId, text);
  }

  function readLastQueuedPromptText(
    piSession: unknown,
    behavior: RunningPromptBehavior,
  ): string | undefined {
    const queueReader = piSession as {
      getSteeringMessages?: () => readonly string[];
      getFollowUpMessages?: () => readonly string[];
    };
    const messages = behavior === "followUp"
      ? queueReader.getFollowUpMessages?.()
      : queueReader.getSteeringMessages?.();
    return messages?.[messages.length - 1];
  }

  async function handleUserPrompt(
    identity: UserIdentity,
    message: FeishuInboundMessage,
  ): Promise<void> {
    const openId = identity.openId;
    const conversationKey = getConversationTargetKey(message.conversationTarget, openId);
    const conversationTarget = message.conversationTarget;
    const messageId = message.messageId;
    let lockAcquired = false;
    if (deps.runtimeState.isDraining()) {
      await sendTextReply(identity, conversationTarget, "网关正在重启，暂时不接新任务，请稍后再试。");
      return;
    }

    if (!deps.runtimeState.acquireLock(conversationKey, messageId)) {
      if (deps.runtimeState.isDraining()) {
        await sendTextReply(identity, conversationTarget, "网关正在重启，暂时不接新任务，请稍后再试。");
        return;
      }
      logger.info("用户消息因已有处理中任务被忽略", { openId, conversationKey, messageId });
      return;
    }
    lockAcquired = true;

    try {
      const { activeSessionId, piSession } = await getActiveSession(identity, conversationTarget);
      const userState = await readTargetState(identity, conversationTarget);
      applyUserPromptPreferences(piSession, userState);
      const stoppedBeforePrompt = await deps.runtimeState.setAbortHandler(
        conversationKey,
        messageId,
        async () => {
          await piSession.abort();
        },
      );
      if (stoppedBeforePrompt) {
        logger.info("任务启动前收到停止请求，已跳过 prompt", { openId, conversationKey, messageId });
        return;
      }

      const promptIdentity = await enrichGroupSenderIdentity(identity, conversationTarget);
      const enrichedMessage = await attachQuotedMessage(message, quotedMessageStore, readQuotedMessage);
      const processingReactionType = deps.runtimeConfig
        ? deps.runtimeConfig.getProcessingReactionType()
        : deps.config.FEISHU_PROCESSING_REACTION_TYPE;
      const streamingEnabled = userState?.streamingEnabled
        ?? (deps.runtimeConfig
          ? deps.runtimeConfig.getStreamingEnabled()
          : deps.config.STREAMING_ENABLED);
      const toolCallsDisplayMode = userState?.toolCallsDisplayMode ?? "off";
      const promptInput = addConversationPromptContext(
        await preparePromptInput(enrichedMessage, piSession, buildPromptPreparationOptions(identity, conversationTarget), {
          downloadResource: deps.downloadResource,
        }),
        promptIdentity,
        conversationTarget,
      );
      if (deps.runtimeState.isStopRequested(conversationKey, messageId)) {
        logger.info("prompt 输入准备完成前收到停止请求，已跳过 prompt", { openId, conversationKey, messageId });
        return;
      }

      const logCtx = { openId, conversationKey, sessionId: activeSessionId, messageId };
      const targetForRunner = conversationTarget?.kind === "p2p" ? undefined : conversationTarget;
      const result = targetForRunner
        ? await deps.promptRunner.promptSession(
            piSession,
            promptInput,
            openId,
            messageId,
            processingReactionType,
            streamingEnabled,
            deps.config.TEXT_CHUNK_LIMIT,
            toolCallsDisplayMode,
            undefined,
            () => deps.runtimeState.isStopRequested(conversationKey, messageId),
            targetForRunner,
          )
        : await deps.promptRunner.promptSession(
            piSession,
            promptInput,
            openId,
            messageId,
            processingReactionType,
            streamingEnabled,
            deps.config.TEXT_CHUNK_LIMIT,
            toolCallsDisplayMode,
            undefined,
            () => deps.runtimeState.isStopRequested(conversationKey, messageId),
          );

      if (result.error && !result.text && !result.aborted && !result.displayed) {
        await sendTextReply(identity, conversationTarget, formatError(result.error));
      }

      await touchSession(identity, conversationTarget, messageId);
      logger.info("Pi prompt 完成", logCtx);
    } catch (err) {
      logger.error("Pi prompt 处理失败", { openId, messageId, error: String(err) });
      await sendTextReply(
        identity,
        conversationTarget,
        formatError(formatPromptPreparationError(err) ?? "处理失败，请稍后重试或使用 /new 新建会话"),
      );
    } finally {
      if (lockAcquired) {
        deps.runtimeState.releaseLock(conversationKey);
        await deps.deferredCronRunService?.flush(conversationKey);
      }
    }
  }

  async function queueRunningPrompt(
    identity: UserIdentity,
    message: FeishuInboundMessage,
    behavior: RunningPromptBehavior,
  ): Promise<RunningPromptQueueResult> {
    if (message.kind !== "text") {
      return "unsupported";
    }

    const openId = identity.openId;
    const messageId = message.messageId;
    const conversationTarget = message.conversationTarget;
    if (deps.runtimeState.isDraining()) {
      return "not_running";
    }

    let activeSessionId = "unknown";
    let piSession: Awaited<ReturnType<SessionService["getOrCreateActiveSession"]>>["piSession"];
    try {
      const sessionState = await getActiveSession(identity, conversationTarget);
      activeSessionId = sessionState.activeSessionId;
      piSession = sessionState.piSession;
      const userState = await readTargetState(identity, conversationTarget);
      applyUserPromptPreferences(piSession, userState);
    } catch (error) {
      logger.warn("获取运行中 Pi session 失败，退回普通队列", { openId, messageId, error: String(error) });
      return "not_running";
    }

    if (!piSession.isStreaming) {
      return "not_running";
    }

    let promptText: string;
    try {
      const promptIdentity = await enrichGroupSenderIdentity(identity, conversationTarget);
      const enrichedMessage = await attachQuotedMessage(message, quotedMessageStore, readQuotedMessage);
      const promptInput = addConversationPromptContext(
        await preparePromptInput(enrichedMessage, piSession, buildPromptPreparationOptions(identity, conversationTarget), {
          downloadResource: deps.downloadResource,
        }),
        promptIdentity,
        conversationTarget,
      );
      promptText = promptInput.text;
      if (behavior === "followUp") {
        await piSession.followUp(promptInput.text, promptInput.images);
      } else {
        await piSession.steer(promptInput.text, promptInput.images);
      }
      const queuedPromptText = readLastQueuedPromptText(piSession, behavior) ?? promptText;

      const steeringReactionType = deps.runtimeConfig?.getSteeringReactionType() ?? deps.config.FEISHU_STEERING_REACTION_TYPE;
      if (steeringReactionType) {
        try {
          const reactionId = await deps.messenger.addProcessingReaction?.(messageId, steeringReactionType);
          if (reactionId) {
            registerSessionReaction(piSession as any, messageId, reactionId, {
              pendingText: queuedPromptText,
              deliveredReactionType: QUEUED_PROMPT_DELIVERED_REACTION_TYPE,
              replySeparator: behavior === "steer" ? STEER_REPLY_SEPARATOR : undefined,
            });
          }
        } catch (error) {
          logger.warn("steering reaction 添加失败", {
            openId,
            messageId,
            behavior,
            error: String(error),
          });
        }
      }
    } catch (error) {
      logger.warn("Pi 运行中队列写入失败，退回普通队列", {
        openId,
        sessionId: activeSessionId,
        messageId,
        behavior,
        error: String(error),
      });
      return piSession.isStreaming ? "unsupported" : "not_running";
    }

    try {
      await touchSession(identity, conversationTarget, messageId);
    } catch (error) {
      logger.warn("运行中队列消息 touch session 失败", { openId, sessionId: activeSessionId, messageId, error: String(error) });
    }

    logger.info("Pi prompt 已加入运行中队列", {
      openId,
      sessionId: activeSessionId,
      messageId,
      behavior,
      textLen: promptText.length,
    });
    return "queued";
  }

  async function enrichGroupSenderIdentity(
    identity: UserIdentity,
    conversationTarget?: ConversationTarget,
  ): Promise<UserIdentity> {
    if (!conversationTarget || conversationTarget.kind === "p2p" || identity.name?.trim()) {
      return identity;
    }

    try {
      const name = await deps.resolveSenderName?.(identity, conversationTarget);
      return name?.trim() ? { ...identity, name: name.trim() } : identity;
    } catch (error) {
      logger.warn("群聊发送者昵称补齐失败，已降级为 open_id", {
        openId: identity.openId,
        conversationKey: conversationTarget.key,
        error: String(error),
      });
      return identity;
    }
  }

  return {
    handleUserPrompt,
    queueRunningPrompt,
  };
}

function applyUserPromptPreferences(
  session: { setThinkingLevel?: (level: NonNullable<UserState["thinkingLevel"]>) => void },
  userState?: Pick<UserState, "thinkingLevel"> | null,
): void {
  if (!userState?.thinkingLevel || typeof session.setThinkingLevel !== "function") {
    return;
  }

  session.setThinkingLevel(userState.thinkingLevel);
}

function addConversationPromptContext(
  promptInput: PreparedPromptInput,
  identity: UserIdentity,
  conversationTarget: ConversationTarget | undefined,
): PreparedPromptInput {
  if (!conversationTarget || conversationTarget.kind === "p2p") {
    return promptInput;
  }

  const sender = identity.name?.trim() || identity.openId;

  return {
    ...promptInput,
    text: `发送者：${sender}\n用户消息：\n${promptInput.text}`,
  };
}

function formatPromptPreparationError(error: unknown): string | undefined {
  const message = error instanceof Error ? error.message : String(error);
  const lines = message
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const senseVoiceFailure = lines.find((line) => line.startsWith("SenseVoice transcription failed:"));
  if (senseVoiceFailure) {
    const reason = senseVoiceFailure.slice("SenseVoice transcription failed:".length).trim();
    if (reason === "No module named 'torchaudio'") {
      return "SenseVoice 不可用：当前环境缺少 torchaudio，请先安装后再试。";
    }
    return `SenseVoice 转写失败：${reason || "请稍后重试。"}`;
  }

  const ocrFailure = lines.find((line) => line.startsWith("OCR 请求失败:"));
  if (ocrFailure) {
    return `图片识别失败：${ocrFailure.slice("OCR 请求失败:".length).trim()}`;
  }

  if (message.includes("OCR 没返回可用结果")) {
    return "图片识别失败：OCR 没返回可用结果。";
  }

  if (message.includes("SenseVoice 语音转写没有产出文本")) {
    return "SenseVoice 转写失败：没有产出文本。";
  }

  if (message.includes("豆包语音未配置 FEISHU_AUDIO_TRANSCRIBE_DOUBAO_API_KEY")) {
    return "豆包语音未配置 API Key，请先在 .env 设置 FEISHU_AUDIO_TRANSCRIBE_DOUBAO_API_KEY。";
  }

  if (message.includes("豆包语音暂不支持当前音频格式")) {
    return lines.find((line) => line.includes("豆包语音暂不支持当前音频格式"));
  }

  if (message.includes("豆包语音转写失败：")) {
    return lines.find((line) => line.includes("豆包语音转写失败："));
  }

  if (message.includes("豆包语音转写没有产出文本")) {
    return "豆包语音转写失败：没有产出文本。";
  }

  if (message.includes("语音转写没有产出文本")) {
    return "语音转写失败：没有产出文本。";
  }

  return undefined;
}

async function attachQuotedMessage(
  message: FeishuInboundMessage,
  quotedMessageStore: Pick<QuotedMessageStore, "readQuotedMessage">,
  readQuotedMessage: typeof readFeishuQuotedMessage,
): Promise<FeishuInboundMessage> {
  const quotedMessageId = resolveQuotedMessageId(message);
  if (!quotedMessageId) {
    return message;
  }

  try {
    const cachedQuotedMessage = await quotedMessageStore.readQuotedMessage(quotedMessageId);
    if (cachedQuotedMessage) {
      return {
        ...message,
        quotedMessage: cachedQuotedMessage,
      };
    }
  } catch (error) {
    logger.warn("Quoted message cache read failed", {
      messageId: message.messageId,
      parentMessageId: message.parentMessageId,
      rootMessageId: message.rootMessageId,
      quotedMessageId,
      error: String(error),
    });
  }

  try {
    const quotedMessage = await readQuotedMessage(quotedMessageId);
    if (!quotedMessage) {
      return message;
    }

    return {
      ...message,
      quotedMessage,
    };
  } catch (error) {
    logger.warn("读取被引用消息失败，已退回仅处理当前消息", {
      messageId: message.messageId,
      parentMessageId: message.parentMessageId,
      rootMessageId: message.rootMessageId,
      quotedMessageId,
      error: String(error),
    });
    return message;
  }
}

function resolveQuotedMessageId(message: FeishuInboundMessage): string | null {
  const candidates = [message.parentMessageId, message.rootMessageId];
  for (const candidate of candidates) {
    if (candidate && candidate !== message.messageId) {
      return candidate;
    }
  }
  return null;
}
