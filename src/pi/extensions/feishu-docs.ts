import { Type } from "@mariozechner/pi-ai";
import {
  defineTool,
  type ExtensionAPI,
  type ExtensionFactory,
} from "@mariozechner/pi-coding-agent";
import type { FeishuDocsService } from "../../feishu/doc-service.js";
import { getWorkspaceIdentity } from "../workspace-identity.js";
import type { UserIdentity } from "../../types.js";

const DOCX_ONLY_GUIDELINES = [
  "这些飞书文档工具只支持新版文档 docx，不支持 wiki 链接或知识库节点。",
  "修改已有文档前，优先先读取当前内容，避免误删用户已有正文。",
];

const DOCX_IMAGE_GUIDELINES = [
  "如果正文里包含可直接访问的真实图片 URL 或 data URL，默认应让文档直接嵌图，不要主动改成“保留原图链接”。",
  "只有在图片不是直链、下载失败、返回的不是图片、需要登录，或写入失败时，才退回成图片链接，并在最终回复里明确说清原因。",
];

const DOCX_DOCUMENT_REF_FIELDS = {
  document_id: Type.Optional(
    Type.String({ description: "飞书 docx document_id。和 document_url 二选一。" }),
  ),
  document_url: Type.Optional(
    Type.String({ description: "飞书 docx 文档链接。只支持 /docx/... 链接，不支持 wiki。" }),
  ),
};

const READABLE_DOCUMENT_REF_FIELDS = {
  document_id: Type.Optional(
    Type.String({ description: "飞书 docx document_id。和 document_url 二选一。" }),
  ),
  document_url: Type.Optional(
    Type.String({
      description:
        "飞书文档链接。支持 /docx/... 文档链接，也支持 /wiki/... 知识库节点链接。",
    }),
  ),
};

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
    document_id: raw.document_id ?? raw.documentId,
    document_url: raw.document_url ?? raw.documentUrl,
    folder_token: raw.folder_token ?? raw.folderToken,
    start_index: raw.start_index ?? raw.startIndex,
    end_index: raw.end_index ?? raw.endIndex,
  };
}

export function createFeishuDocsExtension(
  service: FeishuDocsService,
  resolveIdentityByWorkspace: (cwd: string) => UserIdentity | null = getWorkspaceIdentity,
): ExtensionFactory {
  const createTool = defineTool({
    name: "feishu_doc_create",
    label: "Feishu Doc Create",
    description:
      "创建飞书新版文档 docx。可选直接写入 markdown/html 正文。只支持 docx，不支持 wiki。",
    promptSnippet: "feishu_doc_create: 创建飞书 docx 文档，可选一次性写入 markdown/html 正文。",
    promptGuidelines: [
      ...DOCX_ONLY_GUIDELINES,
      ...DOCX_IMAGE_GUIDELINES,
      "新建文档后，默认会尝试把文档所有权转给当前飞书私聊用户，同时给应用自己保留管理权限。",
      "如果所有权转移失败，要明确告诉用户文档虽然已创建，但当前仍不是用户本人所有。",
    ],
    parameters: Type.Object({
      title: Type.Optional(Type.String({ description: "文档标题。" })),
      content: Type.Optional(Type.String({ description: "要写入正文的内容。" })),
      format: Type.Optional(
        Type.String({ description: "正文格式。默认 markdown，可选 html。" }),
      ),
      folder_token: Type.Optional(
        Type.String({ description: "要放进去的飞书文件夹 token，可不传。" }),
      ),
    }),
    prepareArguments: normalizeArgs as any,
    async execute(_toolCallId, params, _signal, _onUpdate, ctx) {
      const result = await service.createDocument({
        title: typeof params.title === "string" ? params.title : undefined,
        content: typeof params.content === "string" ? params.content : undefined,
        format: typeof params.format === "string" ? params.format as "markdown" | "html" : undefined,
        folder_token:
          typeof params.folder_token === "string" ? params.folder_token : undefined,
      });

      const identity = resolveIdentityByWorkspace(ctx.cwd);
      if (!identity?.openId) {
        return toToolResult({
          ...result,
          owner_transfer: {
            status: "skipped_no_identity",
          },
        });
      }

      try {
        const transfer = await service.transferDocumentOwner({
          document_id: result.document_id,
          member_id: identity.openId,
          member_type: "openid",
          remove_old_owner: false,
          old_owner_perm: "full_access",
          stay_put: false,
        });

        return toToolResult({
          ...result,
          owner_transfer: {
            status: "transferred",
            member_id: transfer.member_id,
            member_type: transfer.member_type,
          },
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(
          `文档已创建，但转给当前飞书用户失败：${message}。文档链接：${result.document_url}`,
        );
      }
    },
  });

  const readTool = defineTool({
    name: "feishu_doc_read",
    label: "Feishu Doc Read",
    description:
      "读取飞书新版文档 docx 的标题、revision_id 和纯文本正文。支持 /docx/... 文档链接，也支持 /wiki/... 知识库节点链接。",
    promptSnippet:
      "feishu_doc_read: 读取飞书 docx 文档标题、版本号和纯文本正文，也支持 wiki 链接自动解析后读取。",
    promptGuidelines: [
      "读取工具支持新版文档 docx，也支持 wiki 链接或知识库节点链接。",
      "如果传入 wiki 链接，工具会先解析出真实 docx token，再读取正文。",
      "修改已有文档前，优先先读取当前内容，避免误删用户已有正文。",
    ],
    parameters: Type.Object(READABLE_DOCUMENT_REF_FIELDS),
    prepareArguments: normalizeArgs as any,
    async execute(_toolCallId, params) {
      const result = await service.readDocument({
        document_id:
          typeof params.document_id === "string" ? params.document_id : undefined,
        document_url:
          typeof params.document_url === "string" ? params.document_url : undefined,
      });
      return toToolResult(result);
    },
  });

  const appendTool = defineTool({
    name: "feishu_doc_append",
    label: "Feishu Doc Append",
    description:
      "往飞书新版文档 docx 的根节点末尾追加正文内容。只支持 docx，不支持 wiki。",
    promptSnippet: "feishu_doc_append: 往飞书 docx 文档末尾追加 markdown/html 内容。",
    promptGuidelines: [...DOCX_ONLY_GUIDELINES, ...DOCX_IMAGE_GUIDELINES],
    parameters: Type.Object({
      ...DOCX_DOCUMENT_REF_FIELDS,
      content: Type.String({ description: "要追加进去的正文内容。" }),
      format: Type.Optional(
        Type.String({ description: "正文格式。默认 markdown，可选 html。" }),
      ),
    }),
    prepareArguments: normalizeArgs as any,
    async execute(_toolCallId, params) {
      const result = await service.appendContent({
        document_id:
          typeof params.document_id === "string" ? params.document_id : undefined,
        document_url:
          typeof params.document_url === "string" ? params.document_url : undefined,
        content: params.content,
        format: typeof params.format === "string" ? params.format as "markdown" | "html" : undefined,
      });
      return toToolResult(result);
    },
  });

  const replaceTool = defineTool({
    name: "feishu_doc_replace",
    label: "Feishu Doc Replace",
    description:
      "整篇替换飞书新版文档 docx 的正文内容。会先写入新正文，确认成功后再删旧内容。只支持 docx，不支持 wiki。",
    promptSnippet: "feishu_doc_replace: 整篇替换飞书 docx 正文，会先写新内容再删旧内容。",
    promptGuidelines: [...DOCX_ONLY_GUIDELINES, ...DOCX_IMAGE_GUIDELINES],
    parameters: Type.Object({
      ...DOCX_DOCUMENT_REF_FIELDS,
      content: Type.String({ description: "替换后的完整正文内容。" }),
      format: Type.Optional(
        Type.String({ description: "正文格式。默认 markdown，可选 html。" }),
      ),
    }),
    prepareArguments: normalizeArgs as any,
    async execute(_toolCallId, params) {
      const result = await service.replaceContent({
        document_id:
          typeof params.document_id === "string" ? params.document_id : undefined,
        document_url:
          typeof params.document_url === "string" ? params.document_url : undefined,
        content: params.content,
        format: typeof params.format === "string" ? params.format as "markdown" | "html" : undefined,
      });
      return toToolResult(result);
    },
  });

  const deleteBlocksTool = defineTool({
    name: "feishu_doc_delete_blocks",
    label: "Feishu Doc Delete Blocks",
    description:
      "删除飞书新版文档 docx 根级块的一个区间。end_index 是右开区间，也就是不包含 end_index 本身。只支持 docx，不支持 wiki。",
    promptSnippet:
      "feishu_doc_delete_blocks: 删除飞书 docx 根级块区间，end_index 按右开区间处理。",
    promptGuidelines: DOCX_ONLY_GUIDELINES,
    parameters: Type.Object({
      ...DOCX_DOCUMENT_REF_FIELDS,
      start_index: Type.Number({ description: "起始块下标，包含这个位置。" }),
      end_index: Type.Number({ description: "结束块下标，右开，不包含这个位置。" }),
    }),
    prepareArguments: normalizeArgs as any,
    async execute(_toolCallId, params) {
      const result = await service.deleteRootChildRange({
        document_id:
          typeof params.document_id === "string" ? params.document_id : undefined,
        document_url:
          typeof params.document_url === "string" ? params.document_url : undefined,
        start_index: params.start_index,
        end_index: params.end_index,
      });
      return toToolResult(result);
    },
  });

  const deleteDocumentTool = defineTool({
    name: "feishu_doc_delete_document",
    label: "Feishu Doc Delete",
    description:
      "删除整篇飞书新版文档 docx。只有用户明确同意后才允许调用，而且必须传 confirm=true。只支持 docx，不支持 wiki。",
    promptSnippet:
      "feishu_doc_delete_document: 删除整篇飞书 docx 文档，必须先拿到用户明确确认。",
    promptGuidelines: [
      ...DOCX_ONLY_GUIDELINES,
      "删除整篇文档前，必须先拿到用户明确确认，再传 confirm=true 调这个工具。",
      "只有当用户在对话里明确表达“确认删除整篇文档”这类意思时，才允许真的删除。",
    ],
    parameters: Type.Object({
      ...DOCX_DOCUMENT_REF_FIELDS,
      confirm: Type.Optional(
        Type.Boolean({
          description: "只有在用户已经明确确认要删除整篇文档时，才传 true。",
          default: false,
        }),
      ),
    }),
    prepareArguments: normalizeArgs as any,
    async execute(_toolCallId, params, _signal, _onUpdate, ctx) {
      if (params.confirm !== true) {
        throw new Error("删除整篇文档前必须先拿到用户明确确认，并传 confirm=true");
      }
      if (!hasExplicitDocumentDeleteConfirmation(ctx)) {
        throw new Error(
          "删除整篇文档前，用户必须在对话里明确确认，例如直接回复“确认删除整篇文档”，不能只靠模型自己传 confirm=true",
        );
      }

      const result = await service.deleteDocument({
        document_id:
          typeof params.document_id === "string" ? params.document_id : undefined,
        document_url:
          typeof params.document_url === "string" ? params.document_url : undefined,
      });
      return toToolResult(result);
    },
  });

  const createFolderTool = defineTool({
    name: "feishu_folder_create",
    label: "Feishu Folder Create",
    description: "在飞书云空间里新建文件夹，通常用来给新文档找落点。",
    promptSnippet: "feishu_folder_create: 在飞书云空间里创建文件夹。",
    promptGuidelines: [
      "如果用户想把新文档放进指定目录，但没给 folder_token，先问清楚或者先建文件夹。",
    ],
    parameters: Type.Object({
      name: Type.String({ description: "文件夹名称。" }),
      folder_token: Type.String({ description: "父文件夹 token。" }),
    }),
    prepareArguments: normalizeArgs as any,
    async execute(_toolCallId, params) {
      const result = await service.createFolder({
        name: params.name,
        folder_token: params.folder_token,
      });
      return toToolResult(result);
    },
  });

  return (pi: ExtensionAPI) => {
    pi.registerTool(createTool);
    pi.registerTool(readTool);
    pi.registerTool(appendTool);
    pi.registerTool(replaceTool);
    pi.registerTool(deleteBlocksTool);
    pi.registerTool(deleteDocumentTool);
    pi.registerTool(createFolderTool);
  };
}

function hasExplicitDocumentDeleteConfirmation(ctx: {
  sessionManager?: {
    getBranch?: () => Array<{
      type?: string;
      message?: {
        role?: string;
        content?: unknown;
      };
    }>;
  };
} | undefined): boolean {
  const entries = ctx?.sessionManager?.getBranch?.() ?? [];

  for (let index = entries.length - 1; index >= 0; index--) {
    const entry = entries[index];
    if (entry?.type !== "message" || entry.message?.role !== "user") {
      continue;
    }

    const text = extractText(entry.message.content).replace(/\s+/g, "");
    if (!text) {
      return false;
    }

    return isExplicitDeleteConfirmation(text);
  }

  return false;
}

function isExplicitDeleteConfirmation(text: string): boolean {
  const confirmPattern = /(确认|确定|同意|可以|confirm|yes)/i;
  const deletePattern = /(删除|删掉|移除|delete|remove)/i;
  const documentPattern = /(整篇|全文|整个|整份|文档|document|docx)/i;
  return confirmPattern.test(text) && deletePattern.test(text) && documentPattern.test(text);
}

function extractText(content: unknown): string {
  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    return content.map((item) => extractText(item)).filter(Boolean).join("\n");
  }

  if (!content || typeof content !== "object") {
    return "";
  }

  return Object.values(content as Record<string, unknown>)
    .map((value) => extractText(value))
    .filter(Boolean)
    .join("\n");
}
