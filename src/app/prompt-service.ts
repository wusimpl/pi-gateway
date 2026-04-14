import type { Config } from "../config.js";
import { formatError } from "../feishu/format.js";
import { downloadFeishuResource } from "../feishu/inbound/resource.js";
import { prepareFeishuPromptInput } from "../feishu/inbound/transform.js";
import type { FeishuInboundMessage } from "../feishu/inbound/types.js";
import type { FeishuMessenger } from "../feishu/send.js";
import type { PromptRunner } from "../pi/stream.js";
import type { SessionService } from "../pi/sessions.js";
import type { WorkspaceService } from "../pi/workspace.js";
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
    | "FEISHU_AUDIO_TRANSCRIBE_SCRIPT"
    | "FEISHU_AUDIO_TRANSCRIBE_LANGUAGE"
    | "FEISHU_PROCESSING_REACTION_TYPE"
    | "STREAMING_ENABLED"
    | "TEXT_CHUNK_LIMIT"
  >;
  runtimeState: Pick<RuntimeStateStore, "acquireLock" | "releaseLock">;
  sessionService: Pick<SessionService, "getOrCreateActiveSession" | "touchSession">;
  workspaceService: Pick<WorkspaceService, "getUserWorkspaceDir">;
  promptRunner: Pick<PromptRunner, "promptSession">;
  messenger: Pick<FeishuMessenger, "sendTextMessage">;
  downloadResource?: typeof downloadFeishuResource;
  preparePromptInput?: typeof prepareFeishuPromptInput;
}

export function createPromptService(deps: PromptServiceDeps): PromptService {
  const preparePromptInput = deps.preparePromptInput ?? prepareFeishuPromptInput;

  async function handleUserPrompt(
    identity: UserIdentity,
    message: FeishuInboundMessage,
  ): Promise<void> {
    const openId = identity.openId;
    const messageId = message.messageId;
    if (!deps.runtimeState.acquireLock(openId, messageId)) {
      logger.info("用户消息因已有处理中任务被忽略", { openId, messageId });
      return;
    }

    try {
      const { activeSessionId, piSession } = await deps.sessionService.getOrCreateActiveSession(identity);
      const promptInput = await preparePromptInput(message, piSession, {
        workspaceDir: deps.workspaceService.getUserWorkspaceDir(identity),
        ollamaBaseUrl: deps.config.FEISHU_MEDIA_OLLAMA_BASE_URL,
        ocrModel: deps.config.FEISHU_MEDIA_OCR_MODEL,
        audioTranscribeScript: deps.config.FEISHU_AUDIO_TRANSCRIBE_SCRIPT,
        audioLanguage: deps.config.FEISHU_AUDIO_TRANSCRIBE_LANGUAGE,
      }, {
        downloadResource: deps.downloadResource,
      });

      const logCtx = { openId, sessionId: activeSessionId, messageId };
      const result = await deps.promptRunner.promptSession(
        piSession,
        promptInput,
        openId,
        messageId,
        deps.config.FEISHU_PROCESSING_REACTION_TYPE,
        deps.config.STREAMING_ENABLED,
        deps.config.TEXT_CHUNK_LIMIT,
      );

      if (result.error && !result.text) {
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
