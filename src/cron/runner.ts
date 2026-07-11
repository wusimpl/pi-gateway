import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import type { Config } from "../config.js";
import type { ConversationTarget } from "../conversation.js";
import { formatError } from "../feishu/format.js";
import type { FeishuMessenger } from "../feishu/send.js";
import type { PromptRunner } from "../pi/stream.js";
import type { PiRuntime } from "../pi/runtime.js";
import { bindSessionIdentity, bindWorkspaceIdentity } from "../pi/workspace-identity.js";
import type { WorkspaceService } from "../pi/workspace.js";
import type { UserIdentity } from "../types.js";
import { logger } from "../app/logger.js";
import { enforceHostMachineToolAccess } from "../app/tool-access.js";
import type { RuntimeStateStore, StopRequestResult } from "../app/state.js";
import type { DeferredCronRunService } from "./deferred-run.js";
import {
  CRON_RESULT_FOOTER_LABEL,
  formatCronResultHeader,
  formatCronResultMessage,
} from "./result-message.js";
import { getCronRuntimeLockKey } from "./scope.js";
import type { CronJob, CronJobRunResult } from "./types.js";

export interface CronRunner {
  run(job: CronJob): Promise<CronJobRunResult>;
  stop(job: CronJob): Promise<StopRequestResult>;
}

interface CronRunnerDeps {
  config: Pick<Config, "DATA_DIR" | "TEXT_CHUNK_LIMIT" | "CRON_JOB_TIMEOUT_MS" | "CRON_DEFAULT_TZ">;
  runtime: Pick<PiRuntime, "createPiSession">;
  runtimeState: Pick<
    RuntimeStateStore,
    "acquireLock" | "releaseLock" | "setAbortHandler" | "requestStop" | "isStopRequested"
  >;
  workspaceService: Pick<WorkspaceService, "ensureUserWorkspace"> &
    Partial<Pick<WorkspaceService, "ensureConversationWorkspace">>;
  promptRunner: Pick<PromptRunner, "promptSession">;
  messenger: Pick<FeishuMessenger, "sendTextMessage"> &
    Partial<Pick<FeishuMessenger, "sendTextMessageToTarget">>;
  deferredCronRunService?: Pick<DeferredCronRunService, "flush">;
}

export function createCronRunner(deps: CronRunnerDeps): CronRunner {
  async function run(job: CronJob): Promise<CronJobRunResult> {
    const identity: UserIdentity = {
      openId: job.openId,
      userId: job.userId,
    };
    const startedAtMs = Date.now();
    const syntheticMessageId = `${createSyntheticMessageIdPrefix(job.id)}${startedAtMs}`;
    const openId = job.openId;
    const scopeKey = job.scopeKey?.trim() || job.conversationTarget?.key.trim() || openId;
    const lockKey = getCronRuntimeLockKey(scopeKey);
    const conversationTarget = job.conversationTarget?.kind === "p2p" ? undefined : job.conversationTarget;

    if (!deps.runtimeState.acquireLock(lockKey, syntheticMessageId)) {
      logger.info("cron 任务因同 scope 定时任务仍在运行而顺延", {
        openId,
        scopeKey,
        lockKey,
        jobId: job.id,
      });
      return {
        jobId: job.id,
        status: "busy",
        error: "当前会话还有定时任务在跑",
      };
    }

    let session: { abort(): Promise<void>; dispose(): void } | null = null;
    try {
      const workspaceDir = await ensureWorkspace(identity, conversationTarget);
      bindWorkspaceIdentity(workspaceDir, identity, conversationTarget);

      const sessionDir = join(
        deps.config.DATA_DIR,
        "cron",
        "sessions",
        sanitizeSegment(scopeKey),
        sanitizeSegment(job.id),
      );
      await mkdir(sessionDir, { recursive: true });

      session = await deps.runtime.createPiSession(workspaceDir, sessionDir);
      bindSessionIdentity(session, identity, conversationTarget);
      enforceHostMachineToolAccess(session, identity, conversationTarget);
      const stoppedBeforePrompt = await deps.runtimeState.setAbortHandler(
        lockKey,
        syntheticMessageId,
        async () => {
          await session?.abort();
        },
      );

      if (stoppedBeforePrompt) {
        logger.info("cron 任务启动前已收到停止请求", {
          openId,
          jobId: job.id,
        });
        return {
          jobId: job.id,
          status: "aborted",
        };
      }

      const result = await deps.promptRunner.promptSession(
        session as any,
        {
          text: buildCronPrompt(job),
          displayHeaderText: formatCronResultHeader(job, startedAtMs, deps.config.CRON_DEFAULT_TZ),
          footerLabel: CRON_RESULT_FOOTER_LABEL,
          includeFooter: true,
        },
        openId,
        syntheticMessageId,
        undefined,
        false,
        deps.config.TEXT_CHUNK_LIMIT,
        false,
        deps.config.CRON_JOB_TIMEOUT_MS,
        () => deps.runtimeState.isStopRequested(lockKey, syntheticMessageId),
        conversationTarget,
      );

      if (result.aborted) {
        return {
          jobId: job.id,
          status: "aborted",
        };
      }

      if (result.error) {
        if (!result.text && !result.displayed) {
          await sendJobReply(
            job,
            formatCronResultMessage(
              job,
              formatError(`定时任务「${job.name}」执行失败：${result.error}`),
              startedAtMs,
              deps.config.CRON_DEFAULT_TZ,
            ),
          );
        }
        return {
          jobId: job.id,
          status: "error",
          error: result.error,
        };
      }

      return {
        jobId: job.id,
        status: "success",
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error("cron 任务执行失败", {
        openId,
        scopeKey,
        lockKey,
        jobId: job.id,
        error: message,
      });
      await sendJobReply(
        job,
        formatCronResultMessage(
          job,
          formatError(`定时任务「${job.name}」执行失败：${message}`),
          startedAtMs,
          deps.config.CRON_DEFAULT_TZ,
        ),
      );
      return {
        jobId: job.id,
        status: "error",
        error: message,
      };
    } finally {
      try {
        session?.dispose();
      } catch {
        // ignore
      }
      deps.runtimeState.releaseLock(lockKey, syntheticMessageId);
      await deps.deferredCronRunService?.flush(scopeKey);
    }
  }

  async function stop(job: CronJob): Promise<StopRequestResult> {
    const scopeKey = job.scopeKey?.trim() || job.conversationTarget?.key.trim() || job.openId;
    return deps.runtimeState.requestStop(getCronRuntimeLockKey(scopeKey), createSyntheticMessageIdPrefix(job.id));
  }

  return {
    run,
    stop,
  };

  async function ensureWorkspace(identity: UserIdentity, conversationTarget?: ConversationTarget): Promise<string> {
    if (conversationTarget && deps.workspaceService.ensureConversationWorkspace) {
      return deps.workspaceService.ensureConversationWorkspace(identity, conversationTarget);
    }

    return deps.workspaceService.ensureUserWorkspace(identity);
  }

  async function sendJobReply(job: CronJob, text: string): Promise<void> {
    if (job.conversationTarget && job.conversationTarget.kind !== "p2p" && deps.messenger.sendTextMessageToTarget) {
      await deps.messenger.sendTextMessageToTarget(job.conversationTarget, text);
      return;
    }

    await deps.messenger.sendTextMessage(job.openId, text);
  }
}

function buildCronPrompt(job: CronJob): string {
  return [
    `[cron:${job.id} ${job.name}]`,
    "这是一次定时任务执行。系统会把你的最终回复作为唯一的定时任务结果发回当前飞书会话，并自动在最前面加上「【定时任务结果】」。",
    "普通提醒、播报、总结等文本结果，请直接输出最终正文；不要调用 feishu_message_send 发送普通文本结果，也不要在完成后再输出“已播报”“已发送”“已完成”等确认话术。",
    "如果任务要求创建飞书文档、发送文件或图片，必须实际调用对应工具；成功后最终回复只给必要结果或链接，失败时最终回复直接说明失败原因。",
    "",
    job.prompt,
  ].join("\n");
}

function createSyntheticMessageIdPrefix(jobId: string): string {
  return `cron:${jobId}:`;
}

function sanitizeSegment(value: string): string {
  const normalized = value.trim().replace(/[^a-zA-Z0-9._-]/g, "_");
  return normalized || "unknown";
}
