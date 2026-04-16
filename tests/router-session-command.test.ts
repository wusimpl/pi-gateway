import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  sendTextMessage: vi.fn(),
  sendRenderedMessage: vi.fn(),
  promptSession: vi.fn(),
  getOrCreateActiveSession: vi.fn(),
  createNewSession: vi.fn(),
  touchSession: vi.fn(),
  listSessions: vi.fn(),
  resumeSession: vi.fn(),
  readUserState: vi.fn(),
  parseMessageEvent: vi.fn(),
  isSupportedP2PMessage: vi.fn(),
  normalizeFeishuInboundMessage: vi.fn(),
  listAvailableModels: vi.fn(),
  findAvailableModel: vi.fn(),
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
  listSessions: mocks.listSessions,
  resumeSession: mocks.resumeSession,
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
  prepareFeishuPromptInput: vi.fn(),
}));

vi.mock("../src/pi/models.js", () => ({
  listAvailableModels: mocks.listAvailableModels,
  findAvailableModel: mocks.findAvailableModel,
  filterAvailableModels: (models: Array<{ provider: string }>, providerFilter?: string) => {
    const trimmed = providerFilter?.trim();
    if (!trimmed) {
      return models;
    }
    return models.filter((model) => model.provider === trimmed);
  },
  formatModelLabel: (provider: string, id: string) => `${provider}/${id}`,
}));

import { clearAllState, releaseLock } from "../src/app/state.js";
import { handleFeishuMessage, initRouter } from "../src/app/router.js";

const baseEvent = {
  sender: { senderId: { openId: "ou_1", userId: "u_1" } },
  message: { messageId: "om_1", messageType: "text", content: "{}" },
};

describe("handleFeishuMessage 会话历史命令", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-16T12:00:00.000Z"));

    clearAllState();
    releaseLock("ou_1");

    mocks.sendTextMessage.mockReset();
    mocks.sendRenderedMessage.mockReset();
    mocks.promptSession.mockReset();
    mocks.getOrCreateActiveSession.mockReset();
    mocks.createNewSession.mockReset();
    mocks.touchSession.mockReset();
    mocks.listSessions.mockReset();
    mocks.resumeSession.mockReset();
    mocks.readUserState.mockReset();
    mocks.parseMessageEvent.mockReset();
    mocks.isSupportedP2PMessage.mockReset();
    mocks.normalizeFeishuInboundMessage.mockReset();
    mocks.listAvailableModels.mockReset();
    mocks.findAvailableModel.mockReset();

    initRouter({
      FEISHU_PROCESSING_REACTION_TYPE: "SMILE",
      STREAMING_ENABLED: true,
      TEXT_CHUNK_LIMIT: 2000,
    } as any);

    mocks.parseMessageEvent.mockReturnValue(baseEvent);
    mocks.isSupportedP2PMessage.mockReturnValue(true);
    mocks.sendRenderedMessage.mockResolvedValue(undefined);
    mocks.sendTextMessage.mockResolvedValue("om_reply");
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("`/sessions` 会返回最近会话列表", async () => {
    mocks.normalizeFeishuInboundMessage.mockReturnValue({
      kind: "text",
      identity: { openId: "ou_1", userId: "u_1" },
      messageId: "om_1",
      messageType: "text",
      createTime: "123",
      rawContent: '{"text":"/sessions"}',
      text: "/sessions",
    });
    mocks.listSessions.mockResolvedValue([
      {
        order: 1,
        sessionId: "session_003",
        sessionFile: "/tmp/3.jsonl",
        isActive: true,
        firstMessage: "这个项目",
        messageCount: 2,
        updatedAt: "2026-04-16T11:48:00.000Z",
      },
      {
        order: 2,
        sessionId: "session_002",
        sessionFile: "/tmp/2.jsonl",
        isActive: false,
        firstMessage: "hello!",
        messageCount: 14,
        updatedAt: "2026-04-14T12:00:00.000Z",
      },
    ]);

    await handleFeishuMessage({});

    expect(mocks.listSessions).toHaveBeenCalledTimes(1);
    expect(mocks.sendRenderedMessage).toHaveBeenCalledWith(
      "ou_1",
      "📚 最近会话（第 1/1 页，共 2 个）\n用 /resume <序号> 切换。翻页：/sessions -n <页码>。* 表示当前会话。\n\n```text\n1. 这个项目                      2 12m *\n2. hello!                       14  2d  \n```",
      2000,
    );
  });

  it("`/sessions -n 2` 会返回第二页会话列表", async () => {
    mocks.normalizeFeishuInboundMessage.mockReturnValue({
      kind: "text",
      identity: { openId: "ou_1", userId: "u_1" },
      messageId: "om_1",
      messageType: "text",
      createTime: "123",
      rawContent: '{"text":"/sessions -n 2"}',
      text: "/sessions -n 2",
    });
    mocks.listSessions.mockResolvedValue(
      Array.from({ length: 22 }, (_, index) => ({
        order: index + 1,
        sessionId: `session_${String(index + 1).padStart(3, "0")}`,
        sessionFile: `/tmp/${index + 1}.jsonl`,
        isActive: index + 1 === 21,
        firstMessage: `会话 ${index + 1}`,
        messageCount: index + 1,
        updatedAt: "2026-04-16T11:48:00.000Z",
      })),
    );

    await handleFeishuMessage({});

    expect(mocks.sendRenderedMessage).toHaveBeenCalledWith(
      "ou_1",
      "📚 最近会话（第 2/2 页，共 22 个）\n用 /resume <序号> 切换。翻页：/sessions -n <页码>。* 表示当前会话。\n\n```text\n21. 会话 21                      21 12m *\n22. 会话 22                      22 12m  \n```",
      2000,
    );
  });

  it("`/sessions -n 3` 超出页码时会返回提示", async () => {
    mocks.normalizeFeishuInboundMessage.mockReturnValue({
      kind: "text",
      identity: { openId: "ou_1", userId: "u_1" },
      messageId: "om_1",
      messageType: "text",
      createTime: "123",
      rawContent: '{"text":"/sessions -n 3"}',
      text: "/sessions -n 3",
    });
    mocks.listSessions.mockResolvedValue(
      Array.from({ length: 22 }, (_, index) => ({
        order: index + 1,
        sessionId: `session_${String(index + 1).padStart(3, "0")}`,
        sessionFile: `/tmp/${index + 1}.jsonl`,
        isActive: false,
        firstMessage: `会话 ${index + 1}`,
        messageCount: index + 1,
        updatedAt: "2026-04-16T11:48:00.000Z",
      })),
    );

    await handleFeishuMessage({});

    expect(mocks.sendTextMessage).toHaveBeenCalledWith(
      "ou_1",
      "页码超出范围，目前只有 2 页。\n\n用 /sessions 看第一页，或用 /sessions -n <页码> 翻页。",
    );
  });

  it("`/resume` 会切换到指定会话", async () => {
    mocks.normalizeFeishuInboundMessage.mockReturnValue({
      kind: "text",
      identity: { openId: "ou_1", userId: "u_1" },
      messageId: "om_1",
      messageType: "text",
      createTime: "123",
      rawContent: '{"text":"/resume 1"}',
      text: "/resume 1",
    });
    mocks.resumeSession.mockResolvedValue({
      activeSessionId: "session_002",
      piSession: {
        model: { provider: "rightcodes", id: "gpt-5.4-high" },
      },
    });

    await handleFeishuMessage({});

    expect(mocks.resumeSession).toHaveBeenCalledWith(
      { openId: "ou_1", userId: "u_1" },
      "1",
    );
    expect(mocks.sendRenderedMessage).toHaveBeenCalledWith(
      "ou_1",
      "✅ 已切换到会话: session_002\n🤖 当前模型: rightcodes/gpt-5.4-high",
      2000,
    );
  });
});
