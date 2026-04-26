import { describe, expect, it, vi } from "vitest";
import { createCommandService } from "../src/app/command-service.js";

function createDeps(records: Array<{ name: string; count: number; lastUsedAt: string }> = []) {
  const messenger = {
    sendRenderedMessage: vi.fn().mockResolvedValue(undefined),
    sendTextMessage: vi.fn().mockResolvedValue(undefined),
  };
  const skillStatsStore = {
    listSkillUsage: vi.fn().mockResolvedValue(records),
    reset: vi.fn().mockResolvedValue(undefined),
  };
  const service = createCommandService({
    config: {
      TEXT_CHUNK_LIMIT: 2000,
      CRON_DEFAULT_TZ: "Asia/Shanghai",
      FEISHU_AUDIO_TRANSCRIBE_DOUBAO_API_KEY: "doubao-api-key",
      DATA_DIR: "/tmp/pi-gateway-data",
    },
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
    skillStatsStore,
  });

  return { service, messenger, skillStatsStore };
}

describe("command service skillstat", () => {
  it("/skillstat 会返回第一页统计，一页十个", async () => {
    const records = Array.from({ length: 12 }, (_, index) => ({
      name: `skill-${index + 1}`,
      count: 20 - index,
      lastUsedAt: "2026-04-16T11:48:00.000Z",
    }));
    const { service, messenger } = createDeps(records);

    await service.handleBridgeCommand(
      { openId: "ou_1", userId: "u_1" },
      { name: "skillstat", args: "" },
    );

    const text = messenger.sendRenderedMessage.mock.calls[0]?.[1];
    expect(text).toContain("📊 Skill 使用统计（第 1/2 页，共 12 个）");
    expect(text).toContain("| 1 | skill-1 | 20 |");
    expect(text).toContain("| 10 | skill-10 | 11 |");
    expect(text).not.toContain("skill-11");
  });

  it("/skillstat -n 2 会返回第二页", async () => {
    const records = Array.from({ length: 12 }, (_, index) => ({
      name: `skill-${index + 1}`,
      count: 20 - index,
      lastUsedAt: "2026-04-16T11:48:00.000Z",
    }));
    const { service, messenger } = createDeps(records);

    await service.handleBridgeCommand(
      { openId: "ou_1", userId: "u_1" },
      { name: "skillstat", args: "-n 2" },
    );

    const text = messenger.sendRenderedMessage.mock.calls[0]?.[1];
    expect(text).toContain("📊 Skill 使用统计（第 2/2 页，共 12 个）");
    expect(text).toContain("| 11 | skill-11 | 10 |");
    expect(text).toContain("| 12 | skill-12 | 9 |");
  });

  it("/skillstat reset 会清空统计", async () => {
    const { service, messenger, skillStatsStore } = createDeps();

    await service.handleBridgeCommand(
      { openId: "ou_1", userId: "u_1" },
      { name: "skillstat", args: "reset" },
    );

    expect(skillStatsStore.reset).toHaveBeenCalledTimes(1);
    expect(messenger.sendTextMessage).toHaveBeenCalledWith("ou_1", "✅ 已清空 skill 使用统计。");
  });
});
