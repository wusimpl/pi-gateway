import type { ConversationTarget } from "../../conversation.js";
import type { RuntimeConfigStore } from "../runtime-config.js";
import type { UserIdentity, UserState } from "../../types.js";
import { handleBridgeCommand, type BridgeCommand } from "../commands.js";
import {
  getCurrentModelLabel,
  getCurrentThinkingLevel,
} from "./helpers.js";
import {
  parseOnOffArgs,
  parseSettingsArgs,
  parseSttProviderArgs,
} from "./parsers.js";
import type { CommandReplySender, TargetStateAccess } from "./types.js";

interface SettingsCommandHandlersDeps extends TargetStateAccess {
  doubaoApiKey: string;
  runtimeConfig?: Pick<
    RuntimeConfigStore,
    | "getStreamingEnabled"
    | "setAudioTranscribeProvider"
    | "setStreamingEnabled"
    | "enableProcessingReaction"
    | "disableProcessingReaction"
  >;
  sendTextReply: CommandReplySender;
  sendCommandReply: CommandReplySender;
}

export function createSettingsCommandHandlers(deps: SettingsCommandHandlersDeps) {
  async function handleSettingsCommand(
    identity: UserIdentity,
    command: BridgeCommand,
    conversationTarget?: ConversationTarget,
  ): Promise<void> {
    const openId = identity.openId;
    const parsed = parseSettingsArgs(command.args);
    if (parsed.error) {
      await deps.sendTextReply(identity, conversationTarget, parsed.error);
      return;
    }

    const sessionState = await deps.getActiveSession(identity, conversationTarget);
    const userState = (await deps.readTargetState(identity, conversationTarget)) ?? {
      activeSessionId: sessionState.activeSessionId,
      piSessionFile: sessionState.piSession.sessionFile ?? undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
    } satisfies UserState;

    if (parsed.kind === "show") {
      const reply = handleBridgeCommand(command, {
        openId,
        currentModel: getCurrentModelLabel(sessionState.piSession),
        currentThinkingLevel: userState.thinkingLevel ?? getCurrentThinkingLevel(sessionState.piSession),
        streamingEnabled: userState.streamingEnabled ?? deps.runtimeConfig?.getStreamingEnabled() ?? false,
      });
      await deps.sendCommandReply(identity, conversationTarget, reply);
      return;
    }

    if (parsed.kind === "think") {
      userState.thinkingLevel = parsed.level;
      userState.updatedAt = new Date().toISOString();
      await deps.writeTargetState(identity, conversationTarget, userState);
      sessionState.piSession.setThinkingLevel!(parsed.level);
      const effectiveThinkingLevel = getCurrentThinkingLevel(sessionState.piSession);
      const reply = handleBridgeCommand(command, {
        openId,
        currentModel: getCurrentModelLabel(sessionState.piSession),
        currentThinkingLevel: effectiveThinkingLevel,
        requestedThinkingLevel: parsed.level,
        effectiveThinkingLevel,
      });
      await deps.sendCommandReply(identity, conversationTarget, reply);
      return;
    }

    if (parsed.kind !== "stream") {
      await deps.sendTextReply(identity, conversationTarget, "settings 参数解析失败。");
      return;
    }

    userState.streamingEnabled = parsed.enabled;
    userState.updatedAt = new Date().toISOString();
    await deps.writeTargetState(identity, conversationTarget, userState);
    const reply = handleBridgeCommand(command, {
      openId,
      streamingEnabled: parsed.enabled,
    });
    await deps.sendCommandReply(identity, conversationTarget, reply);
  }

  async function handleSttCommand(
    identity: UserIdentity,
    command: BridgeCommand,
    conversationTarget?: ConversationTarget,
  ): Promise<void> {
    if (!deps.runtimeConfig) {
      await deps.sendTextReply(identity, conversationTarget, "当前环境不支持这个命令。");
      return;
    }

    const parsed = parseSttProviderArgs(command.args);
    if (parsed.error) {
      await deps.sendTextReply(identity, conversationTarget, parsed.error);
      return;
    }

    if (!parsed.provider) {
      await deps.sendTextReply(identity, conversationTarget, "语音转写 provider 解析失败。");
      return;
    }

    if (parsed.provider === "doubao" && !deps.doubaoApiKey.trim()) {
      await deps.sendTextReply(
        identity,
        conversationTarget,
        "当前 .env 里没配置 FEISHU_AUDIO_TRANSCRIBE_DOUBAO_API_KEY，不能切到 doubao。",
      );
      return;
    }

    deps.runtimeConfig.setAudioTranscribeProvider(parsed.provider);
    await deps.sendCommandReply(identity, conversationTarget, `✅ 语音转写已切到 ${parsed.provider}。`);
  }

  async function handleStreamCommand(
    identity: UserIdentity,
    command: BridgeCommand,
    conversationTarget?: ConversationTarget,
  ): Promise<void> {
    if (!deps.runtimeConfig) {
      await deps.sendTextReply(identity, conversationTarget, "当前环境不支持这个命令。");
      return;
    }

    const parsed = parseOnOffArgs(command.args, "stream");
    if (parsed.error) {
      await deps.sendTextReply(identity, conversationTarget, parsed.error);
      return;
    }

    if (parsed.enabled === undefined) {
      await deps.sendTextReply(identity, conversationTarget, "stream 开关解析失败。");
      return;
    }

    deps.runtimeConfig.setStreamingEnabled(parsed.enabled);
    const action = parsed.enabled ? "开启" : "关闭";
    await deps.sendCommandReply(identity, conversationTarget, `✅ 已${action}流式回复。`);
  }

  async function handleReactionCommand(
    identity: UserIdentity,
    command: BridgeCommand,
    conversationTarget?: ConversationTarget,
  ): Promise<void> {
    if (!deps.runtimeConfig) {
      await deps.sendTextReply(identity, conversationTarget, "当前环境不支持这个命令。");
      return;
    }

    const parsed = parseOnOffArgs(command.args, "reaction");
    if (parsed.error) {
      await deps.sendTextReply(identity, conversationTarget, parsed.error);
      return;
    }

    if (!parsed.enabled) {
      deps.runtimeConfig.disableProcessingReaction();
      await deps.sendCommandReply(identity, conversationTarget, "✅ 已关闭处理中 reaction。");
      return;
    }

    const reactionType = deps.runtimeConfig.enableProcessingReaction();
    if (!reactionType) {
      await deps.sendTextReply(
        identity,
        conversationTarget,
        "当前 .env 里没配置 FEISHU_PROCESSING_REACTION_TYPE，不能开启 reaction。",
      );
      return;
    }

    await deps.sendCommandReply(identity, conversationTarget, `✅ 已开启处理中 reaction，表情继续使用 .env 里的 ${reactionType}。`);
  }

  return {
    handleSettingsCommand,
    handleSttCommand,
    handleStreamCommand,
    handleReactionCommand,
  };
}
