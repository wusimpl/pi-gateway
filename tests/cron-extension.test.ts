import { describe, expect, it, vi } from "vitest";
import { createCronTaskExtension } from "../src/pi/extensions/cron-task.js";

const groupTarget = {
  kind: "group",
  key: "oc_group_1",
  receiveIdType: "chat_id",
  receiveId: "oc_group_1",
  chatId: "oc_group_1",
} as const;

function collectTools(
  resolveIdentityByWorkspace: (cwd: string) => any = () => ({ openId: "ou_1", userId: "u_1" }),
) {
  const cronService = {
    isEnabled: () => true,
    getDefaultTimezone: () => "Asia/Shanghai",
    listJobs: vi.fn().mockResolvedValue([]),
    addJob: vi.fn().mockResolvedValue({
      id: "cron_1",
      name: "提醒我喝水",
    }),
    removeJob: vi.fn().mockResolvedValue({
      id: "cron_1",
      name: "提醒我喝水",
    }),
    setJobEnabled: vi.fn().mockImplementation(async (_scope, jobId, enabled) => ({
      id: jobId,
      name: "提醒我喝水",
      enabled,
    })),
    updateJob: vi.fn().mockImplementation(async (_scope, jobId, input) => ({
      id: jobId,
      name: input.name ?? "提醒我喝水",
      prompt: input.prompt ?? "提醒我喝水。",
      schedule: input.schedule,
      deleteAfterRun: input.deleteAfterRun ?? false,
    })),
    stopJob: vi.fn().mockResolvedValue({
      jobId: "cron_1",
      status: "not_running",
      job: {
        id: "cron_1",
        name: "提醒我喝水",
      },
    }),
    runJobNow: vi.fn().mockResolvedValue({
      jobId: "cron_1",
      status: "success",
      removed: false,
      job: {
        id: "cron_1",
        name: "提醒我喝水",
      },
    }),
  };
  const deferredCronRunService = {
    queueRun: vi.fn().mockResolvedValue({
      jobId: "cron_1",
      status: "queued",
      queued: true,
      removed: false,
      job: {
        id: "cron_1",
        name: "提醒我喝水",
      },
    }),
  };

  const tools: any[] = [];
  createCronTaskExtension(
    () => cronService as any,
    resolveIdentityByWorkspace as any,
    () => deferredCronRunService as any,
  )({
    registerTool(tool) {
      tools.push(tool);
    },
  } as any);

  return { cronService, deferredCronRunService, tools };
}

describe("cron task extension", () => {
  it("会注册 cron_task 工具", () => {
    const { tools } = collectTools();

    expect(tools.map((tool) => tool.name)).toEqual(["cron_task"]);
  });

  it("工具说明会约束定时任务 prompt 的最终交付方式", () => {
    const { tools } = collectTools();
    const tool = tools[0];

    expect(tool.description).toContain("触发后可直接执行");
    expect(tool.promptGuidelines.join("\n")).toContain("不要要求执行端调用 feishu_message_send");
    expect(tool.promptGuidelines.join("\n")).toContain("失败时最终回复直接说明失败原因");
  });

  it("add 会把相对时间解析成一次性任务再交给 cron service", async () => {
    const { tools, cronService } = collectTools();
    const tool = tools[0];

    await tool.execute(
      "call-1",
      tool.prepareArguments({
        action: "add",
        name: "提醒我喝水",
        time: "20m",
        prompt: "20分钟后提醒我喝水。",
      }),
      undefined,
      undefined,
      {
        cwd: "/tmp/workspace/u_1",
      },
    );

    expect(cronService.addJob).toHaveBeenCalledWith(
      expect.objectContaining({
        openId: "ou_1",
        userId: "u_1",
        scopeType: "dm",
        scopeKey: "ou_1",
        name: "提醒我喝水",
        prompt: "20分钟后提醒我喝水。",
        deleteAfterRun: true,
        schedule: expect.objectContaining({
          kind: "at",
        }),
      }),
    );
  });

  it("群聊 workspace 里的 add 会把任务绑定到当前群聊", async () => {
    const { tools, cronService } = collectTools(() => ({
      identity: { openId: "ou_1", userId: "u_1" },
      conversationTarget: groupTarget,
    }));
    const tool = tools[0];

    await tool.execute(
      "call-1",
      tool.prepareArguments({
        action: "add",
        name: "群早报",
        time: "0 9 * * *",
        prompt: "总结群里的待办。",
      }),
      undefined,
      undefined,
      {
        cwd: "/tmp/workspace/conversations/oc_group_1",
      },
    );

    expect(cronService.addJob).toHaveBeenCalledWith(
      expect.objectContaining({
        openId: "ou_1",
        userId: "u_1",
        scopeType: "group",
        scopeKey: "oc_group_1",
        conversationTarget: groupTarget,
        name: "群早报",
        prompt: "总结群里的待办。",
      }),
    );
  });

  it("pause 会暂停指定任务", async () => {
    const { tools, cronService } = collectTools();
    const tool = tools[0];

    const result = await tool.execute(
      "call-1",
      tool.prepareArguments({
        action: "pause",
        job_id: "cron_1",
      }),
      undefined,
      undefined,
      {
        cwd: "/tmp/workspace/u_1",
      },
    );

    expect(cronService.setJobEnabled).toHaveBeenCalledWith(
      { scopeKey: "ou_1", scopeType: "dm" },
      "cron_1",
      false,
    );
    expect(result.details).toMatchObject({
      action: "pause",
      job: {
        id: "cron_1",
        enabled: false,
      },
    });
  });

  it("resume 会恢复指定任务", async () => {
    const { tools, cronService } = collectTools();
    const tool = tools[0];

    const result = await tool.execute(
      "call-1",
      tool.prepareArguments({
        action: "resume",
        job_id: "cron_1",
      }),
      undefined,
      undefined,
      {
        cwd: "/tmp/workspace/u_1",
      },
    );

    expect(cronService.setJobEnabled).toHaveBeenCalledWith(
      { scopeKey: "ou_1", scopeType: "dm" },
      "cron_1",
      true,
    );
    expect(result.details).toMatchObject({
      action: "resume",
      job: {
        id: "cron_1",
        enabled: true,
      },
    });
  });

  it("resume_all 只恢复当前范围里已暂停的任务", async () => {
    const { tools, cronService } = collectTools();
    cronService.listJobs.mockResolvedValueOnce([
      { id: "cron_1", enabled: false },
      { id: "cron_2", enabled: true },
      { id: "cron_3", enabled: false },
    ]);
    const tool = tools[0];

    const result = await tool.execute(
      "call-1",
      tool.prepareArguments({
        action: "resume_all",
      }),
      undefined,
      undefined,
      {
        cwd: "/tmp/workspace/u_1",
      },
    );

    expect(cronService.setJobEnabled).toHaveBeenCalledTimes(2);
    expect(cronService.setJobEnabled).toHaveBeenNthCalledWith(
      1,
      { scopeKey: "ou_1", scopeType: "dm" },
      "cron_1",
      true,
    );
    expect(cronService.setJobEnabled).toHaveBeenNthCalledWith(
      2,
      { scopeKey: "ou_1", scopeType: "dm" },
      "cron_3",
      true,
    );
    expect(result.details).toMatchObject({
      action: "resume_all",
      resumed_count: 2,
    });
  });

  it("update 会把名称、提示词和时间交给 cron service", async () => {
    const { tools, cronService } = collectTools();
    const tool = tools[0];

    const result = await tool.execute(
      "call-1",
      tool.prepareArguments({
        action: "update",
        job_id: "cron_1",
        name: "晚报",
        time: "0 18 * * *",
        tz: "Asia/Shanghai",
        prompt: "总结今天完成的事。",
      }),
      undefined,
      undefined,
      {
        cwd: "/tmp/workspace/u_1",
      },
    );

    expect(cronService.updateJob).toHaveBeenCalledWith(
      { scopeKey: "ou_1", scopeType: "dm" },
      "cron_1",
      expect.objectContaining({
        name: "晚报",
        prompt: "总结今天完成的事。",
        deleteAfterRun: false,
        schedule: expect.objectContaining({
          kind: "cron",
          expr: "0 18 * * *",
          tz: "Asia/Shanghai",
        }),
      }),
    );
    expect(result.details).toMatchObject({
      action: "update",
      updated_fields: ["name", "prompt", "time"],
      job: {
        id: "cron_1",
        name: "晚报",
      },
    });
  });

  it("当前 workspace 没有关联到飞书用户时会报错", async () => {
    const { tools } = collectTools(() => null);
    const tool = tools[0];

    await expect(
      tool.execute(
        "call-1",
        {
          action: "list",
        },
        undefined,
        undefined,
        {
          cwd: "/tmp/workspace/u_1",
        },
      ),
    ).rejects.toThrow("当前 workspace 没有关联到飞书用户");
  });

  it("run 会先安排在当前回复结束后执行", async () => {
    const { tools, cronService, deferredCronRunService } = collectTools();
    const tool = tools[0];

    const result = await tool.execute(
      "call-1",
      tool.prepareArguments({
        action: "run",
        job_id: "cron_1",
      }),
      undefined,
      undefined,
      {
        cwd: "/tmp/workspace/u_1",
      },
    );

    expect(deferredCronRunService.queueRun).toHaveBeenCalledWith(
      { scopeKey: "ou_1", scopeType: "dm" },
      "cron_1",
    );
    expect(cronService.runJobNow).not.toHaveBeenCalled();
    expect(result.details).toMatchObject({
      action: "run",
      result: {
        jobId: "cron_1",
        status: "queued",
      },
    });
  });
});
