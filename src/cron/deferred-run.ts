import { formatError } from "../feishu/format.js";
import type { FeishuMessenger } from "../feishu/send.js";
import type { RuntimeStateStore } from "../app/state.js";
import type { CronService } from "./service.js";
import type { CronJob, CronManualRunResult } from "./types.js";

export interface DeferredCronRunService {
  queueRun(openId: string, jobId: string): Promise<CronManualRunResult>;
  flush(openId: string): Promise<void>;
}

interface DeferredCronRunServiceDeps {
  getCronService: () => Pick<CronService, "isEnabled" | "listJobs" | "runJobNow"> | null;
  runtimeState: Pick<RuntimeStateStore, "isLocked">;
  messenger: Pick<FeishuMessenger, "sendTextMessage">;
}

export function createDeferredCronRunService(
  deps: DeferredCronRunServiceDeps,
): DeferredCronRunService {
  const pendingRuns = new Map<string, string[]>();
  const flushingOpenIds = new Set<string>();

  async function queueRun(openId: string, jobId: string): Promise<CronManualRunResult> {
    const cronService = deps.getCronService();
    if (!cronService?.isEnabled()) {
      throw new Error("CRON_DISABLED");
    }

    const job = await findOwnedJob(cronService, openId, jobId);
    if (!job) {
      throw new Error("CRON_JOB_NOT_FOUND");
    }

    const queue = pendingRuns.get(openId) ?? [];
    if (!queue.includes(job.id)) {
      queue.push(job.id);
      pendingRuns.set(openId, queue);
    }

    return {
      jobId: job.id,
      status: "queued",
      queued: true,
      removed: false,
      job,
    };
  }

  async function flush(openId: string): Promise<void> {
    if (flushingOpenIds.has(openId)) {
      return;
    }

    const cronService = deps.getCronService();
    if (!cronService?.isEnabled()) {
      return;
    }

    flushingOpenIds.add(openId);
    try {
      while (!deps.runtimeState.isLocked(openId)) {
        const jobId = shiftPendingRun(openId);
        if (!jobId) {
          break;
        }

        try {
          const result = await cronService.runJobNow(openId, jobId);
          if (result.status === "busy") {
            prependPendingRun(openId, jobId);
            break;
          }
        } catch (error) {
          const code = error instanceof Error ? error.message : String(error);
          if (code === "CRON_JOB_NOT_FOUND") {
            await deps.messenger.sendTextMessage(
              openId,
              `定时任务 ${jobId} 已不存在，刚才安排的立即执行已取消。`,
            );
            continue;
          }
          if (code === "CRON_JOB_RUNNING") {
            prependPendingRun(openId, jobId);
            break;
          }

          await deps.messenger.sendTextMessage(
            openId,
            formatError(`定时任务立即执行失败：${code}`),
          );
        }
      }
    } finally {
      flushingOpenIds.delete(openId);
    }
  }

  return {
    queueRun,
    flush,
  };

  async function findOwnedJob(
    cronService: Pick<CronService, "listJobs">,
    openId: string,
    jobId: string,
  ): Promise<CronJob | null> {
    const jobs = await cronService.listJobs(openId);
    return jobs.find((job) => job.id === jobId) ?? null;
  }

  function shiftPendingRun(openId: string): string | null {
    const queue = pendingRuns.get(openId);
    if (!queue?.length) {
      pendingRuns.delete(openId);
      return null;
    }

    const jobId = queue.shift() ?? null;
    if (queue.length === 0) {
      pendingRuns.delete(openId);
    }
    return jobId;
  }

  function prependPendingRun(openId: string, jobId: string): void {
    const queue = pendingRuns.get(openId) ?? [];
    if (!queue.includes(jobId)) {
      queue.unshift(jobId);
    }
    pendingRuns.set(openId, queue);
  }
}
