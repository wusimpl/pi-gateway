import { describe, expect, it, vi } from "vitest";
import { createCommandService } from "../src/app/command-service.js";
import { SUPER_ADMIN_OPEN_ID } from "../src/app/access-control.js";

const groupTarget = {
  kind: "group",
  key: "oc_1",
  receiveIdType: "chat_id",
  receiveId: "oc_1",
  chatId: "oc_1",
} as const;

function createDeps(options: { groupOwner?: boolean } = {}) {
  const messenger = {
    sendRenderedMessage: vi.fn().mockResolvedValue(undefined),
    sendTextMessage: vi.fn().mockResolvedValue(undefined),
    sendRenderedMessageToTarget: vi.fn().mockResolvedValue(undefined),
    sendTextMessageToTarget: vi.fn().mockResolvedValue(undefined),
  };
  const service = createCommandService({
    config: {
      TEXT_CHUNK_LIMIT: 2000,
      CRON_DEFAULT_TZ: "Asia/Shanghai",
      FEISHU_AUDIO_TRANSCRIBE_DOUBAO_API_KEY: "doubao-api-key",
      DATA_DIR: "/tmp/pi-gateway-data",
    } as any,
    messenger,
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
      getUserWorkspaceDir: vi.fn(),
    },
    runtimeState: {
      isLocked: vi.fn(),
      hasActiveLocks: vi.fn(),
      beginRestartDrain: vi.fn(),
      cancelRestartDrain: vi.fn(),
      requestStop: vi.fn(),
    },
    restartService: {
      restartGateway: vi.fn(),
    },
    listAvailableModels: vi.fn(),
    findAvailableModel: vi.fn(),
    groupOwnerResolver: options.groupOwner
      ? { isGroupOwner: vi.fn().mockResolvedValue(true) }
      : undefined,
  });

  return { service, messenger };
}

describe("/commands", () => {
  it("私聊普通用户能看到个人命令", async () => {
    const { service, messenger } = createDeps();

    await service.handleBridgeCommand(
      { openId: "ou_1", userId: "u_1" },
      { name: "commands", args: "" },
    );

    const reply = messenger.sendRenderedMessage.mock.calls[0]?.[1] as string;
    expect(reply).toContain("当前可用命令（私聊）");
    expect(reply).toContain("/commands");
    expect(reply).toContain("/new");
    expect(reply).toContain("/tools — 查看工具状态");
    expect(reply).toContain("/tools on|off|set|reset");
    expect(reply).not.toContain("/restart");
    expect(reply).not.toContain("/p2p");
    expect(reply).not.toContain("/stt");
  });

  it("私聊 super admin 能看到管理命令", async () => {
    const { service, messenger } = createDeps();

    await service.handleBridgeCommand(
      { openId: SUPER_ADMIN_OPEN_ID },
      { name: "commands", args: "" },
    );

    const reply = messenger.sendRenderedMessage.mock.calls[0]?.[1] as string;
    expect(reply).toContain("当前可用命令（私聊）");
    expect(reply).toContain("/restart");
    expect(reply).toContain("/p2p");
    expect(reply).toContain("/tools on|off|set|reset");
  });

  it("群聊普通用户只看到群聊公开命令", async () => {
    const { service, messenger } = createDeps();

    await service.handleBridgeCommand(
      { openId: "ou_1", userId: "u_1" },
      { name: "commands", args: "" },
      groupTarget,
    );

    const reply = messenger.sendRenderedMessageToTarget.mock.calls[0]?.[1] as string;
    expect(reply).toContain("当前可用命令（群聊）");
    expect(reply).toContain("/commands");
    expect(reply).toContain("/model — 查看模型配置和可用模型");
    expect(reply).not.toContain("/new");
    expect(reply).not.toContain("/model <序号或模型>");
    expect(reply).not.toContain("/restart");
    expect(reply).not.toContain("/group");
  });

  it("真实群主能看到群聊管理命令但看不到全局管理命令", async () => {
    const { service, messenger } = createDeps({ groupOwner: true });

    await service.handleBridgeCommand(
      { openId: "ou_1", userId: "u_1" },
      { name: "commands", args: "" },
      groupTarget,
    );

    const reply = messenger.sendRenderedMessageToTarget.mock.calls[0]?.[1] as string;
    expect(reply).toContain("/new");
    expect(reply).toContain("/group");
    expect(reply).not.toContain("/restart");
    expect(reply).not.toContain("/p2p");
  });
});
