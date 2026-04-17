import { describe, expect, it, vi } from "vitest";
import { createCommandService } from "../src/app/command-service.js";

function createDeps() {
  const messenger = {
    sendRenderedMessage: vi.fn().mockResolvedValue(undefined),
    sendTextMessage: vi.fn().mockResolvedValue(undefined),
  };
  const cronService = {
    isEnabled: () => true,
    getDefaultTimezone: () => "Asia/Shanghai",
    listJobs: vi.fn().mockResolvedValue([]),
    addJob: vi.fn().mockResolvedValue({
      id: "cron_1",
      name: "早报",
      schedule: { kind: "cron", expr: "0 9 * * *", tz: "Asia/Shanghai" },
      state: { nextRunAtMs: Date.parse("2026-04-17T09:00:00.000+08:00") },
    }),
    removeJob: vi.fn(),
    runJobNow: vi.fn(),
  };

  const service = createCommandService({
    config: {
      TEXT_CHUNK_LIMIT: 2000,
      CRON_DEFAULT_TZ: "Asia/Shanghai",
      FEISHU_AUDIO_TRANSCRIBE_DOUBAO_API_KEY: "",
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
    cronService,
  });

  return {
    service,
    messenger,
    cronService,
  };
}

describe("command service /cron", () => {
  it("空参数时会返回帮助", async () => {
    const { service, messenger } = createDeps();

    await service.handleBridgeCommand(
      { openId: "ou_1", userId: "u_1" },
      { name: "cron", args: "" },
    );

    expect(messenger.sendRenderedMessage).toHaveBeenCalledWith(
      "ou_1",
      expect.stringContaining("定时任务命令"),
      2000,
    );
  });

  it("add 会创建任务并返回结果", async () => {
    const { service, messenger, cronService } = createDeps();

    await service.handleBridgeCommand(
      { openId: "ou_1", userId: "u_1" },
      {
        name: "cron",
        args: "add\nname: 早报\ncron: 0 9 * * *\ntz: Asia/Shanghai\nprompt:\n总结今天的待办。",
      },
    );

    expect(cronService.addJob).toHaveBeenCalledWith({
      openId: "ou_1",
      userId: "u_1",
      name: "早报",
      prompt: "总结今天的待办。",
      schedule: {
        kind: "cron",
        expr: "0 9 * * *",
        tz: "Asia/Shanghai",
      },
      deleteAfterRun: false,
    });
    expect(messenger.sendRenderedMessage).toHaveBeenCalledWith(
      "ou_1",
      expect.stringContaining("已创建定时任务"),
      2000,
    );
  });
});
