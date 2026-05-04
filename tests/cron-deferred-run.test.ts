import { describe, expect, it, vi } from "vitest";
import { createDeferredCronRunService } from "../src/cron/deferred-run.js";
import type { CronJob } from "../src/cron/types.js";

function createJob(id: string): CronJob {
  return {
    id,
    openId: "ou_1",
    userId: "u_1",
    scopeType: "dm",
    scopeKey: "ou_1",
    name: `任务 ${id}`,
    enabled: true,
    prompt: "提醒我喝水。",
    schedule: {
      kind: "cron",
      expr: "0 9 * * *",
      tz: "Asia/Shanghai",
    },
    deleteAfterRun: false,
    createdAtMs: 1,
    updatedAtMs: 1,
    state: {},
  };
}

describe("deferred cron run service", () => {
  it("会把立即执行请求排队并在解锁后触发", async () => {
    const listJobs = vi.fn().mockResolvedValue([createJob("cron_1")]);
    const runJobNow = vi.fn().mockResolvedValue({
      jobId: "cron_1",
      status: "success",
      removed: false,
      job: createJob("cron_1"),
    });
    const isLocked = vi
      .fn<() => boolean>()
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(false);
    const sendTextMessage = vi.fn().mockResolvedValue(undefined);

    const service = createDeferredCronRunService({
      getCronService: () => ({
        isEnabled: () => true,
        listJobs,
        runJobNow,
      }),
      runtimeState: {
        isLocked,
      },
      messenger: {
        sendTextMessage,
      },
    });

    const queued = await service.queueRun("ou_1", "cron_1");
    await service.flush("ou_1");

    expect(queued).toMatchObject({
      jobId: "cron_1",
      status: "queued",
      queued: true,
    });
    expect(runJobNow).toHaveBeenCalledWith({ scopeKey: "ou_1", scopeType: "dm" }, "cron_1");
    expect(sendTextMessage).not.toHaveBeenCalled();
  });

  it("同一个任务重复排队时只会执行一次", async () => {
    const job = createJob("cron_1");
    const runJobNow = vi.fn().mockResolvedValue({
      jobId: "cron_1",
      status: "success",
      removed: false,
      job,
    });

    const service = createDeferredCronRunService({
      getCronService: () => ({
        isEnabled: () => true,
        listJobs: vi.fn().mockResolvedValue([job]),
        runJobNow,
      }),
      runtimeState: {
        isLocked: vi.fn(() => false),
      },
      messenger: {
        sendTextMessage: vi.fn().mockResolvedValue(undefined),
      },
    });

    await service.queueRun("ou_1", "cron_1");
    await service.queueRun("ou_1", "cron_1");
    await service.flush("ou_1");

    expect(runJobNow).toHaveBeenCalledTimes(1);
  });

  it("排队任务后来不存在时，会把通知标成定时任务异常", async () => {
    const job = createJob("cron_1");
    const sendTextMessage = vi.fn().mockResolvedValue(undefined);
    const service = createDeferredCronRunService({
      getCronService: () => ({
        isEnabled: () => true,
        listJobs: vi.fn().mockResolvedValue([job]),
        runJobNow: vi.fn().mockRejectedValue(new Error("CRON_JOB_NOT_FOUND")),
      }),
      runtimeState: {
        isLocked: vi.fn(() => false),
      },
      messenger: {
        sendTextMessage,
      },
    });

    await service.queueRun("ou_1", "cron_1");
    await service.flush("ou_1");

    expect(sendTextMessage).toHaveBeenCalledWith(
      "ou_1",
      expect.stringContaining("【定时任务异常】\n任务：任务 cron_1"),
    );
  });
});
