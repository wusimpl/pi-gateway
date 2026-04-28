import { resolve, relative, isAbsolute } from "node:path";
import { Type } from "@mariozechner/pi-ai";
import {
  defineTool,
  type ExtensionFactory,
} from "@mariozechner/pi-coding-agent";
import { isFeishuImageFileName, type FeishuMessageRecipient, type FeishuMessenger } from "../../feishu/send.js";
import {
  getWorkspaceContext,
  type WorkspaceContext,
} from "../workspace-identity.js";
import type { UserIdentity } from "../../types.js";

type WorkspaceFileContext = UserIdentity | WorkspaceContext;

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
    file_name: raw.file_name ?? raw.fileName,
  };
}

function resolveWorkspaceFilePath(cwd: string, rawPath: string): string {
  const trimmed = rawPath.trim();
  if (!trimmed) {
    throw new Error("path 不能为空");
  }

  const resolvedPath = resolve(cwd, trimmed);
  const relativePath = relative(cwd, resolvedPath);
  if (
    relativePath === ".." ||
    relativePath.startsWith("../") ||
    relativePath.startsWith("..\\") ||
    isAbsolute(relativePath)
  ) {
    throw new Error("只能发送当前 workspace 里的文件，不能越出工作目录");
  }

  return resolvedPath;
}

export function createFeishuFilesExtension(
  messenger: Pick<FeishuMessenger, "sendLocalFileMessage" | "sendLocalImageMessage">,
  resolveIdentityByWorkspace: (cwd: string) => WorkspaceFileContext | null = getWorkspaceContext,
): ExtensionFactory {
  const sendImageTool = defineTool({
    name: "feishu_image_send",
    label: "Feishu Image Send",
    description: "把当前 workspace 里的本地图片发送到当前飞书会话，图片会直接显示在聊天里。",
    promptSnippet: "feishu_image_send: 发送图片、截图、海报、图表、照片、设计稿预览时默认使用这个工具，让用户直接看到图片。",
    promptGuidelines: [
      "发送图片、截图、海报、图表、照片、设计稿预览时默认调用 feishu_image_send，不要用 feishu_file_send。",
      "只有当图片已经生成或已下载到当前 workspace 后，才调用 feishu_image_send。",
      "支持 jpg、jpeg、png、webp、gif、tiff、bmp、ico；传入的 path 必须指向当前 workspace 里的真实图片。",
    ],
    parameters: Type.Object({
      path: Type.String({ description: "当前 workspace 里的图片路径，可相对可绝对。" }),
      file_name: Type.Optional(Type.String({ description: "发给飞书时记录的图片名，可不传。" })),
    }),
    prepareArguments: normalizeArgs as any,
    async execute(_toolCallId, params, _signal, _onUpdate, ctx) {
      const workspaceContext = resolveWorkspaceContext(ctx.cwd, resolveIdentityByWorkspace);
      const identity = workspaceContext.identity;
      const target = resolveFileRecipient(identity, workspaceContext);
      const filePath = resolveWorkspaceFilePath(ctx.cwd, params.path);
      const fileName = typeof params.file_name === "string" ? params.file_name : undefined;
      const result = await messenger.sendLocalImageMessage(target, {
        path: filePath,
        fileName,
      });

      return toToolResult({
        open_id: identity.openId,
        receive_id_type: typeof target === "string" ? "open_id" : target.receiveIdType,
        receive_id: typeof target === "string" ? target : target.receiveId,
        path: filePath,
        file_name: result.fileName,
        image_key: result.imageKey,
        message_id: result.messageId,
      });
    },
  });

  const sendFileTool = defineTool({
    name: "feishu_file_send",
    label: "Feishu File Send",
    description: "把当前 workspace 里的非图片文件发送到当前飞书会话。发送图片请用 feishu_image_send。",
    promptSnippet: "feishu_file_send: 发送 PDF、表格、文档、压缩包等非图片文件；图片默认使用 feishu_image_send。",
    promptGuidelines: [
      "只有当文件已经生成或已下载到当前 workspace 后，才调用 feishu_file_send。",
      "只发送用户明确要的最终产物，例如 pdf、csv、txt、zip；不要发送无关的中间文件。",
      "不要用 feishu_file_send 发送图片；图片请用 feishu_image_send，这样用户可直接看见。",
      "如果误传图片路径，本工具会自动改用图片发送。",
      "传入的 path 必须指向当前 workspace 里的真实文件，不能越出工作目录。",
    ],
    parameters: Type.Object({
      path: Type.String({ description: "当前 workspace 里的文件路径，可相对可绝对。" }),
      file_name: Type.Optional(Type.String({ description: "发给飞书时显示的文件名，可不传。" })),
    }),
    prepareArguments: normalizeArgs as any,
    async execute(_toolCallId, params, _signal, _onUpdate, ctx) {
      const workspaceContext = resolveWorkspaceContext(ctx.cwd, resolveIdentityByWorkspace);
      const identity = workspaceContext.identity;
      const target = resolveFileRecipient(identity, workspaceContext);
      const filePath = resolveWorkspaceFilePath(ctx.cwd, params.path);
      const fileName = typeof params.file_name === "string" ? params.file_name : undefined;
      if (isFeishuImageFileName(filePath) || (fileName && isFeishuImageFileName(fileName))) {
        const result = await messenger.sendLocalImageMessage(target, {
          path: filePath,
          fileName,
        });

        return toToolResult({
          open_id: identity.openId,
          receive_id_type: typeof target === "string" ? "open_id" : target.receiveIdType,
          receive_id: typeof target === "string" ? target : target.receiveId,
          path: filePath,
          file_name: result.fileName,
          image_key: result.imageKey,
          message_id: result.messageId,
          sent_as: "image",
        });
      }

      const result = await messenger.sendLocalFileMessage(target, {
        path: filePath,
        fileName,
      });

      return toToolResult({
        open_id: identity.openId,
        receive_id_type: typeof target === "string" ? "open_id" : target.receiveIdType,
        receive_id: typeof target === "string" ? target : target.receiveId,
        path: filePath,
        file_name: result.fileName,
        file_key: result.fileKey,
        message_id: result.messageId,
        sent_as: "file",
      });
    },
  });

  return (pi) => {
    pi.registerTool(sendImageTool);
    pi.registerTool(sendFileTool);
  };
}

function resolveWorkspaceContext(
  cwd: string,
  resolveIdentityByWorkspace: (cwd: string) => WorkspaceFileContext | null,
): WorkspaceContext {
  const workspaceContext = normalizeWorkspaceFileContext(resolveIdentityByWorkspace(cwd));
  if (!workspaceContext?.identity.openId) {
    throw new Error("当前 workspace 没有关联到飞书用户，暂时不能发送文件");
  }
  return workspaceContext;
}

function normalizeWorkspaceFileContext(raw: WorkspaceFileContext | null): WorkspaceContext | null {
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

function resolveFileRecipient(
  identity: UserIdentity,
  workspaceContext: WorkspaceContext,
): FeishuMessageRecipient {
  const target = workspaceContext.conversationTarget;
  return target && target.kind !== "p2p" ? target : identity.openId;
}
