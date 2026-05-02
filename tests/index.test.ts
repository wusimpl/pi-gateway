import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const client = { tag: "feishu-client" };
  const startMessageConnection = vi.fn().mockResolvedValue(undefined);
  const modelRegistry = {
    getAvailable: vi.fn(() => [{ provider: "pi", id: "model-1" }]),
  };
  const modelRouter = { route: vi.fn() };
  const adminServer = {
    start: vi.fn().mockResolvedValue(undefined),
    stop: vi.fn().mockResolvedValue(undefined),
    getUrl: vi.fn(() => "http://127.0.0.1:8787/admin/"),
  };

  return {
    client,
    modelRegistry,
    modelRouter,
    startMessageConnection,
    ensureDir: vi.fn().mockResolvedValue(undefined),
    setLogLevel: vi.fn(),
    logger: {
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      debug: vi.fn(),
    },
    createPiRuntime: vi.fn(() => ({
      getModelRegistry: () => modelRegistry,
    })),
    createFeishuConnection: vi.fn(() => ({
      client,
      startMessageConnection,
    })),
    createFeishuMessageReader: vi.fn(() => vi.fn()),
    createFeishuResourceDownloader: vi.fn(() => vi.fn()),
    createFeishuMessenger: vi.fn(() => ({
      sendFeishuMessage: vi.fn(),
      sendTextMessage: vi.fn(),
      sendRenderedMessage: vi.fn(),
      addProcessingReaction: vi.fn(),
      removeReaction: vi.fn(),
    })),
    createPromptRunner: vi.fn(() => ({
      promptSession: vi.fn(),
    })),
    cronRunner: { tag: "cron-runner" },
    cronService: {
      start: vi.fn().mockResolvedValue(undefined),
      stop: vi.fn().mockResolvedValue(undefined),
      isEnabled: vi.fn(() => true),
      getDefaultTimezone: vi.fn(() => "Asia/Shanghai"),
      listJobs: vi.fn(),
      addJob: vi.fn(),
      removeJob: vi.fn(),
      runJobNow: vi.fn(),
    },
    createCronRunner: vi.fn(() => ({ tag: "cron-runner" })),
    createCronService: vi.fn(() => ({
      start: mocks.cronService.start,
      stop: mocks.cronService.stop,
      isEnabled: mocks.cronService.isEnabled,
      getDefaultTimezone: mocks.cronService.getDefaultTimezone,
      listJobs: mocks.cronService.listJobs,
      addJob: mocks.cronService.addJob,
      removeJob: mocks.cronService.removeJob,
      runJobNow: mocks.cronService.runJobNow,
    })),
    createCronTaskExtension: vi.fn(() => "cron-extension-factory"),
    createSkillStatsStore: vi.fn(() => "skill-stats-store"),
    createSkillStatsExtension: vi.fn(() => "skill-stats-extension-factory"),
    createSessionService: vi.fn(() => ({
      disposeAllSessions: vi.fn(),
      getOrCreateActiveSession: vi.fn(),
      touchSession: vi.fn(),
    })),
    createCommandService: vi.fn(() => ({
      handleBridgeCommand: vi.fn(),
    })),
    createRestartService: vi.fn(() => ({
      restartGateway: vi.fn(),
    })),
    signalRestartReadyIfNeeded: vi.fn().mockResolvedValue(undefined),
    notifyRestartReadyIfNeeded: vi.fn().mockResolvedValue(undefined),
    createPromptService: vi.fn(() => ({
      handleUserPrompt: vi.fn(),
    })),
    createModelRouter: vi.fn(() => modelRouter),
    createMessageRouter: vi.fn(() => ({
      handleFeishuMessage: vi.fn(),
    })),
    adminServer,
    createAdminServer: vi.fn(() => adminServer),
    createRuntimeStateStore: vi.fn(() => ({
      clearAllState: vi.fn(),
      isDuplicate: vi.fn(),
      isLocked: vi.fn(),
      acquireLock: vi.fn(),
      releaseLock: vi.fn(),
    })),
    createGroupSettingsStore: vi.fn(() => ({})),
    createUserStateStore: vi.fn(() => ({})),
    createWorkspaceService: vi.fn(() => ({
      getUserWorkspaceDir: vi.fn(),
    })),
    setQuotedMessageDataDir: vi.fn(),
  };
});

vi.mock("../src/config.js", () => ({
  loadConfig: () => ({
    FEISHU_DOMAIN: "feishu",
    FEISHU_APP_ID: "app-id",
    FEISHU_APP_SECRET: "app-secret",
    FEISHU_PROCESSING_REACTION_TYPE: "SMILE",
    STREAMING_ENABLED: true,
    TEXT_CHUNK_LIMIT: 2000,
    FEISHU_MEDIA_OLLAMA_BASE_URL: "http://127.0.0.1:11434",
    FEISHU_MEDIA_OCR_MODEL: "glm-ocr:latest",
    FEISHU_AUDIO_TRANSCRIBE_PROVIDER: "whisper",
    FEISHU_AUDIO_TRANSCRIBE_SCRIPT: "/tmp/transcribe.sh",
    FEISHU_AUDIO_TRANSCRIBE_LANGUAGE: "zh",
    FEISHU_AUDIO_TRANSCRIBE_SENSEVOICE_PYTHON: "/tmp/.venv-sensevoice/bin/python",
    FEISHU_AUDIO_TRANSCRIBE_SENSEVOICE_MODEL: "iic/SenseVoiceSmall",
    FEISHU_AUDIO_TRANSCRIBE_SENSEVOICE_DEVICE: "cpu",
    FEISHU_AUDIO_TRANSCRIBE_DOUBAO_API_KEY: "",
    DATA_DIR: "/tmp/pi-gateway-data",
    PI_WORKSPACE_ROOT: "/tmp/pi-gateway-workspace",
    PI_DISABLE_GLOBAL_AGENTS: true,
    PI_GATEWAY_AGENTS_FILE: "/tmp/pi-gateway-agents.md",
    CRON_ENABLED: true,
    CRON_DEFAULT_TZ: "Asia/Shanghai",
    CRON_JOB_TIMEOUT_MS: 30000,
    LOG_LEVEL: "info",
  }),
}));

vi.mock("../src/app/logger.js", () => ({
  setLogLevel: mocks.setLogLevel,
  logger: mocks.logger,
}));

vi.mock("../src/storage/files.js", () => ({
  ensureDir: mocks.ensureDir,
}));

vi.mock("../src/pi/runtime.js", () => ({
  createPiRuntime: mocks.createPiRuntime,
}));

vi.mock("../src/feishu/client.js", () => ({
  createFeishuConnection: mocks.createFeishuConnection,
}));

vi.mock("../src/feishu/inbound/resource.js", () => ({
  createFeishuResourceDownloader: mocks.createFeishuResourceDownloader,
}));

vi.mock("../src/feishu/inbound/message.js", () => ({
  createFeishuMessageReader: mocks.createFeishuMessageReader,
}));

vi.mock("../src/feishu/send.js", () => ({
  createFeishuMessenger: mocks.createFeishuMessenger,
}));

vi.mock("../src/pi/stream.js", () => ({
  createPromptRunner: mocks.createPromptRunner,
}));

vi.mock("../src/cron/runner.js", () => ({
  createCronRunner: mocks.createCronRunner,
}));

vi.mock("../src/cron/service.js", () => ({
  createCronService: mocks.createCronService,
}));

vi.mock("../src/pi/extensions/cron-task.js", () => ({
  createCronTaskExtension: mocks.createCronTaskExtension,
}));

vi.mock("../src/pi/skill-stats.js", () => ({
  createSkillStatsStore: mocks.createSkillStatsStore,
}));

vi.mock("../src/pi/extensions/skill-stats.js", () => ({
  createSkillStatsExtension: mocks.createSkillStatsExtension,
}));

vi.mock("../src/pi/sessions.js", () => ({
  createSessionService: mocks.createSessionService,
}));

vi.mock("../src/app/command-service.js", () => ({
  createCommandService: mocks.createCommandService,
}));

vi.mock("../src/app/restart.js", () => ({
  createRestartService: mocks.createRestartService,
  signalRestartReadyIfNeeded: mocks.signalRestartReadyIfNeeded,
  notifyRestartReadyIfNeeded: mocks.notifyRestartReadyIfNeeded,
}));

vi.mock("../src/app/prompt-service.js", () => ({
  createPromptService: mocks.createPromptService,
}));

vi.mock("../src/pi/model-routing.js", () => ({
  createModelRouter: mocks.createModelRouter,
}));

vi.mock("../src/app/router.js", () => ({
  createMessageRouter: mocks.createMessageRouter,
}));

vi.mock("../src/admin/server.js", () => ({
  createAdminServer: mocks.createAdminServer,
}));

vi.mock("../src/app/state.js", () => ({
  createRuntimeStateStore: mocks.createRuntimeStateStore,
}));

vi.mock("../src/storage/users.js", () => ({
  createUserStateStore: mocks.createUserStateStore,
}));

vi.mock("../src/storage/group-settings.js", () => ({
  createGroupSettingsStore: mocks.createGroupSettingsStore,
}));

vi.mock("../src/storage/quoted-messages.js", () => ({
  setQuotedMessageDataDir: mocks.setQuotedMessageDataDir,
}));

vi.mock("../src/pi/workspace.js", () => ({
  createWorkspaceService: mocks.createWorkspaceService,
}));

describe("index wiring", () => {
  beforeEach(() => {
    vi.resetModules();
    mocks.startMessageConnection.mockClear();
    mocks.ensureDir.mockClear();
    mocks.setLogLevel.mockClear();
    mocks.logger.info.mockClear();
    mocks.logger.error.mockClear();
    mocks.logger.warn.mockClear();
    mocks.logger.debug.mockClear();
    mocks.createPiRuntime.mockClear();
    mocks.createFeishuConnection.mockClear();
    mocks.createFeishuMessageReader.mockClear();
    mocks.createFeishuResourceDownloader.mockClear();
    mocks.createFeishuMessenger.mockClear();
    mocks.createPromptRunner.mockClear();
    mocks.createCronRunner.mockClear();
    mocks.createCronService.mockClear();
    mocks.createCronTaskExtension.mockClear();
    mocks.createSkillStatsStore.mockClear();
    mocks.createSkillStatsExtension.mockClear();
    mocks.cronService.start.mockClear();
    mocks.cronService.stop.mockClear();
    mocks.createSessionService.mockClear();
    mocks.createCommandService.mockClear();
    mocks.createRestartService.mockClear();
    mocks.signalRestartReadyIfNeeded.mockClear();
    mocks.notifyRestartReadyIfNeeded.mockClear();
    mocks.createPromptService.mockClear();
    mocks.createModelRouter.mockClear();
    mocks.modelRouter.route.mockClear();
    mocks.modelRegistry.getAvailable.mockClear();
    mocks.createMessageRouter.mockClear();
    mocks.createAdminServer.mockClear();
    mocks.adminServer.start.mockClear();
    mocks.adminServer.stop.mockClear();
    mocks.adminServer.getUrl.mockClear();
    mocks.createRuntimeStateStore.mockClear();
    mocks.createGroupSettingsStore.mockClear();
    mocks.createUserStateStore.mockClear();
    mocks.setQuotedMessageDataDir.mockClear();
    mocks.createWorkspaceService.mockClear();
  });

  it("启动时应把飞书资源下载器注入 prompt service", async () => {
    const downloadResource = vi.fn();
    const readQuotedMessage = vi.fn();
    mocks.createFeishuMessageReader.mockReturnValue(readQuotedMessage);
    mocks.createFeishuResourceDownloader.mockReturnValue(downloadResource);

    await import("../src/index.ts");

    await vi.waitFor(() => {
      expect(mocks.createPromptService).toHaveBeenCalledTimes(1);
    });

    expect(mocks.createFeishuMessageReader).toHaveBeenCalledWith(mocks.client);
    expect(mocks.createFeishuResourceDownloader).toHaveBeenCalledWith(mocks.client);
    expect(mocks.createPiRuntime).toHaveBeenCalledWith(
      expect.objectContaining({
        disableGlobalAgents: true,
        gatewayAgentsFile: "/tmp/pi-gateway-agents.md",
        extensionFactories: expect.arrayContaining([
          "cron-extension-factory",
          "skill-stats-extension-factory",
        ]),
      }),
    );
    expect(mocks.createSkillStatsStore).toHaveBeenCalledWith("/tmp/pi-gateway-data");
    expect(mocks.createGroupSettingsStore).toHaveBeenCalledWith("/tmp/pi-gateway-data");
    expect(mocks.createSkillStatsExtension).toHaveBeenCalledWith("skill-stats-store");
    expect(mocks.createCommandService.mock.calls[0]?.[0]?.skillStatsStore).toBe("skill-stats-store");
    expect(mocks.createCronRunner).toHaveBeenCalledTimes(1);
    expect(mocks.createCronService).toHaveBeenCalledTimes(1);
    expect(mocks.cronService.start).toHaveBeenCalledTimes(1);
    expect(mocks.setQuotedMessageDataDir).toHaveBeenCalledWith("/tmp/pi-gateway-data");
    expect(mocks.createPromptService.mock.calls[0]?.[0]?.downloadResource).toBe(downloadResource);
    expect(mocks.createPromptService.mock.calls[0]?.[0]?.readQuotedMessage).toBe(readQuotedMessage);
    expect(mocks.createModelRouter).toHaveBeenCalledWith({ registry: mocks.modelRegistry });
    expect(mocks.createPromptService.mock.calls[0]?.[0]?.modelRouter).toBe(mocks.modelRouter);
    expect(mocks.startMessageConnection).toHaveBeenCalledTimes(1);
    expect(mocks.signalRestartReadyIfNeeded).toHaveBeenCalledTimes(1);
    expect(mocks.notifyRestartReadyIfNeeded).toHaveBeenCalledTimes(1);
  });
});
