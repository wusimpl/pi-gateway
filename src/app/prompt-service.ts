import type { Config } from "../config.js";
import { formatError } from "../feishu/format.js";
import { readFeishuQuotedMessage } from "../feishu/inbound/message.js";
import { downloadFeishuResource } from "../feishu/inbound/resource.js";
import { prepareFeishuPromptInput } from "../feishu/inbound/transform.js";
import type { FeishuInboundMessage } from "../feishu/inbound/types.js";
import type { FeishuMessenger } from "../feishu/send.js";
import type { PromptRunner } from "../pi/stream.js";
import type { SessionService } from "../pi/sessions.js";
import type { WorkspaceService } from "../pi/workspace.js";
import type { QuotedMessageStore } from "../storage/quoted-messages.js";
import { readQuotedMessage as readCachedQuotedMessage } from "../storage/quoted-messages.js";
import type { UserIdentity } from "../types.js";
import { logger } from "./logger.js";
import type { RuntimeStateStore } from "./state.js";

export interface PromptService {
  handleUserPrompt(identity: UserIdentity, message: FeishuInboundMessage): Promise<void>;
}

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
}

export function createPromptService(deps: PromptServiceDeps): PromptService {
  const preparePromptInput = deps.preparePromptInput ?? prepareFeishuPromptInput;
  const readQuotedMessage = deps.readQuotedMessage ?? readFeishuQuotedMessage;
  const quotedMessageStore = deps.quotedMessageStore ?? {
    readQuotedMessage: readCachedQuotedMessage,
  };

  async function handleUserPrompt(
    identity: UserIdentity,
    message: FeishuInboundMessage,
  ): Promise<void> {
    const openId = identity.openId;
    const messageId = message.messageId;
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
      const promptInput = await preparePromptInput(enrichedMessage, piSession, {
        workspaceDir: deps.workspaceService.getUserWorkspaceDir(identity),
        ollamaBaseUrl: deps.config.FEISHU_MEDIA_OLLAMA_BASE_URL,
        ocrModel: deps.config.FEISHU_MEDIA_OCR_MODEL,
        audioTranscribeProvider: deps.config.FEISHU_AUDIO_TRANSCRIBE_PROVIDER,
        audioTranscribeScript: deps.config.FEISHU_AUDIO_TRANSCRIBE_SCRIPT,
        audioLanguage: deps.config.FEISHU_AUDIO_TRANSCRIBE_LANGUAGE,
        audioTranscribeSenseVoicePython: deps.config.FEISHU_AUDIO_TRANSCRIBE_SENSEVOICE_PYTHON,
        audioTranscribeSenseVoiceModel: deps.config.FEISHU_AUDIO_TRANSCRIBE_SENSEVOICE_MODEL,
        audioTranscribeSenseVoiceDevice: deps.config.FEISHU_AUDIO_TRANSCRIBE_SENSEVOICE_DEVICE,
      }, {
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
        deps.config.FEISHU_PROCESSING_REACTION_TYPE,
        deps.config.STREAMING_ENABLED,
        deps.config.TEXT_CHUNK_LIMIT,
        deps.config.PI_SHOW_TOOL_CALLS_IN_REPLY,
        undefined,
        () => deps.runtimeState.isStopRequested(openId, messageId),
      );

      if (result.error && !result.text && !result.aborted) {
        await deps.messenger.sendTextMessage(openId, formatError(result.error));
      }

      await deps.sessionService.touchSession(openId, messageId);
      logger.info("Pi prompt 完成", logCtx);
    } catch (err) {
      logger.error("Pi prompt 处理失败", { openId, messageId, error: String(err) });
      await deps.messenger.sendTextMessage(openId, formatError("处理失败，请稍后重试或使用 /new 新建会话"));
    } finally {
      deps.runtimeState.releaseLock(openId);
    }
  }

  return {
    handleUserPrompt,
  };
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
