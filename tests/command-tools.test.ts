import { describe, expect, it, vi } from "vitest";
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
  };
  const sessionService = {
    getOrCreateActiveSession: vi.fn().mockResolvedValue({
      activeSessionId: "session_1",
      piSession,
    }),
    createNewSession: vi.fn(),
    listSessions: vi.fn(),
    resumeSession: vi.fn(),
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
  it("`/tools` 会返回当前 tool 状态", async () => {
    const piSession = createPiSessionMock({ activeTools: ["read", "bash"] });
    const { service, messenger } = createDeps(piSession.session);

    await service.handleBridgeCommand(
      { openId: "ou_1", userId: "u_1" },
      { name: "tools", args: "" },
    );

    expect(messenger.sendRenderedMessage).toHaveBeenCalledWith(
      "ou_1",
      "🧰 当前 tools（2/5 已启用）\n" +
        "✅ read\n" +
        "✅ bash\n" +
        "❌ edit\n" +
        "❌ write\n" +
        "❌ grep\n" +
        "\n" +
        "查看：/tools\n" +
        "启用：/tools on <tool...>\n" +
        "禁用：/tools off <tool...>\n" +
        "设为指定集合：/tools set <tool...>\n" +
        "恢复默认：/tools reset",
      2000,
    );
  });

  it("`/tools on` 会更新 active tools 并写入 session", async () => {
    const piSession = createPiSessionMock({ activeTools: ["read", "bash"] });
    const { service, messenger } = createDeps(piSession.session);

    await service.handleBridgeCommand(
      { openId: "ou_1", userId: "u_1" },
      { name: "tools", args: "on grep" },
    );

    expect(piSession.spies.setActiveToolsByName).toHaveBeenCalledWith(["read", "bash", "grep"]);
    expect(piSession.spies.appendCustomEntry).toHaveBeenCalledWith("tools-config", {
      enabledTools: ["read", "bash", "grep"],
    });
    expect(messenger.sendRenderedMessage).toHaveBeenCalledWith(
      "ou_1",
      "✅ 已启用 tools。\n变更：grep\n当前启用（3/5）：read, bash, grep\n\n查看详情：/tools",
      2000,
    );
  });

  it("`/tools on` 遇到不存在的 tool 会直接报错", async () => {
    const piSession = createPiSessionMock({ activeTools: ["read", "bash"] });
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
      "🛠️ 工具调用展示\n当前模式：显示详情\n\n关闭：/toolcalls off\n只显示工具名：/toolcalls name\n显示详情：/toolcalls full",
      2000,
    );
  });
});
