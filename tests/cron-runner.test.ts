import { describe, expect, it, vi } from "vitest";
import { createRuntimeStateStore } from "../src/app/state.js";
import { createCronRunner } from "../src/cron/runner.js";
import { getWorkspaceContext } from "../src/pi/workspace-identity.js";

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
    const setActiveToolsByName = vi.fn();
    const sessionManager = {};
    const session = {
      abort,
      dispose,
      sessionManager,
      getActiveToolNames: vi.fn(() => ["read", "bash", "firecrawl_search"]),
      setActiveToolsByName,
    };
    const createPiSession = vi.fn().mockResolvedValue(session);
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
    expect(setActiveToolsByName).toHaveBeenCalledWith(["firecrawl_search"]);
    expect(getWorkspaceContext("/tmp/workspace/u_1", sessionManager)).toEqual({
      identity: { openId: "ou_1", userId: "u_1" },
      conversationTarget: undefined,
    });
    expect(promptSession).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        text: expect.stringContaining("总结今天的待办。"),
        displayHeaderText: "【定时任务结果】",
        footerLabel: "定时任务会话：",
        includeFooter: true,
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
    expect(runtimeState.acquireLock).toHaveBeenCalledWith("cron:ou_1", expect.stringMatching(/^cron:cron_1:/));
    expect(runtimeState.releaseLock).toHaveBeenCalledWith("cron:ou_1", expect.stringMatching(/^cron:cron_1:/));
    expect(dispose).toHaveBeenCalledTimes(1);
  });

  it("群聊任务会沿用当前群的工作目录和回复目标，并使用独立 cron 锁", async () => {
    const abort = vi.fn().mockResolvedValue(undefined);
    const dispose = vi.fn();
    const setActiveToolsByName = vi.fn();
    const sessionManager = {};
    const session = {
      abort,
      dispose,
      sessionManager,
      getActiveToolNames: vi.fn(() => ["read", "bash"]),
      setActiveToolsByName,
    };
    const createPiSession = vi.fn().mockResolvedValue(session);
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
    expect(setActiveToolsByName).toHaveBeenCalledWith([]);
    expect(getWorkspaceContext("/tmp/workspace/conversations/oc_group_1", sessionManager)).toEqual({
      identity: { openId: "ou_1", userId: "u_1" },
      conversationTarget: groupTarget,
    });
    expect(promptSession).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        text: expect.stringContaining("总结群里的待办。"),
        displayHeaderText: "【定时任务结果】",
        footerLabel: "定时任务会话：",
        includeFooter: true,
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
    expect(runtimeState.acquireLock).toHaveBeenCalledWith("cron:oc_group_1", expect.stringMatching(/^cron:cron_group_1:/));
    expect(runtimeState.releaseLock).toHaveBeenCalledWith(
      "cron:oc_group_1",
      expect.stringMatching(/^cron:cron_group_1:/),
    );
  });

  it("拿不到 cron 锁时会直接返回 busy", async () => {
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
      error: "当前会话还有定时任务在跑",
    });
  });

  it("同 scope 的前一个 cron 运行超过 10 分钟时，新任务仍不能进入", async () => {
    const runtimeState = createRuntimeStateStore();
    let finishPrompt!: (result: { text: string; error: undefined }) => void;
    const promptSession = vi.fn()
      .mockImplementationOnce(
        () => new Promise<{ text: string; error: undefined }>((resolve) => {
          finishPrompt = resolve;
        }),
      )
      .mockResolvedValue({ text: "unexpected second run", error: undefined });
    const runner = createCronRunner({
      config: {
        DATA_DIR: "/tmp/pi-gateway-data",
        TEXT_CHUNK_LIMIT: 2000,
        CRON_JOB_TIMEOUT_MS: 30_000,
        CRON_DEFAULT_TZ: "Asia/Shanghai",
      },
      runtime: {
        createPiSession: vi.fn().mockResolvedValue({
          abort: vi.fn().mockResolvedValue(undefined),
          dispose: vi.fn(),
        }),
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
    const baseJob = {
      openId: "ou_1",
      userId: "u_1",
      scopeType: "dm" as const,
      scopeKey: "ou_1",
      enabled: true,
      prompt: "总结今天的待办。",
      schedule: {
        kind: "cron" as const,
        expr: "0 9 * * *",
        tz: "Asia/Shanghai",
      },
      deleteAfterRun: false,
      createdAtMs: 1,
      updatedAtMs: 1,
      state: {},
    };

    const firstRun = runner.run({ ...baseJob, id: "cron_1", name: "早报" });
    await vi.waitFor(() => expect(promptSession).toHaveBeenCalledTimes(1));

    const tenMinutesLater = Date.now() + 10 * 60 * 1000 + 1;
    const nowSpy = vi.spyOn(Date, "now").mockReturnValue(tenMinutesLater);
    let secondResult;
    try {
      secondResult = await runner.run({ ...baseJob, id: "cron_2", name: "午报" });
    } finally {
      nowSpy.mockRestore();
    }

    finishPrompt({ text: "done", error: undefined });
    const firstResult = await firstRun;
    runtimeState.clearAllState();

    expect(secondResult).toEqual({
      jobId: "cron_2",
      status: "busy",
      error: "当前会话还有定时任务在跑",
    });
    expect(firstResult).toEqual({ jobId: "cron_1", status: "success" });
    expect(promptSession).toHaveBeenCalledTimes(1);
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
    expect(requestStop).toHaveBeenCalledWith("cron:ou_1", "cron:cron_1:");
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
