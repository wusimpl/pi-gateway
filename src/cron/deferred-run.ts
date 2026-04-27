import { formatError } from "../feishu/format.js";
import type { FeishuMessenger } from "../feishu/send.js";
import type { RuntimeStateStore } from "../app/state.js";
import type { CronService } from "./service.js";
import type { CronJob, CronManualRunResult } from "./types.js";

export interface DeferredCronRunService {
  queueRun(scopeKey: string, jobId: string): Promise<CronManualRunResult>;
  flush(scopeKey: string): Promise<void>;
}

interface DeferredCronRunServiceDeps {
  getCronService: () => Pick<CronService, "isEnabled" | "listJobs" | "runJobNow"> | null;
  runtimeState: Pick<RuntimeStateStore, "isLocked">;
  messenger: Pick<FeishuMessenger, "sendTextMessage"> &
    Partial<Pick<FeishuMessenger, "sendTextMessageToTarget">>;
}

export function createDeferredCronRunService(
  deps: DeferredCronRunServiceDeps,
): DeferredCronRunService {
  const pendingRuns = new Map<string, CronJob[]>();
  const flushingScopeKeys = new Set<string>();

  async function queueRun(scopeKey: string, jobId: string): Promise<CronManualRunResult> {
    const cronService = deps.getCronService();
    if (!cronService?.isEnabled()) {
      throw new Error("CRON_DISABLED");
    }

    const job = await findOwnedJob(cronService, scopeKey, jobId);
    if (!job) {
      throw new Error("CRON_JOB_NOT_FOUND");
    }

    const queue = pendingRuns.get(scopeKey) ?? [];
    if (!queue.some((queuedJob) => queuedJob.id === job.id)) {
      queue.push(cloneQueuedJob(job));
      pendingRuns.set(scopeKey, queue);
    }

    return {
      jobId: job.id,
      status: "queued",
      queued: true,
      removed: false,
      job,
    };
  }

  async function flush(scopeKey: string): Promise<void> {
    if (flushingScopeKeys.has(scopeKey)) {
      return;
    }

    const cronService = deps.getCronService();
    if (!cronService?.isEnabled()) {
      return;
    }

    flushingScopeKeys.add(scopeKey);
    try {
      while (!deps.runtimeState.isLocked(scopeKey)) {
        const queuedJob = shiftPendingRun(scopeKey);
        if (!queuedJob) {
          break;
        }

        try {
          const result = await cronService.runJobNow(scopeKey, queuedJob.id);
          if (result.status === "busy") {
            prependPendingRun(scopeKey, queuedJob);
            break;
          }
        } catch (error) {
          const code = error instanceof Error ? error.message : String(error);
          if (code === "CRON_JOB_NOT_FOUND") {
            await sendJobNotification(
              queuedJob,
              `定时任务 ${queuedJob.id} 已不存在，刚才安排的立即执行已取消。`,
            );
            continue;
          }
          if (code === "CRON_JOB_RUNNING") {
            prependPendingRun(scopeKey, queuedJob);
            break;
          }

          await sendJobNotification(queuedJob, formatError(`定时任务立即执行失败：${code}`));
        }
      }
    } finally {
      flushingScopeKeys.delete(scopeKey);
    }
  }

  return {
    queueRun,
    flush,
  };

  async function findOwnedJob(
    cronService: Pick<CronService, "listJobs">,
    scopeKey: string,
    jobId: string,
  ): Promise<CronJob | null> {
    const jobs = await cronService.listJobs(scopeKey);
    return jobs.find((job) => job.id === jobId) ?? null;
  }

  function shiftPendingRun(scopeKey: string): CronJob | null {
    const queue = pendingRuns.get(scopeKey);
    if (!queue?.length) {
      pendingRuns.delete(scopeKey);
      return null;
    }

    const job = queue.shift() ?? null;
    if (queue.length === 0) {
      pendingRuns.delete(scopeKey);
    }
    return job;
  }

  function prependPendingRun(scopeKey: string, job: CronJob): void {
    const queue = pendingRuns.get(scopeKey) ?? [];
    if (!queue.some((queuedJob) => queuedJob.id === job.id)) {
      queue.unshift(cloneQueuedJob(job));
    }
    pendingRuns.set(scopeKey, queue);
  }

  async function sendJobNotification(job: CronJob, text: string): Promise<void> {
    if (job.conversationTarget && job.conversationTarget.kind !== "p2p" && deps.messenger.sendTextMessageToTarget) {
      await deps.messenger.sendTextMessageToTarget(job.conversationTarget, text);
      return;
    }

    await deps.messenger.sendTextMessage(job.openId, text);
  }

  function cloneQueuedJob(job: CronJob): CronJob {
    return {
      ...job,
      conversationTarget: job.conversationTarget ? { ...job.conversationTarget } : undefined,
      schedule: { ...job.schedule },
      state: { ...job.state },
    };
  }
}
