import { Cron } from "croner";
import type { CronJob, CronSchedule } from "./types.js";

const ABSOLUTE_DATE_TIME_PATTERN =
  /^(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})(?:[ T](?<hour>\d{2}):(?<minute>\d{2})(?::(?<second>\d{2})(?:\.(?<millisecond>\d{1,3}))?)?(?<offset>Z|[+-]\d{2}:\d{2})?)?$/;

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
    const atMs = parseAbsoluteDateTime(input, defaultTz);
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
  return ABSOLUTE_DATE_TIME_PATTERN.test(input);
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

function parseAbsoluteDateTime(input: string, defaultTz: string): number {
  const match = ABSOLUTE_DATE_TIME_PATTERN.exec(input);
  if (!match?.groups) {
    throw new Error("时间格式不合法，请用 ISO 时间、相对时间或 cron 表达式");
  }

  const parts = parseAbsoluteDateTimeParts(match.groups);
  if (!isValidAbsoluteDateTimeParts(parts)) {
    throw new Error("时间格式不合法，请用 ISO 时间、相对时间或 cron 表达式");
  }

  if (parts.offset) {
    return applyOffsetToAbsoluteDateTime(parts);
  }

  return parseAbsoluteDateTimeInTimeZone(parts, defaultTz);
}

function parseAbsoluteDateTimeParts(
  groups: Record<string, string | undefined>,
): ParsedAbsoluteDateTimeParts {
  return {
    year: Number(groups.year),
    month: Number(groups.month),
    day: Number(groups.day),
    hour: Number(groups.hour ?? "0"),
    minute: Number(groups.minute ?? "0"),
    second: Number(groups.second ?? "0"),
    millisecond: Number((groups.millisecond ?? "").padEnd(3, "0") || "0"),
    offset: groups.offset,
  };
}

function isValidAbsoluteDateTimeParts(parts: ParsedAbsoluteDateTimeParts): boolean {
  if (parts.month < 1 || parts.month > 12) {
    return false;
  }
  if (parts.hour < 0 || parts.hour > 23) {
    return false;
  }
  if (parts.minute < 0 || parts.minute > 59) {
    return false;
  }
  if (parts.second < 0 || parts.second > 59) {
    return false;
  }
  if (parts.millisecond < 0 || parts.millisecond > 999) {
    return false;
  }

  const maxDay = new Date(Date.UTC(parts.year, parts.month, 0)).getUTCDate();
  return parts.day >= 1 && parts.day <= maxDay;
}

function applyOffsetToAbsoluteDateTime(parts: ParsedAbsoluteDateTimeParts): number {
  const utcMs = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
    parts.millisecond,
  );
  return utcMs - parseOffsetMs(parts.offset);
}

function parseAbsoluteDateTimeInTimeZone(
  parts: ParsedAbsoluteDateTimeParts,
  timeZone: string,
): number {
  const utcGuess = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
    parts.millisecond,
  );

  let atMs = utcGuess - getTimeZoneOffsetMs(utcGuess, timeZone);
  atMs = utcGuess - getTimeZoneOffsetMs(atMs, timeZone);

  if (!matchesAbsoluteDateTimeInTimeZone(atMs, parts, timeZone)) {
    throw new Error("时间格式不合法，请用 ISO 时间、相对时间或 cron 表达式");
  }

  return atMs;
}

function matchesAbsoluteDateTimeInTimeZone(
  atMs: number,
  parts: ParsedAbsoluteDateTimeParts,
  timeZone: string,
): boolean {
  const actual = formatDateTimePartsInTimeZone(atMs, timeZone);
  return (
    actual.year === parts.year &&
    actual.month === parts.month &&
    actual.day === parts.day &&
    actual.hour === parts.hour &&
    actual.minute === parts.minute &&
    actual.second === parts.second
  );
}

function formatDateTimePartsInTimeZone(atMs: number, timeZone: string): FormattedDateTimeParts {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    hourCycle: "h23",
  });
  const parts = formatter.formatToParts(new Date(atMs));
  return {
    year: Number(parts.find((part) => part.type === "year")?.value),
    month: Number(parts.find((part) => part.type === "month")?.value),
    day: Number(parts.find((part) => part.type === "day")?.value),
    hour: Number(parts.find((part) => part.type === "hour")?.value),
    minute: Number(parts.find((part) => part.type === "minute")?.value),
    second: Number(parts.find((part) => part.type === "second")?.value),
  };
}

function getTimeZoneOffsetMs(atMs: number, timeZone: string): number {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    timeZoneName: "longOffset",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const offset = formatter
    .formatToParts(new Date(atMs))
    .find((part) => part.type === "timeZoneName")?.value;
  return parseOffsetMs(offset);
}

function parseOffsetMs(offset: string | undefined): number {
  if (!offset) {
    throw new Error("时间格式不合法，请用 ISO 时间、相对时间或 cron 表达式");
  }

  if (offset === "Z" || offset === "GMT" || offset === "UTC") {
    return 0;
  }

  const match = /^(?:GMT)?(?<sign>[+-])(?<hour>\d{2}):(?<minute>\d{2})$/.exec(offset);
  if (!match?.groups) {
    throw new Error("时间格式不合法，请用 ISO 时间、相对时间或 cron 表达式");
  }

  const sign = match.groups.sign === "+" ? 1 : -1;
  return sign * (Number(match.groups.hour) * 60 + Number(match.groups.minute)) * 60_000;
}

interface ParsedAbsoluteDateTimeParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  millisecond: number;
  offset?: string;
}

interface FormattedDateTimeParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}
