import { afterEach, describe, expect, it, vi } from "vitest";

const ORIGINAL_ENV = process.env;

function applyBaseEnv(extraEnv?: Record<string, string | undefined>) {
  process.env = {
    ...ORIGINAL_ENV,
    FEISHU_APP_ID: "cli_test_app_id",
    FEISHU_APP_SECRET: "test_secret",
    STREAMING_ENABLED: undefined,
    PI_DISABLE_GLOBAL_AGENTS: undefined,
    PI_GATEWAY_AGENTS_FILE: undefined,
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

  it("后台管理默认只监听本机", async () => {
    applyBaseEnv();
    const { loadConfig } = await import("../src/config.js");

    const config = loadConfig();
    expect(config.ADMIN_HOST).toBe("127.0.0.1");
    expect(config.ADMIN_PORT).toBe(8787);
    expect(config.ADMIN_PASSWORD).toBe("admin");
  });

  it("群聊 allowlist 应按逗号解析", async () => {
    applyBaseEnv({
      FEISHU_GROUP_CHAT_POLICY: "allowlist",
      FEISHU_GROUP_CHAT_ALLOWLIST: "oc_1, oc_2,,",
      FEISHU_GROUP_MESSAGE_MODE: "all",
      FEISHU_BOT_OPEN_ID: " ou_bot_1 ",
      FEISHU_OWNER_OPEN_IDS: "ou_owner_1, ou_owner_2",
    });
    const { loadConfig } = await import("../src/config.js");

    const config = loadConfig();
    expect(config.FEISHU_GROUP_CHAT_POLICY).toBe("allowlist");
    expect(config.FEISHU_GROUP_CHAT_ALLOWLIST).toEqual(["oc_1", "oc_2"]);
    expect(config.FEISHU_GROUP_MESSAGE_MODE).toBe("all");
    expect(config.FEISHU_BOT_OPEN_ID).toBe("ou_bot_1");
    expect(config.FEISHU_OWNER_OPEN_IDS).toEqual(["ou_owner_1", "ou_owner_2"]);
  });

  it("keyword 模式关键词应按空白分隔", async () => {
    applyBaseEnv({
      FEISHU_GROUP_MESSAGE_MODE: "keyword",
      FEISHU_GROUP_MESSAGE_KEYWORDS: "Pi  小助手\n日报",
    });
    const { loadConfig } = await import("../src/config.js");

    const config = loadConfig();
    expect(config.FEISHU_GROUP_MESSAGE_MODE).toBe("keyword");
    expect(config.FEISHU_GROUP_MESSAGE_KEYWORDS).toEqual(["Pi", "小助手", "日报"]);
  });

  it("PI_DISABLE_GLOBAL_AGENTS=true 时应禁用全局 context 文件", async () => {
    applyBaseEnv({ PI_DISABLE_GLOBAL_AGENTS: "true" });
    const { loadConfig } = await import("../src/config.js");

    expect(loadConfig().PI_DISABLE_GLOBAL_AGENTS).toBe(true);
  });

  it("PI_GATEWAY_AGENTS_FILE 默认应指向飞书网关专属规则文件并展开 ~", async () => {
    applyBaseEnv({ HOME: "/tmp/test-home" });
    const { loadConfig } = await import("../src/config.js");

    expect(loadConfig().PI_GATEWAY_AGENTS_FILE).toBe(
      "/tmp/test-home/.pi/feishu-gateway/AGENTS.md",
    );
  });

  it("PI_GATEWAY_AGENTS_FILE 应支持自定义路径并展开 ~", async () => {
    applyBaseEnv({
      HOME: "/tmp/test-home",
      PI_GATEWAY_AGENTS_FILE: "~/custom/gateway.md",
    });
    const { loadConfig } = await import("../src/config.js");

    expect(loadConfig().PI_GATEWAY_AGENTS_FILE).toBe("/tmp/test-home/custom/gateway.md");
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
