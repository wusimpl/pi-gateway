import type { Config } from "../config.js";

type AudioTranscribeProvider = Config["FEISHU_AUDIO_TRANSCRIBE_PROVIDER"];
type GroupChatPolicy = Config["FEISHU_GROUP_CHAT_POLICY"];
type GroupMessageMode = Config["FEISHU_GROUP_MESSAGE_MODE"];

export interface RuntimeConfigStore {
  getAudioTranscribeProvider(): AudioTranscribeProvider;
  setAudioTranscribeProvider(provider: AudioTranscribeProvider): void;
  getStreamingEnabled(): boolean;
  setStreamingEnabled(enabled: boolean): void;
  getGroupChatPolicy(): GroupChatPolicy;
  setGroupChatPolicy(policy: GroupChatPolicy): void;
  getGroupChatAllowlist(): string[];
  setGroupChatAllowlist(chatIds: string[]): void;
  getGroupMessageMode(): GroupMessageMode;
  setGroupMessageMode(mode: GroupMessageMode): void;
  getGroupMessageKeywords(): string[];
  setGroupMessageKeywords(keywords: string[]): void;
  getGroupRoutingConfig(): Pick<
    Config,
    | "FEISHU_GROUP_CHAT_POLICY"
    | "FEISHU_GROUP_CHAT_ALLOWLIST"
    | "FEISHU_GROUP_MESSAGE_MODE"
    | "FEISHU_GROUP_MESSAGE_KEYWORDS"
    | "FEISHU_BOT_OPEN_ID"
  >;
  getProcessingReactionType(): string | undefined;
  getSteeringReactionType(): string | undefined;
  enableProcessingReaction(): string | undefined;
  disableProcessingReaction(): void;
}

export function createRuntimeConfigStore(
  config: Partial<
    Pick<
      Config,
      | "FEISHU_AUDIO_TRANSCRIBE_PROVIDER"
      | "STREAMING_ENABLED"
      | "FEISHU_GROUP_CHAT_POLICY"
      | "FEISHU_GROUP_CHAT_ALLOWLIST"
      | "FEISHU_GROUP_MESSAGE_MODE"
      | "FEISHU_GROUP_MESSAGE_KEYWORDS"
      | "FEISHU_BOT_OPEN_ID"
      | "FEISHU_PROCESSING_REACTION_TYPE"
      | "FEISHU_STEERING_REACTION_TYPE"
    >
  >,
): RuntimeConfigStore {
  let audioTranscribeProvider: AudioTranscribeProvider =
    config.FEISHU_AUDIO_TRANSCRIBE_PROVIDER ?? "whisper";
  let streamingEnabled = config.STREAMING_ENABLED ?? false;
  let groupChatPolicy: GroupChatPolicy = config.FEISHU_GROUP_CHAT_POLICY ?? "disabled";
  let groupChatAllowlist = normalizeStringList(config.FEISHU_GROUP_CHAT_ALLOWLIST ?? []);
  let groupMessageMode: GroupMessageMode = config.FEISHU_GROUP_MESSAGE_MODE ?? "mention";
  let groupMessageKeywords = normalizeStringList(config.FEISHU_GROUP_MESSAGE_KEYWORDS ?? []);
  const groupBotOpenId = config.FEISHU_BOT_OPEN_ID;
  const defaultProcessingReactionType = config.FEISHU_PROCESSING_REACTION_TYPE;
  const steeringReactionType = config.FEISHU_STEERING_REACTION_TYPE;
  let processingReactionType = defaultProcessingReactionType;

  function getAudioTranscribeProvider(): AudioTranscribeProvider {
    return audioTranscribeProvider;
  }

  function setAudioTranscribeProvider(provider: AudioTranscribeProvider): void {
    audioTranscribeProvider = provider;
  }

  function getStreamingEnabled(): boolean {
    return streamingEnabled;
  }

  function setStreamingEnabled(enabled: boolean): void {
    streamingEnabled = enabled;
  }

  function getGroupChatPolicy(): GroupChatPolicy {
    return groupChatPolicy;
  }

  function setGroupChatPolicy(policy: GroupChatPolicy): void {
    groupChatPolicy = policy;
  }

  function getGroupChatAllowlist(): string[] {
    return [...groupChatAllowlist];
  }

  function setGroupChatAllowlist(chatIds: string[]): void {
    groupChatAllowlist = normalizeStringList(chatIds);
  }

  function getGroupMessageMode(): GroupMessageMode {
    return groupMessageMode;
  }

  function setGroupMessageMode(mode: GroupMessageMode): void {
    groupMessageMode = mode;
  }

  function getGroupMessageKeywords(): string[] {
    return [...groupMessageKeywords];
  }

  function setGroupMessageKeywords(keywords: string[]): void {
    groupMessageKeywords = normalizeStringList(keywords);
  }

  function getGroupRoutingConfig(): Pick<
    Config,
    | "FEISHU_GROUP_CHAT_POLICY"
    | "FEISHU_GROUP_CHAT_ALLOWLIST"
    | "FEISHU_GROUP_MESSAGE_MODE"
    | "FEISHU_GROUP_MESSAGE_KEYWORDS"
    | "FEISHU_BOT_OPEN_ID"
  > {
    return {
      FEISHU_GROUP_CHAT_POLICY: groupChatPolicy,
      FEISHU_GROUP_CHAT_ALLOWLIST: getGroupChatAllowlist(),
      FEISHU_GROUP_MESSAGE_MODE: groupMessageMode,
      FEISHU_GROUP_MESSAGE_KEYWORDS: getGroupMessageKeywords(),
      FEISHU_BOT_OPEN_ID: groupBotOpenId,
    };
  }

  function getProcessingReactionType(): string | undefined {
    return processingReactionType;
  }

  function getSteeringReactionType(): string | undefined {
    return steeringReactionType;
  }

  function enableProcessingReaction(): string | undefined {
    if (!defaultProcessingReactionType) {
      return undefined;
    }
    processingReactionType = defaultProcessingReactionType;
    return processingReactionType;
  }

  function disableProcessingReaction(): void {
    processingReactionType = undefined;
  }

  return {
    getAudioTranscribeProvider,
    setAudioTranscribeProvider,
    getStreamingEnabled,
    setStreamingEnabled,
    getGroupChatPolicy,
    setGroupChatPolicy,
    getGroupChatAllowlist,
    setGroupChatAllowlist,
    getGroupMessageMode,
    setGroupMessageMode,
    getGroupMessageKeywords,
    setGroupMessageKeywords,
    getGroupRoutingConfig,
    getProcessingReactionType,
    getSteeringReactionType,
    enableProcessingReaction,
    disableProcessingReaction,
  };
}

function normalizeStringList(items: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const item of items) {
    const normalized = item.trim();
    if (!normalized || seen.has(normalized)) {
      continue;
    }
    seen.add(normalized);
    result.push(normalized);
  }
  return result;
}
