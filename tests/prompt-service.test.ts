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
  const downloadResource = vi.fn();

  beforeEach(() => {
    preparePromptInput.mockReset();
    promptSession.mockReset();
    sendTextMessage.mockReset();
    getOrCreateActiveSession.mockReset();
    touchSession.mockReset();
    acquireLock.mockReset();
    releaseLock.mockReset();
    downloadResource.mockReset();

    acquireLock.mockReturnValue(true);
    getOrCreateActiveSession.mockResolvedValue({
      activeSessionId: "session_1",
      piSession: { model: { input: ["text"] } },
    });
    preparePromptInput.mockResolvedValue({
      text: "转写后的文本",
      localFiles: ["/tmp/workspace/.feishu-inbox/om_1/audio.ogg"],
    });
    promptSession.mockResolvedValue({ text: "done", error: undefined });
    touchSession.mockResolvedValue(undefined);
  });

  it("应把显式资源下载器透传给 prompt 输入预处理", async () => {
    const promptService = createPromptService({
      config: {
        FEISHU_MEDIA_OLLAMA_BASE_URL: "http://127.0.0.1:11434",
        FEISHU_MEDIA_OCR_MODEL: "glm-ocr:latest",
        FEISHU_AUDIO_TRANSCRIBE_SCRIPT: "/tmp/transcribe.sh",
        FEISHU_AUDIO_TRANSCRIBE_LANGUAGE: "zh",
        FEISHU_PROCESSING_REACTION_TYPE: "SMILE",
        STREAMING_ENABLED: true,
        TEXT_CHUNK_LIMIT: 2000,
      },
      runtimeState: {
        acquireLock,
        releaseLock,
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
      { model: { input: ["text"] } },
      expect.objectContaining({
        workspaceDir: "/tmp/workspace",
        audioTranscribeScript: "/tmp/transcribe.sh",
      }),
      {
        downloadResource,
      },
    );
    expect(promptSession).toHaveBeenCalled();
    expect(sendTextMessage).not.toHaveBeenCalled();
    expect(releaseLock).toHaveBeenCalledWith("ou_1");
  });
});
