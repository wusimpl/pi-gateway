import { beforeEach, describe, expect, it, vi } from "vitest";

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

  it("已有处理中任务时后续消息应排队，首条完成后继续处理", async () => {
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

  it("不同会话目标的消息互不排队", async () => {
    const resolvers: Array<() => void> = [];
    mocks.promptSession.mockImplementation(
      () => new Promise((resolve) => {
        resolvers.push(() => resolve({ text: "done", error: undefined }));
      }),
    );

    mocks.normalizeFeishuInboundMessage.mockReturnValue({
      kind: "text",
      identity: { openId: "ou_1", userId: "u_1" },
      conversationTarget: {
        kind: "group",
        key: "oc_1",
        receiveIdType: "chat_id",
        receiveId: "oc_1",
        chatId: "oc_1",
      },
      messageId: "om_1",
      messageType: "text",
      createTime: "123",
      rawContent: '{"text":"first"}',
      text: "first",
    });
    mocks.prepareFeishuPromptInput.mockResolvedValue({ text: "first", localFiles: [] });

    const firstCall = handleFeishuMessage({});
    await vi.waitFor(() => {
      expect(mocks.promptSession).toHaveBeenCalledTimes(1);
    });

    mocks.parseMessageEvent.mockReturnValue({
      ...baseEvent,
      message: { ...baseEvent.message, messageId: "om_2", content: "{}" },
    });
    mocks.normalizeFeishuInboundMessage.mockReturnValue({
      kind: "text",
      identity: { openId: "ou_1", userId: "u_1" },
      conversationTarget: {
        kind: "group",
        key: "oc_2",
        receiveIdType: "chat_id",
        receiveId: "oc_2",
        chatId: "oc_2",
      },
      messageId: "om_2",
      messageType: "text",
      createTime: "124",
      rawContent: '{"text":"second"}',
      text: "second",
    });
    mocks.prepareFeishuPromptInput.mockResolvedValue({ text: "second", localFiles: [] });

    const secondCall = handleFeishuMessage({});
    await vi.waitFor(() => {
      expect(mocks.promptSession).toHaveBeenCalledTimes(2);
    });

    resolvers.forEach((resolve) => resolve());
    await firstCall;
    await secondCall;
  });

  it("运行中收到普通文本时应作为 steer 交给 Pi", async () => {
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

    await handleFeishuMessage({});

    expect(piSession.steer).toHaveBeenCalledWith("second", undefined);
    expect(piSession.followUp).not.toHaveBeenCalled();
    expect(mocks.promptSession).toHaveBeenCalledTimes(1);

    releasePrompt?.();
    await firstCall;

    expect(mocks.promptSession).toHaveBeenCalledTimes(1);
    expect(mocks.sendTextMessage).not.toHaveBeenCalled();
    expect(mocks.sendRenderedMessage).not.toHaveBeenCalled();
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
    mocks.normalizeFeishuInboundMessage.mockReturnValue({
      kind: "text",
      identity: { openId: "ou_1", userId: "u_1" },
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
    mocks.normalizeFeishuInboundMessage.mockReturnValue({
      kind: "text",
      identity: { openId: "ou_1", userId: "u_1" },
      messageId: "om_next_empty",
      messageType: "text",
      createTime: "123",
      rawContent: '{"text":"/next"}',
      text: "/next",
    });

    await handleFeishuMessage({});

    expect(mocks.promptSession).not.toHaveBeenCalled();
    expect(mocks.sendRenderedMessage).toHaveBeenCalledWith(
      "ou_1",
      "用法：/next <要排到当前任务后处理的内容>",
      2000,
    );
  });

  it("未知斜杠命令应直接返回不支持提示，不进入 prompt", async () => {
    mocks.normalizeFeishuInboundMessage.mockReturnValue({
      kind: "text",
      identity: { openId: "ou_1", userId: "u_1" },
      messageId: "om_unknown_slash",
      messageType: "text",
      createTime: "123",
      rawContent: '{"text":"/compact now"}',
      text: "/compact now",
    });

    await handleFeishuMessage({});

    expect(mocks.promptSession).not.toHaveBeenCalled();
    expect(mocks.sendRenderedMessage).toHaveBeenCalledWith(
      "ou_1",
      expect.stringContaining("暂不支持命令：/compact"),
      2000,
    );
  });
});
