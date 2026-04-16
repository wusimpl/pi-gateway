import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createCronService } from "../src/cron/service.js";
import type { CronJob } from "../src/cron/types.js";

function createMemoryStore(initialJobs: CronJob[] = []) {
  let jobs = initialJobs.map(cloneJob);
  return {
    getFilePath: () => "/tmp/pi-gateway/cron/jobs.json",
    loadJobs: vi.fn(async () => jobs.map(cloneJob)),
    saveJobs: vi.fn(async (nextJobs: CronJob[]) => {
      jobs = nextJobs.map(cloneJob);
    }),
    readJobs: () => jobs.map(cloneJob),
  };
}

describe("cron service", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-16T12:00:00.000+08:00"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("一次性任务执行成功后会自动删除", async () => {
    const store = createMemoryStore();
    const runner = {
      run: vi.fn(async (job: CronJob) => ({
        jobId: job.id,
        status: "success" as const,
      })),
    };
    const service = createCronService({
      store,
      runner,
      defaultTz: "Asia/Shanghai",
    });

    await service.start();
    const job = await service.addJob({
      openId: "ou_1",
      prompt: "提醒我喝水。",
      schedule: {
        kind: "at",
        atMs: Date.now() + 1_000,
      },
    });

    await vi.advanceTimersByTimeAsync(1_000);

    await vi.waitFor(() => {
      expect(runner.run).toHaveBeenCalledWith(expect.objectContaining({ id: job.id }));
    });
    await expect(service.listJobs("ou_1")).resolves.toEqual([]);
  });

  it("用户忙时会顺延 60 秒再试", async () => {
    const store = createMemoryStore();
    const runner = {
      run: vi.fn(async (job: CronJob) => ({
        jobId: job.id,
        status: "busy" as const,
        error: "当前用户还有任务在跑",
      })),
    };
    const service = createCronService({
      store,
      runner,
      defaultTz: "Asia/Shanghai",
    });

    await service.start();
    await service.addJob({
      openId: "ou_1",
      prompt: "提醒我喝水。",
      schedule: {
        kind: "at",
        atMs: Date.now() + 1_000,
      },
    });

    await vi.advanceTimersByTimeAsync(1_000);

    await vi.waitFor(() => {
      expect(runner.run).toHaveBeenCalledTimes(1);
    });
    const [job] = await service.listJobs("ou_1");
    expect(job.state.lastRunStatus).toBe("busy");
    expect(job.state.nextRunAtMs).toBeGreaterThanOrEqual(Date.now() + 59_950);
    expect(job.state.nextRunAtMs).toBeLessThanOrEqual(Date.now() + 60_000);
  });

  it("手动执行周期任务失败后仍会保留任务", async () => {
    const store = createMemoryStore();
    const runner = {
      run: vi.fn(async (job: CronJob) => ({
        jobId: job.id,
        status: "error" as const,
        error: "boom",
      })),
    };
    const service = createCronService({
      store,
      runner,
      defaultTz: "Asia/Shanghai",
    });

    await service.start();
    const job = await service.addJob({
      openId: "ou_1",
      prompt: "每天早上给我发日报。",
      schedule: {
        kind: "cron",
        expr: "0 9 * * *",
        tz: "Asia/Shanghai",
      },
      deleteAfterRun: false,
    });

    const result = await service.runJobNow("ou_1", job.id);

    expect(result).toMatchObject({
      jobId: job.id,
      status: "error",
      removed: false,
      error: "boom",
    });
    const [listed] = await service.listJobs("ou_1");
    expect(listed.enabled).toBe(true);
    expect(listed.state.lastRunStatus).toBe("error");
    expect(listed.state.nextRunAtMs).toBeGreaterThan(Date.now());
  });
});

function cloneJob(job: CronJob): CronJob {
  return {
    ...job,
    schedule: { ...job.schedule },
    state: { ...job.state },
  };
}
