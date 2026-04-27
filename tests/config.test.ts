import { afterEach, describe, expect, it, vi } from "vitest";

const ORIGINAL_ENV = process.env;

function applyBaseEnv(extraEnv?: Record<string, string | undefined>) {
  process.env = {
    ...ORIGINAL_ENV,
    FEISHU_APP_ID: "cli_test_app_id",
    FEISHU_APP_SECRET: "test_secret",
    STREAMING_ENABLED: undefined,
    PI_DISABLE_GLOBAL_AGENTS: undefined,
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

  it("默认的 FEISHU_STEERING_REACTION_TYPE 应保留", async () => {
    applyBaseEnv();
    const { loadConfig } = await import("../src/config.js");

    expect(loadConfig().FEISHU_STEERING_REACTION_TYPE).toBe("OnIt");
  });

  it("非法的 FEISHU_STEERING_REACTION_TYPE 应自动禁用", async () => {
    applyBaseEnv({ FEISHU_STEERING_REACTION_TYPE: "EYES" });
    const { loadConfig } = await import("../src/config.js");

    expect(loadConfig().FEISHU_STEERING_REACTION_TYPE).toBeUndefined();
  });

  it("STREAMING_ENABLED 默认应为 false", async () => {
    applyBaseEnv();
    const { loadConfig } = await import("../src/config.js");

    expect(loadConfig().STREAMING_ENABLED).toBe(false);
  });

  it("PI_DISABLE_GLOBAL_AGENTS 默认应为 false", async () => {
    applyBaseEnv();
    const { loadConfig } = await import("../src/config.js");

    expect(loadConfig().PI_DISABLE_GLOBAL_AGENTS).toBe(false);
  });

  it("CRON 默认应启用并使用上海时区", async () => {
    applyBaseEnv();
    const { loadConfig } = await import("../src/config.js");

    const config = loadConfig();
    expect(config.CRON_ENABLED).toBe(true);
    expect(config.CRON_DEFAULT_TZ).toBe("Asia/Shanghai");
  });

  it("群聊配置默认应关闭并使用 mention 模式", async () => {
    applyBaseEnv();
    const { loadConfig } = await import("../src/config.js");

    const config = loadConfig();
    expect(config.FEISHU_GROUP_CHAT_POLICY).toBe("disabled");
    expect(config.FEISHU_GROUP_CHAT_ALLOWLIST).toEqual([]);
    expect(config.FEISHU_GROUP_MESSAGE_MODE).toBe("mention");
  });

  it("群聊 allowlist 应按逗号解析", async () => {
    applyBaseEnv({
      FEISHU_GROUP_CHAT_POLICY: "allowlist",
      FEISHU_GROUP_CHAT_ALLOWLIST: "oc_1, oc_2,,",
      FEISHU_GROUP_MESSAGE_MODE: "all",
      FEISHU_BOT_OPEN_ID: " ou_bot_1 ",
    });
    const { loadConfig } = await import("../src/config.js");

    const config = loadConfig();
    expect(config.FEISHU_GROUP_CHAT_POLICY).toBe("allowlist");
    expect(config.FEISHU_GROUP_CHAT_ALLOWLIST).toEqual(["oc_1", "oc_2"]);
    expect(config.FEISHU_GROUP_MESSAGE_MODE).toBe("all");
    expect(config.FEISHU_BOT_OPEN_ID).toBe("ou_bot_1");
  });

  it("PI_DISABLE_GLOBAL_AGENTS=true 时应禁用全局 context 文件", async () => {
    applyBaseEnv({ PI_DISABLE_GLOBAL_AGENTS: "true" });
    const { loadConfig } = await import("../src/config.js");

    expect(loadConfig().PI_DISABLE_GLOBAL_AGENTS).toBe(true);
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

  it("SenseVoice Python 和模型路径里的 ~ 应展开成 home 目录", async () => {
    applyBaseEnv({
      HOME: "/tmp/test-home",
      FEISHU_AUDIO_TRANSCRIBE_PROVIDER: "sensevoice",
      FEISHU_AUDIO_TRANSCRIBE_SENSEVOICE_PYTHON: "~/.venv-sensevoice/bin/python",
      FEISHU_AUDIO_TRANSCRIBE_SENSEVOICE_MODEL: "~/.cache/modelscope/iic/SenseVoiceSmall",
    });
    const { loadConfig } = await import("../src/config.js");

    const config = loadConfig();
    expect(config.FEISHU_AUDIO_TRANSCRIBE_PROVIDER).toBe("sensevoice");
    expect(config.FEISHU_AUDIO_TRANSCRIBE_SENSEVOICE_PYTHON).toBe(
      "/tmp/test-home/.venv-sensevoice/bin/python",
    );
    expect(config.FEISHU_AUDIO_TRANSCRIBE_SENSEVOICE_MODEL).toBe(
      "/tmp/test-home/.cache/modelscope/iic/SenseVoiceSmall",
    );
  });

  it("豆包 provider 和 API Key 应能正常读取", async () => {
    applyBaseEnv({
      FEISHU_AUDIO_TRANSCRIBE_PROVIDER: "doubao",
      FEISHU_AUDIO_TRANSCRIBE_DOUBAO_API_KEY: "test-doubao-key",
    });
    const { loadConfig } = await import("../src/config.js");

    const config = loadConfig();
    expect(config.FEISHU_AUDIO_TRANSCRIBE_PROVIDER).toBe("doubao");
    expect(config.FEISHU_AUDIO_TRANSCRIBE_DOUBAO_API_KEY).toBe("test-doubao-key");
  });
});
