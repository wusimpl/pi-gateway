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
