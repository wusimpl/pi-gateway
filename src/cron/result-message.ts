import { formatDateTime, resolveScheduleTimezone } from "./schedule.js";
import type { CronJob } from "./types.js";

export const CRON_RESULT_FOOTER_LABEL = "定时任务会话：";
export const CRON_RESULT_HEADER = "【定时任务结果】";

type CronResultJob = Pick<CronJob, "name" | "schedule">;

export function formatCronResultHeader(
  _job: CronResultJob,
  nowMs: number = Date.now(),
  fallbackTz: string = "Asia/Shanghai",
): string {
  void nowMs;
  void fallbackTz;
  return CRON_RESULT_HEADER;
}

export function formatCronErrorHeader(
  job: CronResultJob,
  nowMs: number = Date.now(),
  fallbackTz: string = "Asia/Shanghai",
): string {
  const timeZone = resolveScheduleTimezone(job.schedule, fallbackTz);
  return [
    "【定时任务异常】",
    `任务：${job.name}`,
    `执行时间：${formatDateTime(nowMs, timeZone)}`,
  ].join("\n");
}

export function formatCronResultMessage(
  job: CronResultJob,
  text: string,
  nowMs: number = Date.now(),
  fallbackTz: string = "Asia/Shanghai",
): string {
  const header = formatCronErrorHeader(job, nowMs, fallbackTz);
  const body = text.trimStart();
  return body ? `${header}\n\n${body}` : header;
}
