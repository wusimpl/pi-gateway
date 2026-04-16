import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const client = { tag: "feishu-client" };
  const startMessageConnection = vi.fn().mockResolvedValue(undefined);

  return {
    client,
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
      getModelRegistry: () => ({
        getAvailable: () => [{ provider: "pi", id: "model-1" }],
      }),
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
    createSessionService: vi.fn(() => ({
      disposeAllSessions: vi.fn(),
      getOrCreateActiveSession: vi.fn(),
      touchSession: vi.fn(),
    })),
    createCommandService: vi.fn(() => ({
      handleBridgeCommand: vi.fn(),
    })),
    createPromptService: vi.fn(() => ({
      handleUserPrompt: vi.fn(),
    })),
    createMessageRouter: vi.fn(() => ({
      handleFeishuMessage: vi.fn(),
    })),
    createRuntimeStateStore: vi.fn(() => ({
      clearAllState: vi.fn(),
      isDuplicate: vi.fn(),
      isLocked: vi.fn(),
      acquireLock: vi.fn(),
      releaseLock: vi.fn(),
    })),
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
    PI_SHOW_TOOL_CALLS_IN_REPLY: false,
    TEXT_CHUNK_LIMIT: 2000,
    FEISHU_MEDIA_OLLAMA_BASE_URL: "http://127.0.0.1:11434",
    FEISHU_MEDIA_OCR_MODEL: "glm-ocr:latest",
    FEISHU_AUDIO_TRANSCRIBE_PROVIDER: "whisper",
    FEISHU_AUDIO_TRANSCRIBE_SCRIPT: "/tmp/transcribe.sh",
    FEISHU_AUDIO_TRANSCRIBE_LANGUAGE: "zh",
    FEISHU_AUDIO_TRANSCRIBE_SENSEVOICE_PYTHON: "/tmp/.venv-sensevoice/bin/python",
    FEISHU_AUDIO_TRANSCRIBE_SENSEVOICE_MODEL: "iic/SenseVoiceSmall",
    FEISHU_AUDIO_TRANSCRIBE_SENSEVOICE_DEVICE: "cpu",
    DATA_DIR: "/tmp/pi-gateway-data",
    PI_WORKSPACE_ROOT: "/tmp/pi-gateway-workspace",
    PI_DISABLE_GLOBAL_AGENTS: true,
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

vi.mock("../src/pi/sessions.js", () => ({
  createSessionService: mocks.createSessionService,
}));

vi.mock("../src/app/command-service.js", () => ({
  createCommandService: mocks.createCommandService,
}));

vi.mock("../src/app/prompt-service.js", () => ({
  createPromptService: mocks.createPromptService,
}));

vi.mock("../src/app/router.js", () => ({
  createMessageRouter: mocks.createMessageRouter,
}));

vi.mock("../src/app/state.js", () => ({
  createRuntimeStateStore: mocks.createRuntimeStateStore,
}));

vi.mock("../src/storage/users.js", () => ({
  createUserStateStore: mocks.createUserStateStore,
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
    mocks.createSessionService.mockClear();
    mocks.createCommandService.mockClear();
    mocks.createPromptService.mockClear();
    mocks.createMessageRouter.mockClear();
    mocks.createRuntimeStateStore.mockClear();
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
        extensionFactories: expect.any(Array),
      }),
    );
    expect(mocks.setQuotedMessageDataDir).toHaveBeenCalledWith("/tmp/pi-gateway-data");
    expect(mocks.createPromptService.mock.calls[0]?.[0]?.downloadResource).toBe(downloadResource);
    expect(mocks.createPromptService.mock.calls[0]?.[0]?.readQuotedMessage).toBe(readQuotedMessage);
    expect(mocks.startMessageConnection).toHaveBeenCalledTimes(1);
  });
});
