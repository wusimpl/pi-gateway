import { describe, expect, it, vi } from "vitest";
import { createCronRunner } from "../src/cron/runner.js";

const groupTarget = {
  kind: "group",
  key: "oc_group_1",
  receiveIdType: "chat_id",
  receiveId: "oc_group_1",
  chatId: "oc_group_1",
} as const;

describe("cron runner", () => {
  it("会创建隔离 session 并把结果直接回给飞书用户", async () => {
    const abort = vi.fn().mockResolvedValue(undefined);
    const dispose = vi.fn();
    const createPiSession = vi.fn().mockResolvedValue({
      abort,
      dispose,
    });
    const promptSession = vi.fn().mockResolvedValue({
      text: "done",
      error: undefined,
    });
    const runtimeState = {
      acquireLock: vi.fn(() => true),
      releaseLock: vi.fn(),
      setAbortHandler: vi.fn().mockResolvedValue(false),
      isStopRequested: vi.fn(() => false),
    };
    const runner = createCronRunner({
      config: {
        DATA_DIR: "/tmp/pi-gateway-data",
        TEXT_CHUNK_LIMIT: 2000,
        CRON_JOB_TIMEOUT_MS: 30_000,
        CRON_DEFAULT_TZ: "Asia/Shanghai",
      },
      runtime: {
        createPiSession,
      },
      runtimeState,
      workspaceService: {
        ensureUserWorkspace: vi.fn().mockResolvedValue("/tmp/workspace/u_1"),
      },
      promptRunner: {
        promptSession,
      },
      messenger: {
        sendTextMessage: vi.fn(),
      },
    });

    const result = await runner.run({
      id: "cron_1",
      openId: "ou_1",
      userId: "u_1",
      scopeType: "dm",
      scopeKey: "ou_1",
      name: "早报",
      enabled: true,
      prompt: "总结今天的待办。",
      schedule: {
        kind: "cron",
        expr: "0 9 * * *",
        tz: "Asia/Shanghai",
      },
      deleteAfterRun: false,
      createdAtMs: 1,
      updatedAtMs: 1,
      state: {},
    });

    expect(result).toEqual({
      jobId: "cron_1",
      status: "success",
    });
    expect(createPiSession).toHaveBeenCalledWith(
      "/tmp/workspace/u_1",
      "/tmp/pi-gateway-data/cron/sessions/ou_1/cron_1",
    );
    expect(promptSession).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        text: expect.stringContaining("总结今天的待办。"),
        displayHeaderText: "【定时任务结果】",
        footerLabel: "定时任务会话：",
        includeFooter: false,
      }),
      "ou_1",
      expect.stringMatching(/^cron:cron_1:/),
      undefined,
      false,
      2000,
      false,
      30000,
      expect.any(Function),
      undefined,
    );
    expect(runtimeState.releaseLock).toHaveBeenCalledWith("ou_1");
    expect(dispose).toHaveBeenCalledTimes(1);
  });

  it("群聊任务会沿用当前群的锁、工作目录和回复目标", async () => {
    const abort = vi.fn().mockResolvedValue(undefined);
    const dispose = vi.fn();
    const createPiSession = vi.fn().mockResolvedValue({
      abort,
      dispose,
    });
    const promptSession = vi.fn().mockResolvedValue({
      text: "done",
      error: undefined,
    });
    const runtimeState = {
      acquireLock: vi.fn(() => true),
      releaseLock: vi.fn(),
      setAbortHandler: vi.fn().mockResolvedValue(false),
      isStopRequested: vi.fn(() => false),
    };
    const ensureConversationWorkspace = vi.fn().mockResolvedValue("/tmp/workspace/conversations/oc_group_1");
    const runner = createCronRunner({
      config: {
        DATA_DIR: "/tmp/pi-gateway-data",
        TEXT_CHUNK_LIMIT: 2000,
        CRON_JOB_TIMEOUT_MS: 30_000,
        CRON_DEFAULT_TZ: "Asia/Shanghai",
      },
      runtime: {
        createPiSession,
      },
      runtimeState,
      workspaceService: {
        ensureUserWorkspace: vi.fn(),
        ensureConversationWorkspace,
      },
      promptRunner: {
        promptSession,
      },
      messenger: {
        sendTextMessage: vi.fn(),
        sendTextMessageToTarget: vi.fn(),
      },
    });

    const result = await runner.run({
      id: "cron_group_1",
      openId: "ou_1",
      userId: "u_1",
      scopeType: "group",
      scopeKey: "oc_group_1",
      conversationTarget: groupTarget,
      name: "群早报",
      enabled: true,
      prompt: "总结群里的待办。",
      schedule: {
        kind: "cron",
        expr: "0 9 * * *",
        tz: "Asia/Shanghai",
      },
      deleteAfterRun: false,
      createdAtMs: 1,
      updatedAtMs: 1,
      state: {},
    });

    expect(result).toEqual({
      jobId: "cron_group_1",
      status: "success",
    });
    expect(ensureConversationWorkspace).toHaveBeenCalledWith({ openId: "ou_1", userId: "u_1" }, groupTarget);
    expect(createPiSession).toHaveBeenCalledWith(
      "/tmp/workspace/conversations/oc_group_1",
      "/tmp/pi-gateway-data/cron/sessions/oc_group_1/cron_group_1",
    );
    expect(promptSession).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        text: expect.stringContaining("总结群里的待办。"),
        displayHeaderText: "【定时任务结果】",
        footerLabel: "定时任务会话：",
        includeFooter: false,
      }),
      "ou_1",
      expect.stringMatching(/^cron:cron_group_1:/),
      undefined,
      false,
      2000,
      false,
      30000,
      expect.any(Function),
      groupTarget,
    );
    expect(runtimeState.acquireLock).toHaveBeenCalledWith("oc_group_1", expect.stringMatching(/^cron:cron_group_1:/));
    expect(runtimeState.releaseLock).toHaveBeenCalledWith("oc_group_1");
  });

  it("拿不到用户锁时会直接返回 busy", async () => {
    const runner = createCronRunner({
      config: {
        DATA_DIR: "/tmp/pi-gateway-data",
        TEXT_CHUNK_LIMIT: 2000,
        CRON_JOB_TIMEOUT_MS: 30_000,
        CRON_DEFAULT_TZ: "Asia/Shanghai",
      },
      runtime: {
        createPiSession: vi.fn(),
      },
      runtimeState: {
        acquireLock: vi.fn(() => false),
        releaseLock: vi.fn(),
        setAbortHandler: vi.fn(),
        isStopRequested: vi.fn(() => false),
      },
      workspaceService: {
        ensureUserWorkspace: vi.fn(),
      },
      promptRunner: {
        promptSession: vi.fn(),
      },
      messenger: {
        sendTextMessage: vi.fn(),
      },
    });

    const result = await runner.run({
      id: "cron_1",
      openId: "ou_1",
      scopeType: "dm",
      scopeKey: "ou_1",
      name: "早报",
      enabled: true,
      prompt: "总结今天的待办。",
      schedule: {
        kind: "cron",
        expr: "0 9 * * *",
        tz: "Asia/Shanghai",
      },
      deleteAfterRun: false,
      createdAtMs: 1,
      updatedAtMs: 1,
      state: {},
    });

    expect(result).toEqual({
      jobId: "cron_1",
      status: "busy",
      error: "当前会话还有任务在跑",
    });
  });

  it("stop 会按定时任务 synthetic messageId 前缀请求停止", async () => {
    const requestStop = vi.fn().mockResolvedValue("requested" as const);
    const runner = createCronRunner({
      config: {
        DATA_DIR: "/tmp/pi-gateway-data",
        TEXT_CHUNK_LIMIT: 2000,
        CRON_JOB_TIMEOUT_MS: 30_000,
        CRON_DEFAULT_TZ: "Asia/Shanghai",
      },
      runtime: {
        createPiSession: vi.fn(),
      },
      runtimeState: {
        acquireLock: vi.fn(),
        releaseLock: vi.fn(),
        setAbortHandler: vi.fn(),
        requestStop,
        isStopRequested: vi.fn(() => false),
      },
      workspaceService: {
        ensureUserWorkspace: vi.fn(),
      },
      promptRunner: {
        promptSession: vi.fn(),
      },
      messenger: {
        sendTextMessage: vi.fn(),
      },
    });

    await expect(runner.stop({
      id: "cron_1",
      openId: "ou_1",
      scopeType: "dm",
      scopeKey: "ou_1",
      name: "早报",
      enabled: true,
      prompt: "总结今天的待办。",
      schedule: {
        kind: "cron",
        expr: "0 9 * * *",
        tz: "Asia/Shanghai",
      },
      deleteAfterRun: false,
      createdAtMs: 1,
      updatedAtMs: 1,
      state: {},
    })).resolves.toBe("requested");
    expect(requestStop).toHaveBeenCalledWith("ou_1", "cron:cron_1:");
  });

  it("任务失败且没有可展示正文时，会把失败通知标成定时任务异常", async () => {
    const abort = vi.fn().mockResolvedValue(undefined);
    const dispose = vi.fn();
    const sendTextMessage = vi.fn().mockResolvedValue(undefined);
    const runner = createCronRunner({
      config: {
        DATA_DIR: "/tmp/pi-gateway-data",
        TEXT_CHUNK_LIMIT: 2000,
        CRON_JOB_TIMEOUT_MS: 30_000,
        CRON_DEFAULT_TZ: "Asia/Shanghai",
      },
      runtime: {
        createPiSession: vi.fn().mockResolvedValue({
          abort,
          dispose,
        }),
      },
      runtimeState: {
        acquireLock: vi.fn(() => true),
        releaseLock: vi.fn(),
        setAbortHandler: vi.fn().mockResolvedValue(false),
        requestStop: vi.fn(),
        isStopRequested: vi.fn(() => false),
      },
      workspaceService: {
        ensureUserWorkspace: vi.fn().mockResolvedValue("/tmp/workspace/u_1"),
      },
      promptRunner: {
        promptSession: vi.fn().mockResolvedValue({
          text: "",
          error: "boom",
        }),
      },
      messenger: {
        sendTextMessage,
      },
    });

    const result = await runner.run({
      id: "cron_1",
      openId: "ou_1",
      scopeType: "dm",
      scopeKey: "ou_1",
      name: "早报",
      enabled: true,
      prompt: "总结今天的待办。",
      schedule: {
        kind: "cron",
        expr: "0 9 * * *",
        tz: "Asia/Shanghai",
      },
      deleteAfterRun: false,
      createdAtMs: 1,
      updatedAtMs: 1,
      state: {},
    });

    expect(result).toEqual({
      jobId: "cron_1",
      status: "error",
      error: "boom",
    });
    expect(sendTextMessage).toHaveBeenCalledWith(
      "ou_1",
      expect.stringContaining("【定时任务异常】\n任务：早报"),
    );
  });
});
