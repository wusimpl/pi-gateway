import { describe, expect, it, vi } from "vitest";
import { createCommandService } from "../src/app/command-service.js";

describe("createCommandService conversation target", () => {
  it("/stop 使用当前会话目标 key", async () => {
    const requestStop = vi.fn().mockResolvedValue("requested");
    const sendRenderedMessage = vi.fn().mockResolvedValue(undefined);
    const sendRenderedMessageToTarget = vi.fn().mockResolvedValue(undefined);
    const service = createCommandService({
      config: {
        TEXT_CHUNK_LIMIT: 2000,
        CRON_DEFAULT_TZ: "Asia/Shanghai",
        FEISHU_AUDIO_TRANSCRIBE_DOUBAO_API_KEY: "",
        DATA_DIR: "/tmp/pi-gateway-test",
      },
      messenger: {
        sendRenderedMessage,
        sendRenderedMessageToTarget,
        sendTextMessage: vi.fn().mockResolvedValue("om_reply"),
      },
      sessionService: {
        getOrCreateActiveSession: vi.fn(),
        createNewSession: vi.fn(),
        listSessions: vi.fn(),
        resumeSession: vi.fn(),
      },
      userStateStore: {
        readUserState: vi.fn(),
        writeUserState: vi.fn(),
      },
      workspaceService: {
        getUserWorkspaceDir: vi.fn(() => "/tmp/workspace"),
      },
      runtimeState: {
        isLocked: vi.fn(() => false),
        hasActiveLocks: vi.fn(() => false),
        beginRestartDrain: vi.fn(() => "started"),
        cancelRestartDrain: vi.fn(),
        requestStop,
      },
      restartService: {
        restartGateway: vi.fn(),
      },
      listAvailableModels: vi.fn(),
      findAvailableModel: vi.fn(),
    });

    await service.handleBridgeCommand(
      { openId: "ou_1", userId: "u_1" },
      { name: "stop", args: "" },
      {
        kind: "group",
        key: "oc_1",
        receiveIdType: "chat_id",
        receiveId: "oc_1",
        chatId: "oc_1",
      },
    );

    expect(requestStop).toHaveBeenCalledWith("oc_1");
    expect(sendRenderedMessageToTarget).toHaveBeenCalledWith(
      {
        kind: "group",
        key: "oc_1",
        receiveIdType: "chat_id",
        receiveId: "oc_1",
        chatId: "oc_1",
      },
      expect.any(String),
      2000,
    );
    expect(sendRenderedMessage).not.toHaveBeenCalled();
  });
});
