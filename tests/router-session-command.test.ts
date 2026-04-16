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
      "📚 最近会话（第 1/1 页，共 2 个）\n用 /resume <序号> 切换。翻页：/sessions -n <页码>。\n\n| 序号 | 会话 | 消息 | 时间 |\n| --- | --- | --- | --- |\n| 1 | 这个项目 | 2 | 12m |\n| 2 | hello! | 14 | 2d |",
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
      "📚 最近会话（第 2/2 页，共 22 个）\n用 /resume <序号> 切换。翻页：/sessions -n <页码>。\n\n| 序号 | 会话 | 消息 | 时间 |\n| --- | --- | --- | --- |\n| 21 | 会话 21 | 21 | 12m |\n| 22 | 会话 22 | 22 | 12m |",
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
        messages: [
          { role: "user", content: "第一轮问题" },
          { role: "assistant", content: [{ type: "text", text: "第一轮回答" }] },
          { role: "user", content: "第二轮问题" },
          { role: "assistant", content: [{ type: "text", text: "第二轮回答" }] },
        ],
      },
    });

    await handleFeishuMessage({});

    expect(mocks.resumeSession).toHaveBeenCalledWith(
      { openId: "ou_1", userId: "u_1" },
      "1",
    );
    expect(mocks.sendRenderedMessage).toHaveBeenCalledWith(
      "ou_1",
      "✅ 已切换到会话: session_002\n🤖 当前模型: rightcodes/gpt-5.4-high\n\n历史消息：\nuser input: 第一轮问题\nmodel output: 第一轮回答\n\nuser input: 第二轮问题\nmodel output: 第二轮回答",
      2000,
    );
  });

  it("`/resume` 历史摘要不应回显引用/媒体包装提示", async () => {
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
        messages: [
          {
            role: "user",
            content:
              "用户这次是在回复一条之前的消息。\n被引用消息：\n上一条机器人消息\n\n用户这次的新消息：\n继续处理这个报错",
          },
          { role: "assistant", content: [{ type: "text", text: "先看日志" }] },
          {
            role: "user",
            content:
              "用户发来了一张图片，图片已保存到本地：/tmp/pi-workspace/user/.feishu-inbox/om_2/image.png\n当前模型不支持直接看图，以下是本地 OCR/视觉结果：\n这里是截图里的文字",
          },
          { role: "assistant", content: [{ type: "text", text: "我看到一张报错截图" }] },
        ],
      },
    });

    await handleFeishuMessage({});

    expect(mocks.sendRenderedMessage).toHaveBeenCalledWith(
      "ou_1",
      "✅ 已切换到会话: session_002\n\n历史消息：\nuser input: 继续处理这个报错\nmodel output: 先看日志\n\nuser input: [图片]\nmodel output: 我看到一张报错截图",
      2000,
    );
  });

  it("`/resume` 历史摘要应保留上一轮失败或停止状态", async () => {
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
        messages: [
          { role: "user", content: "第一轮问题" },
          {
            role: "assistant",
            content: [{ type: "text", text: "第一轮回答到一半" }],
            stopReason: "error",
            errorMessage: "网络断开",
          },
          { role: "user", content: "第二轮问题" },
          {
            role: "assistant",
            content: [{ type: "text", text: "第二轮回答到一半" }],
            stopReason: "aborted",
          },
        ],
      },
    });

    await handleFeishuMessage({});

    expect(mocks.sendRenderedMessage).toHaveBeenCalledWith(
      "ou_1",
      "✅ 已切换到会话: session_002\n\n历史消息：\nuser input: 第一轮问题\nmodel output: 第一轮回答到一半 （回复中断：网络断开）\n\nuser input: 第二轮问题\nmodel output: 第二轮回答到一半 （已停止）",
      2000,
    );
  });
});
