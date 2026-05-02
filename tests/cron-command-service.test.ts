import { describe, expect, it, vi } from "vitest";
import { createCommandService } from "../src/app/command-service.js";

const groupTarget = {
  kind: "group",
  key: "oc_group_1",
  receiveIdType: "chat_id",
  receiveId: "oc_group_1",
  chatId: "oc_group_1",
} as const;

function createDeps() {
  const messenger = {
    sendRenderedMessage: vi.fn().mockResolvedValue(undefined),
    sendRenderedMessageToTarget: vi.fn().mockResolvedValue(undefined),
    sendTextMessage: vi.fn().mockResolvedValue(undefined),
    sendTextMessageToTarget: vi.fn().mockResolvedValue(undefined),
  };
  const deferredCronRunService = {
    queueRun: vi.fn().mockResolvedValue({
      jobId: "cron_1",
      status: "queued",
      queued: true,
      removed: false,
      job: {
        id: "cron_1",
        name: "早报",
      },
    }),
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
    setJobEnabled: vi.fn().mockImplementation(async (_scope, jobId, enabled) => ({
      id: jobId,
      name: "早报",
      enabled,
    })),
    runJobNow: vi.fn(),
  };
  const runtimeState = {
    isLocked: vi.fn(() => false),
    hasActiveLocks: vi.fn(),
    beginRestartDrain: vi.fn(),
    cancelRestartDrain: vi.fn(),
    requestStop: vi.fn(),
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
    runtimeState,
    restartService: {
      restartGateway: vi.fn(),
    },
    listAvailableModels: vi.fn(),
    findAvailableModel: vi.fn(),
    cronService,
    deferredCronRunService,
  });

  return {
    service,
    messenger,
    cronService,
    deferredCronRunService,
    runtimeState,
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
      scopeType: "dm",
      scopeKey: "ou_1",
      conversationTarget: undefined,
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

  it("群聊 add 会把任务绑到当前群会话", async () => {
    const { service, messenger, cronService } = createDeps();

    await service.handleBridgeCommand(
      { openId: "ou_1", userId: "u_1" },
      {
        name: "cron",
        args: "add\nname: 群早报\ncron: 0 9 * * *\ntz: Asia/Shanghai\nprompt:\n总结群里的待办。",
      },
      groupTarget,
    );

    expect(cronService.addJob).toHaveBeenCalledWith({
      openId: "ou_1",
      userId: "u_1",
      scopeType: "group",
      scopeKey: "oc_group_1",
      conversationTarget: groupTarget,
      name: "群早报",
      prompt: "总结群里的待办。",
      schedule: {
        kind: "cron",
        expr: "0 9 * * *",
        tz: "Asia/Shanghai",
      },
      deleteAfterRun: false,
    });
    expect(messenger.sendRenderedMessageToTarget).toHaveBeenCalledWith(
      groupTarget,
      expect.stringContaining("已创建定时任务"),
      2000,
    );
  });

  it("run 在当前有任务时会改成稍后执行", async () => {
    const { service, messenger, cronService, deferredCronRunService, runtimeState } = createDeps();
    runtimeState.isLocked.mockReturnValue(true);

    await service.handleBridgeCommand(
      { openId: "ou_1", userId: "u_1" },
      { name: "cron", args: "run cron_1" },
    );

    expect(deferredCronRunService.queueRun).toHaveBeenCalledWith(
      { scopeKey: "ou_1", scopeType: "dm" },
      "cron_1",
    );
    expect(cronService.runJobNow).not.toHaveBeenCalled();
    expect(messenger.sendRenderedMessage).toHaveBeenCalledWith(
      "ou_1",
      expect.stringContaining("已安排稍后执行"),
      2000,
    );
  });

  it("群聊 run 在当前群有任务时会按群会话排队", async () => {
    const { service, cronService, deferredCronRunService, runtimeState } = createDeps();
    runtimeState.isLocked.mockImplementation((key: string) => key === "oc_group_1");

    await service.handleBridgeCommand(
      { openId: "ou_1", userId: "u_1" },
      { name: "cron", args: "run cron_1" },
      groupTarget,
    );

    expect(deferredCronRunService.queueRun).toHaveBeenCalledWith(
      { scopeKey: "oc_group_1", scopeType: "group" },
      "cron_1",
    );
    expect(cronService.runJobNow).not.toHaveBeenCalled();
  });

  it("pause 会暂停定时任务", async () => {
    const { service, messenger, cronService } = createDeps();

    await service.handleBridgeCommand(
      { openId: "ou_1", userId: "u_1" },
      { name: "cron", args: "pause cron_1" },
    );

    expect(cronService.setJobEnabled).toHaveBeenCalledWith(
      { scopeKey: "ou_1", scopeType: "dm" },
      "cron_1",
      false,
    );
    expect(messenger.sendRenderedMessage).toHaveBeenCalledWith(
      "ou_1",
      expect.stringContaining("已暂停定时任务"),
      2000,
    );
  });

  it("resume 会启动定时任务", async () => {
    const { service, messenger, cronService } = createDeps();

    await service.handleBridgeCommand(
      { openId: "ou_1", userId: "u_1" },
      { name: "cron", args: "resume cron_1" },
    );

    expect(cronService.setJobEnabled).toHaveBeenCalledWith(
      { scopeKey: "ou_1", scopeType: "dm" },
      "cron_1",
      true,
    );
    expect(messenger.sendRenderedMessage).toHaveBeenCalledWith(
      "ou_1",
      expect.stringContaining("已启动定时任务"),
      2000,
    );
  });
});
