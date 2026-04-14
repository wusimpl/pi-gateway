import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  sendTextMessage: vi.fn(),
  promptSession: vi.fn(),
  getOrCreateActiveSession: vi.fn(),
  touchSession: vi.fn(),
  createNewSession: vi.fn(),
  readUserState: vi.fn(),
  parseMessageEvent: vi.fn(),
  isP2PTextMessage: vi.fn(),
  extractTextContent: vi.fn(),
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("../src/feishu/send.js", () => ({
  sendTextMessage: mocks.sendTextMessage,
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
  isP2PTextMessage: mocks.isP2PTextMessage,
  extractTextContent: mocks.extractTextContent,
}));

vi.mock("../src/pi/workspace.js", () => ({
  getUserWorkspaceDir: () => "workspace/user",
}));

vi.mock("../src/app/logger.js", () => ({
  logger: mocks.logger,
}));

import { clearAllState } from "../src/app/state.js";
import { handleFeishuMessage, initRouter } from "../src/app/router.js";

const baseEvent = {
  sender: { senderId: { openId: "ou_1", userId: "u_1" } },
  message: { messageId: "om_1", content: "{}" },
};

describe("handleFeishuMessage 日志", () => {
  beforeEach(() => {
    clearAllState();
    mocks.sendTextMessage.mockReset();
    mocks.promptSession.mockReset();
    mocks.getOrCreateActiveSession.mockReset();
    mocks.touchSession.mockReset();
    mocks.createNewSession.mockReset();
    mocks.readUserState.mockReset();
    mocks.parseMessageEvent.mockReset();
    mocks.isP2PTextMessage.mockReset();
    mocks.extractTextContent.mockReset();
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
    mocks.isP2PTextMessage.mockReturnValue(true);
    mocks.getOrCreateActiveSession.mockResolvedValue({
      activeSessionId: "session_1",
      piSession: { id: "pi_session" },
    });
    mocks.promptSession.mockResolvedValue({ text: "done", error: undefined });
    mocks.touchSession.mockResolvedValue(undefined);
  });

  it("收到私聊消息时在 info 日志里打印前 30 个字符", async () => {
    const text = "123456789012345678901234567890XYZ";
    mocks.extractTextContent.mockReturnValue(text);

    await handleFeishuMessage({});

    expect(mocks.logger.info).toHaveBeenCalledWith(
      "收到私聊消息",
      expect.objectContaining({
        openId: "ou_1",
        messageId: "om_1",
        textLen: text.length,
        text: "123456789012345678901234567890",
      })
    );
  });
});
