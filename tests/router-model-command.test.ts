import { beforeEach, describe, expect, it, vi } from "vitest";
import { SUPER_ADMIN_OPEN_ID } from "../src/app/access-control.js";

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

import { acquireLock, clearAllState } from "../src/app/state.js";
import { handleFeishuMessage, initRouter } from "../src/app/router.js";

const baseEvent = {
  sender: { senderId: { openId: "ou_1", userId: "u_1" } },
  message: { messageId: "om_1", messageType: "text", content: "{}" },
};

describe("handleFeishuMessage 模型命令", () => {
  beforeEach(() => {
    clearAllState();

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
      rawContent: '{"text":"/model"}',
      text: "/model",
    });
    mocks.sendRenderedMessage.mockResolvedValue(undefined);
    mocks.sendTextMessage.mockResolvedValue("om_reply");
    mocks.writeUserState.mockResolvedValue(undefined);
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
















});
