import type { ConversationTarget } from "../../conversation.js";
import {
  formatCronHelp,
  formatCronJobAdded,
  formatCronJobEnabled,
  formatCronJobList,
  formatCronJobRemoved,
  formatCronJobRunResult,
  formatCronJobStopResult,
  parseCronBridgeCommand,
} from "../../cron/commands.js";
import type { DeferredCronRunService } from "../../cron/deferred-run.js";
import { getCronConversationTargetForStorage, getCronRuntimeLockKey } from "../../cron/scope.js";
import type { CronService } from "../../cron/service.js";
import type { CronScopeSelector } from "../../cron/types.js";
import { parseScheduleInput } from "../../cron/schedule.js";
import type { UserIdentity } from "../../types.js";
import type { BridgeCommand } from "../commands.js";
import type { CommandReplySender } from "./types.js";

interface CronCommandHandlerDeps {
  cronDefaultTimezone: string;
  cronService?: Pick<CronService, "isEnabled" | "getDefaultTimezone" | "listJobs" | "addJob" | "setJobEnabled" | "removeJob" | "stopJob" | "runJobNow">;
  deferredCronRunService?: Pick<DeferredCronRunService, "queueRun">;
  isLocked(lockKey: string): boolean;
  getCronScope(identity: UserIdentity, conversationTarget?: ConversationTarget): CronScopeSelector;
  sendTextReply: CommandReplySender;
  sendCommandReply: CommandReplySender;
}

export function createCronCommandHandler(deps: CronCommandHandlerDeps) {
  return async function handleCronCommand(
    identity: UserIdentity,
    command: BridgeCommand,
    conversationTarget?: ConversationTarget,
  ): Promise<void> {
    const openId = identity.openId;
    const cronScope = deps.getCronScope(identity, conversationTarget);
    const cronLockKey = getCronRuntimeLockKey(cronScope.scopeKey);
    const cronService = deps.cronService;
    if (!cronService?.isEnabled()) {
      await deps.sendTextReply(identity, conversationTarget, "当前网关没有开启定时任务。");
      return;
    }

    const parsed = parseCronBridgeCommand(command.args);
    if (parsed.error) {
      await deps.sendTextReply(identity, conversationTarget, parsed.error);
      return;
    }

    const defaultTz = cronService.getDefaultTimezone?.() ?? deps.cronDefaultTimezone;
    switch (parsed.command?.action) {
      case "help":
        await deps.sendCommandReply(identity, conversationTarget, formatCronHelp(defaultTz));
        return;
      case "list": {
        const jobs = await cronService.listJobs(cronScope);
        await deps.sendCommandReply(identity, conversationTarget, formatCronJobList(jobs, defaultTz));
        return;
      }
      case "add": {
        const parsedSchedule = parseScheduleInput(
          parsed.command.time,
          parsed.command.tz?.trim() || defaultTz,
        );
        const schedule =
          parsedSchedule.schedule.kind === "cron" && parsed.command.tz?.trim()
            ? {
                ...parsedSchedule.schedule,
                tz: parsed.command.tz.trim(),
              }
            : parsedSchedule.schedule;
        const job = await cronService.addJob({
          openId,
          userId: identity.userId,
          scopeType: cronScope.scopeType,
          scopeKey: cronScope.scopeKey,
          conversationTarget: getCronConversationTargetForStorage(conversationTarget),
          name: parsed.command.name,
          prompt: parsed.command.prompt,
          schedule,
          deleteAfterRun: parsedSchedule.deleteAfterRun,
        });
        await deps.sendCommandReply(identity, conversationTarget, formatCronJobAdded(job, defaultTz));
        return;
      }
      case "remove": {
        try {
          const removed = await cronService.removeJob(cronScope, parsed.command.jobId);
          if (!removed) {
            await deps.sendTextReply(identity, conversationTarget, "没找到这个定时任务。");
            return;
          }
          await deps.sendCommandReply(identity, conversationTarget, formatCronJobRemoved(removed));
        } catch (error) {
          if ((error instanceof Error ? error.message : String(error)) === "CRON_JOB_RUNNING") {
            await deps.sendTextReply(identity, conversationTarget, "这个定时任务正在执行，先用 /cron stop <jobId> 停掉再删。");
            return;
          }
          throw error;
        }
        return;
      }
      case "resume":
      case "pause": {
        try {
          const job = await cronService.setJobEnabled(cronScope, parsed.command.jobId, parsed.command.action === "resume");
          await deps.sendCommandReply(identity, conversationTarget, formatCronJobEnabled(job));
        } catch (error) {
          const code = error instanceof Error ? error.message : String(error);
          if (code === "CRON_JOB_NOT_FOUND") {
            await deps.sendTextReply(identity, conversationTarget, "没找到这个定时任务。");
            return;
          }
          throw error;
        }
        return;
      }
      case "stop": {
        try {
          const result = await cronService.stopJob(cronScope, parsed.command.jobId);
          await deps.sendCommandReply(identity, conversationTarget, formatCronJobStopResult(result));
        } catch (error) {
          const code = error instanceof Error ? error.message : String(error);
          if (code === "CRON_JOB_NOT_FOUND") {
            await deps.sendTextReply(identity, conversationTarget, "没找到这个定时任务。");
            return;
          }
          if (code === "CRON_STOP_UNSUPPORTED") {
            await deps.sendTextReply(identity, conversationTarget, "当前网关暂不支持停止定时任务。");
            return;
          }
          throw error;
        }
        return;
      }
      case "run": {
        try {
          const result =
            deps.isLocked(cronLockKey) && deps.deferredCronRunService
              ? await deps.deferredCronRunService.queueRun(cronScope, parsed.command.jobId)
              : await cronService.runJobNow(cronScope, parsed.command.jobId);
          await deps.sendCommandReply(identity, conversationTarget, formatCronJobRunResult(result, defaultTz));
        } catch (error) {
          const code = error instanceof Error ? error.message : String(error);
          if (code === "CRON_JOB_NOT_FOUND") {
            await deps.sendTextReply(identity, conversationTarget, "没找到这个定时任务。");
            return;
          }
          if (code === "CRON_JOB_RUNNING") {
            await deps.sendTextReply(identity, conversationTarget, "这个定时任务已经在执行中了。");
            return;
          }
          throw error;
        }
      }
    }
  };
}
