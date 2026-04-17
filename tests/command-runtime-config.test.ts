import { describe, expect, it, vi } from "vitest";
import { createCommandService } from "../src/app/command-service.js";
import { createRuntimeConfigStore } from "../src/app/runtime-config.js";

function createDeps(options: { doubaoApiKey?: string } = {}) {
  const messenger = {
    sendRenderedMessage: vi.fn().mockResolvedValue(undefined),
    sendTextMessage: vi.fn().mockResolvedValue(undefined),
  };
  const runtimeConfig = createRuntimeConfigStore({
    FEISHU_AUDIO_TRANSCRIBE_PROVIDER: "whisper",
    STREAMING_ENABLED: true,
    FEISHU_PROCESSING_REACTION_TYPE: "SMILE",
  });

  const service = createCommandService({
    config: {
      TEXT_CHUNK_LIMIT: 2000,
      CRON_DEFAULT_TZ: "Asia/Shanghai",
      FEISHU_AUDIO_TRANSCRIBE_DOUBAO_API_KEY: options.doubaoApiKey ?? "doubao-api-key",
      DATA_DIR: "/tmp/pi-gateway-data",
    },
    runtimeConfig,
    messenger,
    sessionService: {
      getOrCreateActiveSession: vi.fn(),
      createNewSession: vi.fn(),
      listSessions: vi.fn(),
      resumeSession: vi.fn(),
    },
    userStateStore: {
      readUserState: vi.fn(),
    },
    workspaceService: {
      getUserWorkspaceDir: vi.fn(),
    },
    runtimeState: {
      isLocked: vi.fn(),
      hasActiveLocks: vi.fn(),
      beginRestartDrain: vi.fn(),
      cancelRestartDrain: vi.fn(),
      requestStop: vi.fn(),
    },
    restartService: {
      restartGateway: vi.fn(),
    },
    listAvailableModels: vi.fn(),
    findAvailableModel: vi.fn(),
  });

  return {
    service,
    messenger,
    runtimeConfig,
  };
}

describe("command service runtime config", () => {
  it("/stt provider 会切换转写 provider", async () => {
    const { service, messenger, runtimeConfig } = createDeps();

    await service.handleBridgeCommand(
      { openId: "ou_1", userId: "u_1" },
      { name: "stt", args: "provider doubao" },
    );

    expect(runtimeConfig.getAudioTranscribeProvider()).toBe("doubao");
    expect(messenger.sendRenderedMessage).toHaveBeenCalledWith(
      "ou_1",
      "✅ 语音转写已切到 doubao。",
      2000,
    );
  });

  it("没配豆包 key 时不允许切到 doubao", async () => {
    const { service, messenger, runtimeConfig } = createDeps({ doubaoApiKey: "" });

    await service.handleBridgeCommand(
      { openId: "ou_1", userId: "u_1" },
      { name: "stt", args: "provider doubao" },
    );

    expect(runtimeConfig.getAudioTranscribeProvider()).toBe("whisper");
    expect(messenger.sendTextMessage).toHaveBeenCalledWith(
      "ou_1",
      "当前 .env 里没配置 FEISHU_AUDIO_TRANSCRIBE_DOUBAO_API_KEY，不能切到 doubao。",
    );
    expect(messenger.sendRenderedMessage).not.toHaveBeenCalled();
  });

  it("/stream off 会关闭流式回复", async () => {
    const { service, messenger, runtimeConfig } = createDeps();

    await service.handleBridgeCommand(
      { openId: "ou_1", userId: "u_1" },
      { name: "stream", args: "off" },
    );

    expect(runtimeConfig.getStreamingEnabled()).toBe(false);
    expect(messenger.sendRenderedMessage).toHaveBeenCalledWith(
      "ou_1",
      "✅ 已关闭流式回复。",
      2000,
    );
  });

  it("/reaction off 再 on 时应恢复 .env 里的表情", async () => {
    const { service, messenger, runtimeConfig } = createDeps();

    await service.handleBridgeCommand(
      { openId: "ou_1", userId: "u_1" },
      { name: "reaction", args: "off" },
    );
    await service.handleBridgeCommand(
      { openId: "ou_1", userId: "u_1" },
      { name: "reaction", args: "on" },
    );

    expect(runtimeConfig.getProcessingReactionType()).toBe("SMILE");
    expect(messenger.sendRenderedMessage).toHaveBeenNthCalledWith(
      1,
      "ou_1",
      "✅ 已关闭处理中 reaction。",
      2000,
    );
    expect(messenger.sendRenderedMessage).toHaveBeenNthCalledWith(
      2,
      "ou_1",
      "✅ 已开启处理中 reaction，表情继续使用 .env 里的 SMILE。",
      2000,
    );
  });

  it(".env 没配 reaction 时，/reaction on 应明确报错", async () => {
    const messenger = {
      sendRenderedMessage: vi.fn().mockResolvedValue(undefined),
      sendTextMessage: vi.fn().mockResolvedValue(undefined),
    };
    const service = createCommandService({
      config: {
        TEXT_CHUNK_LIMIT: 2000,
        CRON_DEFAULT_TZ: "Asia/Shanghai",
        FEISHU_AUDIO_TRANSCRIBE_DOUBAO_API_KEY: "",
        DATA_DIR: "/tmp/pi-gateway-data",
      },
      runtimeConfig: createRuntimeConfigStore({}),
      messenger,
      sessionService: {
        getOrCreateActiveSession: vi.fn(),
        createNewSession: vi.fn(),
        listSessions: vi.fn(),
        resumeSession: vi.fn(),
      },
      userStateStore: {
        readUserState: vi.fn(),
      },
      workspaceService: {
        getUserWorkspaceDir: vi.fn(),
      },
      runtimeState: {
        isLocked: vi.fn(),
        hasActiveLocks: vi.fn(),
        beginRestartDrain: vi.fn(),
        cancelRestartDrain: vi.fn(),
        requestStop: vi.fn(),
      },
      restartService: {
        restartGateway: vi.fn(),
      },
      listAvailableModels: vi.fn(),
      findAvailableModel: vi.fn(),
    });

    await service.handleBridgeCommand(
      { openId: "ou_1", userId: "u_1" },
      { name: "reaction", args: "on" },
    );

    expect(messenger.sendTextMessage).toHaveBeenCalledWith(
      "ou_1",
      "当前 .env 里没配置 FEISHU_PROCESSING_REACTION_TYPE，不能开启 reaction。",
    );
    expect(messenger.sendRenderedMessage).not.toHaveBeenCalled();
  });
});
