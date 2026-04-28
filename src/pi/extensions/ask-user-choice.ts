import { Type } from "@mariozechner/pi-ai";
import {
  defineTool,
  type ExtensionFactory,
} from "@mariozechner/pi-coding-agent";
import {
  buildFeishuChoiceCardContent,
  createFeishuChoiceRequestId,
  type FeishuChoiceOption,
} from "../../feishu/choice-card.js";
import type { FeishuChoiceInteractionStore } from "../../feishu/choice-interactions.js";
import type { FeishuMessageRecipient, FeishuMessenger } from "../../feishu/send.js";
import type { UserIdentity } from "../../types.js";
import {
  getWorkspaceContext,
  type WorkspaceContext,
} from "../workspace-identity.js";

type WorkspaceChoiceContext = UserIdentity | WorkspaceContext;

const DEFAULT_TIMEOUT_SECONDS = 300;
const MIN_TIMEOUT_SECONDS = 10;
const MAX_TIMEOUT_SECONDS = 30 * 60;

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
    timeout_seconds: raw.timeout_seconds ?? raw.timeoutSeconds,
  };
}

export function createAskUserChoiceExtension(
  messenger: Pick<FeishuMessenger, "sendFeishuMessage"> & Partial<Pick<FeishuMessenger, "sendFeishuMessageToTarget">>,
  choiceStore: Pick<FeishuChoiceInteractionStore, "waitForChoice">,
  resolveIdentityByWorkspace: (cwd: string) => WorkspaceChoiceContext | null = getWorkspaceContext,
): ExtensionFactory {
  const askUserChoiceTool = defineTool({
    name: "ask_user_choice",
    label: "Ask User Choice",
    description:
      "在当前飞书会话里发送一个单选按钮卡片，并等待当前用户点击后把选择返回给模型。适合需要用户在 2-4 个明确方案中做决定时使用。",
    promptSnippet:
      "ask_user_choice: 在飞书里向当前用户展示 2-4 个按钮选项，等待用户点击后返回选择。",
    promptGuidelines: [
      "当需要用户在少量明确方案中做选择，而不是让用户输入长文本时，可以调用 ask_user_choice。",
      "一次只问一个问题；选项保持 2-4 个，label 简短清晰，description 用来说明影响或权衡。",
      "用户点击卡片前工具会等待；如果返回 status=timeout、cancelled 或 aborted，应简短说明并停止依赖该选择的动作。",
    ],
    parameters: Type.Object({
      title: Type.Optional(Type.String({ description: "卡片标题。默认：需要你选择。" })),
      question: Type.String({ description: "要询问用户的问题。" }),
      options: Type.Array(
        Type.Object({
          label: Type.String({ description: "按钮显示文本，建议 1-8 个字。" }),
          value: Type.Optional(Type.String({ description: "返回给模型的稳定值；不传则使用 label。" })),
          description: Type.Optional(Type.String({ description: "选项说明，会展示在问题正文里。" })),
        }),
        { description: "2-4 个候选选项。" },
      ),
      timeout_seconds: Type.Optional(
        Type.Number({ description: "等待用户点击的超时时间，默认 300 秒，范围 10-1800 秒。" }),
      ),
    }),
    prepareArguments: normalizeArgs as any,
    async execute(_toolCallId, params, signal, onUpdate, ctx) {
      const workspaceContext = normalizeWorkspaceChoiceContext(resolveIdentityByWorkspace(ctx.cwd));
      if (!workspaceContext?.identity.openId) {
        throw new Error("当前 workspace 没有关联到飞书用户，暂时不能发起选择卡片");
      }
      const identity = workspaceContext.identity;

      const question = normalizeRequiredText(params.question, "question");
      const options = normalizeOptions(params.options);
      const title = normalizeOptionalText(params.title) ?? "需要你选择";
      const timeoutSeconds = normalizeTimeoutSeconds(params.timeout_seconds);
      const requestId = createFeishuChoiceRequestId();
      const target = resolveChoiceRecipient(identity, workspaceContext);

      const content = buildFeishuChoiceCardContent({
        requestId,
        title,
        question,
        options,
      });
      const messageId = typeof target === "string" || !messenger.sendFeishuMessageToTarget
        ? await messenger.sendFeishuMessage(identity.openId, "interactive", content)
        : await messenger.sendFeishuMessageToTarget(target, "interactive", content);

      if (!messageId) {
        throw new Error("飞书选择卡片发送失败");
      }

      const emitWaitingUpdate = () => {
        onUpdate?.(toToolResult({
          status: "waiting",
          request_id: requestId,
          message: "等待用户在飞书卡片上选择...",
        }));
      };
      emitWaitingUpdate();
      const keepAlive = setInterval(emitWaitingUpdate, 60 * 1000);
      if (typeof keepAlive.unref === "function") {
        keepAlive.unref();
      }

      try {
        const result = await choiceStore.waitForChoice({
          requestId,
          openId: identity.openId,
          options,
          timeoutMs: timeoutSeconds * 1000,
          signal,
        });

        return toToolResult({
          ...result,
          question,
          message_id: messageId,
        });
      } finally {
        clearInterval(keepAlive);
      }
    },
  });

  return (pi) => {
    pi.registerTool(askUserChoiceTool);
  };
}

function normalizeWorkspaceChoiceContext(raw: WorkspaceChoiceContext | null): WorkspaceContext | null {
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

function resolveChoiceRecipient(
  identity: UserIdentity,
  workspaceContext: WorkspaceContext,
): FeishuMessageRecipient {
  const target = workspaceContext.conversationTarget;
  return target && target.kind !== "p2p" ? target : identity.openId;
}

function normalizeRequiredText(value: unknown, fieldName: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${fieldName} 不能为空`);
  }
  return value.trim();
}

function normalizeOptionalText(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function normalizeOptions(rawOptions: unknown): FeishuChoiceOption[] {
  if (!Array.isArray(rawOptions)) {
    throw new Error("options 必须是数组");
  }
  if (rawOptions.length < 2 || rawOptions.length > 4) {
    throw new Error("options 必须包含 2-4 个选项");
  }

  const values = new Set<string>();
  return rawOptions.map((raw, index) => {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
      throw new Error(`第 ${index + 1} 个选项格式无效`);
    }
    const record = raw as Record<string, unknown>;
    const label = normalizeRequiredText(record.label, `第 ${index + 1} 个选项 label`);
    const value = normalizeOptionalText(record.value) ?? label;
    if (values.has(value)) {
      throw new Error(`选项 value 不能重复: ${value}`);
    }
    values.add(value);
    return {
      label,
      value,
      description: normalizeOptionalText(record.description),
    };
  });
}

function normalizeTimeoutSeconds(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return DEFAULT_TIMEOUT_SECONDS;
  }
  return Math.min(MAX_TIMEOUT_SECONDS, Math.max(MIN_TIMEOUT_SECONDS, Math.round(value)));
}
