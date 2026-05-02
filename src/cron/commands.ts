import type { CronJob, CronManualRunResult, CronStopJobResult } from "./types.js";
import {
  formatCronJobNextRun,
  formatCronScheduleForText,
  resolveScheduleTimezone,
  formatDateTime,
} from "./schedule.js";

export type ParsedCronBridgeCommand =
  | { action: "help" }
  | { action: "list" }
  | {
      action: "add";
      name?: string;
      time: string;
      tz?: string;
      prompt: string;
    }
  | { action: "remove"; jobId: string }
  | { action: "resume"; jobId: string }
  | { action: "pause"; jobId: string }
  | { action: "stop"; jobId: string }
  | { action: "run"; jobId: string };

export function parseCronBridgeCommand(
  args: string,
): { command?: ParsedCronBridgeCommand; error?: string } {
  const trimmed = args.trim();
  if (!trimmed || trimmed === "help") {
    return { command: { action: "help" } };
  }
  if (trimmed === "list") {
    return { command: { action: "list" } };
  }

  if (trimmed.startsWith("remove ")) {
    const jobId = trimmed.slice("remove ".length).trim();
    if (!jobId) {
      return { error: "用法：/cron remove <jobId>" };
    }
    return { command: { action: "remove", jobId } };
  }

  if (trimmed.startsWith("resume ")) {
    const jobId = trimmed.slice("resume ".length).trim();
    if (!jobId) {
      return { error: "用法：/cron resume <jobId>" };
    }
    return { command: { action: "resume", jobId } };
  }

  if (trimmed.startsWith("pause ")) {
    const jobId = trimmed.slice("pause ".length).trim();
    if (!jobId) {
      return { error: "用法：/cron pause <jobId>" };
    }
    return { command: { action: "pause", jobId } };
  }

  if (trimmed.startsWith("stop ")) {
    const jobId = trimmed.slice("stop ".length).trim();
    if (!jobId) {
      return { error: "用法：/cron stop <jobId>" };
    }
    return { command: { action: "stop", jobId } };
  }

  if (trimmed.startsWith("run ")) {
    const jobId = trimmed.slice("run ".length).trim();
    if (!jobId) {
      return { error: "用法：/cron run <jobId>" };
    }
    return { command: { action: "run", jobId } };
  }

  if (trimmed === "add" || trimmed.startsWith("add\n")) {
    return parseCronAddCommand(trimmed.slice("add".length).trimStart());
  }

  return {
    error:
      "不认识这个 /cron 子命令。\n\n可用命令：/cron、/cron list、/cron add、/cron run <jobId>、/cron pause <jobId>、/cron resume <jobId>、/cron stop <jobId>、/cron remove <jobId>",
  };
}

export function formatCronHelp(defaultTz: string): string {
  return [
    "⏰ 定时任务命令",
    "",
    "/cron",
    "/cron list",
    "/cron run <jobId>",
    "/cron pause <jobId>",
    "/cron resume <jobId>",
    "/cron stop <jobId>",
    "/cron remove <jobId>",
    "",
    "新增周期任务：",
    "/cron add",
    "name: 早报",
    "cron: 0 9 * * *",
    `tz: ${defaultTz}`,
    "prompt:",
    "总结今天的待办和需要优先处理的事。",
    "",
    "新增一次性任务：",
    "/cron add",
    "name: 20分钟后提醒",
    "at: 20m",
    "prompt:",
    "提醒我开会。",
  ].join("\n");
}

export function formatCronJobList(jobs: CronJob[], defaultTz: string): string {
  if (jobs.length === 0) {
    return "当前还没有定时任务。";
  }

  const lines = [`⏰ 当前有 ${jobs.length} 个定时任务`, ""];
  jobs.forEach((job, index) => {
    const timeZone = resolveScheduleTimezone(job.schedule, defaultTz);
    lines.push(`${index + 1}. ${job.name}`);
    lines.push(`ID: ${job.id}`);
    lines.push(`时间: ${formatCronScheduleForText(job.schedule, defaultTz)}`);
    lines.push(`下次: ${formatCronJobNextRun(job, defaultTz)}`);
    lines.push(`状态: ${formatCronJobStatus(job, timeZone)}`);
    if (job.state.lastRunAtMs) {
      lines.push(`上次执行: ${formatDateTime(job.state.lastRunAtMs, timeZone)}`);
    }
    if (job.state.lastError) {
      lines.push(`上次错误: ${job.state.lastError}`);
    }
    if (index < jobs.length - 1) {
      lines.push("");
    }
  });
  return lines.join("\n");
}

export function formatCronJobAdded(job: CronJob, defaultTz: string): string {
  return [
    `✅ 已创建定时任务：${job.name}`,
    `ID: ${job.id}`,
    `时间: ${formatCronScheduleForText(job.schedule, defaultTz)}`,
    `下次: ${formatCronJobNextRun(job, defaultTz)}`,
  ].join("\n");
}

export function formatCronJobRemoved(job: CronJob): string {
  return `✅ 已删除定时任务：${job.name}\nID: ${job.id}`;
}

export function formatCronJobEnabled(job: CronJob): string {
  return `${job.enabled ? "✅ 已启动定时任务" : "⏸️ 已暂停定时任务"}：${job.name}\nID: ${job.id}`;
}

export function formatCronJobStopResult(result: CronStopJobResult): string {
  const jobLabel = result.job?.name ?? result.jobId;
  if (result.status === "not_running") {
    return `这个定时任务当前没有在执行：${jobLabel}\nID: ${result.jobId}`;
  }
  if (result.status === "already_requested") {
    return `⏹️ 已经请求停止定时任务：${jobLabel}\nID: ${result.jobId}`;
  }
  return `⏹️ 已请求停止定时任务：${jobLabel}\nID: ${result.jobId}`;
}

export function formatCronJobRunResult(
  result: CronManualRunResult,
  defaultTz: string,
): string {
  const job = result.job;
  if (result.status === "queued") {
    const jobLabel = job?.name ?? result.jobId;
    return [
      `⏳ 已安排稍后执行：${jobLabel}`,
      `ID: ${result.jobId}`,
      "会在当前这条回复结束后开始执行，结果会像普通定时任务一样单独发给你。",
    ].join("\n");
  }
  if (!job) {
    return `✅ 已执行定时任务：${result.jobId}`;
  }

  const lines = [`✅ 已执行定时任务：${job.name}`, `ID: ${job.id}`];
  if (result.removed) {
    lines.push("这是一条一次性任务，执行后已自动删除。");
  } else {
    lines.push(`下次: ${formatCronJobNextRun(job, defaultTz)}`);
  }
  if (result.status === "error" && result.error) {
    lines.push(`本次执行报错: ${result.error}`);
  }
  if (result.status === "aborted") {
    lines.push("本次执行已被停止。");
  }
  return lines.join("\n");
}

function parseCronAddCommand(
  body: string,
): { command?: ParsedCronBridgeCommand; error?: string } {
  if (!body.trim()) {
    return {
      error:
        "请按块状文本写 /cron add。\n\n示例：\n/cron add\nname: 早报\ncron: 0 9 * * *\ntz: Asia/Shanghai\nprompt:\n总结今天的待办。",
    };
  }

  const lines = body.replace(/\r\n/g, "\n").split("\n");
  let name: string | undefined;
  let cron: string | undefined;
  let at: string | undefined;
  let tz: string | undefined;
  let promptStarted = false;
  const promptLines: string[] = [];

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();

    if (promptStarted) {
      promptLines.push(rawLine);
      continue;
    }

    if (!line.trim()) {
      continue;
    }

    const matched = line.match(/^([a-zA-Z_]+)\s*:\s*(.*)$/);
    if (!matched) {
      return {
        error: `无法识别这一行：${line}\n\n请用 key: value 形式，prompt 放最后。`,
      };
    }

    const key = matched[1].toLowerCase();
    const value = matched[2];

    switch (key) {
      case "name":
        name = value.trim();
        break;
      case "cron":
        cron = value.trim();
        break;
      case "at":
        at = value.trim();
        break;
      case "tz":
        tz = value.trim();
        break;
      case "prompt":
        promptStarted = true;
        if (value) {
          promptLines.push(value);
        }
        break;
      default:
        return {
          error: `不支持的字段：${matched[1]}\n\n只支持 name、cron、at、tz、prompt。`,
        };
    }
  }

  const prompt = promptLines.join("\n").trim();
  if (!prompt) {
    return { error: "prompt 不能为空。" };
  }
  if ((cron ? 1 : 0) + (at ? 1 : 0) !== 1) {
    return { error: "cron 和 at 二选一，而且只能填一个。" };
  }

  return {
    command: {
      action: "add",
      name: name || undefined,
      time: cron ?? at!,
      tz: cron ? tz || undefined : undefined,
      prompt,
    },
  };
}

function formatCronJobStatus(job: CronJob, timeZone: string): string {
  if (job.state.runningAtMs) {
    return `执行中（开始于 ${formatDateTime(job.state.runningAtMs, timeZone)}）`;
  }
  if (!job.enabled) {
    return "已停用";
  }
  if (job.state.lastRunStatus === "error") {
    return "启用中，上次执行失败";
  }
  if (job.state.lastRunStatus === "busy") {
    return "启用中，上次因用户任务占用而顺延";
  }
  if (job.state.lastRunStatus === "aborted") {
    return "启用中，上次被停止";
  }
  return "启用中";
}
