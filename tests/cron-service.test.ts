import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createCronService } from "../src/cron/service.js";
import type { CronJob } from "../src/cron/types.js";

const MAX_TIMER_DELAY_MS = 2_147_483_647;

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
    vi.restoreAllMocks();
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

  it("超长等待会分段挂定时器", async () => {
    const store = createMemoryStore();
    const runner = {
      run: vi.fn(async (job: CronJob) => ({
        jobId: job.id,
        status: "success" as const,
      })),
    };
    const setTimeoutSpy = vi.spyOn(globalThis, "setTimeout");
    const service = createCronService({
      store,
      runner,
      defaultTz: "Asia/Shanghai",
    });

    await service.start();
    await service.addJob({
      openId: "ou_1",
      prompt: "下个月提醒我缴费。",
      schedule: {
        kind: "at",
        atMs: Date.now() + MAX_TIMER_DELAY_MS + 5_000,
      },
    });

    const timeoutCalls = setTimeoutSpy.mock.calls.filter(
      (call): call is [unknown, number, ...unknown[]] => typeof call[1] === "number",
    );
    expect(timeoutCalls.at(-1)?.[1]).toBe(MAX_TIMER_DELAY_MS);

    await vi.advanceTimersByTimeAsync(MAX_TIMER_DELAY_MS);

    expect(runner.run).not.toHaveBeenCalled();
    const rearmedCalls = setTimeoutSpy.mock.calls.filter(
      (call): call is [unknown, number, ...unknown[]] => typeof call[1] === "number",
    );
    expect(rearmedCalls.at(-1)?.[1]).toBe(5_000);

    await vi.advanceTimersByTimeAsync(5_000);

    expect(runner.run).toHaveBeenCalledTimes(1);
  });

  it("手动执行遇到 busy 不会改写原定时间", async () => {
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
    const originalNextRunAtMs = Date.now() + 86_400_000;
    const job = await service.addJob({
      openId: "ou_1",
      prompt: "明天提醒我续费。",
      schedule: {
        kind: "at",
        atMs: originalNextRunAtMs,
      },
    });

    const result = await service.runJobNow("ou_1", job.id);

    expect(result).toMatchObject({
      jobId: job.id,
      status: "busy",
      removed: false,
    });
    const [listed] = await service.listJobs("ou_1");
    expect(listed.state.lastRunStatus).toBe("busy");
    expect(listed.state.nextRunAtMs).toBe(originalNextRunAtMs);
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
