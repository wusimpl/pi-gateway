import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  sendTextMessage: vi.fn(),
  sendTextMessageToTarget: vi.fn(),
  sendRenderedMessage: vi.fn(),
  sendRenderedMessageToTarget: vi.fn(),
  promptSession: vi.fn(),
  getOrCreateActiveSession: vi.fn(),
  touchSession: vi.fn(),
  createNewSession: vi.fn(),
  listSessions: vi.fn(),
  resumeSession: vi.fn(),
  readUserState: vi.fn(),
  parseMessageEvent: vi.fn(),
  isSupportedP2PMessage: vi.fn(),
  normalizeFeishuInboundMessage: vi.fn(),
  prepareFeishuPromptInput: vi.fn(),
  listAvailableModels: vi.fn(),
  findAvailableModel: vi.fn(),
  restartGateway: vi.fn(),
  recordRestartReadyNotification: vi.fn(),
  clearRestartReadyNotification: vi.fn(),
}));

vi.mock("../src/feishu/send.js", () => ({
  sendTextMessage: mocks.sendTextMessage,
  sendTextMessageToTarget: mocks.sendTextMessageToTarget,
  sendRenderedMessage: mocks.sendRenderedMessage,
  sendRenderedMessageToTarget: mocks.sendRenderedMessageToTarget,
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
  prepareFeishuPromptInput: mocks.prepareFeishuPromptInput,
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

vi.mock("../src/app/restart.js", () => ({
  RESTART_MESSAGE: "🔄 正在重启网关...",
  recordRestartReadyNotification: mocks.recordRestartReadyNotification,
  clearRestartReadyNotification: mocks.clearRestartReadyNotification,
  createRestartService: () => ({
    restartGateway: mocks.restartGateway,
  }),
}));

import { acquireLock, clearAllState, releaseLock } from "../src/app/state.js";
import { handleFeishuMessage, initRouter } from "../src/app/router.js";

const baseEvent = {
  sender: { senderId: { openId: "ou_1", userId: "u_1" } },
  message: { messageId: "om_1", messageType: "text", content: "{}" },
};

describe("handleFeishuMessage /restart", () => {
  beforeEach(() => {
    clearAllState();
    releaseLock("ou_1");
    releaseLock("ou_other");

    mocks.sendTextMessage.mockReset();
    mocks.sendTextMessageToTarget.mockReset();
    mocks.sendRenderedMessage.mockReset();
    mocks.sendRenderedMessageToTarget.mockReset();
    mocks.promptSession.mockReset();
    mocks.getOrCreateActiveSession.mockReset();
    mocks.touchSession.mockReset();
    mocks.createNewSession.mockReset();
    mocks.readUserState.mockReset();
    mocks.parseMessageEvent.mockReset();
    mocks.isSupportedP2PMessage.mockReset();
    mocks.normalizeFeishuInboundMessage.mockReset();
    mocks.prepareFeishuPromptInput.mockReset();
    mocks.listAvailableModels.mockReset();
    mocks.findAvailableModel.mockReset();
    mocks.restartGateway.mockReset();
    mocks.recordRestartReadyNotification.mockReset();
    mocks.clearRestartReadyNotification.mockReset();

    initRouter({
      DATA_DIR: "/tmp/pi-gateway-data",
      FEISHU_OWNER_OPEN_IDS: ["ou_1"],
      FEISHU_PROCESSING_REACTION_TYPE: "SMILE",
      STREAMING_ENABLED: true,
      TEXT_CHUNK_LIMIT: 2000,
    } as any);

    mocks.parseMessageEvent.mockReturnValue(baseEvent);
    mocks.isSupportedP2PMessage.mockReturnValue(true);
    mocks.sendRenderedMessage.mockResolvedValue(undefined);
    mocks.sendRenderedMessageToTarget.mockResolvedValue(undefined);
    mocks.sendTextMessage.mockResolvedValue("om_reply");
    mocks.sendTextMessageToTarget.mockResolvedValue("om_group_reply");
    mocks.restartGateway.mockResolvedValue(undefined);
    mocks.recordRestartReadyNotification.mockResolvedValue(undefined);
    mocks.clearRestartReadyNotification.mockResolvedValue(undefined);
  });

  it("空闲时会先回复，再触发网关重启", async () => {
    mocks.normalizeFeishuInboundMessage.mockReturnValue({
      kind: "text",
      identity: { openId: "ou_1", userId: "u_1" },
      messageId: "om_1",
      messageType: "text",
      createTime: "123",
      rawContent: '{"text":"/restart"}',
      text: "/restart",
    });

    await handleFeishuMessage({});

    expect(mocks.recordRestartReadyNotification).toHaveBeenCalledWith(
      "/tmp/pi-gateway-data",
      "ou_1",
      {
        kind: "p2p",
        key: "ou_1",
        receiveIdType: "open_id",
        receiveId: "ou_1",
      },
    );
    expect(mocks.sendRenderedMessage).toHaveBeenCalledWith("ou_1", "🔄 正在重启网关...", 2000);
    expect(mocks.restartGateway).toHaveBeenCalledTimes(1);
    expect(mocks.clearRestartReadyNotification).not.toHaveBeenCalled();
  });

  it("群聊里重启会把完成通知登记到当前群聊", async () => {
    const target = {
      kind: "group",
      key: "oc_1",
      receiveIdType: "chat_id",
      receiveId: "oc_1",
      chatId: "oc_1",
    } as const;
    mocks.normalizeFeishuInboundMessage.mockReturnValue({
      kind: "text",
      identity: { openId: "ou_1", userId: "u_1" },
      messageId: "om_group_restart",
      messageType: "text",
      createTime: "123",
      rawContent: '{"text":"/restart"}',
      text: "/restart",
      conversationTarget: target,
    });

    await handleFeishuMessage({});

    expect(mocks.recordRestartReadyNotification).toHaveBeenCalledWith(
      "/tmp/pi-gateway-data",
      "ou_1",
      target,
    );
    expect(mocks.sendRenderedMessageToTarget).toHaveBeenCalledWith(target, "🔄 正在重启网关...", 2000);
    expect(mocks.sendRenderedMessage).not.toHaveBeenCalled();
    expect(mocks.restartGateway).toHaveBeenCalledTimes(1);
  });

  it("只要还有任何用户任务在跑，就拒绝重启", async () => {
    acquireLock("ou_other", "busy_message");
    mocks.normalizeFeishuInboundMessage.mockReturnValue({
      kind: "text",
      identity: { openId: "ou_1", userId: "u_1" },
      messageId: "om_2",
      messageType: "text",
      createTime: "124",
      rawContent: '{"text":"/restart"}',
      text: "/restart",
    });

    await handleFeishuMessage({});

    expect(mocks.sendTextMessage).toHaveBeenCalledWith(
      "ou_1",
      "当前还有任务在跑，等这条回复结束后再重启网关。",
    );
    expect(mocks.sendRenderedMessage).not.toHaveBeenCalled();
    expect(mocks.recordRestartReadyNotification).not.toHaveBeenCalled();
    expect(mocks.restartGateway).not.toHaveBeenCalled();
  });

  it("开始重启后应拒绝新的普通消息任务", async () => {
    mocks.normalizeFeishuInboundMessage
      .mockReturnValueOnce({
        kind: "text",
        identity: { openId: "ou_1", userId: "u_1" },
        messageId: "om_restart",
        messageType: "text",
        createTime: "125",
        rawContent: '{"text":"/restart"}',
        text: "/restart",
      })
      .mockReturnValueOnce({
        kind: "text",
        identity: { openId: "ou_other", userId: "u_2" },
        messageId: "om_prompt",
        messageType: "text",
        createTime: "126",
        rawContent: '{"text":"hello"}',
        text: "hello",
      });

    await handleFeishuMessage({});
    await handleFeishuMessage({});

    expect(mocks.restartGateway).toHaveBeenCalledTimes(1);
    expect(mocks.sendTextMessage).toHaveBeenCalledWith(
      "ou_other",
      "网关正在重启，暂时不接新任务，请稍后再试。",
    );
    expect(mocks.promptSession).not.toHaveBeenCalled();
  });

  it("重启触发失败时会清掉上线通知记录", async () => {
    mocks.restartGateway.mockRejectedValue(new Error("restart failed"));
    mocks.normalizeFeishuInboundMessage.mockReturnValue({
      kind: "text",
      identity: { openId: "ou_1", userId: "u_1" },
      messageId: "om_3",
      messageType: "text",
      createTime: "127",
      rawContent: '{"text":"/restart"}',
      text: "/restart",
    });

    await handleFeishuMessage({});

    expect(mocks.recordRestartReadyNotification).toHaveBeenCalledWith(
      "/tmp/pi-gateway-data",
      "ou_1",
      {
        kind: "p2p",
        key: "ou_1",
        receiveIdType: "open_id",
        receiveId: "ou_1",
      },
    );
    expect(mocks.clearRestartReadyNotification).toHaveBeenCalledWith("/tmp/pi-gateway-data");
    expect(mocks.sendTextMessage).toHaveBeenCalledWith("ou_1", "❌ 错误: 命令处理失败，请稍后重试");
  });
});
