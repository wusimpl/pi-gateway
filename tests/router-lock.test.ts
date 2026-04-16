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

import { clearAllState } from "../src/app/state.js";
import { handleFeishuMessage, initRouter } from "../src/app/router.js";

const baseEvent = {
  sender: { senderId: { openId: "ou_1", userId: "u_1" } },
  message: { messageId: "om_1", messageType: "text", content: '{}' },
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
    mocks.isSupportedP2PMessage.mockReset();
    mocks.normalizeFeishuInboundMessage.mockReset();
    mocks.prepareFeishuPromptInput.mockReset();

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
    mocks.prepareFeishuPromptInput.mockResolvedValue({ text: "hello", localFiles: [] });
    mocks.getOrCreateActiveSession.mockResolvedValue({
      activeSessionId: "session_1",
      piSession: { id: "pi_session" },
    });
    mocks.touchSession.mockResolvedValue(undefined);
  });

  it("已有处理中任务时应排队等待，前一条结束后继续处理下一条", async () => {
    let releasePrompt: (() => void) | undefined;
    mocks.promptSession
      .mockImplementationOnce(
        () => new Promise((resolve) => {
          releasePrompt = () => resolve({ text: "done", error: undefined });
        })
      )
      .mockResolvedValueOnce({ text: "done second", error: undefined });

    const firstCall = handleFeishuMessage({});
    await vi.waitFor(() => {
      expect(mocks.promptSession).toHaveBeenCalledTimes(1);
    });

    mocks.parseMessageEvent.mockReturnValue({
      ...baseEvent,
      message: { ...baseEvent.message, messageId: "om_2", content: '{}' },
    });
    mocks.normalizeFeishuInboundMessage.mockReturnValue({
      kind: "text",
      identity: { openId: "ou_1", userId: "u_1" },
      messageId: "om_2",
      messageType: "text",
      createTime: "124",
      rawContent: '{"text":"second"}',
      text: "second",
    });
    mocks.prepareFeishuPromptInput.mockResolvedValue({ text: "second", localFiles: [] });

    const secondCall = handleFeishuMessage({});

    await Promise.resolve();
    expect(mocks.promptSession).toHaveBeenCalledTimes(1);

    releasePrompt?.();
    await firstCall;
    await secondCall;

    expect(mocks.promptSession).toHaveBeenCalledTimes(2);
    expect(mocks.prepareFeishuPromptInput).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        messageId: "om_2",
        text: "second",
      }),
      expect.anything(),
      expect.anything(),
      expect.anything(),
    );
    expect(mocks.sendTextMessage).not.toHaveBeenCalled();
    expect(mocks.sendRenderedMessage).not.toHaveBeenCalled();
  });
});
