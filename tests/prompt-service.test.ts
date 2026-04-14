import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPromptService } from "../src/app/prompt-service.js";

describe("createPromptService", () => {
  const preparePromptInput = vi.fn();
  const promptSession = vi.fn();
  const sendTextMessage = vi.fn();
  const getOrCreateActiveSession = vi.fn();
  const touchSession = vi.fn();
  const acquireLock = vi.fn();
  const releaseLock = vi.fn();
  const setAbortHandler = vi.fn();
  const isStopRequested = vi.fn();
  const downloadResource = vi.fn();
  const readQuotedMessage = vi.fn();

  beforeEach(() => {
    preparePromptInput.mockReset();
    promptSession.mockReset();
    sendTextMessage.mockReset();
    getOrCreateActiveSession.mockReset();
    touchSession.mockReset();
    acquireLock.mockReset();
    releaseLock.mockReset();
    setAbortHandler.mockReset();
    isStopRequested.mockReset();
    downloadResource.mockReset();
    readQuotedMessage.mockReset();

    acquireLock.mockReturnValue(true);
    setAbortHandler.mockResolvedValue(false);
    isStopRequested.mockReturnValue(false);
    getOrCreateActiveSession.mockResolvedValue({
      activeSessionId: "session_1",
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
    readQuotedMessage.mockResolvedValue({
      messageId: "om_parent_1",
      messageType: "text",
      text: "上一条消息内容",
    });
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
    expect(sendTextMessage).not.toHaveBeenCalled();
    expect(releaseLock).toHaveBeenCalledWith("ou_1");
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
});
