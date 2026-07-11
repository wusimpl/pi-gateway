import { describe, expect, it, vi } from "vitest";
import { SUPER_ADMIN_OPEN_ID } from "../src/app/access-control.js";
import { createCommandService } from "../src/app/command-service.js";

function createPiSessionMock(options?: { activeTools?: string[]; allTools?: string[] }) {
  let activeTools = [...(options?.activeTools ?? ["read", "bash"])];
  const allTools = [...(options?.allTools ?? ["read", "bash", "edit", "write", "grep"])];
  const appendCustomEntry = vi.fn();
  const setActiveToolsByName = vi.fn((toolNames: string[]) => {
    activeTools = [...toolNames];
  });

  return {
    session: {
      getAllTools: () => allTools.map((name) => ({ name })),
      getActiveToolNames: () => [...activeTools],
      setActiveToolsByName,
      sessionManager: {
        appendCustomEntry,
      },
    },
    spies: {
      appendCustomEntry,
      setActiveToolsByName,
      getActiveTools: () => [...activeTools],
    },
  };
}

function createDeps(piSession: ReturnType<typeof createPiSessionMock>["session"]) {
  const messenger = {
    sendRenderedMessage: vi.fn().mockResolvedValue(undefined),
    sendTextMessage: vi.fn().mockResolvedValue(undefined),
    sendRenderedMessageToTarget: vi.fn().mockResolvedValue(undefined),
    sendTextMessageToTarget: vi.fn().mockResolvedValue(undefined),
  };
  const sessionService = {
    getOrCreateActiveSession: vi.fn().mockResolvedValue({
      activeSessionId: "session_1",
      piSession,
    }),
    getOrCreateActiveSessionForTarget: vi.fn().mockResolvedValue({
      activeSessionId: "group_session_1",
      piSession,
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

  return {
    service,
    messenger,
    sessionService,
    userStateStore,
  };
}

describe("command service tools", () => {
  it("普通私聊查看 `/tools` 时会清除已启用的宿主机工具", async () => {
    const piSession = createPiSessionMock({
      activeTools: ["read", "bash", "tts_synthesize"],
      allTools: ["read", "bash", "edit", "write", "grep", "tts_synthesize"],
    });
    const { service, messenger, userStateStore } = createDeps(piSession.session);

    await service.handleBridgeCommand(
      { openId: "ou_1", userId: "u_1" },
      { name: "tools", args: "" },
    );

    expect(messenger.sendRenderedMessage).toHaveBeenCalledWith(
      "ou_1",
      "🧰 当前 tools（1/6 已启用）\n" +
        "❌ read\n" +
        "❌ bash\n" +
        "❌ edit\n" +
        "❌ write\n" +
        "❌ grep\n" +
        "✅ tts_synthesize\n" +
        "\n" +
        "查看：/tools\n" +
        "启用：/tools on <tool...>\n" +
        "禁用：/tools off <tool...>\n" +
        "设为指定集合：/tools set <tool...>\n" +
        "恢复默认：/tools reset",
      2000,
    );
    expect(piSession.spies.setActiveToolsByName).toHaveBeenCalledWith(["tts_synthesize"]);
    expect(userStateStore.writeUserState).toHaveBeenCalledWith(
      "ou_1",
      expect.objectContaining({ enabledTools: ["tts_synthesize"] }),
    );
  });

  it("私聊超级管理员可以启用宿主机工具", async () => {
    const piSession = createPiSessionMock({ activeTools: ["read", "bash"] });
    const { service, messenger, userStateStore } = createDeps(piSession.session);
    userStateStore.readUserState.mockResolvedValue({
      activeSessionId: "session_1",
      createdAt: "2026-04-27T00:00:00.000Z",
      updatedAt: "2026-04-27T00:00:00.000Z",
      lastActiveAt: "2026-04-27T00:00:00.000Z",
    });

    await service.handleBridgeCommand(
      { openId: SUPER_ADMIN_OPEN_ID, userId: "u_1" },
      { name: "tools", args: "on grep" },
    );

    expect(piSession.spies.setActiveToolsByName).toHaveBeenCalledWith(["read", "bash", "grep"]);
    expect(piSession.spies.appendCustomEntry).not.toHaveBeenCalled();
    expect(userStateStore.writeUserState).toHaveBeenCalledWith(
      SUPER_ADMIN_OPEN_ID,
      expect.objectContaining({ enabledTools: ["read", "bash", "grep"] }),
    );
    expect(messenger.sendRenderedMessage).toHaveBeenCalledWith(
      SUPER_ADMIN_OPEN_ID,
      "✅ 已启用 tools。\n变更：grep\n当前启用（3/5）：read, bash, grep\n\n查看详情：/tools",
      2000,
    );
  });

  it("普通私聊不能启用宿主机工具", async () => {
    const piSession = createPiSessionMock({
      activeTools: ["tts_synthesize"],
      allTools: ["read", "grep", "tts_synthesize"],
    });
    const { service, messenger, userStateStore } = createDeps(piSession.session);

    await service.handleBridgeCommand(
      { openId: "ou_1", userId: "u_1" },
      { name: "tools", args: "on grep" },
    );

    expect(messenger.sendTextMessage).toHaveBeenCalledWith(
      "ou_1",
      "这些工具会直接操作机器人所在的电脑，只能由超级管理员在私聊中启用：grep。",
    );
    expect(piSession.spies.setActiveToolsByName).not.toHaveBeenCalled();
    expect(userStateStore.writeUserState).not.toHaveBeenCalled();
  });

  it("普通私聊仍可启用非宿主机工具", async () => {
    const piSession = createPiSessionMock({
      activeTools: ["tts_synthesize"],
      allTools: ["read", "tts_synthesize", "firecrawl_search"],
    });
    const { service, userStateStore } = createDeps(piSession.session);

    await service.handleBridgeCommand(
      { openId: "ou_1", userId: "u_1" },
      { name: "tools", args: "on firecrawl_search" },
    );

    expect(piSession.spies.setActiveToolsByName).toHaveBeenCalledWith(["tts_synthesize", "firecrawl_search"]);
    expect(userStateStore.writeUserState).toHaveBeenCalledWith(
      "ou_1",
      expect.objectContaining({ enabledTools: ["tts_synthesize", "firecrawl_search"] }),
    );
  });

  it("群聊超级管理员也不能启用宿主机工具", async () => {
    const piSession = createPiSessionMock({
      activeTools: ["tts_synthesize"],
      allTools: ["read", "tts_synthesize"],
    });
    const { service, messenger, sessionService } = createDeps(piSession.session);
    const target = {
      kind: "group" as const,
      key: "chat_1",
      receiveIdType: "chat_id" as const,
      receiveId: "chat_1",
      chatId: "chat_1",
    };

    await service.handleBridgeCommand(
      { openId: SUPER_ADMIN_OPEN_ID, userId: "u_1" },
      { name: "tools", args: "on read" },
      target,
    );

    expect(messenger.sendTextMessageToTarget).toHaveBeenCalledWith(
      target,
      "群聊中不能启用会直接操作机器人所在电脑的工具：read。",
    );
    expect(piSession.spies.setActiveToolsByName).not.toHaveBeenCalled();
    expect(sessionService.writeSessionState).not.toHaveBeenCalled();
  });

  it("群聊处理工具命令时会过滤现有宿主机工具", async () => {
    const piSession = createPiSessionMock({ activeTools: ["read", "bash", "grep"] });
    const { service, sessionService } = createDeps(piSession.session);
    const target = {
      kind: "group" as const,
      key: "chat_1",
      receiveIdType: "chat_id" as const,
      receiveId: "chat_1",
      chatId: "chat_1",
    };
    sessionService.readSessionState.mockResolvedValue({
      activeSessionId: "group_session_1",
      createdAt: "2026-04-27T00:00:00.000Z",
      updatedAt: "2026-04-27T00:00:00.000Z",
      lastActiveAt: "2026-04-27T00:00:00.000Z",
    });

    await service.handleBridgeCommand(
      { openId: "ou_1", userId: "u_1" },
      { name: "tools", args: "off grep" },
      target,
    );

    expect(piSession.spies.setActiveToolsByName).toHaveBeenCalledWith([]);
    expect(sessionService.writeSessionState).toHaveBeenCalledWith(
      { openId: "ou_1", userId: "u_1" },
      target,
      expect.objectContaining({ enabledTools: [] }),
    );
  });

  it("`/tools on` 遇到不存在的 tool 会直接报错", async () => {
    const piSession = createPiSessionMock({ activeTools: [] });
    const { service, messenger } = createDeps(piSession.session);

    await service.handleBridgeCommand(
      { openId: "ou_1", userId: "u_1" },
      { name: "tools", args: "on missing-tool" },
    );

    expect(messenger.sendTextMessage).toHaveBeenCalledWith(
      "ou_1",
      "这些 tools 不存在：missing-tool。\n\n先用 /tools 看当前 session 里的可用 tools。",
    );
    expect(piSession.spies.setActiveToolsByName).not.toHaveBeenCalled();
  });

  it("`/toolcalls name` 会保存只显示工具名", async () => {
    const piSession = createPiSessionMock({ activeTools: ["read", "bash"] });
    const { service, messenger, userStateStore } = createDeps(piSession.session);
    userStateStore.readUserState.mockResolvedValue({
      activeSessionId: "session_1",
      createdAt: "2026-04-27T00:00:00.000Z",
      updatedAt: "2026-04-27T00:00:00.000Z",
      lastActiveAt: "2026-04-27T00:00:00.000Z",
    });

    await service.handleBridgeCommand(
      { openId: "ou_1", userId: "u_1" },
      { name: "toolcalls", args: "name" },
    );

    expect(userStateStore.writeUserState).toHaveBeenCalledWith(
      "ou_1",
      expect.objectContaining({ toolCallsDisplayMode: "name" }),
    );
    expect(messenger.sendRenderedMessage).toHaveBeenCalledWith(
      "ou_1",
      "✅ 已更新工具调用展示\n当前模式：只显示工具名",
      2000,
    );
  });

  it("`/toolcalls focus` 会保存聚焦展示", async () => {
    const piSession = createPiSessionMock({ activeTools: ["read", "bash"] });
    const { service, messenger, userStateStore } = createDeps(piSession.session);
    userStateStore.readUserState.mockResolvedValue({
      activeSessionId: "session_1",
      createdAt: "2026-04-27T00:00:00.000Z",
      updatedAt: "2026-04-27T00:00:00.000Z",
      lastActiveAt: "2026-04-27T00:00:00.000Z",
    });

    await service.handleBridgeCommand(
      { openId: "ou_1", userId: "u_1" },
      { name: "toolcalls", args: "focus" },
    );

    expect(userStateStore.writeUserState).toHaveBeenCalledWith(
      "ou_1",
      expect.objectContaining({ toolCallsDisplayMode: "focus" }),
    );
    expect(messenger.sendRenderedMessage).toHaveBeenCalledWith(
      "ou_1",
      "✅ 已更新工具调用展示\n当前模式：聚焦展示",
      2000,
    );
  });

  it("`/toolcalls` 会返回当前展示模式", async () => {
    const piSession = createPiSessionMock({ activeTools: ["read", "bash"] });
    const { service, messenger, userStateStore } = createDeps(piSession.session);
    userStateStore.readUserState.mockResolvedValue({
      activeSessionId: "session_1",
      createdAt: "2026-04-27T00:00:00.000Z",
      updatedAt: "2026-04-27T00:00:00.000Z",
      lastActiveAt: "2026-04-27T00:00:00.000Z",
      toolCallsDisplayMode: "full",
    });

    await service.handleBridgeCommand(
      { openId: "ou_1", userId: "u_1" },
      { name: "toolcalls", args: "" },
    );

    expect(userStateStore.writeUserState).not.toHaveBeenCalled();
    expect(messenger.sendRenderedMessage).toHaveBeenCalledWith(
      "ou_1",
      "🛠️ 工具调用展示\n当前模式：显示详情\n\n关闭：/toolcalls off\n只显示工具名：/toolcalls name\n聚焦展示：/toolcalls focus\n显示详情：/toolcalls full",
      2000,
    );
  });
});
