import { beforeEach, describe, expect, it, vi } from "vitest";
import { SUPER_ADMIN_OPEN_ID } from "../src/app/access-control.js";

const mocks = vi.hoisted(() => ({
  sendTextMessage: vi.fn(),
  sendRenderedMessage: vi.fn(),
  promptSession: vi.fn(),
  getOrCreateActiveSession: vi.fn(),
  getOrCreateActiveSessionForTarget: vi.fn(),
  touchSession: vi.fn(),
  touchSessionForTarget: vi.fn(),
  createNewSession: vi.fn(),
  listSessions: vi.fn(),
  resumeSession: vi.fn(),
  readSessionState: vi.fn(),
  readUserState: vi.fn(),
  parseMessageEvent: vi.fn(),
  isSupportedP2PMessage: vi.fn(),
  normalizeFeishuInboundMessage: vi.fn(),
  prepareFeishuPromptInput: vi.fn(),
}));

vi.mock("../src/feishu/send.js", () => ({
  sendTextMessage: mocks.sendTextMessage,
  sendRenderedMessage: mocks.sendRenderedMessage,
  sendTextMessageToTarget: vi.fn(),
  sendRenderedMessageToTarget: vi.fn(),
}));

vi.mock("../src/pi/stream.js", () => ({
  promptSession: mocks.promptSession,
}));

vi.mock("../src/pi/sessions.js", () => ({
  getOrCreateActiveSession: mocks.getOrCreateActiveSession,
  getOrCreateActiveSessionForTarget: mocks.getOrCreateActiveSessionForTarget,
  createNewSession: mocks.createNewSession,
  touchSession: mocks.touchSession,
  touchSessionForTarget: mocks.touchSessionForTarget,
  listSessions: mocks.listSessions,
  resumeSession: mocks.resumeSession,
  readSessionState: mocks.readSessionState,
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
  getConversationWorkspaceDir: () => "workspace/conversation",
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
    mocks.getOrCreateActiveSessionForTarget.mockReset();
    mocks.touchSession.mockReset();
    mocks.touchSessionForTarget.mockReset();
    mocks.createNewSession.mockReset();
    mocks.readUserState.mockReset();
    mocks.readSessionState.mockReset();
    mocks.parseMessageEvent.mockReset();
    mocks.isSupportedP2PMessage.mockReset();
    mocks.normalizeFeishuInboundMessage.mockReset();
    mocks.prepareFeishuPromptInput.mockReset();

    initRouter({
      FEISHU_PROCESSING_REACTION_TYPE: "SMILE",
      FEISHU_P2P_CHAT_POLICY: "all",
      FEISHU_P2P_CHAT_ALLOWLIST: [],
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
    mocks.getOrCreateActiveSessionForTarget.mockResolvedValue({
      activeSessionId: "session_group_1",
      piSession: { id: "pi_session_group" },
    });
    mocks.touchSession.mockResolvedValue(undefined);
    mocks.touchSessionForTarget.mockResolvedValue(undefined);
    mocks.readSessionState.mockResolvedValue(null);
  });









  it("运行中收到 /next 文本时应作为 follow-up 交给 Pi", async () => {
    const piSession = {
      id: "pi_session",
      isStreaming: true,
      steer: vi.fn().mockResolvedValue(undefined),
      followUp: vi.fn().mockResolvedValue(undefined),
      abort: vi.fn().mockResolvedValue(undefined),
    };
    mocks.getOrCreateActiveSession.mockResolvedValue({
      activeSessionId: "session_1",
      piSession,
    });

    let releasePrompt: (() => void) | undefined;
    mocks.promptSession.mockImplementationOnce(
      () => new Promise((resolve) => {
        releasePrompt = () => resolve({ text: "done", error: undefined });
      }),
    );

    mocks.parseMessageEvent.mockReturnValue({
      ...baseEvent,
      sender: { senderId: { openId: SUPER_ADMIN_OPEN_ID, userId: "u_super" } },
    });
    mocks.normalizeFeishuInboundMessage.mockReturnValue({
      kind: "text",
      identity: { openId: SUPER_ADMIN_OPEN_ID, userId: "u_super" },
      messageId: "om_1",
      messageType: "text",
      createTime: "123",
      rawContent: '{"text":"run"}',
      text: "run",
    });

    const firstCall = handleFeishuMessage({});
    await vi.waitFor(() => {
      expect(mocks.promptSession).toHaveBeenCalledTimes(1);
    });

    mocks.parseMessageEvent.mockReturnValue({
      ...baseEvent,
      sender: { senderId: { openId: SUPER_ADMIN_OPEN_ID, userId: "u_super" } },
      message: { ...baseEvent.message, messageId: "om_2", content: '{}' },
    });
    mocks.normalizeFeishuInboundMessage.mockReturnValue({
      kind: "text",
      identity: { openId: SUPER_ADMIN_OPEN_ID, userId: "u_super" },
      messageId: "om_2",
      messageType: "text",
      createTime: "124",
      rawContent: '{"text":"/next after this"}',
      text: "/next after this",
    });
    mocks.prepareFeishuPromptInput.mockResolvedValue({ text: "after this", localFiles: [] });

    await handleFeishuMessage({});

    expect(piSession.followUp).toHaveBeenCalledWith("after this", undefined);
    expect(piSession.steer).not.toHaveBeenCalled();
    expect(mocks.prepareFeishuPromptInput).toHaveBeenLastCalledWith(
      expect.objectContaining({
        messageId: "om_2",
        text: "after this",
        rawContent: '{"text":"after this"}',
      }),
      expect.anything(),
      expect.anything(),
      expect.anything(),
    );
    expect(mocks.promptSession).toHaveBeenCalledTimes(1);

    releasePrompt?.();
    await firstCall;
  });

  it("空闲时收到 /next 文本应直接作为普通 prompt 处理", async () => {
    mocks.parseMessageEvent.mockReturnValue({
      ...baseEvent,
      sender: { senderId: { openId: SUPER_ADMIN_OPEN_ID, userId: "u_super" } },
      message: { ...baseEvent.message, messageId: "om_next_idle" },
    });
    mocks.normalizeFeishuInboundMessage.mockReturnValue({
      kind: "text",
      identity: { openId: SUPER_ADMIN_OPEN_ID, userId: "u_super" },
      messageId: "om_next_idle",
      messageType: "text",
      createTime: "123",
      rawContent: '{"text":"/next after this"}',
      text: "/next after this",
    });
    mocks.prepareFeishuPromptInput.mockResolvedValue({ text: "after this", localFiles: [] });
    mocks.promptSession.mockResolvedValueOnce({ text: "done", error: undefined });

    await handleFeishuMessage({});

    expect(mocks.promptSession).toHaveBeenCalledTimes(1);
    expect(mocks.prepareFeishuPromptInput).toHaveBeenCalledWith(
      expect.objectContaining({
        messageId: "om_next_idle",
        text: "after this",
        rawContent: '{"text":"after this"}',
      }),
      expect.anything(),
      expect.anything(),
      expect.anything(),
    );
    expect(mocks.sendTextMessage).not.toHaveBeenCalled();
    expect(mocks.sendRenderedMessage).not.toHaveBeenCalled();
  });

  it("空 /next 应返回用法，不进入 prompt", async () => {
    mocks.parseMessageEvent.mockReturnValue({
      ...baseEvent,
      sender: { senderId: { openId: SUPER_ADMIN_OPEN_ID, userId: "u_super" } },
      message: { ...baseEvent.message, messageId: "om_next_empty" },
    });
    mocks.normalizeFeishuInboundMessage.mockReturnValue({
      kind: "text",
      identity: { openId: SUPER_ADMIN_OPEN_ID, userId: "u_super" },
      messageId: "om_next_empty",
      messageType: "text",
      createTime: "123",
      rawContent: '{"text":"/next"}',
      text: "/next",
    });

    await handleFeishuMessage({});

    expect(mocks.promptSession).not.toHaveBeenCalled();
    expect(mocks.sendRenderedMessage).toHaveBeenCalledWith(
      SUPER_ADMIN_OPEN_ID,
      "用法：/next <要排到当前任务后处理的内容>",
      2000,
    );
  });


});
