import { Type } from "@mariozechner/pi-ai";
import {
  defineTool,
  type ExtensionFactory,
} from "@mariozechner/pi-coding-agent";
import { parseScheduleInput } from "../../cron/schedule.js";
import type { CronService } from "../../cron/service.js";
import type { DeferredCronRunService } from "../../cron/deferred-run.js";
import type { UserIdentity } from "../../types.js";
import type { ConversationTarget } from "../../conversation.js";
import type { CronScopeSelector } from "../../cron/types.js";
import {
  createCronScopeSelector,
  getCronConversationTargetForStorage,
} from "../../cron/scope.js";
import {
  getWorkspaceContext,
  type WorkspaceContext,
} from "../workspace-identity.js";

type WorkspaceCronContext = UserIdentity | WorkspaceContext;

function toToolResult(details: unknown) {
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(details, null, 2),
      },
    ],
    details,
  };
}

function normalizeArgs(args: unknown): Record<string, unknown> {
  if (!args || typeof args !== "object" || Array.isArray(args)) {
    return {};
  }

  const raw = args as Record<string, unknown>;
  return {
    ...raw,
    job_id: raw.job_id ?? raw.jobId,
  };
}

export function createCronTaskExtension(
  getCronService: () => CronService | null,
  resolveIdentityByWorkspace: (cwd: string) => WorkspaceCronContext | null = getWorkspaceContext,
  getDeferredCronRunService: () => DeferredCronRunService | null = () => null,
): ExtensionFactory {
  const cronTaskTool = defineTool({
    name: "cron_task",
    label: "Cron Task",
    description:
      "创建、查看、删除、停止、立即执行当前飞书用户的定时任务。提醒、定时、每天几点这类需求必须调用它，不能只口头答应。",
    promptSnippet:
      "cron_task: 创建、查看、删除、停止、立即执行当前飞书用户的定时任务。涉及提醒/定时时必须调用。",
    promptGuidelines: [
      "涉及提醒、稍后、X分钟后、每天几点、每周几这类定时需求时，必须调用 cron_task，不能只用自然语言承诺。",
      "action=add 时必须同时提供 prompt 和 time；name 可不传，系统会自动生成。",
      "time 支持相对时间（如 20m、1h30m）、ISO 时间、cron 表达式（如 0 9 * * *）。",
      "cron 表达式默认使用网关时区；如果用户明确给了时区，再传 tz。",
      "删除、停止或立即执行时，先用 list 拿到 job_id，再调用 remove、stop 或 run。",
      "action=run 只代表已安排执行；当前回复结束后才会真正开始跑，不能声称已经拿到了执行结果。",
    ],
    parameters: Type.Object({
      action: Type.String({ description: "add、list、remove、stop、run 之一。" }),
      name: Type.Optional(Type.String({ description: "任务名称，可不传。" })),
      time: Type.Optional(
        Type.String({
          description: "相对时间、ISO 时间或 cron 表达式。仅 add 时需要。",
        }),
      ),
      tz: Type.Optional(Type.String({ description: "cron 表达式的 IANA 时区，可不传。" })),
      prompt: Type.Optional(Type.String({ description: "到时要执行的提示词。仅 add 时需要。" })),
      job_id: Type.Optional(Type.String({ description: "已有任务的 job_id。remove/stop/run 时需要。" })),
    }),
    prepareArguments: normalizeArgs as any,
    async execute(_toolCallId, params, _signal, _onUpdate, ctx) {
      const workspaceContext = normalizeWorkspaceCronContext(resolveIdentityByWorkspace(ctx.cwd));
      if (!workspaceContext?.identity.openId) {
        throw new Error("当前 workspace 没有关联到飞书用户，暂时不能管理定时任务");
      }
      const identity = workspaceContext.identity;
      const conversationTarget = workspaceContext.conversationTarget;
      const cronScope = createCronScope(identity, conversationTarget);

      const cronService = getCronService();
      if (!cronService?.isEnabled()) {
        throw new Error("当前网关没有开启定时任务");
      }

      const action = typeof params.action === "string" ? params.action.trim().toLowerCase() : "";
      switch (action) {
        case "list": {
          const jobs = await cronService.listJobs(cronScope);
          return toToolResult({
            action,
            jobs,
          });
        }
        case "add": {
          if (typeof params.prompt !== "string" || !params.prompt.trim()) {
            throw new Error("action=add 时必须提供 prompt");
          }
          if (typeof params.time !== "string" || !params.time.trim()) {
            throw new Error("action=add 时必须提供 time");
          }

          const parsed = parseScheduleInput(
            params.time,
            typeof params.tz === "string" && params.tz.trim()
              ? params.tz.trim()
              : cronService.getDefaultTimezone(),
          );
          const schedule =
            parsed.schedule.kind === "cron" && typeof params.tz === "string" && params.tz.trim()
              ? { ...parsed.schedule, tz: params.tz.trim() }
              : parsed.schedule;
          const job = await cronService.addJob({
            openId: identity.openId,
            userId: identity.userId,
            scopeType: cronScope.scopeType,
            scopeKey: cronScope.scopeKey,
            conversationTarget: getCronConversationTargetForStorage(conversationTarget),
            name: typeof params.name === "string" ? params.name : undefined,
            prompt: params.prompt,
            schedule,
            deleteAfterRun: parsed.deleteAfterRun,
          });
          return toToolResult({
            action,
            job,
          });
        }
        case "remove": {
          if (typeof params.job_id !== "string" || !params.job_id.trim()) {
            throw new Error("action=remove 时必须提供 job_id");
          }
          const removed = await cronService.removeJob(cronScope, params.job_id.trim());
          if (!removed) {
            throw new Error("没找到这个定时任务");
          }
          return toToolResult({
            action,
            removed,
          });
        }
        case "stop": {
          if (typeof params.job_id !== "string" || !params.job_id.trim()) {
            throw new Error("action=stop 时必须提供 job_id");
          }
          const result = await cronService.stopJob(cronScope, params.job_id.trim());
          return toToolResult({
            action,
            result,
          });
        }
        case "run": {
          if (typeof params.job_id !== "string" || !params.job_id.trim()) {
            throw new Error("action=run 时必须提供 job_id");
          }
          const deferredCronRunService = getDeferredCronRunService();
          const result = deferredCronRunService
            ? await deferredCronRunService.queueRun(cronScope, params.job_id.trim())
            : await cronService.runJobNow(cronScope, params.job_id.trim());
          return toToolResult({
            action,
            result,
            note:
              result.status === "queued"
                ? "当前回复结束后才会开始执行，执行结果会稍后单独发给用户。"
                : undefined,
          });
        }
        default:
          throw new Error("action 只支持 add、list、remove、stop、run");
      }
    },
  });

  return (pi) => {
    pi.registerTool(cronTaskTool);
  };
}

function normalizeWorkspaceCronContext(raw: WorkspaceCronContext | null): WorkspaceContext | null {
  if (!raw) {
    return null;
  }
  if ("identity" in raw) {
    return raw;
  }
  return {
    identity: raw,
  };
}

function createCronScope(
  identity: UserIdentity,
  conversationTarget?: ConversationTarget,
): CronScopeSelector {
  return createCronScopeSelector(identity.openId, conversationTarget);
}
