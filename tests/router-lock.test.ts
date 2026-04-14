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
  isP2PTextMessage: vi.fn(),
  extractTextContent: vi.fn(),
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
  isP2PTextMessage: mocks.isP2PTextMessage,
  extractTextContent: mocks.extractTextContent,
}));

vi.mock("../src/pi/workspace.js", () => ({
  getUserWorkspaceDir: () => "workspace/user",
}));

import { clearAllState } from "../src/app/state.js";
import { handleFeishuMessage, initRouter } from "../src/app/router.js";

const baseEvent = {
  sender: { senderId: { openId: "ou_1", userId: "u_1" } },
  message: { messageId: "om_1", content: '{}' },
};

describe("handleFeishuMessage 运行锁", () => {
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
    mocks.isP2PTextMessage.mockReset();
    mocks.extractTextContent.mockReset();

    initRouter({
      FEISHU_PROCESSING_REACTION_TYPE: "SMILE",
      STREAMING_ENABLED: true,
      TEXT_CHUNK_LIMIT: 2000,
    } as any);

    mocks.parseMessageEvent.mockReturnValue(baseEvent);
    mocks.isP2PTextMessage.mockReturnValue(true);
    mocks.extractTextContent.mockReturnValue("hello");
    mocks.getOrCreateActiveSession.mockResolvedValue({
      activeSessionId: "session_1",
      piSession: { id: "pi_session" },
    });
    mocks.touchSession.mockResolvedValue(undefined);
  });

  it("已有处理中任务时不再发送提示消息，仅忽略后续消息", async () => {
    let releasePrompt: (() => void) | undefined;
    mocks.promptSession.mockImplementation(
      () => new Promise((resolve) => {
        releasePrompt = () => resolve({ text: "done", error: undefined });
      })
    );

    const firstCall = handleFeishuMessage({});
    await Promise.resolve();

    mocks.parseMessageEvent.mockReturnValue({
      ...baseEvent,
      message: { ...baseEvent.message, messageId: "om_2", content: '{}' },
    });
    mocks.extractTextContent.mockReturnValue("second");

    await handleFeishuMessage({});

    expect(mocks.promptSession).toHaveBeenCalledTimes(1);
    expect(mocks.sendTextMessage).not.toHaveBeenCalled();
    expect(mocks.sendRenderedMessage).not.toHaveBeenCalled();

    releasePrompt?.();
    await firstCall;
  });
});
