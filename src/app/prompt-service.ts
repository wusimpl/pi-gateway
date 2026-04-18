import type { Config } from "../config.js";
import { formatError } from "../feishu/format.js";
import { readFeishuQuotedMessage } from "../feishu/inbound/message.js";
import { downloadFeishuResource } from "../feishu/inbound/resource.js";
import { prepareFeishuPromptInput } from "../feishu/inbound/transform.js";
import type { FeishuInboundMessage, FeishuMediaProcessingOptions } from "../feishu/inbound/types.js";
import type { FeishuMessenger } from "../feishu/send.js";
import type { PromptRunner } from "../pi/stream.js";
import type { SessionService } from "../pi/sessions.js";
import type { WorkspaceService } from "../pi/workspace.js";
import type { QuotedMessageStore } from "../storage/quoted-messages.js";
import { readQuotedMessage as readCachedQuotedMessage } from "../storage/quoted-messages.js";
import type { UserIdentity } from "../types.js";
import type { DeferredCronRunService } from "../cron/deferred-run.js";
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
    | "PI_SHOW_TOOL_CALLS_IN_REPLY"
    | "TEXT_CHUNK_LIMIT"
  >;
  runtimeState: Pick<
    RuntimeStateStore,
    "acquireLock" | "releaseLock" | "setAbortHandler" | "isStopRequested" | "isDraining"
  >;
  sessionService: Pick<SessionService, "getOrCreateActiveSession" | "touchSession">;
  workspaceService: Pick<WorkspaceService, "getUserWorkspaceDir">;
  promptRunner: Pick<PromptRunner, "promptSession">;
  messenger: Pick<FeishuMessenger, "sendTextMessage">;
  quotedMessageStore?: Pick<QuotedMessageStore, "readQuotedMessage">;
  downloadResource?: typeof downloadFeishuResource;
  readQuotedMessage?: typeof readFeishuQuotedMessage;
  preparePromptInput?: typeof prepareFeishuPromptInput;
  runtimeConfig?: Pick<
    RuntimeConfigStore,
    "getAudioTranscribeProvider" | "getStreamingEnabled" | "getProcessingReactionType"
  >;
  deferredCronRunService?: Pick<DeferredCronRunService, "flush">;
}

export function createPromptService(deps: PromptServiceDeps): PromptService {
  const preparePromptInput = deps.preparePromptInput ?? prepareFeishuPromptInput;
  const readQuotedMessage = deps.readQuotedMessage ?? readFeishuQuotedMessage;
  const quotedMessageStore = deps.quotedMessageStore ?? {
    readQuotedMessage: readCachedQuotedMessage,
  };

  function buildPromptPreparationOptions(identity: UserIdentity): FeishuMediaProcessingOptions {
    const audioTranscribeProvider = deps.runtimeConfig
      ? deps.runtimeConfig.getAudioTranscribeProvider()
      : deps.config.FEISHU_AUDIO_TRANSCRIBE_PROVIDER;

    return {
      workspaceDir: deps.workspaceService.getUserWorkspaceDir(identity),
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

  async function handleUserPrompt(
    identity: UserIdentity,
    message: FeishuInboundMessage,
  ): Promise<void> {
    const openId = identity.openId;
    const messageId = message.messageId;
    let lockAcquired = false;
    if (deps.runtimeState.isDraining()) {
      await deps.messenger.sendTextMessage(openId, "网关正在重启，暂时不接新任务，请稍后再试。");
      return;
    }

    if (!deps.runtimeState.acquireLock(openId, messageId)) {
      if (deps.runtimeState.isDraining()) {
        await deps.messenger.sendTextMessage(openId, "网关正在重启，暂时不接新任务，请稍后再试。");
        return;
      }
      logger.info("用户消息因已有处理中任务被忽略", { openId, messageId });
      return;
    }
    lockAcquired = true;

    try {
      const { activeSessionId, piSession } = await deps.sessionService.getOrCreateActiveSession(identity);
      const stoppedBeforePrompt = await deps.runtimeState.setAbortHandler(
        openId,
        messageId,
        async () => {
          await piSession.abort();
        },
      );
      if (stoppedBeforePrompt) {
        logger.info("任务启动前收到停止请求，已跳过 prompt", { openId, messageId });
        return;
      }

      const enrichedMessage = await attachQuotedMessage(message, quotedMessageStore, readQuotedMessage);
      const processingReactionType = deps.runtimeConfig
        ? deps.runtimeConfig.getProcessingReactionType()
        : deps.config.FEISHU_PROCESSING_REACTION_TYPE;
      const streamingEnabled = deps.runtimeConfig
        ? deps.runtimeConfig.getStreamingEnabled()
        : deps.config.STREAMING_ENABLED;
      const promptInput = await preparePromptInput(enrichedMessage, piSession, buildPromptPreparationOptions(identity), {
        downloadResource: deps.downloadResource,
      });
      if (deps.runtimeState.isStopRequested(openId, messageId)) {
        logger.info("prompt 输入准备完成前收到停止请求，已跳过 prompt", { openId, messageId });
        return;
      }

      const logCtx = { openId, sessionId: activeSessionId, messageId };
      const result = await deps.promptRunner.promptSession(
        piSession,
        promptInput,
        openId,
        messageId,
        processingReactionType,
        streamingEnabled,
        deps.config.TEXT_CHUNK_LIMIT,
        deps.config.PI_SHOW_TOOL_CALLS_IN_REPLY,
        undefined,
        () => deps.runtimeState.isStopRequested(openId, messageId),
      );

      if (result.error && !result.text && !result.aborted && !result.displayed) {
        await deps.messenger.sendTextMessage(openId, formatError(result.error));
      }

      await deps.sessionService.touchSession(openId, messageId);
      logger.info("Pi prompt 完成", logCtx);
    } catch (err) {
      logger.error("Pi prompt 处理失败", { openId, messageId, error: String(err) });
      await deps.messenger.sendTextMessage(
        openId,
        formatError(formatPromptPreparationError(err) ?? "处理失败，请稍后重试或使用 /new 新建会话"),
      );
    } finally {
      if (lockAcquired) {
        deps.runtimeState.releaseLock(openId);
        await deps.deferredCronRunService?.flush(openId);
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
    if (deps.runtimeState.isDraining()) {
      return "not_running";
    }

    let activeSessionId = "unknown";
    let piSession: Awaited<ReturnType<SessionService["getOrCreateActiveSession"]>>["piSession"];
    try {
      const sessionState = await deps.sessionService.getOrCreateActiveSession(identity);
      activeSessionId = sessionState.activeSessionId;
      piSession = sessionState.piSession;
    } catch (error) {
      logger.warn("获取运行中 Pi session 失败，退回普通队列", { openId, messageId, error: String(error) });
      return "not_running";
    }

    if (!piSession.isStreaming) {
      return "not_running";
    }

    let promptText: string;
    try {
      const enrichedMessage = await attachQuotedMessage(message, quotedMessageStore, readQuotedMessage);
      const promptInput = await preparePromptInput(enrichedMessage, piSession, buildPromptPreparationOptions(identity), {
        downloadResource: deps.downloadResource,
      });
      promptText = promptInput.text;
      if (behavior === "followUp") {
        await piSession.followUp(promptInput.text, promptInput.images);
      } else {
        await piSession.steer(promptInput.text, promptInput.images);
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
      await deps.sessionService.touchSession(openId, messageId);
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

  return {
    handleUserPrompt,
    queueRunningPrompt,
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
