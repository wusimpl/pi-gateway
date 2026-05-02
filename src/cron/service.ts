import { randomUUID } from "node:crypto";
import { logger } from "../app/logger.js";
import type { CronStore } from "./store.js";
import { computeNextRunAtMs } from "./schedule.js";
import type {
  CreateCronJobInput,
  CronJob,
  CronManualRunResult,
  CronJobRunResult,
  CronScopeInput,
  CronScopeSelector,
  CronStopJobResult,
  UpdateCronJobInput,
} from "./types.js";
import {
  resolveCreateCronJobScope,
  resolveCronScopeInput,
  resolveLoadedCronJobScope,
} from "./scope.js";

const BUSY_RETRY_MS = 60_000;
const MAX_TIMER_DELAY_MS = 2_147_483_647;

export interface CronService {
  start(): Promise<void>;
  stop(): Promise<void>;
  isEnabled(): boolean;
  getDefaultTimezone(): string;
  listJobs(scope: CronScopeInput): Promise<CronJob[]>;
  addJob(input: CreateCronJobInput): Promise<CronJob>;
  setJobEnabled(scope: CronScopeInput, jobId: string, enabled: boolean): Promise<CronJob>;
  updateJob(scope: CronScopeInput, jobId: string, input: UpdateCronJobInput): Promise<CronJob>;
  removeJob(scope: CronScopeInput, jobId: string): Promise<CronJob | null>;
  stopJob(scope: CronScopeInput, jobId: string): Promise<CronStopJobResult>;
  runJobNow(scope: CronScopeInput, jobId: string): Promise<CronManualRunResult>;
}

interface CronServiceDeps {
  store: Pick<CronStore, "loadJobs" | "saveJobs" | "getFilePath">;
  runner: {
    run(job: CronJob): Promise<CronJobRunResult>;
    stop?(job: CronJob): Promise<"not_running" | "requested" | "already_requested">;
  };
  defaultTz: string;
  enabled?: boolean;
  now?: () => number;
}

export function createCronService(deps: CronServiceDeps): CronService {
  const now = deps.now ?? (() => Date.now());
  const jobs = new Map<string, CronJob>();
  const runningJobs = new Set<string>();
  let timer: NodeJS.Timeout | null = null;
  let started = false;
  let stopped = false;
  let mutationChain = Promise.resolve();

  function mutate<T>(operation: () => Promise<T>): Promise<T> {
    const result = mutationChain.then(operation, operation);
    mutationChain = result.then(
      () => undefined,
      () => undefined,
    );
    return result;
  }

  async function persist(): Promise<void> {
    await deps.store.saveJobs([...jobs.values()].sort((a, b) => a.createdAtMs - b.createdAtMs));
  }

  function clearTimer(): void {
    if (!timer) {
      return;
    }
    clearTimeout(timer);
    timer = null;
  }

  function armTimer(): void {
    clearTimer();
    if (!started || stopped || deps.enabled === false) {
      return;
    }

    let nextRunAtMs: number | undefined;
    for (const job of jobs.values()) {
      if (!job.enabled || runningJobs.has(job.id) || !job.state.nextRunAtMs) {
        continue;
      }
      if (nextRunAtMs === undefined || job.state.nextRunAtMs < nextRunAtMs) {
        nextRunAtMs = job.state.nextRunAtMs;
      }
    }

    if (nextRunAtMs === undefined) {
      return;
    }

    const delayMs = Math.max(0, Math.min(nextRunAtMs - now(), MAX_TIMER_DELAY_MS));
    timer = setTimeout(() => {
      void processDueJobs();
    }, delayMs);
    if (typeof timer.unref === "function") {
      timer.unref();
    }
  }

  async function processDueJobs(): Promise<void> {
    await mutate(async () => {
      if (!started || stopped || deps.enabled === false) {
        return;
      }

      const dueJobs = [...jobs.values()]
        .filter((job) => job.enabled && !runningJobs.has(job.id))
        .filter((job) => (job.state.nextRunAtMs ?? Number.MAX_SAFE_INTEGER) <= now())
        .sort((a, b) => (a.state.nextRunAtMs ?? Number.MAX_SAFE_INTEGER) - (b.state.nextRunAtMs ?? Number.MAX_SAFE_INTEGER));

      for (const job of dueJobs) {
        void executeJob(job.id, "scheduled");
      }

      armTimer();
    });
  }

  async function start(): Promise<void> {
    if (started) {
      return;
    }
    started = true;
    stopped = false;

    const loadedJobs = await deps.store.loadJobs();
    await mutate(async () => {
      const currentTime = now();
      for (const rawJob of loadedJobs) {
        const normalized = normalizeLoadedJob(rawJob, currentTime);
        jobs.set(normalized.id, normalized);
      }
      await persist();
      armTimer();
      logger.info("cron 服务已启动", {
        enabled: deps.enabled !== false,
        jobsFile: deps.store.getFilePath(),
        count: jobs.size,
      });
    });
  }

  async function stop(): Promise<void> {
    stopped = true;
    clearTimer();
  }

  async function listJobs(scope: CronScopeInput): Promise<CronJob[]> {
    const owner = resolveCronScopeInput(scope);
    return [...jobs.values()]
      .filter((job) => isJobInScope(job, owner))
      .sort((a, b) => {
        const aNext = a.state.nextRunAtMs ?? Number.MAX_SAFE_INTEGER;
        const bNext = b.state.nextRunAtMs ?? Number.MAX_SAFE_INTEGER;
        if (aNext !== bNext) {
          return aNext - bNext;
        }
        return a.createdAtMs - b.createdAtMs;
      })
      .map(cloneJob);
  }

  async function addJob(input: CreateCronJobInput): Promise<CronJob> {
    if (deps.enabled === false) {
      throw new Error("CRON_DISABLED");
    }

    const currentTime = now();
    const scope = resolveCreateCronJobScope(input);
    const createdJob: CronJob = {
      id: createJobId(),
      openId: input.openId,
      userId: input.userId,
      scopeType: scope.scopeType,
      scopeKey: scope.scopeKey,
      conversationTarget: scope.conversationTarget,
      name: normalizeJobName(input.name, input.prompt),
      enabled: input.enabled ?? true,
      prompt: input.prompt.trim(),
      schedule: input.schedule,
      deleteAfterRun: input.deleteAfterRun ?? input.schedule.kind === "at",
      createdAtMs: currentTime,
      updatedAtMs: currentTime,
      state: {
        nextRunAtMs: computeNextRunAtMs(input.schedule, currentTime),
      },
    };

    if (!createdJob.prompt) {
      throw new Error("CRON_PROMPT_REQUIRED");
    }

    return mutate(async () => {
      jobs.set(createdJob.id, createdJob);
      await persist();
      armTimer();
      return cloneJob(createdJob);
    });
  }

  async function removeJob(scope: CronScopeInput, jobId: string): Promise<CronJob | null> {
    const owner = resolveCronScopeInput(scope);
    return mutate(async () => {
      const job = requireOwnedJob(owner, jobId);
      if (!job) {
        return null;
      }
      if (runningJobs.has(job.id)) {
        throw new Error("CRON_JOB_RUNNING");
      }
      jobs.delete(job.id);
      await persist();
      armTimer();
      return cloneJob(job);
    });
  }

  async function setJobEnabled(scope: CronScopeInput, jobId: string, enabled: boolean): Promise<CronJob> {
    if (deps.enabled === false) {
      throw new Error("CRON_DISABLED");
    }

    const owner = resolveCronScopeInput(scope);
    return mutate(async () => {
      const job = requireOwnedJob(owner, jobId);
      if (!job) {
        throw new Error("CRON_JOB_NOT_FOUND");
      }

      const currentTime = now();
      job.enabled = enabled;
      job.updatedAtMs = currentTime;
      job.state.nextRunAtMs = enabled ? computeNextRunAtMs(job.schedule, currentTime) : undefined;
      await persist();
      armTimer();
      return cloneJob(job);
    });
  }

  async function updateJob(scope: CronScopeInput, jobId: string, input: UpdateCronJobInput): Promise<CronJob> {
    if (deps.enabled === false) {
      throw new Error("CRON_DISABLED");
    }

    const hasName = input.name !== undefined;
    const hasPrompt = input.prompt !== undefined;
    const hasSchedule = input.schedule !== undefined;
    if (!hasName && !hasPrompt && !hasSchedule) {
      throw new Error("CRON_UPDATE_REQUIRED");
    }

    const nextName = hasName ? input.name?.trim() : undefined;
    const nextPrompt = hasPrompt ? input.prompt?.trim() : undefined;
    if (hasName && !nextName) {
      throw new Error("CRON_NAME_REQUIRED");
    }
    if (hasPrompt && !nextPrompt) {
      throw new Error("CRON_PROMPT_REQUIRED");
    }

    const owner = resolveCronScopeInput(scope);
    return mutate(async () => {
      const job = requireOwnedJob(owner, jobId);
      if (!job) {
        throw new Error("CRON_JOB_NOT_FOUND");
      }

      const currentTime = now();
      if (nextName) {
        job.name = nextName;
      }
      if (nextPrompt) {
        job.prompt = nextPrompt;
      }
      if (input.schedule) {
        job.schedule = input.schedule;
        job.deleteAfterRun = input.deleteAfterRun ?? input.schedule.kind === "at";
        job.state.nextRunAtMs = job.enabled ? computeNextRunAtMs(input.schedule, currentTime) : undefined;
      }
      job.updatedAtMs = currentTime;
      await persist();
      armTimer();
      return cloneJob(job);
    });
  }

  async function stopJob(scope: CronScopeInput, jobId: string): Promise<CronStopJobResult> {
    const owner = resolveCronScopeInput(scope);
    const ownedJob = requireOwnedJob(owner, jobId);
    if (!ownedJob) {
      throw new Error("CRON_JOB_NOT_FOUND");
    }

    if (!runningJobs.has(ownedJob.id)) {
      return {
        jobId: ownedJob.id,
        status: "not_running",
        job: cloneJob(ownedJob),
      };
    }

    if (!deps.runner.stop) {
      throw new Error("CRON_STOP_UNSUPPORTED");
    }

    const status = await deps.runner.stop(cloneJob(ownedJob));
    return {
      jobId: ownedJob.id,
      status,
      job: cloneJob(ownedJob),
    };
  }

  async function runJobNow(scope: CronScopeInput, jobId: string): Promise<CronManualRunResult> {
    if (deps.enabled === false) {
      throw new Error("CRON_DISABLED");
    }

    const owner = resolveCronScopeInput(scope);
    const ownedJob = requireOwnedJob(owner, jobId);
    if (!ownedJob) {
      throw new Error("CRON_JOB_NOT_FOUND");
    }

    return executeJob(ownedJob.id, "manual");
  }

  async function executeJob(
    jobId: string,
    trigger: "manual" | "scheduled",
  ): Promise<CronManualRunResult> {
    let jobSnapshot: CronJob;

    await mutate(async () => {
      const job = jobs.get(jobId);
      if (!job) {
        throw new Error("CRON_JOB_NOT_FOUND");
      }
      if (runningJobs.has(jobId)) {
        throw new Error("CRON_JOB_RUNNING");
      }

      runningJobs.add(jobId);
      const currentTime = now();
      job.updatedAtMs = currentTime;
      job.state.runningAtMs = currentTime;
      job.state.lastError = undefined;
      await persist();
      armTimer();
      jobSnapshot = cloneJob(job);
    });

    let runResult: CronJobRunResult;
    try {
      runResult = await deps.runner.run(jobSnapshot!);
    } catch (error) {
      runResult = {
        jobId,
        status: "error",
        error: error instanceof Error ? error.message : String(error),
      };
    }

    return mutate(async () => {
      runningJobs.delete(jobId);

      const job = jobs.get(jobId);
      if (!job) {
        armTimer();
        return {
          jobId,
          status: runResult.status,
          error: runResult.error,
          removed: true,
        };
      }

      const currentTime = now();
      job.updatedAtMs = currentTime;
      job.state.runningAtMs = undefined;
      job.state.lastRunAtMs = currentTime;
      job.state.lastRunStatus = runResult.status;
      job.state.lastError = runResult.error;

      const removed = finalizeJobAfterRun(job, runResult, currentTime, trigger);
      await persist();
      armTimer();

      return {
        jobId,
        status: runResult.status,
        error: runResult.error,
        removed,
        job: removed ? undefined : cloneJob(job),
      };
    });
  }

  return {
    start,
    stop,
    isEnabled: () => deps.enabled !== false,
    getDefaultTimezone: () => deps.defaultTz,
    listJobs,
    addJob,
    setJobEnabled,
    updateJob,
    removeJob,
    stopJob,
    runJobNow,
  };

  function requireOwnedJob(owner: CronScopeSelector, jobId: string): CronJob | null {
    const job = jobs.get(jobId);
    if (!job || !isJobInScope(job, owner)) {
      return null;
    }
    return job;
  }

  function isJobInScope(job: CronJob, owner: CronScopeSelector): boolean {
    return job.scopeType === owner.scopeType && resolveJobScopeKey(job) === owner.scopeKey;
  }

  function finalizeJobAfterRun(
    job: CronJob,
    runResult: CronJobRunResult,
    currentTime: number,
    trigger: "manual" | "scheduled",
  ): boolean {
    if (!job.enabled) {
      job.state.nextRunAtMs = undefined;
      return false;
    }

    if (runResult.status === "busy") {
      if (trigger === "manual") {
        return false;
      }
      job.state.nextRunAtMs = currentTime + BUSY_RETRY_MS;
      return false;
    }

    if (job.schedule.kind === "at") {
      if (runResult.status === "success" && job.deleteAfterRun) {
        jobs.delete(job.id);
        return true;
      }

      job.enabled = false;
      job.state.nextRunAtMs = undefined;
      return false;
    }

    job.state.nextRunAtMs = computeNextRunAtMs(job.schedule, currentTime);
    return false;
  }
}

function normalizeLoadedJob(job: CronJob, currentTime: number): CronJob {
  const normalized = cloneJob(job);
  const scope = resolveLoadedCronJobScope(normalized);
  normalized.scopeType = scope.scopeType;
  normalized.scopeKey = scope.scopeKey;
  normalized.conversationTarget = scope.conversationTarget;
  normalized.state.runningAtMs = undefined;
  if (normalized.enabled) {
    if (!normalized.state.nextRunAtMs) {
      normalized.state.nextRunAtMs = computeNextRunAtMs(normalized.schedule, currentTime);
    }
  } else {
    normalized.state.nextRunAtMs = undefined;
  }
  return normalized;
}

function cloneJob(job: CronJob): CronJob {
  return {
    ...job,
    conversationTarget: job.conversationTarget ? { ...job.conversationTarget } : undefined,
    schedule: { ...job.schedule },
    state: { ...job.state },
  };
}

function resolveJobScopeKey(job: Pick<CronJob, "scopeKey" | "openId" | "conversationTarget">): string {
  return job.scopeKey?.trim() || job.conversationTarget?.key.trim() || job.openId;
}

function createJobId(): string {
  return `cron_${randomUUID().replace(/-/g, "").slice(0, 12)}`;
}

function normalizeJobName(rawName: string | undefined, prompt: string): string {
  const name = rawName?.trim();
  if (name) {
    return name;
  }

  const firstLine = prompt.trim().split(/\r?\n/, 1)[0]?.trim() ?? "";
  if (!firstLine) {
    return "未命名任务";
  }

  return firstLine.length > 30 ? `${firstLine.slice(0, 30)}...` : firstLine;
}
