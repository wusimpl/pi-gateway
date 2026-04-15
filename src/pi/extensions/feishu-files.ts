import { resolve, relative, isAbsolute } from "node:path";
import { Type } from "@mariozechner/pi-ai";
import {
  defineTool,
  type ExtensionFactory,
} from "@mariozechner/pi-coding-agent";
import type { FeishuMessenger } from "../../feishu/send.js";
import { getWorkspaceIdentity } from "../workspace-identity.js";
import type { UserIdentity } from "../../types.js";

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
  messenger: Pick<FeishuMessenger, "sendLocalFileMessage">,
  resolveIdentityByWorkspace: (cwd: string) => UserIdentity | null = getWorkspaceIdentity,
): ExtensionFactory {
  const sendFileTool = defineTool({
    name: "feishu_file_send",
    label: "Feishu File Send",
    description: "把当前 workspace 里的本地文件发送给当前飞书私聊用户。",
    promptSnippet: "feishu_file_send: 把当前 workspace 里的本地文件直接发给当前飞书用户。",
    promptGuidelines: [
      "只有当文件已经生成或已下载到当前 workspace 后，才调用 feishu_file_send。",
      "只发送用户明确要的最终产物，例如 pdf、csv、txt、zip；不要发送无关的中间文件。",
      "传入的 path 必须指向当前 workspace 里的真实文件，不能越出工作目录。",
    ],
    parameters: Type.Object({
      path: Type.String({ description: "当前 workspace 里的文件路径，可相对可绝对。" }),
      file_name: Type.Optional(Type.String({ description: "发给飞书时显示的文件名，可不传。" })),
    }),
    prepareArguments: normalizeArgs as any,
    async execute(_toolCallId, params, _signal, _onUpdate, ctx) {
      const identity = resolveIdentityByWorkspace(ctx.cwd);
      if (!identity?.openId) {
        throw new Error("当前 workspace 没有关联到飞书用户，暂时不能发送文件");
      }

      const filePath = resolveWorkspaceFilePath(ctx.cwd, params.path);
      const result = await messenger.sendLocalFileMessage(identity.openId, {
        path: filePath,
        fileName: typeof params.file_name === "string" ? params.file_name : undefined,
      });

      return toToolResult({
        open_id: identity.openId,
        path: filePath,
        file_name: result.fileName,
        file_key: result.fileKey,
        message_id: result.messageId,
      });
    },
  });

  return (pi) => {
    pi.registerTool(sendFileTool);
  };
}
