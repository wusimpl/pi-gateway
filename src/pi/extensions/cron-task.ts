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
import type { CronScopeSelector, CronSchedule, UpdateCronJobInput } from "../../cron/types.js";
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
      "创建、查看、更新、删除、暂停、恢复、停止、立即执行当前飞书用户的定时任务。提醒、定时、每天几点这类需求必须调用它，不能只口头答应。创建或更新任务时，prompt 必须写成触发后可直接执行的最终任务说明。",
    promptSnippet:
      "cron_task: 创建、查看、更新、删除、暂停、恢复、停止、立即执行当前飞书用户的定时任务。涉及提醒/定时时必须调用。",
    promptGuidelines: [
      "涉及提醒、稍后、X分钟后、每天几点、每周几这类定时需求时，必须调用 cron_task，不能只用自然语言承诺。",
      "action=add 时必须同时提供 prompt 和 time；name 可不传，系统会自动生成。",
      "action=update 时必须提供 job_id，并至少提供 name、prompt、time 之一；只传 tz 不算更新。",
      "time 支持相对时间（如 20m、1h30m）、ISO 时间、cron 表达式（如 0 9 * * *）。",
      "cron 表达式默认使用网关时区；如果用户明确给了时区，再传 tz。",
      "写 prompt 时要明确最终交付方式：普通提醒、播报、总结等文本结果直接输出最终正文，不要要求执行端调用 feishu_message_send 发送普通文本。",
      "写 prompt 时不要让执行端在完成后再输出“已播报”“已发送”“已完成”等确认话术；最终回复本身就是定时任务结果。",
      "如果 prompt 要求创建飞书文档、发送文件或图片，必须要求执行端实际调用对应工具；成功后最终回复只给必要结果或链接，失败时最终回复直接说明失败原因。",
      "删除、暂停、恢复、更新、停止或立即执行时，先用 list 拿到 job_id，再调用对应 action。",
      "action=resume_all 只恢复当前会话范围里已暂停的任务。",
      "action=run 只代表已安排执行；当前回复结束后才会真正开始跑，不能声称已经拿到了执行结果。",
    ],
    parameters: Type.Object({
      action: Type.String({ description: "add、list、update、remove、pause、resume、resume_all、stop、run 之一。" }),
      name: Type.Optional(Type.String({ description: "任务名称。add/update 时可传。" })),
      time: Type.Optional(
        Type.String({
          description: "相对时间、ISO 时间或 cron 表达式。add 时需要，update 时可传。",
        }),
      ),
      tz: Type.Optional(Type.String({ description: "cron 表达式的 IANA 时区，可不传。" })),
      prompt: Type.Optional(Type.String({
        description:
          "到时要执行的提示词。add/update 时可传。应写清最终交付方式：普通文本结果直接输出正文；文档/文件/图片任务先调用对应工具，成功后输出链接或结果，失败时说明原因。",
      })),
      job_id: Type.Optional(Type.String({ description: "已有任务的 job_id。update/remove/pause/resume/stop/run 时需要。" })),
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

          const parsed = parseToolSchedule(params, cronService.getDefaultTimezone());
          const job = await cronService.addJob({
            openId: identity.openId,
            userId: identity.userId,
            scopeType: cronScope.scopeType,
            scopeKey: cronScope.scopeKey,
            conversationTarget: getCronConversationTargetForStorage(conversationTarget),
            name: typeof params.name === "string" ? params.name : undefined,
            prompt: params.prompt,
            schedule: parsed.schedule,
            deleteAfterRun: parsed.deleteAfterRun,
          });
          return toToolResult({
            action,
            job,
          });
        }
        case "update": {
          if (typeof params.job_id !== "string" || !params.job_id.trim()) {
            throw new Error("action=update 时必须提供 job_id");
          }

          const input: UpdateCronJobInput = {};
          const updatedFields: string[] = [];
          if (typeof params.name === "string") {
            input.name = params.name;
            updatedFields.push("name");
          }
          if (typeof params.prompt === "string") {
            input.prompt = params.prompt;
            updatedFields.push("prompt");
          }
          if (typeof params.time === "string") {
            if (!params.time.trim()) {
              throw new Error("action=update 修改 time 时不能为空");
            }
            const parsed = parseToolSchedule(params, cronService.getDefaultTimezone());
            input.schedule = parsed.schedule;
            input.deleteAfterRun = parsed.deleteAfterRun;
            updatedFields.push("time");
          } else if (typeof params.tz === "string" && params.tz.trim()) {
            throw new Error("action=update 修改 tz 时必须同时提供 time");
          }
          if (updatedFields.length === 0) {
            throw new Error("action=update 时至少提供 name、prompt、time 之一");
          }

          const job = await cronService.updateJob(cronScope, params.job_id.trim(), input);
          return toToolResult({
            action,
            updated_fields: updatedFields,
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
        case "pause":
        case "resume": {
          if (typeof params.job_id !== "string" || !params.job_id.trim()) {
            throw new Error(`action=${action} 时必须提供 job_id`);
          }
          const job = await cronService.setJobEnabled(cronScope, params.job_id.trim(), action === "resume");
          return toToolResult({
            action,
            job,
          });
        }
        case "resume_all": {
          const jobs = await cronService.listJobs(cronScope);
          const pausedJobs = jobs.filter((job) => !job.enabled);
          const resumed = [];
          for (const job of pausedJobs) {
            resumed.push(await cronService.setJobEnabled(cronScope, job.id, true));
          }
          return toToolResult({
            action,
            resumed_count: resumed.length,
            resumed,
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
          throw new Error("action 只支持 add、list、update、remove、pause、resume、resume_all、stop、run");
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

function parseToolSchedule(
  params: { time?: unknown; tz?: unknown },
  defaultTz: string,
): { schedule: CronSchedule; deleteAfterRun: boolean } {
  if (typeof params.time !== "string" || !params.time.trim()) {
    throw new Error("time 不能为空");
  }

  const tz = typeof params.tz === "string" && params.tz.trim() ? params.tz.trim() : defaultTz;
  const parsed = parseScheduleInput(params.time, tz);
  return {
    schedule: parsed.schedule.kind === "cron" ? { ...parsed.schedule, tz } : parsed.schedule,
    deleteAfterRun: parsed.deleteAfterRun,
  };
}
