import type { Config } from "../config.js";

type AudioTranscribeProvider = Config["FEISHU_AUDIO_TRANSCRIBE_PROVIDER"];

export interface RuntimeConfigStore {
  getAudioTranscribeProvider(): AudioTranscribeProvider;
  setAudioTranscribeProvider(provider: AudioTranscribeProvider): void;
  getStreamingEnabled(): boolean;
  setStreamingEnabled(enabled: boolean): void;
  getProcessingReactionType(): string | undefined;
  enableProcessingReaction(): string | undefined;
  disableProcessingReaction(): void;
}

export function createRuntimeConfigStore(
  config: Partial<
    Pick<
      Config,
      | "FEISHU_AUDIO_TRANSCRIBE_PROVIDER"
      | "STREAMING_ENABLED"
      | "FEISHU_PROCESSING_REACTION_TYPE"
    >
  >,
): RuntimeConfigStore {
  let audioTranscribeProvider: AudioTranscribeProvider =
    config.FEISHU_AUDIO_TRANSCRIBE_PROVIDER ?? "whisper";
  let streamingEnabled = config.STREAMING_ENABLED ?? false;
  const defaultProcessingReactionType = config.FEISHU_PROCESSING_REACTION_TYPE;
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

  function getProcessingReactionType(): string | undefined {
    return processingReactionType;
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
    getProcessingReactionType,
    enableProcessingReaction,
    disableProcessingReaction,
  };
}
