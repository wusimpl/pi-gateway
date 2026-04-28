import { formatDateTime, resolveScheduleTimezone } from "./schedule.js";
import type { CronJob } from "./types.js";

export const CRON_RESULT_FOOTER_LABEL = "定时任务会话：";

type CronResultJob = Pick<CronJob, "name" | "schedule">;

export function formatCronResultHeader(
  job: CronResultJob,
  nowMs: number = Date.now(),
  fallbackTz: string = "Asia/Shanghai",
): string {
  const timeZone = resolveScheduleTimezone(job.schedule, fallbackTz);
  return [
    "【定时任务结果】",
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
  const header = formatCronResultHeader(job, nowMs, fallbackTz);
  const body = text.trimStart();
  return body ? `${header}\n\n${body}` : header;
}
