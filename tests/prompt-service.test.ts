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
  });

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
        text: expect.stringContaining("当前对话来自飞书群聊。"),
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
});
