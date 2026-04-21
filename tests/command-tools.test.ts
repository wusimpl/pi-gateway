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
  const service = createCommandService({
    config: {
      TEXT_CHUNK_LIMIT: 2000,
      CRON_DEFAULT_TZ: "Asia/Shanghai",
      FEISHU_AUDIO_TRANSCRIBE_DOUBAO_API_KEY: "doubao-api-key",
      DATA_DIR: "/tmp/pi-gateway-data",
    },
    messenger,
    sessionService,
    userStateStore: {
      readUserState: vi.fn(),
    },
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
});
