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

  it("应允许更新群聊开关、模式、白名单和关键词", () => {
    const store = createRuntimeConfigStore({
      FEISHU_GROUP_CHAT_POLICY: "open",
      FEISHU_GROUP_CHAT_ALLOWLIST: ["oc_1"],
      FEISHU_GROUP_MESSAGE_MODE: "mention",
      FEISHU_GROUP_MESSAGE_KEYWORDS: ["Pi"],
      FEISHU_BOT_OPEN_ID: "ou_bot_1",
    });

    store.setGroupChatPolicy("allowlist");
    store.setGroupChatAllowlist(["oc_1", "oc_2", "oc_2"]);
    store.setGroupMessageMode("keyword");
    store.setGroupMessageKeywords(["日报", "日报", "小助手"]);

    expect(store.getGroupChatPolicy()).toBe("allowlist");
    expect(store.getGroupChatAllowlist()).toEqual(["oc_1", "oc_2"]);
    expect(store.getGroupMessageMode()).toBe("keyword");
    expect(store.getGroupMessageKeywords()).toEqual(["日报", "小助手"]);
    expect(store.getGroupRoutingConfig()).toEqual({
      FEISHU_GROUP_CHAT_POLICY: "allowlist",
      FEISHU_GROUP_CHAT_ALLOWLIST: ["oc_1", "oc_2"],
      FEISHU_GROUP_MESSAGE_MODE: "keyword",
      FEISHU_GROUP_MESSAGE_KEYWORDS: ["日报", "小助手"],
      FEISHU_BOT_OPEN_ID: "ou_bot_1",
    });
  });
});
