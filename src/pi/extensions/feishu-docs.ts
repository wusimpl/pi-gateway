import { Type } from "@mariozechner/pi-ai";
import {
  defineTool,
  type ExtensionAPI,
  type ExtensionFactory,
} from "@mariozechner/pi-coding-agent";
import type { FeishuDocsService } from "../../feishu/doc-service.js";

const SHARED_DOC_GUIDELINES = [
  "这些飞书文档工具只支持新版文档 docx，不支持 wiki 链接或知识库节点。",
  "修改已有文档前，优先先读取当前内容，避免误删用户已有正文。",
];

const DOCUMENT_REF_FIELDS = {
  document_id: Type.Optional(
    Type.String({ description: "飞书 docx document_id。和 document_url 二选一。" }),
  ),
  document_url: Type.Optional(
    Type.String({ description: "飞书 docx 文档链接。只支持 /docx/... 链接，不支持 wiki。" }),
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

export function createFeishuDocsExtension(service: FeishuDocsService): ExtensionFactory {
  const createTool = defineTool({
    name: "feishu_doc_create",
    label: "Feishu Doc Create",
    description:
      "创建飞书新版文档 docx。可选直接写入 markdown/html 正文。只支持 docx，不支持 wiki。",
    promptSnippet: "feishu_doc_create: 创建飞书 docx 文档，可选一次性写入 markdown/html 正文。",
    promptGuidelines: SHARED_DOC_GUIDELINES,
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
    async execute(_toolCallId, params) {
      const result = await service.createDocument({
        title: typeof params.title === "string" ? params.title : undefined,
        content: typeof params.content === "string" ? params.content : undefined,
        format: typeof params.format === "string" ? params.format as "markdown" | "html" : undefined,
        folder_token:
          typeof params.folder_token === "string" ? params.folder_token : undefined,
      });
      return toToolResult(result);
    },
  });

  const readTool = defineTool({
    name: "feishu_doc_read",
    label: "Feishu Doc Read",
    description:
      "读取飞书新版文档 docx 的标题、revision_id 和纯文本正文。只支持 docx，不支持 wiki。",
    promptSnippet: "feishu_doc_read: 读取飞书 docx 文档标题、版本号和纯文本正文。",
    promptGuidelines: SHARED_DOC_GUIDELINES,
    parameters: Type.Object(DOCUMENT_REF_FIELDS),
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
    promptGuidelines: SHARED_DOC_GUIDELINES,
    parameters: Type.Object({
      ...DOCUMENT_REF_FIELDS,
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
      "整篇替换飞书新版文档 docx 的正文内容。实现方式是删掉根级正文块再重建。只支持 docx，不支持 wiki。",
    promptSnippet: "feishu_doc_replace: 整篇替换飞书 docx 正文，适合重写整份文档。",
    promptGuidelines: SHARED_DOC_GUIDELINES,
    parameters: Type.Object({
      ...DOCUMENT_REF_FIELDS,
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
    promptGuidelines: SHARED_DOC_GUIDELINES,
    parameters: Type.Object({
      ...DOCUMENT_REF_FIELDS,
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
      ...SHARED_DOC_GUIDELINES,
      "删除整篇文档前，必须先拿到用户明确确认，再传 confirm=true 调这个工具。",
    ],
    parameters: Type.Object({
      ...DOCUMENT_REF_FIELDS,
      confirm: Type.Optional(
        Type.Boolean({
          description: "只有在用户已经明确确认要删除整篇文档时，才传 true。",
          default: false,
        }),
      ),
    }),
    prepareArguments: normalizeArgs as any,
    async execute(_toolCallId, params) {
      if (params.confirm !== true) {
        throw new Error("删除整篇文档前必须先拿到用户明确确认，并传 confirm=true");
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
