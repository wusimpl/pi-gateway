import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  promptSession: vi.fn(),
  getOrCreateActiveSession: vi.fn(),
  touchSession: vi.fn(),
  parseMessageEvent: vi.fn(),
  isSupportedP2PMessage: vi.fn(),
  normalizeFeishuInboundMessage: vi.fn(),
  prepareFeishuPromptInput: vi.fn(),
}));

vi.mock("../src/pi/stream.js", () => ({
  promptSession: mocks.promptSession,
}));

vi.mock("../src/pi/sessions.js", () => ({
  getOrCreateActiveSession: mocks.getOrCreateActiveSession,
  createNewSession: vi.fn(),
  touchSession: mocks.touchSession,
}));

vi.mock("../src/storage/users.js", () => ({
  readUserState: vi.fn(),
}));

vi.mock("../src/feishu/events.js", () => ({
  parseMessageEvent: mocks.parseMessageEvent,
  isSupportedP2PMessage: mocks.isSupportedP2PMessage,
}));

vi.mock("../src/feishu/inbound/normalize.js", () => ({
  normalizeFeishuInboundMessage: mocks.normalizeFeishuInboundMessage,
}));

vi.mock("../src/feishu/inbound/transform.js", () => ({
  prepareFeishuPromptInput: mocks.prepareFeishuPromptInput,
}));

vi.mock("../src/feishu/send.js", () => ({
  sendTextMessage: vi.fn(),
  sendRenderedMessage: vi.fn(),
}));

vi.mock("../src/pi/workspace.js", () => ({
  getUserWorkspaceDir: () => "workspace/user",
}));

import { clearAllState } from "../src/app/state.js";
import { handleFeishuMessage, initRouter } from "../src/app/router.js";

describe("handleFeishuMessage 多模态消息", () => {
  beforeEach(() => {
    clearAllState();
    mocks.promptSession.mockReset();
    mocks.getOrCreateActiveSession.mockReset();
    mocks.touchSession.mockReset();
    mocks.parseMessageEvent.mockReset();
    mocks.isSupportedP2PMessage.mockReset();
    mocks.normalizeFeishuInboundMessage.mockReset();
    mocks.prepareFeishuPromptInput.mockReset();

    initRouter({
      FEISHU_PROCESSING_REACTION_TYPE: "SMILE",
      STREAMING_ENABLED: true,
      TEXT_CHUNK_LIMIT: 2000,
      FEISHU_MEDIA_OLLAMA_BASE_URL: "http://127.0.0.1:11434",
      FEISHU_MEDIA_OCR_MODEL: "glm-ocr:latest",
      FEISHU_AUDIO_TRANSCRIBE_SCRIPT: "/tmp/transcribe.sh",
      FEISHU_AUDIO_TRANSCRIBE_LANGUAGE: "zh",
    } as any);

    mocks.parseMessageEvent.mockReturnValue({
      sender: { senderId: { openId: "ou_1", userId: "u_1" } },
      message: { messageId: "om_1", messageType: "image" },
    });
    mocks.isSupportedP2PMessage.mockReturnValue(true);
    mocks.normalizeFeishuInboundMessage.mockReturnValue({
      kind: "image",
      identity: { openId: "ou_1", userId: "u_1" },
      messageId: "om_1",
      messageType: "image",
      createTime: "123",
      rawContent: '{"image_key":"img_123"}',
      imageKey: "img_123",
    });
    mocks.getOrCreateActiveSession.mockResolvedValue({
      activeSessionId: "session_1",
      piSession: { model: { input: ["text", "image"] } },
    });
    mocks.prepareFeishuPromptInput.mockResolvedValue({
      text: "用户发来了一张图片",
      images: [{ type: "image", data: "ZmFrZQ==", mimeType: "image/png" }],
      localFiles: ["workspace/user/.feishu-inbox/om_1/image.png"],
    });
    mocks.promptSession.mockResolvedValue({ text: "done", error: undefined });
    mocks.touchSession.mockResolvedValue(undefined);
  });

  it("图片消息应走中间层后再进入 Pi", async () => {
    await handleFeishuMessage({});

    expect(mocks.prepareFeishuPromptInput).toHaveBeenCalledTimes(1);
    expect(mocks.promptSession).toHaveBeenCalledWith(
      { model: { input: ["text", "image"] } },
      {
        text: "用户发来了一张图片",
        images: [{ type: "image", data: "ZmFrZQ==", mimeType: "image/png" }],
        localFiles: ["workspace/user/.feishu-inbox/om_1/image.png"],
      },
      "ou_1",
      "om_1",
      "SMILE",
      true,
      2000,
    );
  });
});
