import { describe, expect, it, vi } from "vitest";
import { createCommandService } from "../src/app/command-service.js";

function createDeps() {
  const messenger = {
    sendRenderedMessage: vi.fn().mockResolvedValue(undefined),
    sendTextMessage: vi.fn().mockResolvedValue(undefined),
    sendRenderedMessageToTarget: vi.fn().mockResolvedValue(undefined),
    sendTextMessageToTarget: vi.fn().mockResolvedValue(undefined),
  };
  const sessionState = {
    activeSessionId: "session_1",
    piSession: {
      sessionFile: "/tmp/session.jsonl",
    },
  };
  const sessionService = {
    getOrCreateActiveSession: vi.fn().mockResolvedValue(sessionState),
    getOrCreateActiveSessionForTarget: vi.fn().mockResolvedValue({
      ...sessionState,
      activeSessionId: "group_session_1",
    }),
    createNewSession: vi.fn(),
    listSessions: vi.fn(),
    resumeSession: vi.fn(),
    readSessionState: vi.fn(),
    writeSessionState: vi.fn().mockResolvedValue(undefined),
  };
  const userStateStore = {
    readUserState: vi.fn(),
    writeUserState: vi.fn().mockResolvedValue(undefined),
  };
  const service = createCommandService({
    config: {
      TEXT_CHUNK_LIMIT: 2000,
      CRON_DEFAULT_TZ: "Asia/Shanghai",
      FEISHU_AUDIO_TRANSCRIBE_DOUBAO_API_KEY: "doubao-api-key",
      DATA_DIR: "/tmp/pi-gateway-data",
    },
    messenger,
    sessionService,
    userStateStore,
    workspaceService: {
      getUserWorkspaceDir: vi.fn(),
      getConversationWorkspaceDir: vi.fn(),
    },
    runtimeState: {
      isLocked: vi.fn().mockReturnValue(false),
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
  });

  return { service, messenger, sessionService, userStateStore };
}

describe("command service skill-folder", () => {
  it("`/skill-folder` 查看私聊保存的目录开关", async () => {
    const { service, messenger, sessionService, userStateStore } = createDeps();
    userStateStore.readUserState.mockResolvedValue({
      activeSessionId: "session_1",
      createdAt: "2026-04-27T00:00:00.000Z",
      updatedAt: "2026-04-27T00:00:00.000Z",
      lastActiveAt: "2026-04-27T00:00:00.000Z",
      globalAgentsSkillsEnabled: true,
    });

    await service.handleBridgeCommand(
      { openId: "ou_1", userId: "u_1" },
      { name: "skill-folder", args: "" },
    );

    expect(sessionService.getOrCreateActiveSession).not.toHaveBeenCalled();
    expect(messenger.sendRenderedMessage).toHaveBeenCalledWith(
      "ou_1",
      "📁 ~/.agents/skills 目录：已开启\n\n开启：/skill-folder on\n关闭：/skill-folder off\n修改后新会话生效。",
      2000,
    );
  });

  it("`/skill-folder on` 会按私聊保存，并只提示新会话生效", async () => {
    const { service, messenger, userStateStore } = createDeps();
    userStateStore.readUserState.mockResolvedValue({
      activeSessionId: "session_1",
      createdAt: "2026-04-27T00:00:00.000Z",
      updatedAt: "2026-04-27T00:00:00.000Z",
      lastActiveAt: "2026-04-27T00:00:00.000Z",
    });

    await service.handleBridgeCommand(
      { openId: "ou_1", userId: "u_1" },
      { name: "skill-folder", args: "on" },
    );

    expect(userStateStore.writeUserState).toHaveBeenCalledWith(
      "ou_1",
      expect.objectContaining({ globalAgentsSkillsEnabled: true }),
    );
    expect(messenger.sendRenderedMessage).toHaveBeenCalledWith(
      "ou_1",
      "✅ 已开启 ~/.agents/skills 目录\n新会话生效。",
      2000,
    );
  });

  it("群聊 `/skill-folder off` 会写入对应 conversation 状态", async () => {
    const { service, sessionService } = createDeps();
    const target = { kind: "group" as const, key: "chat_1", chatId: "chat_1" };
    sessionService.readSessionState.mockResolvedValue({
      activeSessionId: "group_session_1",
      createdAt: "2026-04-27T00:00:00.000Z",
      updatedAt: "2026-04-27T00:00:00.000Z",
      lastActiveAt: "2026-04-27T00:00:00.000Z",
      globalAgentsSkillsEnabled: true,
    });

    await service.handleBridgeCommand(
      { openId: "ou_1", userId: "u_1" },
      { name: "skill-folder", args: "off" },
      target,
    );

    expect(sessionService.writeSessionState).toHaveBeenCalledWith(
      { openId: "ou_1", userId: "u_1" },
      target,
      expect.objectContaining({ globalAgentsSkillsEnabled: false }),
    );
  });

  it("`/skill-folder` 参数非法时返回用法", async () => {
    const { service, messenger, userStateStore } = createDeps();

    await service.handleBridgeCommand(
      { openId: "ou_1", userId: "u_1" },
      { name: "skill-folder", args: "toggle" },
    );

    expect(userStateStore.writeUserState).not.toHaveBeenCalled();
    expect(messenger.sendTextMessage).toHaveBeenCalledWith(
      "ou_1",
      "用法：/skill-folder、/skill-folder on 或 /skill-folder off。",
    );
  });
});
