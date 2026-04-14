import { afterEach, describe, expect, it, vi } from "vitest";

const ORIGINAL_ENV = process.env;

function applyBaseEnv(extraEnv?: Record<string, string | undefined>) {
  process.env = {
    ...ORIGINAL_ENV,
    FEISHU_APP_ID: "cli_test_app_id",
    FEISHU_APP_SECRET: "test_secret",
    ...extraEnv,
  };
}

describe("loadConfig", () => {
  afterEach(() => {
    process.env = ORIGINAL_ENV;
    vi.resetModules();
  });

  it("合法的 FEISHU_PROCESSING_REACTION_TYPE 应保留", async () => {
    applyBaseEnv({ FEISHU_PROCESSING_REACTION_TYPE: "SMILE" });
    const { loadConfig } = await import("../src/config.js");

    expect(loadConfig().FEISHU_PROCESSING_REACTION_TYPE).toBe("SMILE");
  });

  it("非法的 FEISHU_PROCESSING_REACTION_TYPE 应自动禁用", async () => {
    applyBaseEnv({ FEISHU_PROCESSING_REACTION_TYPE: "EYES" });
    const { loadConfig } = await import("../src/config.js");

    expect(loadConfig().FEISHU_PROCESSING_REACTION_TYPE).toBeUndefined();
  });

  it("音频转写脚本路径里的 ~ 应展开成 home 目录", async () => {
    applyBaseEnv({
      HOME: "/tmp/test-home",
      FEISHU_AUDIO_TRANSCRIBE_SCRIPT: "~/.openclaw/skills/audio-transcribe/transcribe.sh",
    });
    const { loadConfig } = await import("../src/config.js");

    expect(loadConfig().FEISHU_AUDIO_TRANSCRIBE_SCRIPT).toBe(
      "/tmp/test-home/.openclaw/skills/audio-transcribe/transcribe.sh",
    );
  });
});
