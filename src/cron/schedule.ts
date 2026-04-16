import { Cron } from "croner";
import type { CronJob, CronSchedule } from "./types.js";

const DURATION_UNITS: Record<string, number> = {
  ms: 1,
  s: 1000,
  m: 60_000,
  h: 3_600_000,
  d: 86_400_000,
  w: 7 * 86_400_000,
};

export interface ParsedScheduleInput {
  schedule: CronSchedule;
  deleteAfterRun: boolean;
}

export function parseScheduleInput(
  raw: string,
  defaultTz: string,
  nowMs: number = Date.now(),
): ParsedScheduleInput {
  const input = raw.trim();
  if (!input) {
    throw new Error("time 不能为空");
  }

  const relativeMs = parseDurationMs(input);
  if (relativeMs !== null) {
    return {
      schedule: {
        kind: "at",
        atMs: nowMs + relativeMs,
      },
      deleteAfterRun: true,
    };
  }

  if (looksLikeIsoDateTime(input)) {
    const atMs = Date.parse(input);
    if (Number.isNaN(atMs)) {
      throw new Error("时间格式不合法，请用 ISO 时间、相对时间或 cron 表达式");
    }
    if (atMs <= nowMs) {
      throw new Error("一次性任务时间必须晚于当前时间");
    }
    return {
      schedule: {
        kind: "at",
        atMs,
      },
      deleteAfterRun: true,
    };
  }

  validateCronSchedule(input, defaultTz, nowMs);
  return {
    schedule: {
      kind: "cron",
      expr: input,
      tz: defaultTz,
    },
    deleteAfterRun: false,
  };
}

export function validateCronSchedule(
  expr: string,
  tz: string,
  nowMs: number = Date.now(),
): number {
  const cron = new Cron(expr, {
    timezone: tz,
    paused: true,
  });
  const nextRun = cron.nextRun(new Date(nowMs));
  if (!nextRun) {
    throw new Error("cron 表达式算不出下次执行时间");
  }
  return nextRun.getTime();
}

export function computeNextRunAtMs(
  schedule: CronSchedule,
  nowMs: number = Date.now(),
): number | undefined {
  if (schedule.kind === "at") {
    return schedule.atMs;
  }

  return validateCronSchedule(schedule.expr, schedule.tz, nowMs);
}

export function formatCronScheduleForText(schedule: CronSchedule, fallbackTz: string): string {
  if (schedule.kind === "at") {
    return formatDateTime(schedule.atMs, fallbackTz);
  }
  return `${schedule.expr} (${schedule.tz})`;
}

export function formatCronJobNextRun(job: CronJob, fallbackTz: string): string {
  if (!job.state.nextRunAtMs) {
    return "无";
  }
  return formatDateTime(job.state.nextRunAtMs, resolveScheduleTimezone(job.schedule, fallbackTz));
}

export function resolveScheduleTimezone(schedule: CronSchedule, fallbackTz: string): string {
  return schedule.kind === "cron" ? schedule.tz : fallbackTz;
}

export function formatDateTime(ms: number, timeZone: string): string {
  return new Intl.DateTimeFormat("zh-CN", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })
    .format(new Date(ms))
    .replace(/\//g, "-");
}

function looksLikeIsoDateTime(input: string): boolean {
  return /^\d{4}-\d{2}-\d{2}(?:[ T]\d{2}:\d{2}(?::\d{2})?(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})?)?$/.test(
    input,
  );
}

function parseDurationMs(input: string): number | null {
  const normalized = input.trim().toLowerCase();
  if (!normalized) {
    return null;
  }

  let totalMs = 0;
  let matched = 0;
  const regex = /(\d+)\s*(ms|s|m|h|d|w)/g;
  for (const match of normalized.matchAll(regex)) {
    const amount = Number(match[1]);
    const unit = match[2];
    matched += match[0].length;
    totalMs += amount * DURATION_UNITS[unit];
  }

  if (matched !== normalized.replace(/\s+/g, "").length || totalMs <= 0) {
    return null;
  }

  return totalMs;
}

