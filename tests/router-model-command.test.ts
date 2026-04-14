import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  sendTextMessage: vi.fn(),
  sendRenderedMessage: vi.fn(),
  getOrCreateActiveSession: vi.fn(),
  createNewSession: vi.fn(),
  touchSession: vi.fn(),
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

import { acquireLock, clearAllState, releaseLock } from "../src/app/state.js";
import { handleFeishuMessage, initRouter } from "../src/app/router.js";

const baseEvent = {
  sender: { senderId: { openId: "ou_1", userId: "u_1" } },
  message: { messageId: "om_1", messageType: "text", content: "{}" },
};

describe("handleFeishuMessage 模型命令", () => {
  beforeEach(() => {
    clearAllState();
    releaseLock("ou_1");

    mocks.sendTextMessage.mockReset();
    mocks.sendRenderedMessage.mockReset();
    mocks.getOrCreateActiveSession.mockReset();
    mocks.createNewSession.mockReset();
    mocks.touchSession.mockReset();
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
    mocks.normalizeFeishuInboundMessage.mockReturnValue({
      kind: "text",
      identity: { openId: "ou_1", userId: "u_1" },
      messageId: "om_1",
      messageType: "text",
      createTime: "123",
      rawContent: '{"text":"/models"}',
      text: "/models",
    });
    mocks.sendRenderedMessage.mockResolvedValue(undefined);
    mocks.sendTextMessage.mockResolvedValue("om_reply");
  });

  it("`/models` 只返回当前可用模型", async () => {
    mocks.normalizeFeishuInboundMessage.mockReturnValue({
      kind: "text",
      identity: { openId: "ou_1", userId: "u_1" },
      messageId: "om_1",
      messageType: "text",
      createTime: "123",
      rawContent: '{"text":"/models"}',
      text: "/models",
    });
    mocks.listAvailableModels.mockResolvedValue([
      { provider: "openai", id: "gpt-4o", label: "openai/gpt-4o", name: "GPT-4o" },
      { provider: "rightcodes", id: "gpt-5.4-high", label: "rightcodes/gpt-5.4-high", name: "gpt5.4-high" },
    ]);

    await handleFeishuMessage({});

    expect(mocks.sendRenderedMessage).toHaveBeenCalledTimes(1);
    const [, replyText] = mocks.sendRenderedMessage.mock.calls[0];
    expect(replyText).toContain("只显示当前环境真的能用的模型");
    expect(replyText).toContain("openai/gpt-4o");
    expect(replyText).toContain("rightcodes/gpt-5.4-high");
  });

  it("`/model` 会返回当前模型和可用模型数量", async () => {
    const piSession = {
      model: { provider: "zen2api", id: "minimax-m2.5-free" },
    };
    mocks.normalizeFeishuInboundMessage.mockReturnValue({
      kind: "text",
      identity: { openId: "ou_1", userId: "u_1" },
      messageId: "om_1",
      messageType: "text",
      createTime: "123",
      rawContent: '{"text":"/model"}',
      text: "/model",
    });
    mocks.getOrCreateActiveSession.mockResolvedValue({
      activeSessionId: "session_1",
      piSession,
    });
    mocks.listAvailableModels.mockResolvedValue([
      { provider: "zen2api", id: "minimax-m2.5-free", label: "zen2api/minimax-m2.5-free", name: "MiniMax M2.5 Free" },
      { provider: "rightcodes", id: "gpt-5.4-high", label: "rightcodes/gpt-5.4-high", name: "gpt5.4-high" },
    ]);

    await handleFeishuMessage({});

    expect(mocks.sendRenderedMessage).toHaveBeenCalledTimes(1);
    const [, replyText] = mocks.sendRenderedMessage.mock.calls[0];
    expect(replyText).toContain("zen2api/minimax-m2.5-free");
    expect(replyText).toContain("2 个");
  });

  it("`/context` 会返回当前 session 实际加载的 context 文件", async () => {
    const piSession = {
      resourceLoader: {
        getAgentsFiles: () => ({
          agentsFiles: [
            { path: "/Users/williamsandy/.pi/agent/AGENTS.md" },
            { path: "/Users/williamsandy/code/pi-gateway/AGENTS.md" },
          ],
        }),
      },
    };
    mocks.normalizeFeishuInboundMessage.mockReturnValue({
      kind: "text",
      identity: { openId: "ou_1", userId: "u_1" },
      messageId: "om_1",
      messageType: "text",
      createTime: "123",
      rawContent: '{"text":"/context"}',
      text: "/context",
    });
    mocks.getOrCreateActiveSession.mockResolvedValue({
      activeSessionId: "session_1",
      piSession,
    });

    await handleFeishuMessage({});

    expect(mocks.sendRenderedMessage).toHaveBeenCalledTimes(1);
    const [, replyText] = mocks.sendRenderedMessage.mock.calls[0];
    expect(replyText).toContain("[Context]");
    expect(replyText).toContain("~/.pi/agent/AGENTS.md");
    expect(replyText).toContain("~/code/pi-gateway/AGENTS.md");
  });

  it("`/skills` 会返回当前 session 实际加载的 skills", async () => {
    const piSession = {
      resourceLoader: {
        getSkills: () => ({
          skills: [
            {
              filePath: "/Users/williamsandy/.agents/skills/exa-search/SKILL.md",
              sourceInfo: { scope: "user" },
            },
            {
              filePath: "/Users/williamsandy/code/pi-gateway/.agents/skills/local/SKILL.md",
              sourceInfo: { scope: "project" },
            },
          ],
        }),
      },
    };
    mocks.normalizeFeishuInboundMessage.mockReturnValue({
      kind: "text",
      identity: { openId: "ou_1", userId: "u_1" },
      messageId: "om_1",
      messageType: "text",
      createTime: "123",
      rawContent: '{"text":"/skills"}',
      text: "/skills",
    });
    mocks.getOrCreateActiveSession.mockResolvedValue({
      activeSessionId: "session_1",
      piSession,
    });

    await handleFeishuMessage({});

    expect(mocks.sendRenderedMessage).toHaveBeenCalledTimes(1);
    const [, replyText] = mocks.sendRenderedMessage.mock.calls[0];
    expect(replyText).toContain("[Skills]");
    expect(replyText).toContain("  user");
    expect(replyText).toContain("~/.agents/skills/exa-search/SKILL.md");
    expect(replyText).toContain("  project");
    expect(replyText).toContain("~/code/pi-gateway/.agents/skills/local/SKILL.md");
  });

  it("`/model provider/model` 会切到指定的可用模型", async () => {
    const piSession = {
      model: { provider: "zen2api", id: "minimax-m2.5-free" },
      setModel: vi.fn(async (model: { provider: string; id: string }) => {
        piSession.model = { provider: model.provider, id: model.id };
      }),
    };
    mocks.normalizeFeishuInboundMessage.mockReturnValue({
      kind: "text",
      identity: { openId: "ou_1", userId: "u_1" },
      messageId: "om_1",
      messageType: "text",
      createTime: "123",
      rawContent: '{"text":"/model rightcodes/gpt-5.4-high"}',
      text: "/model rightcodes/gpt-5.4-high",
    });
    mocks.getOrCreateActiveSession.mockResolvedValue({
      activeSessionId: "session_1",
      piSession,
    });
    mocks.findAvailableModel.mockResolvedValue({
      provider: "rightcodes",
      id: "gpt-5.4-high",
      label: "rightcodes/gpt-5.4-high",
      name: "gpt5.4-high",
      model: { provider: "rightcodes", id: "gpt-5.4-high" },
    });

    await handleFeishuMessage({});

    expect(piSession.setModel).toHaveBeenCalledWith({ provider: "rightcodes", id: "gpt-5.4-high" });
    const [, replyText] = mocks.sendRenderedMessage.mock.calls[0];
    expect(replyText).toContain("已切到模型");
    expect(replyText).toContain("rightcodes/gpt-5.4-high");
    expect(replyText).toContain("zen2api/minimax-m2.5-free");
  });

  it("模型切换时如果用户还有任务在跑，就直接提示稍后再切", async () => {
    mocks.normalizeFeishuInboundMessage.mockReturnValue({
      kind: "text",
      identity: { openId: "ou_1", userId: "u_1" },
      messageId: "om_1",
      messageType: "text",
      createTime: "123",
      rawContent: '{"text":"/model rightcodes/gpt-5.4-high"}',
      text: "/model rightcodes/gpt-5.4-high",
    });
    mocks.findAvailableModel.mockResolvedValue({
      provider: "rightcodes",
      id: "gpt-5.4-high",
      label: "rightcodes/gpt-5.4-high",
      name: "gpt5.4-high",
      model: { provider: "rightcodes", id: "gpt-5.4-high" },
    });
    acquireLock("ou_1", "busy_message");

    await handleFeishuMessage({});

    expect(mocks.sendTextMessage).toHaveBeenCalledWith(
      "ou_1",
      "当前还有任务在跑，等这条回复结束后再切模型。",
    );
    expect(mocks.getOrCreateActiveSession).not.toHaveBeenCalled();
  });
});
