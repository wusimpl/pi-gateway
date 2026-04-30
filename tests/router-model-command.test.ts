import { beforeEach, describe, expect, it, vi } from "vitest";

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
  writeUserState: vi.fn(),
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
  writeUserState: mocks.writeUserState,
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
    mocks.promptSession.mockReset();
    mocks.getOrCreateActiveSession.mockReset();
    mocks.createNewSession.mockReset();
    mocks.touchSession.mockReset();
    mocks.readUserState.mockReset();
    mocks.writeUserState.mockReset();
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
    mocks.writeUserState.mockResolvedValue(undefined);
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
      { order: 1, provider: "openai", id: "gpt-4o", label: "openai/gpt-4o", name: "GPT-4o" },
      { order: 2, provider: "rightcodes", id: "gpt-5.4-high", label: "rightcodes/gpt-5.4-high", name: "gpt5.4-high" },
    ]);

    await handleFeishuMessage({});

    expect(mocks.listAvailableModels).toHaveBeenCalledTimes(1);
    expect(mocks.sendRenderedMessage).toHaveBeenCalledTimes(1);
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
      { order: 1, provider: "zen2api", id: "minimax-m2.5-free", label: "zen2api/minimax-m2.5-free", name: "MiniMax M2.5 Free" },
      { order: 2, provider: "rightcodes", id: "gpt-5.4-high", label: "rightcodes/gpt-5.4-high", name: "gpt5.4-high" },
    ]);

    await handleFeishuMessage({});

    expect(mocks.getOrCreateActiveSession).toHaveBeenCalledTimes(1);
    expect(mocks.listAvailableModels).toHaveBeenCalledTimes(1);
    expect(mocks.sendRenderedMessage).toHaveBeenCalledTimes(1);
  });

  it("`/new` 会返回新会话和当前模型", async () => {
    const piSession = {
      model: { provider: "rightcodes", id: "gpt-5.4-high" },
    };
    mocks.normalizeFeishuInboundMessage.mockReturnValue({
      kind: "text",
      identity: { openId: "ou_1", userId: "u_1" },
      messageId: "om_1",
      messageType: "text",
      createTime: "123",
      rawContent: '{"text":"/new"}',
      text: "/new",
    });
    mocks.createNewSession.mockResolvedValue({
      activeSessionId: "session_2",
      piSession,
    });

    await handleFeishuMessage({});

    expect(mocks.createNewSession).toHaveBeenCalledTimes(1);
    expect(mocks.sendRenderedMessage).toHaveBeenCalledWith(
      "ou_1",
      "✅ 已创建新会话\n🤖 当前模型: rightcodes/gpt-5.4-high",
      2000,
    );
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

    expect(mocks.getOrCreateActiveSession).toHaveBeenCalledTimes(1);
    expect(mocks.sendRenderedMessage).toHaveBeenCalledTimes(1);
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

    expect(mocks.getOrCreateActiveSession).toHaveBeenCalledTimes(1);
    expect(mocks.sendRenderedMessage).toHaveBeenCalledTimes(1);
  });

  it("`/model provider/model` 会切到指定的可用重模型", async () => {
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
      order: 2,
      provider: "rightcodes",
      id: "gpt-5.4-high",
      label: "rightcodes/gpt-5.4-high",
      name: "gpt5.4-high",
      model: { provider: "rightcodes", id: "gpt-5.4-high" },
    });

    await handleFeishuMessage({});

    expect(mocks.findAvailableModel).toHaveBeenCalledWith("rightcodes/gpt-5.4-high");
    expect(piSession.setModel).toHaveBeenCalledWith({ provider: "rightcodes", id: "gpt-5.4-high" });
    expect(mocks.writeUserState).toHaveBeenCalledWith(
      "ou_1",
      expect.objectContaining({ modelPreference: { provider: "rightcodes", id: "gpt-5.4-high" } }),
    );
    expect(mocks.sendRenderedMessage).toHaveBeenCalledTimes(1);
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
      order: 2,
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

  it("`/model 2` 会按 `/models` 序号设置重模型", async () => {
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
      rawContent: '{"text":"/model 2"}',
      text: "/model 2",
    });
    mocks.getOrCreateActiveSession.mockResolvedValue({
      activeSessionId: "session_1",
      piSession,
    });
    mocks.findAvailableModel.mockResolvedValue({
      order: 2,
      provider: "rightcodes",
      id: "gpt-5.4-high",
      label: "rightcodes/gpt-5.4-high",
      name: "gpt5.4-high",
      model: { provider: "rightcodes", id: "gpt-5.4-high" },
    });

    await handleFeishuMessage({});

    expect(mocks.findAvailableModel).toHaveBeenCalledWith("2");
    expect(piSession.setModel).toHaveBeenCalledWith({ provider: "rightcodes", id: "gpt-5.4-high" });
    expect(mocks.writeUserState).toHaveBeenCalledWith(
      "ou_1",
      expect.objectContaining({ modelPreference: { provider: "rightcodes", id: "gpt-5.4-high" } }),
    );
    expect(mocks.sendRenderedMessage).toHaveBeenCalledTimes(1);
  });

  it("`/model router provider/model` 只保存路由模型，不切当前 session 模型", async () => {
    const piSession = {
      model: { provider: "cpa", id: "heavy" },
      setModel: vi.fn(),
    };
    mocks.normalizeFeishuInboundMessage.mockReturnValue({
      kind: "text",
      identity: { openId: "ou_1", userId: "u_1" },
      messageId: "om_1",
      messageType: "text",
      createTime: "123",
      rawContent: '{"text":"/model router cpa/router"}',
      text: "/model router cpa/router",
    });
    mocks.getOrCreateActiveSession.mockResolvedValue({
      activeSessionId: "session_1",
      piSession,
    });
    mocks.findAvailableModel.mockResolvedValue({
      order: 1,
      provider: "cpa",
      id: "router",
      label: "cpa/router",
      model: { provider: "cpa", id: "router" },
    });

    await handleFeishuMessage({});

    expect(mocks.findAvailableModel).toHaveBeenCalledWith("cpa/router");
    expect(piSession.setModel).not.toHaveBeenCalled();
    expect(mocks.writeUserState).toHaveBeenCalledWith(
      "ou_1",
      expect.objectContaining({
        modelRouting: expect.objectContaining({ routerModel: { provider: "cpa", id: "router" } }),
      }),
    );
  });

  it("`/route on` 配置完整时开启路由", async () => {
    const piSession = {
      model: { provider: "cpa", id: "heavy" },
    };
    mocks.normalizeFeishuInboundMessage.mockReturnValue({
      kind: "text",
      identity: { openId: "ou_1", userId: "u_1" },
      messageId: "om_1",
      messageType: "text",
      createTime: "123",
      rawContent: '{"text":"/route on"}',
      text: "/route on",
    });
    mocks.getOrCreateActiveSession.mockResolvedValue({
      activeSessionId: "session_1",
      piSession,
    });
    mocks.readUserState.mockResolvedValue({
      activeSessionId: "session_1",
      createdAt: "2026-04-30T00:00:00.000Z",
      updatedAt: "2026-04-30T00:00:00.000Z",
      lastActiveAt: "2026-04-30T00:00:00.000Z",
      modelRouting: {
        routerModel: { provider: "cpa", id: "router" },
        lightModel: { provider: "zen", id: "light" },
        heavyModel: { provider: "cpa", id: "heavy" },
      },
    });

    await handleFeishuMessage({});

    expect(mocks.writeUserState).toHaveBeenCalledWith(
      "ou_1",
      expect.objectContaining({
        modelRouting: expect.objectContaining({ enabled: true }),
      }),
    );
    expect(mocks.sendRenderedMessage).toHaveBeenCalledTimes(1);
  });

  it("`/route on` 配置不完整时拒绝开启", async () => {
    mocks.normalizeFeishuInboundMessage.mockReturnValue({
      kind: "text",
      identity: { openId: "ou_1", userId: "u_1" },
      messageId: "om_1",
      messageType: "text",
      createTime: "123",
      rawContent: '{"text":"/route on"}',
      text: "/route on",
    });
    mocks.getOrCreateActiveSession.mockResolvedValue({
      activeSessionId: "session_1",
      piSession: { model: { provider: "cpa", id: "heavy" } },
    });
    mocks.readUserState.mockResolvedValue({
      activeSessionId: "session_1",
      createdAt: "2026-04-30T00:00:00.000Z",
      updatedAt: "2026-04-30T00:00:00.000Z",
      lastActiveAt: "2026-04-30T00:00:00.000Z",
      modelRouting: { heavyModel: { provider: "cpa", id: "heavy" } },
    });

    await handleFeishuMessage({});

    expect(mocks.writeUserState).not.toHaveBeenCalled();
    expect(mocks.sendTextMessage).toHaveBeenCalledWith(
      "ou_1",
      expect.stringContaining("请先设置 router/light/heavy 三类模型"),
    );
  });
});
