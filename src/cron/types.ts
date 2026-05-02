import type { ConversationTarget } from "../conversation.js";

export type CronScopeType = "dm" | "group" | "thread";

export interface CronScopeSelector {
  scopeKey: string;
  scopeType: CronScopeType;
}

export type CronScopeInput = string | CronScopeSelector;

export type CronSchedule =
  | {
      kind: "at";
      atMs: number;
    }
  | {
      kind: "cron";
      expr: string;
      tz: string;
    };

export type CronRunStatus = "success" | "error" | "aborted" | "busy" | "queued";

export interface CronJobState {
  nextRunAtMs?: number;
  runningAtMs?: number;
  lastRunAtMs?: number;
  lastRunStatus?: CronRunStatus;
  lastError?: string;
}

export interface CronJob {
  id: string;
  openId: string;
  userId?: string;
  scopeType: CronScopeType;
  scopeKey: string;
  conversationTarget?: ConversationTarget;
  name: string;
  enabled: boolean;
  prompt: string;
  schedule: CronSchedule;
  deleteAfterRun: boolean;
  createdAtMs: number;
  updatedAtMs: number;
  state: CronJobState;
}

export interface CreateCronJobInput {
  openId: string;
  userId?: string;
  scopeType?: CronScopeType;
  scopeKey?: string;
  conversationTarget?: ConversationTarget;
  name?: string;
  prompt: string;
  schedule: CronSchedule;
  deleteAfterRun?: boolean;
  enabled?: boolean;
}

export interface UpdateCronJobInput {
  name?: string;
  prompt?: string;
  schedule?: CronSchedule;
  deleteAfterRun?: boolean;
}

export interface CronJobRunResult {
  jobId: string;
  status: CronRunStatus;
  error?: string;
}

export type CronStopJobStatus = "not_running" | "requested" | "already_requested";

export interface CronManualRunResult extends CronJobRunResult {
  removed: boolean;
  job?: CronJob;
  queued?: boolean;
}

export interface CronStopJobResult {
  jobId: string;
  status: CronStopJobStatus;
  job?: CronJob;
}
