import { Type } from "@mariozechner/pi-ai";
import {
  defineTool,
  type ExtensionFactory,
} from "@mariozechner/pi-coding-agent";
import type { FeishuMessageRecipient, FeishuMessenger } from "../../feishu/send.js";
import type { UserIdentity } from "../../types.js";
import {
  getWorkspaceContext,
  type WorkspaceContext,
} from "../workspace-identity.js";

type WorkspaceMessageContext = UserIdentity | WorkspaceContext;

interface FeishuMessageTextPart {
  type: "text";
  text: string;
}

interface FeishuMessageMentionPart {
  type: "mention";
  open_id: string;
  name?: string;
}

type FeishuMessagePart = FeishuMessageTextPart | FeishuMessageMentionPart;

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
    parts: Array.isArray(raw.parts) ? raw.parts.map(normalizePart) : raw.parts,
  };
}

function normalizePart(part: unknown): unknown {
  if (!part || typeof part !== "object" || Array.isArray(part)) {
    return part;
  }

  const raw = part as Record<string, unknown>;
  return {
    ...raw,
    open_id: raw.open_id ?? raw.openId,
  };
}

export function createFeishuMessageExtension(
  messenger: Pick<FeishuMessenger, "sendTextMessage"> & Partial<Pick<FeishuMessenger, "sendTextMessageToTarget">>,
  resolveIdentityByWorkspace: (cwd: string) => WorkspaceMessageContext | null = getWorkspaceContext,
): ExtensionFactory {
  const sendMessageTool = defineTool({
    name: "feishu_message_send",
    label: "Feishu Message Send",
    description:
      "向当前飞书会话发送文本消息，支持在同一条消息里按顺序插入结构化 @ 群成员。只能发送到当前会话，不能指定任意群聊。",
    promptSnippet:
      "feishu_message_send: 向当前飞书会话发送文本消息，可用结构化 mention 在群里 @ 成员。",
    promptGuidelines: [
      "当用户明确要求在当前飞书会话里 @、通知、提醒某个群成员，或要求把已完成结果发到群里并 @ 某人时，调用 feishu_message_send。",
      "feishu_message_send 只能发送到当前飞书会话；不要用它向用户未指定或当前会话之外的群/人发送消息。",
      "feishu_message_send 的 parts 会按顺序拼成一条消息；例如先 mention 张三，再 text '，您要的 xxx 已经准备好'。",
      "使用 mention 前必须已经获得目标用户 open_id；禁止凭姓名猜测 open_id。若同名或不确定，先向用户确认。",
      "不要在 text part 里手写 `<at ...>`；需要 @ 时必须使用 `{ type: 'mention', open_id, name }` 结构。",
      "除非用户明确要求，不要主动 @ 人；禁止 @所有人。",
    ],
    parameters: Type.Object({
      parts: Type.Array(
        Type.Object({
          type: Type.String({ description: "消息片段类型：text 或 mention。" }),
          text: Type.Optional(Type.String({ description: "type=text 时的普通文本。" })),
          open_id: Type.Optional(Type.String({ description: "type=mention 时要 @ 的用户 open_id，必须形如 ou_xxx。" })),
          name: Type.Optional(Type.String({ description: "type=mention 时展示用姓名，可不传。" })),
        }),
        { description: "按顺序拼接的消息片段。支持 text 和 mention。" },
      ),
    }),
    prepareArguments: normalizeArgs as any,
    async execute(_toolCallId, params, _signal, _onUpdate, ctx) {
      const workspaceContext = normalizeWorkspaceMessageContext(resolveIdentityByWorkspace(ctx.cwd));
      if (!workspaceContext?.identity.openId) {
        throw new Error("当前 workspace 没有关联到飞书会话，暂时不能发送飞书消息");
      }

      const parts = normalizeMessageParts(params.parts);
      const text = renderFeishuMessageParts(parts);
      if (!text.trim()) {
        throw new Error("要发送的飞书消息不能为空");
      }

      const identity = workspaceContext.identity;
      const target = resolveMessageRecipient(identity, workspaceContext);
      const messageId = typeof target === "string" || !messenger.sendTextMessageToTarget
        ? await messenger.sendTextMessage(identity.openId, text)
        : await messenger.sendTextMessageToTarget(target, text);

      if (!messageId) {
        throw new Error("飞书消息发送失败");
      }

      return toToolResult({
        open_id: identity.openId,
        receive_id_type: typeof target === "string" ? "open_id" : target.receiveIdType,
        receive_id: typeof target === "string" ? target : target.receiveId,
        message_id: messageId,
        mention_count: parts.filter((part) => part.type === "mention").length,
      });
    },
  });

  return (pi) => {
    pi.registerTool(sendMessageTool);
  };
}

function normalizeWorkspaceMessageContext(raw: WorkspaceMessageContext | null): WorkspaceContext | null {
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

function resolveMessageRecipient(
  identity: UserIdentity,
  workspaceContext: WorkspaceContext,
): FeishuMessageRecipient {
  const target = workspaceContext.conversationTarget;
  return target && target.kind !== "p2p" ? target : identity.openId;
}

function normalizeMessageParts(rawParts: unknown): FeishuMessagePart[] {
  if (!Array.isArray(rawParts)) {
    throw new Error("parts 必须是数组");
  }
  if (rawParts.length === 0) {
    throw new Error("parts 不能为空");
  }

  return rawParts.map((raw, index) => normalizeMessagePart(raw, index));
}

function normalizeMessagePart(raw: unknown, index: number): FeishuMessagePart {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    throw new Error(`第 ${index + 1} 个消息片段格式无效`);
  }

  const record = raw as Record<string, unknown>;
  const type = typeof record.type === "string" ? record.type.trim() : "";
  if (type === "text") {
    if (typeof record.text !== "string") {
      throw new Error(`第 ${index + 1} 个 text 片段缺少 text`);
    }
    return {
      type: "text",
      text: record.text,
    };
  }

  if (type === "mention") {
    const openId = typeof record.open_id === "string" ? record.open_id.trim() : "";
    if (!isValidOpenId(openId)) {
      throw new Error(`第 ${index + 1} 个 mention 片段的 open_id 无效，必须是 ou_ 开头的 open_id`);
    }
    const name = typeof record.name === "string" && record.name.trim()
      ? record.name.trim()
      : undefined;
    return {
      type: "mention",
      open_id: openId,
      name,
    };
  }

  throw new Error(`第 ${index + 1} 个消息片段 type 必须是 text 或 mention`);
}

function renderFeishuMessageParts(parts: FeishuMessagePart[]): string {
  return parts.map((part) => {
    if (part.type === "text") {
      return escapeFeishuText(part.text);
    }

    const displayName = escapeFeishuText(part.name ?? "用户");
    return `<at user_id="${part.open_id}">${displayName}</at>`;
  }).join("");
}

function escapeFeishuText(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function isValidOpenId(openId: string): boolean {
  return /^ou_[A-Za-z0-9_-]+$/.test(openId);
}
