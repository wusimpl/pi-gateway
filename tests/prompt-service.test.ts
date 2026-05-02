import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPromptService } from "../src/app/prompt-service.js";
import { createRuntimeConfigStore } from "../src/app/runtime-config.js";

describe("createPromptService", () => {
  const preparePromptInput = vi.fn();
  const promptSession = vi.fn();
  const sendTextMessage = vi.fn();
  const sendTextMessageToTarget = vi.fn();
  const addProcessingReaction = vi.fn();
  const getOrCreateActiveSession = vi.fn();
  const getOrCreateActiveSessionForTarget = vi.fn();
  const touchSession = vi.fn();
  const touchSessionForTarget = vi.fn();
  const acquireLock = vi.fn();
  const releaseLock = vi.fn();
  const setAbortHandler = vi.fn();
  const isStopRequested = vi.fn();
  const isDraining = vi.fn();
  const flushDeferredCronRuns = vi.fn();
  const downloadResource = vi.fn();
  const readQuotedMessage = vi.fn();
  const readCachedQuotedMessage = vi.fn();
  const resolveSenderName = vi.fn();
  const modelRouterRoute = vi.fn();

  beforeEach(() => {
    preparePromptInput.mockReset();
    promptSession.mockReset();
    sendTextMessage.mockReset();
    sendTextMessageToTarget.mockReset();
    addProcessingReaction.mockReset();
    getOrCreateActiveSession.mockReset();
    getOrCreateActiveSessionForTarget.mockReset();
    touchSession.mockReset();
    touchSessionForTarget.mockReset();
    acquireLock.mockReset();
    releaseLock.mockReset();
    setAbortHandler.mockReset();
    isStopRequested.mockReset();
    isDraining.mockReset();
    flushDeferredCronRuns.mockReset();
    downloadResource.mockReset();
    readQuotedMessage.mockReset();
    readCachedQuotedMessage.mockReset();
    resolveSenderName.mockReset();
    modelRouterRoute.mockReset();

    addProcessingReaction.mockResolvedValue("reaction_queued_1");
    acquireLock.mockReturnValue(true);
    setAbortHandler.mockResolvedValue(false);
    isStopRequested.mockReturnValue(false);
    isDraining.mockReturnValue(false);
    flushDeferredCronRuns.mockResolvedValue(undefined);
    getOrCreateActiveSession.mockResolvedValue({
      activeSessionId: "session_1",
      piSession: {
        model: { input: ["text"] },
        abort: vi.fn().mockResolvedValue(undefined),
      },
    });
    getOrCreateActiveSessionForTarget.mockResolvedValue({
      activeSessionId: "session_group_1",
      piSession: {
        model: { input: ["text"] },
        abort: vi.fn().mockResolvedValue(undefined),
      },
    });
    preparePromptInput.mockResolvedValue({
      text: "转写后的文本",
      localFiles: ["/tmp/workspace/.feishu-inbox/om_1/audio.ogg"],
    });
    promptSession.mockResolvedValue({ text: "done", error: undefined });
    touchSession.mockResolvedValue(undefined);
    touchSessionForTarget.mockResolvedValue(undefined);
    readQuotedMessage.mockResolvedValue({
      messageId: "om_parent_1",
      messageType: "text",
      text: "上一条消息内容",
    });
    readCachedQuotedMessage.mockResolvedValue(null);
    resolveSenderName.mockResolvedValue("Andy");
    modelRouterRoute.mockResolvedValue(null);
  });

  function basePromptConfig() {
    return {
      FEISHU_MEDIA_OLLAMA_BASE_URL: "http://127.0.0.1:11434",
      FEISHU_MEDIA_OCR_MODEL: "glm-ocr:latest",
      FEISHU_AUDIO_TRANSCRIBE_PROVIDER: "sensevoice",
      FEISHU_AUDIO_TRANSCRIBE_SCRIPT: "/tmp/transcribe.sh",
      FEISHU_AUDIO_TRANSCRIBE_LANGUAGE: "zh",
      FEISHU_AUDIO_TRANSCRIBE_SENSEVOICE_PYTHON: "/tmp/.venv-sensevoice/bin/python",
      FEISHU_AUDIO_TRANSCRIBE_SENSEVOICE_MODEL: "iic/SenseVoiceSmall",
      FEISHU_AUDIO_TRANSCRIBE_SENSEVOICE_DEVICE: "cpu",
      FEISHU_AUDIO_TRANSCRIBE_DOUBAO_API_KEY: "",
      FEISHU_PROCESSING_REACTION_TYPE: "SMILE",
      STREAMING_ENABLED: true,
      TEXT_CHUNK_LIMIT: 2000,
    };
  }

  function routingState() {
    return {
      activeSessionId: "session_1",
      createdAt: "2026-04-27T00:00:00.000Z",
      updatedAt: "2026-04-27T00:00:00.000Z",
      lastActiveAt: "2026-04-27T00:00:00.000Z",
      modelRouting: {
        enabled: true,
        routerModel: { provider: "cpa", id: "router" },
        lightModel: { provider: "zen", id: "light" },
        heavyModel: { provider: "cpa", id: "heavy" },
      },
    };
  }

  function textMessage(overrides: Record<string, unknown> = {}) {
    return {
      kind: "text",
      identity: { openId: "ou_1", userId: "u_1" },
      messageId: "om_route_1",
      messageType: "text",
      createTime: "123",
      rawContent: '{"text":"hello"}',
      text: "hello",
      ...overrides,
    } as any;
  }

  function createRoutingPromptService(input: {
    userState?: Record<string, unknown> | null;
    groupState?: Record<string, unknown> | null;
    readUserState?: ReturnType<typeof vi.fn>;
    readSessionState?: ReturnType<typeof vi.fn>;
  } = {}) {
    const readUserState = input.readUserState ?? vi.fn().mockResolvedValue(input.userState ?? null);
    const readSessionState = input.readSessionState ?? vi.fn().mockResolvedValue(input.groupState ?? null);
    const promptService = createPromptService({
      config: basePromptConfig(),
      runtimeState: {
        acquireLock,
        releaseLock,
        setAbortHandler,
        isStopRequested,
        isDraining,
      },
      sessionService: {
        getOrCreateActiveSession,
        getOrCreateActiveSessionForTarget,
        touchSession,
        touchSessionForTarget,
        readSessionState,
      },
      userStateStore: {
        readUserState,
      },
      workspaceService: {
        getUserWorkspaceDir: () => "/tmp/workspace/user",
        getConversationWorkspaceDir: () => "/tmp/workspace/conversations/oc_1",
      },
      promptRunner: {
        promptSession,
      },
      messenger: {
        sendTextMessage,
        sendTextMessageToTarget,
        addProcessingReaction,
      },
      quotedMessageStore: {
        readQuotedMessage: readCachedQuotedMessage,
      },
      downloadResource,
      readQuotedMessage,
      preparePromptInput,
      resolveSenderName,
      modelRouter: { route: modelRouterRoute },
    });
    return { promptService, readUserState, readSessionState };
  }

  it("应把显式资源下载器透传给 prompt 输入预处理", async () => {
    const promptService = createPromptService({
      config: {
        FEISHU_MEDIA_OLLAMA_BASE_URL: "http://127.0.0.1:11434",
        FEISHU_MEDIA_OCR_MODEL: "glm-ocr:latest",
        FEISHU_AUDIO_TRANSCRIBE_PROVIDER: "sensevoice",
        FEISHU_AUDIO_TRANSCRIBE_SCRIPT: "/tmp/transcribe.sh",
        FEISHU_AUDIO_TRANSCRIBE_LANGUAGE: "zh",
        FEISHU_AUDIO_TRANSCRIBE_SENSEVOICE_PYTHON: "/tmp/.venv-sensevoice/bin/python",
        FEISHU_AUDIO_TRANSCRIBE_SENSEVOICE_MODEL: "iic/SenseVoiceSmall",
        FEISHU_AUDIO_TRANSCRIBE_SENSEVOICE_DEVICE: "cpu",
        FEISHU_PROCESSING_REACTION_TYPE: "SMILE",
        STREAMING_ENABLED: true,
        TEXT_CHUNK_LIMIT: 2000,
      },
      runtimeState: {
        acquireLock,
        releaseLock,
        setAbortHandler,
        isStopRequested,
        isDraining,
      },
      sessionService: {
        getOrCreateActiveSession,
        touchSession,
      },
      userStateStore: {
        readUserState: vi.fn().mockResolvedValue({
          activeSessionId: "session_1",
          createdAt: "2026-04-27T00:00:00.000Z",
          updatedAt: "2026-04-27T00:00:00.000Z",
          lastActiveAt: "2026-04-27T00:00:00.000Z",
          toolCallsDisplayMode: "name",
        }),
      },
      workspaceService: {
        getUserWorkspaceDir: () => "/tmp/workspace",
      },
      promptRunner: {
        promptSession,
      },
      messenger: {
        sendTextMessage,
        addProcessingReaction,
      },
      quotedMessageStore: {
        readQuotedMessage: readCachedQuotedMessage,
      },
      downloadResource,
      readQuotedMessage,
      preparePromptInput,
      resolveSenderName,
    });

    await promptService.handleUserPrompt(
      { openId: "ou_1", userId: "u_1" },
      {
        kind: "audio",
        identity: { openId: "ou_1", userId: "u_1" },
        messageId: "om_1",
        messageType: "audio",
        createTime: "123",
        rawContent: '{"file_key":"file_123","duration":3200}',
        fileKey: "file_123",
        durationMs: 3200,
      },
    );

    expect(preparePromptInput).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: "audio",
        messageId: "om_1",
        fileKey: "file_123",
      }),
      expect.objectContaining({
        model: { input: ["text"] },
        abort: expect.any(Function),
      }),
      expect.objectContaining({
        workspaceDir: "/tmp/workspace",
        audioTranscribeProvider: "sensevoice",
        audioTranscribeScript: "/tmp/transcribe.sh",
        audioTranscribeSenseVoicePython: "/tmp/.venv-sensevoice/bin/python",
      }),
      {
        downloadResource,
      },
    );
    expect(promptSession).toHaveBeenCalled();
    expect(promptSession.mock.calls[0]?.[7]).toBe("name");
    expect(sendTextMessage).not.toHaveBeenCalled();
    expect(releaseLock).toHaveBeenCalledWith("ou_1");
  });

  it("群聊 prompt 应使用群会话、群 workspace，并把回复目标传给 runner", async () => {
    const target = {
      kind: "group",
      key: "oc_1",
      receiveIdType: "chat_id",
      receiveId: "oc_1",
      chatId: "oc_1",
    } as const;
    const promptService = createPromptService({
      config: {
        FEISHU_MEDIA_OLLAMA_BASE_URL: "http://127.0.0.1:11434",
        FEISHU_MEDIA_OCR_MODEL: "glm-ocr:latest",
        FEISHU_AUDIO_TRANSCRIBE_PROVIDER: "sensevoice",
        FEISHU_AUDIO_TRANSCRIBE_SCRIPT: "/tmp/transcribe.sh",
        FEISHU_AUDIO_TRANSCRIBE_LANGUAGE: "zh",
        FEISHU_AUDIO_TRANSCRIBE_SENSEVOICE_PYTHON: "/tmp/.venv-sensevoice/bin/python",
        FEISHU_AUDIO_TRANSCRIBE_SENSEVOICE_MODEL: "iic/SenseVoiceSmall",
        FEISHU_AUDIO_TRANSCRIBE_SENSEVOICE_DEVICE: "cpu",
        FEISHU_AUDIO_TRANSCRIBE_DOUBAO_API_KEY: "",
        FEISHU_PROCESSING_REACTION_TYPE: "SMILE",
        FEISHU_GROUP_MESSAGE_MODE: "mention",
        STREAMING_ENABLED: true,
        TEXT_CHUNK_LIMIT: 2000,
      },
      runtimeState: {
        acquireLock,
        releaseLock,
        setAbortHandler,
        isStopRequested,
        isDraining,
      },
      sessionService: {
        getOrCreateActiveSession,
        getOrCreateActiveSessionForTarget,
        touchSession,
        touchSessionForTarget,
      },
      workspaceService: {
        getUserWorkspaceDir: () => "/tmp/workspace/user",
        getConversationWorkspaceDir: () => "/tmp/workspace/conversations/oc_1",
      },
      promptRunner: {
        promptSession,
      },
      messenger: {
        sendTextMessage,
        sendTextMessageToTarget,
        addProcessingReaction,
      },
      quotedMessageStore: {
        readQuotedMessage: readCachedQuotedMessage,
      },
      downloadResource,
      readQuotedMessage,
      preparePromptInput,
      resolveSenderName,
    });

    await promptService.handleUserPrompt(
      { openId: "ou_1", userId: "u_1" },
      {
        kind: "text",
        identity: { openId: "ou_1", userId: "u_1" },
        conversationTarget: target,
        messageId: "om_group_1",
        messageType: "text",
        createTime: "123",
        rawContent: '{"text":"hello"}',
        text: "hello",
      },
    );

    expect(getOrCreateActiveSessionForTarget).toHaveBeenCalledWith({ openId: "ou_1", userId: "u_1" }, target);
    expect(preparePromptInput).toHaveBeenCalledWith(
      expect.objectContaining({ messageId: "om_group_1" }),
      expect.anything(),
      expect.objectContaining({ workspaceDir: "/tmp/workspace/conversations/oc_1" }),
      expect.anything(),
    );
    expect(promptSession).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        text: "发送者：Andy\n用户消息：\n转写后的文本",
      }),
      "ou_1",
      "om_group_1",
      "SMILE",
      true,
      2000,
      "off",
      undefined,
      expect.any(Function),
      target,
    );
    expect(resolveSenderName).toHaveBeenCalledWith({ openId: "ou_1", userId: "u_1" }, target);
    expect(touchSessionForTarget).toHaveBeenCalledWith({ openId: "ou_1", userId: "u_1" }, target, "om_group_1");
    expect(touchSession).not.toHaveBeenCalled();
    expect(releaseLock).toHaveBeenCalledWith("oc_1");
  });

  it("回复结束释放锁后会触发延后补跑的 cron", async () => {
    const promptService = createPromptService({
      config: {
        FEISHU_MEDIA_OLLAMA_BASE_URL: "http://127.0.0.1:11434",
        FEISHU_MEDIA_OCR_MODEL: "glm-ocr:latest",
        FEISHU_AUDIO_TRANSCRIBE_PROVIDER: "sensevoice",
        FEISHU_AUDIO_TRANSCRIBE_SCRIPT: "/tmp/transcribe.sh",
        FEISHU_AUDIO_TRANSCRIBE_LANGUAGE: "zh",
        FEISHU_AUDIO_TRANSCRIBE_SENSEVOICE_PYTHON: "/tmp/.venv-sensevoice/bin/python",
        FEISHU_AUDIO_TRANSCRIBE_SENSEVOICE_MODEL: "iic/SenseVoiceSmall",
        FEISHU_AUDIO_TRANSCRIBE_SENSEVOICE_DEVICE: "cpu",
        FEISHU_PROCESSING_REACTION_TYPE: "SMILE",
        STREAMING_ENABLED: true,
        TEXT_CHUNK_LIMIT: 2000,
      },
      runtimeState: {
        acquireLock,
        releaseLock,
        setAbortHandler,
        isStopRequested,
        isDraining,
      },
      sessionService: {
        getOrCreateActiveSession,
        touchSession,
      },
      workspaceService: {
        getUserWorkspaceDir: () => "/tmp/workspace",
      },
      promptRunner: {
        promptSession,
      },
      messenger: {
        sendTextMessage,
        addProcessingReaction,
      },
      quotedMessageStore: {
        readQuotedMessage: readCachedQuotedMessage,
      },
      downloadResource,
      readQuotedMessage,
      preparePromptInput,
      deferredCronRunService: {
        flush: flushDeferredCronRuns,
      },
    });

    await promptService.handleUserPrompt(
      { openId: "ou_1", userId: "u_1" },
      {
        kind: "text",
        identity: { openId: "ou_1", userId: "u_1" },
        messageId: "om_flush_1",
        messageType: "text",
        createTime: "123",
        rawContent: '{"text":"hello"}',
        text: "hello",
      },
    );

    expect(releaseLock).toHaveBeenCalledWith("ou_1");
    expect(flushDeferredCronRuns).toHaveBeenCalledWith("ou_1");
    expect(releaseLock.mock.invocationCallOrder[0]).toBeLessThan(
      flushDeferredCronRuns.mock.invocationCallOrder[0],
    );
  });

  it("运行中配置应覆盖启动时的 stream、reaction 和 stt provider", async () => {
    const promptService = createPromptService({
      config: {
        FEISHU_MEDIA_OLLAMA_BASE_URL: "http://127.0.0.1:11434",
        FEISHU_MEDIA_OCR_MODEL: "glm-ocr:latest",
        FEISHU_AUDIO_TRANSCRIBE_PROVIDER: "sensevoice",
        FEISHU_AUDIO_TRANSCRIBE_SCRIPT: "/tmp/transcribe.sh",
        FEISHU_AUDIO_TRANSCRIBE_LANGUAGE: "zh",
        FEISHU_AUDIO_TRANSCRIBE_SENSEVOICE_PYTHON: "/tmp/.venv-sensevoice/bin/python",
        FEISHU_AUDIO_TRANSCRIBE_SENSEVOICE_MODEL: "iic/SenseVoiceSmall",
        FEISHU_AUDIO_TRANSCRIBE_SENSEVOICE_DEVICE: "cpu",
        FEISHU_PROCESSING_REACTION_TYPE: "SMILE",
        STREAMING_ENABLED: true,
        TEXT_CHUNK_LIMIT: 2000,
      },
      runtimeConfig: createRuntimeConfigStore({
        FEISHU_AUDIO_TRANSCRIBE_PROVIDER: "whisper",
        STREAMING_ENABLED: false,
        FEISHU_STEERING_REACTION_TYPE: "OnIt",
      }),
      runtimeState: {
        acquireLock,
        releaseLock,
        setAbortHandler,
        isStopRequested,
        isDraining,
      },
      sessionService: {
        getOrCreateActiveSession,
        touchSession,
      },
      workspaceService: {
        getUserWorkspaceDir: () => "/tmp/workspace",
      },
      promptRunner: {
        promptSession,
      },
      messenger: {
        sendTextMessage,
        addProcessingReaction,
      },
      quotedMessageStore: {
        readQuotedMessage: readCachedQuotedMessage,
      },
      downloadResource,
      readQuotedMessage,
      preparePromptInput,
    });

    await promptService.handleUserPrompt(
      { openId: "ou_1", userId: "u_1" },
      {
        kind: "audio",
        identity: { openId: "ou_1", userId: "u_1" },
        messageId: "om_runtime_1",
        messageType: "audio",
        createTime: "123",
        rawContent: '{"file_key":"file_123","duration":3200}',
        fileKey: "file_123",
        durationMs: 3200,
      },
    );

    expect(preparePromptInput).toHaveBeenCalledWith(
      expect.objectContaining({ kind: "audio" }),
      expect.anything(),
      expect.objectContaining({
        audioTranscribeProvider: "whisper",
      }),
      expect.anything(),
    );
    expect(promptSession).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      "ou_1",
      "om_runtime_1",
      undefined,
      false,
      2000,
      "off",
      undefined,
      expect.any(Function),
    );
  });

  it("运行中收到 steer 消息后应添加 steering reaction", async () => {
    const piSession = {
      model: { input: ["text"] },
      abort: vi.fn().mockResolvedValue(undefined),
      isStreaming: true,
      steer: vi.fn().mockResolvedValue(undefined),
      followUp: vi.fn().mockResolvedValue(undefined),
    };
    getOrCreateActiveSession.mockResolvedValue({
      activeSessionId: "session_1",
      piSession,
    });

    const promptService = createPromptService({
      config: {
        FEISHU_MEDIA_OLLAMA_BASE_URL: "http://127.0.0.1:11434",
        FEISHU_MEDIA_OCR_MODEL: "glm-ocr:latest",
        FEISHU_AUDIO_TRANSCRIBE_PROVIDER: "sensevoice",
        FEISHU_AUDIO_TRANSCRIBE_SCRIPT: "/tmp/transcribe.sh",
        FEISHU_AUDIO_TRANSCRIBE_LANGUAGE: "zh",
        FEISHU_AUDIO_TRANSCRIBE_SENSEVOICE_PYTHON: "/tmp/.venv-sensevoice/bin/python",
        FEISHU_AUDIO_TRANSCRIBE_SENSEVOICE_MODEL: "iic/SenseVoiceSmall",
        FEISHU_AUDIO_TRANSCRIBE_SENSEVOICE_DEVICE: "cpu",
        FEISHU_PROCESSING_REACTION_TYPE: "SMILE",
        FEISHU_STEERING_REACTION_TYPE: "OnIt",
        STREAMING_ENABLED: true,
        TEXT_CHUNK_LIMIT: 2000,
      },
      runtimeState: {
        acquireLock,
        releaseLock,
        setAbortHandler,
        isStopRequested,
        isDraining,
      },
      sessionService: {
        getOrCreateActiveSession,
        touchSession,
      },
      workspaceService: {
        getUserWorkspaceDir: () => "/tmp/workspace",
      },
      promptRunner: {
        promptSession,
      },
      messenger: {
        sendTextMessage,
        addProcessingReaction,
      },
      quotedMessageStore: {
        readQuotedMessage: readCachedQuotedMessage,
      },
      downloadResource,
      readQuotedMessage,
      preparePromptInput,
    });

    const result = await promptService.queueRunningPrompt(
      { openId: "ou_1", userId: "u_1" },
      {
        kind: "text",
        identity: { openId: "ou_1", userId: "u_1" },
        messageId: "om_steer_1",
        messageType: "text",
        createTime: "123",
        rawContent: '{"text":"second"}',
        text: "second",
      },
      "steer",
    );

    expect(result).toBe("queued");
    expect(piSession.steer).toHaveBeenCalledWith("转写后的文本", undefined);
    expect(addProcessingReaction).toHaveBeenCalledWith("om_steer_1", "OnIt");
    expect(touchSession).toHaveBeenCalledWith("ou_1", "om_steer_1");
  });

  it("运行中收到 /next 时也应添加 steering reaction", async () => {
    const piSession = {
      model: { input: ["text"] },
      abort: vi.fn().mockResolvedValue(undefined),
      isStreaming: true,
      steer: vi.fn().mockResolvedValue(undefined),
      followUp: vi.fn().mockResolvedValue(undefined),
    };
    getOrCreateActiveSession.mockResolvedValue({
      activeSessionId: "session_1",
      piSession,
    });

    const promptService = createPromptService({
      config: {
        FEISHU_MEDIA_OLLAMA_BASE_URL: "http://127.0.0.1:11434",
        FEISHU_MEDIA_OCR_MODEL: "glm-ocr:latest",
        FEISHU_AUDIO_TRANSCRIBE_PROVIDER: "sensevoice",
        FEISHU_AUDIO_TRANSCRIBE_SCRIPT: "/tmp/transcribe.sh",
        FEISHU_AUDIO_TRANSCRIBE_LANGUAGE: "zh",
        FEISHU_AUDIO_TRANSCRIBE_SENSEVOICE_PYTHON: "/tmp/.venv-sensevoice/bin/python",
        FEISHU_AUDIO_TRANSCRIBE_SENSEVOICE_MODEL: "iic/SenseVoiceSmall",
        FEISHU_AUDIO_TRANSCRIBE_SENSEVOICE_DEVICE: "cpu",
        FEISHU_PROCESSING_REACTION_TYPE: "SMILE",
        FEISHU_STEERING_REACTION_TYPE: "OnIt",
        STREAMING_ENABLED: true,
        TEXT_CHUNK_LIMIT: 2000,
      },
      runtimeState: {
        acquireLock,
        releaseLock,
        setAbortHandler,
        isStopRequested,
        isDraining,
      },
      sessionService: {
        getOrCreateActiveSession,
        touchSession,
      },
      workspaceService: {
        getUserWorkspaceDir: () => "/tmp/workspace",
      },
      promptRunner: {
        promptSession,
      },
      messenger: {
        sendTextMessage,
        addProcessingReaction,
      },
      quotedMessageStore: {
        readQuotedMessage: readCachedQuotedMessage,
      },
      downloadResource,
      readQuotedMessage,
      preparePromptInput,
    });

    const result = await promptService.queueRunningPrompt(
      { openId: "ou_1", userId: "u_1" },
      {
        kind: "text",
        identity: { openId: "ou_1", userId: "u_1" },
        messageId: "om_next_1",
        messageType: "text",
        createTime: "123",
        rawContent: '{"text":"after this"}',
        text: "after this",
      },
      "followUp",
    );

    expect(result).toBe("queued");
    expect(piSession.followUp).toHaveBeenCalledWith("转写后的文本", undefined);
    expect(addProcessingReaction).toHaveBeenCalledWith("om_next_1", "OnIt");
    expect(touchSession).toHaveBeenCalledWith("ou_1", "om_next_1");
  });

  it("引用回复时应先读取父消息，再把引用内容透传给 prompt 预处理", async () => {
    const promptService = createPromptService({
      config: {
        FEISHU_MEDIA_OLLAMA_BASE_URL: "http://127.0.0.1:11434",
        FEISHU_MEDIA_OCR_MODEL: "glm-ocr:latest",
        FEISHU_AUDIO_TRANSCRIBE_PROVIDER: "sensevoice",
        FEISHU_AUDIO_TRANSCRIBE_SCRIPT: "/tmp/transcribe.sh",
        FEISHU_AUDIO_TRANSCRIBE_LANGUAGE: "zh",
        FEISHU_AUDIO_TRANSCRIBE_SENSEVOICE_PYTHON: "/tmp/.venv-sensevoice/bin/python",
        FEISHU_AUDIO_TRANSCRIBE_SENSEVOICE_MODEL: "iic/SenseVoiceSmall",
        FEISHU_AUDIO_TRANSCRIBE_SENSEVOICE_DEVICE: "cpu",
        FEISHU_PROCESSING_REACTION_TYPE: "SMILE",
        STREAMING_ENABLED: true,
        TEXT_CHUNK_LIMIT: 2000,
      },
      runtimeState: {
        acquireLock,
        releaseLock,
        setAbortHandler,
        isStopRequested,
        isDraining,
      },
      sessionService: {
        getOrCreateActiveSession,
        touchSession,
      },
      workspaceService: {
        getUserWorkspaceDir: () => "/tmp/workspace",
      },
      promptRunner: {
        promptSession,
      },
      messenger: {
        sendTextMessage,
        addProcessingReaction,
      },
      quotedMessageStore: {
        readQuotedMessage: readCachedQuotedMessage,
      },
      downloadResource,
      readQuotedMessage,
      preparePromptInput,
    });

    await promptService.handleUserPrompt(
      { openId: "ou_1", userId: "u_1" },
      {
        kind: "text",
        identity: { openId: "ou_1", userId: "u_1" },
        messageId: "om_2",
        parentMessageId: "om_parent_1",
        messageType: "text",
        createTime: "123",
        rawContent: '{"text":"go on"}',
        text: "go on",
      },
    );

    expect(readQuotedMessage).toHaveBeenCalledWith("om_parent_1");
    expect(preparePromptInput).toHaveBeenCalledWith(
      expect.objectContaining({
        messageId: "om_2",
        parentMessageId: "om_parent_1",
        quotedMessage: {
          messageId: "om_parent_1",
          messageType: "text",
          text: "上一条消息内容",
        },
      }),
      expect.objectContaining({
        model: { input: ["text"] },
        abort: expect.any(Function),
      }),
      expect.objectContaining({
        workspaceDir: "/tmp/workspace",
      }),
      expect.objectContaining({
        downloadResource,
      }),
    );
  });

  it("引用机器人卡片消息时应优先读取本地缓存正文，不再依赖飞书返回 card_id", async () => {
    readCachedQuotedMessage.mockResolvedValue({
      messageId: "om_parent_card_1",
      messageType: "interactive",
      text: "机器人上一条完整回复正文",
    });

    const promptService = createPromptService({
      config: {
        FEISHU_MEDIA_OLLAMA_BASE_URL: "http://127.0.0.1:11434",
        FEISHU_MEDIA_OCR_MODEL: "glm-ocr:latest",
        FEISHU_AUDIO_TRANSCRIBE_PROVIDER: "sensevoice",
        FEISHU_AUDIO_TRANSCRIBE_SCRIPT: "/tmp/transcribe.sh",
        FEISHU_AUDIO_TRANSCRIBE_LANGUAGE: "zh",
        FEISHU_AUDIO_TRANSCRIBE_SENSEVOICE_PYTHON: "/tmp/.venv-sensevoice/bin/python",
        FEISHU_AUDIO_TRANSCRIBE_SENSEVOICE_MODEL: "iic/SenseVoiceSmall",
        FEISHU_AUDIO_TRANSCRIBE_SENSEVOICE_DEVICE: "cpu",
        FEISHU_PROCESSING_REACTION_TYPE: "SMILE",
        STREAMING_ENABLED: true,
        TEXT_CHUNK_LIMIT: 2000,
      },
      runtimeState: {
        acquireLock,
        releaseLock,
        setAbortHandler,
        isStopRequested,
        isDraining,
      },
      sessionService: {
        getOrCreateActiveSession,
        touchSession,
      },
      workspaceService: {
        getUserWorkspaceDir: () => "/tmp/workspace",
      },
      promptRunner: {
        promptSession,
      },
      messenger: {
        sendTextMessage,
        addProcessingReaction,
      },
      quotedMessageStore: {
        readQuotedMessage: readCachedQuotedMessage,
      },
      downloadResource,
      readQuotedMessage,
      preparePromptInput,
    });

    await promptService.handleUserPrompt(
      { openId: "ou_1", userId: "u_1" },
      {
        kind: "text",
        identity: { openId: "ou_1", userId: "u_1" },
        messageId: "om_quoted_cached_1",
        parentMessageId: "om_parent_card_1",
        messageType: "text",
        createTime: "123",
        rawContent: '{"text":"继续"}',
        text: "继续",
      },
    );

    expect(readCachedQuotedMessage).toHaveBeenCalledWith("om_parent_card_1");
    expect(readQuotedMessage).not.toHaveBeenCalled();
    expect(preparePromptInput).toHaveBeenCalledWith(
      expect.objectContaining({
        quotedMessage: {
          messageId: "om_parent_card_1",
          messageType: "interactive",
          text: "机器人上一条完整回复正文",
        },
      }),
      expect.anything(),
      expect.anything(),
      expect.anything(),
    );
  });

  it("收到停止请求后，不应继续执行 prompt，也不该回错误消息", async () => {
    setAbortHandler.mockResolvedValue(true);

    const promptService = createPromptService({
      config: {
        FEISHU_MEDIA_OLLAMA_BASE_URL: "http://127.0.0.1:11434",
        FEISHU_MEDIA_OCR_MODEL: "glm-ocr:latest",
        FEISHU_AUDIO_TRANSCRIBE_PROVIDER: "sensevoice",
        FEISHU_AUDIO_TRANSCRIBE_SCRIPT: "/tmp/transcribe.sh",
        FEISHU_AUDIO_TRANSCRIBE_LANGUAGE: "zh",
        FEISHU_AUDIO_TRANSCRIBE_SENSEVOICE_PYTHON: "/tmp/.venv-sensevoice/bin/python",
        FEISHU_AUDIO_TRANSCRIBE_SENSEVOICE_MODEL: "iic/SenseVoiceSmall",
        FEISHU_AUDIO_TRANSCRIBE_SENSEVOICE_DEVICE: "cpu",
        FEISHU_PROCESSING_REACTION_TYPE: "SMILE",
        STREAMING_ENABLED: true,
        TEXT_CHUNK_LIMIT: 2000,
      },
      runtimeState: {
        acquireLock,
        releaseLock,
        setAbortHandler,
        isStopRequested,
        isDraining,
      },
      sessionService: {
        getOrCreateActiveSession,
        touchSession,
      },
      workspaceService: {
        getUserWorkspaceDir: () => "/tmp/workspace",
      },
      promptRunner: {
        promptSession,
      },
      messenger: {
        sendTextMessage,
        addProcessingReaction,
      },
      quotedMessageStore: {
        readQuotedMessage: readCachedQuotedMessage,
      },
      downloadResource,
      readQuotedMessage,
      preparePromptInput,
    });

    await promptService.handleUserPrompt(
      { openId: "ou_1", userId: "u_1" },
      {
        kind: "text",
        identity: { openId: "ou_1", userId: "u_1" },
        messageId: "om_stop_1",
        messageType: "text",
        createTime: "123",
        rawContent: '{"text":"hello"}',
        text: "hello",
      },
    );

    expect(preparePromptInput).not.toHaveBeenCalled();
    expect(promptSession).not.toHaveBeenCalled();
    expect(sendTextMessage).not.toHaveBeenCalled();
    expect(releaseLock).toHaveBeenCalledWith("ou_1");
  });

  it("豆包不支持的音频格式应直接返回具体错误", async () => {
    preparePromptInput.mockRejectedValue(
      new Error("豆包语音暂不支持当前音频格式（audio/mp4 / .m4a），请先改用 WAV、MP3 或 OGG/OPUS。"),
    );

    const promptService = createPromptService({
      config: {
        FEISHU_MEDIA_OLLAMA_BASE_URL: "http://127.0.0.1:11434",
        FEISHU_MEDIA_OCR_MODEL: "glm-ocr:latest",
        FEISHU_AUDIO_TRANSCRIBE_PROVIDER: "doubao",
        FEISHU_AUDIO_TRANSCRIBE_SCRIPT: "/tmp/transcribe.sh",
        FEISHU_AUDIO_TRANSCRIBE_LANGUAGE: "zh",
        FEISHU_AUDIO_TRANSCRIBE_SENSEVOICE_PYTHON: "/tmp/.venv-sensevoice/bin/python",
        FEISHU_AUDIO_TRANSCRIBE_SENSEVOICE_MODEL: "iic/SenseVoiceSmall",
        FEISHU_AUDIO_TRANSCRIBE_SENSEVOICE_DEVICE: "cpu",
        FEISHU_AUDIO_TRANSCRIBE_DOUBAO_API_KEY: "doubao-api-key",
        FEISHU_PROCESSING_REACTION_TYPE: "SMILE",
        STREAMING_ENABLED: true,
        TEXT_CHUNK_LIMIT: 2000,
      },
      runtimeState: {
        acquireLock,
        releaseLock,
        setAbortHandler,
        isStopRequested,
        isDraining,
      },
      sessionService: {
        getOrCreateActiveSession,
        touchSession,
      },
      workspaceService: {
        getUserWorkspaceDir: () => "/tmp/workspace",
      },
      promptRunner: {
        promptSession,
      },
      messenger: {
        sendTextMessage,
        addProcessingReaction,
      },
      quotedMessageStore: {
        readQuotedMessage: readCachedQuotedMessage,
      },
      downloadResource,
      readQuotedMessage,
      preparePromptInput,
    });

    await promptService.handleUserPrompt(
      { openId: "ou_1", userId: "u_1" },
      {
        kind: "audio",
        identity: { openId: "ou_1", userId: "u_1" },
        messageId: "om_audio_unsupported",
        messageType: "audio",
        createTime: "123",
        rawContent: '{"file_key":"file_123","duration":3200}',
        fileKey: "file_123",
        durationMs: 3200,
      },
    );

    expect(promptSession).not.toHaveBeenCalled();
    expect(sendTextMessage).toHaveBeenCalledWith(
      "ou_1",
      "❌ 错误: 豆包语音暂不支持当前音频格式（audio/mp4 / .m4a），请先改用 WAV、MP3 或 OGG/OPUS。",
    );
    expect(releaseLock).toHaveBeenCalledWith("ou_1");
  });

  it("排空期间应拒绝启动新任务并提示稍后再试", async () => {
    isDraining.mockReturnValue(true);

    const promptService = createPromptService({
      config: {
        FEISHU_MEDIA_OLLAMA_BASE_URL: "http://127.0.0.1:11434",
        FEISHU_MEDIA_OCR_MODEL: "glm-ocr:latest",
        FEISHU_AUDIO_TRANSCRIBE_PROVIDER: "sensevoice",
        FEISHU_AUDIO_TRANSCRIBE_SCRIPT: "/tmp/transcribe.sh",
        FEISHU_AUDIO_TRANSCRIBE_LANGUAGE: "zh",
        FEISHU_AUDIO_TRANSCRIBE_SENSEVOICE_PYTHON: "/tmp/.venv-sensevoice/bin/python",
        FEISHU_AUDIO_TRANSCRIBE_SENSEVOICE_MODEL: "iic/SenseVoiceSmall",
        FEISHU_AUDIO_TRANSCRIBE_SENSEVOICE_DEVICE: "cpu",
        FEISHU_PROCESSING_REACTION_TYPE: "SMILE",
        STREAMING_ENABLED: true,
        TEXT_CHUNK_LIMIT: 2000,
      },
      runtimeState: {
        acquireLock,
        releaseLock,
        setAbortHandler,
        isStopRequested,
        isDraining,
      },
      sessionService: {
        getOrCreateActiveSession,
        touchSession,
      },
      workspaceService: {
        getUserWorkspaceDir: () => "/tmp/workspace",
      },
      promptRunner: {
        promptSession,
      },
      messenger: {
        sendTextMessage,
        addProcessingReaction,
      },
      quotedMessageStore: {
        readQuotedMessage: readCachedQuotedMessage,
      },
      downloadResource,
      readQuotedMessage,
      preparePromptInput,
    });

    await promptService.handleUserPrompt(
      { openId: "ou_1", userId: "u_1" },
      {
        kind: "text",
        identity: { openId: "ou_1", userId: "u_1" },
        messageId: "om_restart_1",
        messageType: "text",
        createTime: "123",
        rawContent: '{"text":"hello"}',
        text: "hello",
      },
    );

    expect(acquireLock).not.toHaveBeenCalled();
    expect(promptSession).not.toHaveBeenCalled();
    expect(sendTextMessage).toHaveBeenCalledWith("ou_1", "网关正在重启，暂时不接新任务，请稍后再试。");
    expect(releaseLock).not.toHaveBeenCalled();
  });

  it("有重模型配置时应在 prompt 预处理前先执行模型路由并切换模型", async () => {
    const piSession = {
      model: { provider: "old", id: "model", input: ["text"] },
      setModel: vi.fn(async (model: { provider: string; id: string; input: string[] }) => {
        piSession.model = model;
      }),
      setThinkingLevel: vi.fn(),
      abort: vi.fn().mockResolvedValue(undefined),
    };
    getOrCreateActiveSession.mockResolvedValue({
      activeSessionId: "session_1",
      piSession,
    });
    const routedModel = { provider: "zen", id: "light", input: ["text"] };
    modelRouterRoute.mockResolvedValue({
      difficulty: "simple",
      reasonCode: "casual_qa",
      reason: "普通问答",
      slot: "light",
      modelPreference: { provider: "zen", id: "light" },
      model: routedModel,
    });

    const promptService = createPromptService({
      config: {
        FEISHU_MEDIA_OLLAMA_BASE_URL: "http://127.0.0.1:11434",
        FEISHU_MEDIA_OCR_MODEL: "glm-ocr:latest",
        FEISHU_AUDIO_TRANSCRIBE_PROVIDER: "sensevoice",
        FEISHU_AUDIO_TRANSCRIBE_SCRIPT: "/tmp/transcribe.sh",
        FEISHU_AUDIO_TRANSCRIBE_LANGUAGE: "zh",
        FEISHU_AUDIO_TRANSCRIBE_SENSEVOICE_PYTHON: "/tmp/.venv-sensevoice/bin/python",
        FEISHU_AUDIO_TRANSCRIBE_SENSEVOICE_MODEL: "iic/SenseVoiceSmall",
        FEISHU_AUDIO_TRANSCRIBE_SENSEVOICE_DEVICE: "cpu",
        FEISHU_PROCESSING_REACTION_TYPE: "SMILE",
        STREAMING_ENABLED: true,
        TEXT_CHUNK_LIMIT: 2000,
      },
      runtimeState: {
        acquireLock,
        releaseLock,
        setAbortHandler,
        isStopRequested,
        isDraining,
      },
      sessionService: {
        getOrCreateActiveSession,
        touchSession,
      },
      userStateStore: {
        readUserState: vi.fn().mockResolvedValue({
          activeSessionId: "session_1",
          createdAt: "2026-04-27T00:00:00.000Z",
          updatedAt: "2026-04-27T00:00:00.000Z",
          lastActiveAt: "2026-04-27T00:00:00.000Z",
          modelRouting: {
            enabled: true,
            routerModel: { provider: "cpa", id: "router" },
            lightModel: { provider: "zen", id: "light" },
            heavyModel: { provider: "cpa", id: "heavy" },
          },
          thinkingLevel: "low",
        }),
      },
      workspaceService: {
        getUserWorkspaceDir: () => "/tmp/workspace",
      },
      promptRunner: {
        promptSession,
      },
      messenger: {
        sendTextMessage,
        addProcessingReaction,
      },
      quotedMessageStore: {
        readQuotedMessage: readCachedQuotedMessage,
      },
      downloadResource,
      readQuotedMessage,
      preparePromptInput,
      modelRouter: { route: modelRouterRoute },
    });
    const infoSpy = vi.spyOn(console, "info").mockImplementation(() => undefined);

    await promptService.handleUserPrompt(
      { openId: "ou_1", userId: "u_1" },
      {
        kind: "text",
        identity: { openId: "ou_1", userId: "u_1" },
        messageId: "om_route_1",
        messageType: "text",
        createTime: "123",
        rawContent: '{"text":"hello"}',
        text: "hello",
      },
    );

    expect(modelRouterRoute).toHaveBeenCalledWith({
      message: expect.objectContaining({ text: "hello" }),
      userState: expect.objectContaining({ modelRouting: expect.any(Object) }),
    });
    const logLines = infoSpy.mock.calls.map(([line]) => String(line)).join("\n");
    expect(logLines).toContain("模型路由完成");
    expect(logLines).toContain("\"reason\":\"普通问答\"");
    infoSpy.mockRestore();
    expect(piSession.setModel).toHaveBeenCalledWith(routedModel);
    expect(piSession.setModel.mock.invocationCallOrder[0]).toBeLessThan(preparePromptInput.mock.invocationCallOrder[0]);
    expect(preparePromptInput).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ model: routedModel }),
      expect.anything(),
      expect.anything(),
    );
    expect(piSession.setThinkingLevel).toHaveBeenCalledWith("low");
  });

  it("私聊没有模型配置时不触发模型路由", async () => {
    const piSession = {
      model: { provider: "old", id: "model", input: ["text"] },
      setModel: vi.fn(),
      abort: vi.fn().mockResolvedValue(undefined),
    };
    getOrCreateActiveSession.mockResolvedValue({
      activeSessionId: "session_1",
      piSession,
    });
    const { promptService, readUserState } = createRoutingPromptService({
      userState: {
        activeSessionId: "session_1",
        createdAt: "2026-04-27T00:00:00.000Z",
        updatedAt: "2026-04-27T00:00:00.000Z",
        lastActiveAt: "2026-04-27T00:00:00.000Z",
      },
    });

    await promptService.handleUserPrompt(
      { openId: "ou_1", userId: "u_1" },
      textMessage({ messageId: "om_p2p_no_route" }),
    );

    expect(readUserState).toHaveBeenCalledWith("ou_1");
    expect(modelRouterRoute).not.toHaveBeenCalled();
    expect(piSession.setModel).not.toHaveBeenCalled();
    expect(promptSession).toHaveBeenCalled();
    expect(touchSession).toHaveBeenCalledWith("ou_1", "om_p2p_no_route");
  });

  it("私聊路由没有可用决策时继续使用当前模型", async () => {
    const piSession = {
      model: { provider: "old", id: "model", input: ["text"] },
      setModel: vi.fn(),
      abort: vi.fn().mockResolvedValue(undefined),
    };
    getOrCreateActiveSession.mockResolvedValue({
      activeSessionId: "session_1",
      piSession,
    });
    modelRouterRoute.mockResolvedValue(null);
    const { promptService } = createRoutingPromptService({
      userState: routingState(),
    });

    await promptService.handleUserPrompt(
      { openId: "ou_1", userId: "u_1" },
      textMessage({ messageId: "om_p2p_route_null" }),
    );

    expect(modelRouterRoute).toHaveBeenCalledWith({
      message: expect.objectContaining({ text: "hello" }),
      userState: expect.objectContaining({ modelRouting: expect.any(Object) }),
    });
    expect(piSession.setModel).not.toHaveBeenCalled();
    expect(preparePromptInput).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ model: { provider: "old", id: "model", input: ["text"] } }),
      expect.anything(),
      expect.anything(),
    );
  });

  it("群聊应使用群会话状态执行模型路由并切换模型", async () => {
    const target = {
      kind: "group",
      key: "oc_1",
      receiveIdType: "chat_id",
      receiveId: "oc_1",
      chatId: "oc_1",
    } as const;
    const piSession = {
      model: { provider: "old", id: "model", input: ["text"] },
      setModel: vi.fn(async (model: { provider: string; id: string; input: string[] }) => {
        piSession.model = model;
      }),
      setThinkingLevel: vi.fn(),
      abort: vi.fn().mockResolvedValue(undefined),
    };
    getOrCreateActiveSessionForTarget.mockResolvedValue({
      activeSessionId: "session_group_1",
      piSession,
    });
    const routedModel = { provider: "cpa", id: "heavy", input: ["text"] };
    modelRouterRoute.mockResolvedValue({
      difficulty: "hard",
      reasonCode: "complex_task",
      reason: "复杂任务",
      slot: "heavy",
      modelPreference: { provider: "cpa", id: "heavy" },
      model: routedModel,
    });
    const readUserState = vi.fn().mockResolvedValue(routingState());
    const { promptService, readSessionState } = createRoutingPromptService({
      readUserState,
      groupState: {
        ...routingState(),
        activeSessionId: "session_group_1",
        thinkingLevel: "medium",
      },
    });

    await promptService.handleUserPrompt(
      { openId: "ou_1", userId: "u_1" },
      textMessage({
        conversationTarget: target,
        messageId: "om_group_route",
      }),
    );

    expect(getOrCreateActiveSessionForTarget).toHaveBeenCalledWith({ openId: "ou_1", userId: "u_1" }, target);
    expect(getOrCreateActiveSession).not.toHaveBeenCalled();
    expect(readSessionState).toHaveBeenCalledWith({ openId: "ou_1", userId: "u_1" }, target);
    expect(readUserState).not.toHaveBeenCalled();
    expect(modelRouterRoute).toHaveBeenCalledWith({
      message: expect.objectContaining({ text: "hello", conversationTarget: target }),
      userState: expect.objectContaining({ modelRouting: expect.any(Object) }),
    });
    expect(piSession.setModel).toHaveBeenCalledWith(routedModel);
    expect(piSession.setThinkingLevel).toHaveBeenCalledWith("medium");
    expect(promptSession).toHaveBeenCalledWith(
      expect.objectContaining({ model: routedModel }),
      expect.anything(),
      "ou_1",
      "om_group_route",
      "SMILE",
      true,
      2000,
      "off",
      undefined,
      expect.any(Function),
      target,
    );
    expect(touchSessionForTarget).toHaveBeenCalledWith({ openId: "ou_1", userId: "u_1" }, target, "om_group_route");
    expect(touchSession).not.toHaveBeenCalled();
  });

  it("群聊没有模型配置时不读取私聊状态，也不触发模型路由", async () => {
    const target = {
      kind: "group",
      key: "oc_1",
      receiveIdType: "chat_id",
      receiveId: "oc_1",
      chatId: "oc_1",
    } as const;
    const piSession = {
      model: { provider: "old", id: "model", input: ["text"] },
      setModel: vi.fn(),
      abort: vi.fn().mockResolvedValue(undefined),
    };
    getOrCreateActiveSessionForTarget.mockResolvedValue({
      activeSessionId: "session_group_1",
      piSession,
    });
    const readUserState = vi.fn().mockResolvedValue(routingState());
    const { promptService, readSessionState } = createRoutingPromptService({
      readUserState,
      groupState: {
        activeSessionId: "session_group_1",
        createdAt: "2026-04-27T00:00:00.000Z",
        updatedAt: "2026-04-27T00:00:00.000Z",
        lastActiveAt: "2026-04-27T00:00:00.000Z",
      },
    });

    await promptService.handleUserPrompt(
      { openId: "ou_1", userId: "u_1" },
      textMessage({
        conversationTarget: target,
        messageId: "om_group_no_route",
      }),
    );

    expect(readSessionState).toHaveBeenCalledWith({ openId: "ou_1", userId: "u_1" }, target);
    expect(readUserState).not.toHaveBeenCalled();
    expect(modelRouterRoute).not.toHaveBeenCalled();
    expect(piSession.setModel).not.toHaveBeenCalled();
    expect(promptSession).toHaveBeenCalledWith(
      expect.objectContaining({ model: { provider: "old", id: "model", input: ["text"] } }),
      expect.anything(),
      "ou_1",
      "om_group_no_route",
      "SMILE",
      true,
      2000,
      "off",
      undefined,
      expect.any(Function),
      target,
    );
    expect(touchSessionForTarget).toHaveBeenCalledWith({ openId: "ou_1", userId: "u_1" }, target, "om_group_no_route");
  });
});
