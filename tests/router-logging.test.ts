import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  sendTextMessage: vi.fn(),
  sendRenderedMessage: vi.fn(),
  promptSession: vi.fn(),
  getOrCreateActiveSession: vi.fn(),
  touchSession: vi.fn(),
  createNewSession: vi.fn(),
  readUserState: vi.fn(),
  parseMessageEvent: vi.fn(),
  isSupportedP2PMessage: vi.fn(),
  normalizeFeishuInboundMessage: vi.fn(),
  prepareFeishuPromptInput: vi.fn(),
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("../src/feishu/send.js", () => ({
  sendTextMessage: mocks.sendTextMessage,
  sendRenderedMessage: mocks.sendRenderedMessage,
}));

vi.mock("../src/pi/stream.js", () => ({
  promptSession: mocks.promptSession,
}));

vi.mock("../src/pi/sessions.js", () => ({
  getOrCreateActiveSession: mocks.getOrCreateActiveSession,
  createNewSession: mocks.createNewSession,
  touchSession: mocks.touchSession,
}));

vi.mock("../src/storage/users.js", () => ({
  readUserState: mocks.readUserState,
}));

vi.mock("../src/feishu/events.js", () => ({
  parseMessageEvent: mocks.parseMessageEvent,
  isSupportedP2PMessage: mocks.isSupportedP2PMessage,
}));

vi.mock("../src/pi/workspace.js", () => ({
  getUserWorkspaceDir: () => "workspace/user",
}));

vi.mock("../src/feishu/inbound/normalize.js", () => ({
  normalizeFeishuInboundMessage: mocks.normalizeFeishuInboundMessage,
}));

vi.mock("../src/feishu/inbound/transform.js", () => ({
  prepareFeishuPromptInput: mocks.prepareFeishuPromptInput,
}));

vi.mock("../src/app/logger.js", () => ({
  logger: mocks.logger,
}));

import { clearAllState } from "../src/app/state.js";
import { handleFeishuMessage, initRouter } from "../src/app/router.js";

const baseEvent = {
  sender: { senderId: { openId: "ou_1", userId: "u_1" } },
  message: { messageId: "om_1", messageType: "text", content: "{}" },
};

describe("handleFeishuMessage 日志", () => {
  beforeEach(() => {
    clearAllState();
    mocks.sendTextMessage.mockReset();
    mocks.sendRenderedMessage.mockReset();
    mocks.promptSession.mockReset();
    mocks.getOrCreateActiveSession.mockReset();
    mocks.touchSession.mockReset();
    mocks.createNewSession.mockReset();
    mocks.readUserState.mockReset();
    mocks.parseMessageEvent.mockReset();
    mocks.isSupportedP2PMessage.mockReset();
    mocks.normalizeFeishuInboundMessage.mockReset();
    mocks.prepareFeishuPromptInput.mockReset();
    mocks.logger.debug.mockReset();
    mocks.logger.info.mockReset();
    mocks.logger.warn.mockReset();
    mocks.logger.error.mockReset();

    initRouter({
      FEISHU_PROCESSING_REACTION_TYPE: "SMILE",
      STREAMING_ENABLED: true,
      TEXT_CHUNK_LIMIT: 2000,
    } as any);

    mocks.parseMessageEvent.mockReturnValue(baseEvent);
    mocks.isSupportedP2PMessage.mockReturnValue(true);
    mocks.normalizeFeishuInboundMessage.mockReturnValue({
      kind: "text",
      identity: { openId: "ou_1", userId: "u_1" },
      messageId: "om_1",
      messageType: "text",
      createTime: "123",
      rawContent: '{"text":"hello"}',
      text: "hello",
    });
    mocks.getOrCreateActiveSession.mockResolvedValue({
      activeSessionId: "session_1",
      piSession: { id: "pi_session" },
    });
    mocks.prepareFeishuPromptInput.mockResolvedValue({ text: "hello", localFiles: [] });
    mocks.promptSession.mockResolvedValue({ text: "done", error: undefined });
    mocks.touchSession.mockResolvedValue(undefined);
  });

  it("收到私聊消息时在 info 日志里打印前 30 个字符", async () => {
    const text = "123456789012345678901234567890XYZ";
    mocks.normalizeFeishuInboundMessage.mockReturnValue({
      kind: "text",
      identity: { openId: "ou_1", userId: "u_1" },
      messageId: "om_1",
      messageType: "text",
      createTime: "123",
      rawContent: `{\"text\":\"${text}\"}`,
      text,
    });

    await handleFeishuMessage({});

    expect(mocks.logger.info).toHaveBeenCalledWith(
      "收到私聊消息",
      expect.objectContaining({
        openId: "ou_1",
        messageId: "om_1",
        messageType: "text",
        textLen: text.length,
        text: "123456789012345678901234567890",
      })
    );
  });

  it("重复消息只打忽略日志，不再重复打印收到私聊消息", async () => {
    await handleFeishuMessage({});
    await handleFeishuMessage({});

    expect(
      mocks.logger.info.mock.calls.filter(([message]) => message === "收到私聊消息")
    ).toHaveLength(1);
    expect(mocks.logger.debug).toHaveBeenCalledWith("重复消息已忽略", {
      openId: "ou_1",
      messageId: "om_1",
    });
  });
});
