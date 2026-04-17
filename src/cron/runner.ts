import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import type { Config } from "../config.js";
import { formatError } from "../feishu/format.js";
import type { FeishuMessenger } from "../feishu/send.js";
import type { PromptRunner } from "../pi/stream.js";
import type { PiRuntime } from "../pi/runtime.js";
import { bindWorkspaceIdentity } from "../pi/workspace-identity.js";
import type { WorkspaceService } from "../pi/workspace.js";
import type { UserIdentity } from "../types.js";
import { logger } from "../app/logger.js";
import type { RuntimeStateStore } from "../app/state.js";
import type { CronJob, CronJobRunResult } from "./types.js";

export interface CronRunner {
  run(job: CronJob): Promise<CronJobRunResult>;
}

interface CronRunnerDeps {
  config: Pick<Config, "DATA_DIR" | "TEXT_CHUNK_LIMIT" | "CRON_JOB_TIMEOUT_MS">;
  runtime: Pick<PiRuntime, "createPiSession">;
  runtimeState: Pick<
    RuntimeStateStore,
    "acquireLock" | "releaseLock" | "setAbortHandler" | "isStopRequested"
  >;
  workspaceService: Pick<WorkspaceService, "ensureUserWorkspace">;
  promptRunner: Pick<PromptRunner, "promptSession">;
  messenger: Pick<FeishuMessenger, "sendTextMessage">;
}

export function createCronRunner(deps: CronRunnerDeps): CronRunner {
  async function run(job: CronJob): Promise<CronJobRunResult> {
    const identity: UserIdentity = {
      openId: job.openId,
      userId: job.userId,
    };
    const syntheticMessageId = `cron:${job.id}:${Date.now()}`;
    const openId = job.openId;

    if (!deps.runtimeState.acquireLock(openId, syntheticMessageId)) {
      logger.info("cron 任务因用户已有运行中任务而顺延", {
        openId,
        jobId: job.id,
      });
      return {
        jobId: job.id,
        status: "busy",
        error: "当前用户还有任务在跑",
      };
    }

    let session: { abort(): Promise<void>; dispose(): void } | null = null;
    try {
      const workspaceDir = await deps.workspaceService.ensureUserWorkspace(identity);
      bindWorkspaceIdentity(workspaceDir, identity);

      const sessionDir = join(
        deps.config.DATA_DIR,
        "cron",
        "sessions",
        sanitizeSegment(job.openId),
        sanitizeSegment(job.id),
      );
      await mkdir(sessionDir, { recursive: true });

      session = await deps.runtime.createPiSession(workspaceDir, sessionDir);
      const stoppedBeforePrompt = await deps.runtimeState.setAbortHandler(
        openId,
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
        buildCronPrompt(job),
        openId,
        syntheticMessageId,
        undefined,
        false,
        deps.config.TEXT_CHUNK_LIMIT,
        false,
        deps.config.CRON_JOB_TIMEOUT_MS,
        () => deps.runtimeState.isStopRequested(openId, syntheticMessageId),
      );

      if (result.aborted) {
        return {
          jobId: job.id,
          status: "aborted",
        };
      }

      if (result.error) {
        if (!result.text && !result.displayed) {
          await deps.messenger.sendTextMessage(
            openId,
            formatError(`定时任务「${job.name}」执行失败：${result.error}`),
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
        jobId: job.id,
        error: message,
      });
      await deps.messenger.sendTextMessage(
        openId,
        formatError(`定时任务「${job.name}」执行失败：${message}`),
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
      deps.runtimeState.releaseLock(openId);
    }
  }

  return {
    run,
  };
}

function buildCronPrompt(job: CronJob): string {
  return `[cron:${job.id} ${job.name}]\n${job.prompt}`;
}

function sanitizeSegment(value: string): string {
  const normalized = value.trim().replace(/[^a-zA-Z0-9._-]/g, "_");
  return normalized || "unknown";
}
