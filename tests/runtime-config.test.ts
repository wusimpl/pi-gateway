import { describe, expect, it } from "vitest";
import { createRuntimeConfigStore } from "../src/app/runtime-config.js";

describe("createRuntimeConfigStore", () => {
  it("应允许切换 stt provider 和 stream 开关", () => {
    const store = createRuntimeConfigStore({
      FEISHU_AUDIO_TRANSCRIBE_PROVIDER: "whisper",
      STREAMING_ENABLED: true,
      FEISHU_PROCESSING_REACTION_TYPE: "SMILE",
      FEISHU_STEERING_REACTION_TYPE: "OnIt",
    });

    store.setAudioTranscribeProvider("doubao");
    store.setStreamingEnabled(false);

    expect(store.getAudioTranscribeProvider()).toBe("doubao");
    expect(store.getStreamingEnabled()).toBe(false);
  });

  it("reaction off 后应清空，on 时应恢复到 .env 默认值", () => {
    const store = createRuntimeConfigStore({
      FEISHU_PROCESSING_REACTION_TYPE: "SMILE",
      FEISHU_STEERING_REACTION_TYPE: "OnIt",
    });

    store.disableProcessingReaction();
    expect(store.getProcessingReactionType()).toBeUndefined();

    expect(store.enableProcessingReaction()).toBe("SMILE");
    expect(store.getProcessingReactionType()).toBe("SMILE");
    expect(store.getSteeringReactionType()).toBe("OnIt");
  });

  it("未配置默认 reaction 时不应开启成功", () => {
    const store = createRuntimeConfigStore({});

    expect(store.enableProcessingReaction()).toBeUndefined();
    expect(store.getProcessingReactionType()).toBeUndefined();
  });
});
