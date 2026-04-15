import { randomUUID } from "node:crypto";
import { logger } from "../app/logger.js";

export type FeishuDocFormat = "markdown" | "html";

export interface FeishuDocRefInput {
  document_id?: string;
  document_url?: string;
}

export interface FeishuDocBlock {
  block_id?: string;
  parent_id?: string;
  children?: string[];
  block_type: number;
  [key: string]: unknown;
}

export interface FeishuDocsClient {
  docx: {
    v1: {
      document: {
        create(payload?: {
          data?: {
            folder_token?: string;
            title?: string;
          };
        }): Promise<{
          data?: {
            document?: {
              document_id?: string;
              revision_id?: number;
              title?: string;
            };
          };
        }>;
        get(payload?: {
          path: {
            document_id: string;
          };
        }): Promise<{
          data?: {
            document?: {
              document_id?: string;
              revision_id?: number;
              title?: string;
            };
          };
        }>;
        rawContent(payload?: {
          path: {
            document_id: string;
          };
        }): Promise<{
          data?: {
            content?: string;
          };
        }>;
        convert(payload?: {
          data: {
            content_type: FeishuDocFormat;
            content: string;
          };
        }): Promise<{
          data?: {
            first_level_block_ids?: string[];
            blocks?: FeishuDocBlock[];
          };
        }>;
      };
      documentBlockChildren: {
        getWithIterator(payload?: {
          params?: {
            document_revision_id?: number;
            page_token?: string;
            page_size?: number;
            with_descendants?: boolean;
          };
          path: {
            document_id: string;
            block_id: string;
          };
        }): Promise<AsyncIterable<{ items?: FeishuDocBlock[] } | null>>;
        batchDelete(payload?: {
          data: {
            start_index: number;
            end_index: number;
          };
          params?: {
            document_revision_id?: number;
            client_token?: string;
          };
          path: {
            document_id: string;
            block_id: string;
          };
        }): Promise<{
          data?: {
            document_revision_id?: number;
            client_token?: string;
          };
        }>;
      };
      documentBlockDescendant: {
        create(payload?: {
          data: {
            children_id: string[];
            index?: number;
            descendants: FeishuDocBlock[];
          };
          params?: {
            document_revision_id?: number;
            client_token?: string;
          };
          path?: {
            document_id?: string;
            block_id?: string;
          };
        }): Promise<{
          data?: {
            children?: FeishuDocBlock[];
            document_revision_id?: number;
            client_token?: string;
          };
        }>;
      };
    };
  };
  drive: {
    v1: {
      file: {
        delete(payload?: {
          params: {
            type: "docx";
          };
          path?: {
            file_token?: string;
          };
        }): Promise<{
          data?: {
            task_id?: string;
          };
        }>;
        createFolder(payload?: {
          data: {
            name: string;
            folder_token: string;
          };
        }): Promise<{
          data?: {
            token?: string;
            url?: string;
          };
        }>;
      };
    };
  };
}

export interface FeishuDocMeta {
  document_id: string;
  title?: string;
  revision_id?: number;
}

export interface FeishuDocReadResult extends FeishuDocMeta {
  raw_content: string;
}

export interface FeishuDocCreateInput {
  title?: string;
  content?: string;
  format?: FeishuDocFormat;
  folder_token?: string;
}

export interface FeishuDocCreateResult extends FeishuDocMeta {
  inserted_block_ids: string[];
}

export interface FeishuDocWriteInput extends FeishuDocRefInput {
  content: string;
  format?: FeishuDocFormat;
}

export interface FeishuDocWriteResult extends FeishuDocMeta {
  inserted_block_ids: string[];
}

export interface FeishuDocReplaceResult extends FeishuDocWriteResult {
  deleted_block_count: number;
}

export interface FeishuDocDeleteBlocksInput extends FeishuDocRefInput {
  start_index: number;
  end_index: number;
}

export interface FeishuDocDeleteBlocksResult extends FeishuDocMeta {
  deleted_block_count: number;
}

export interface FeishuDocDeleteDocumentResult {
  document_id: string;
  task_id?: string;
}

export interface FeishuFolderCreateInput {
  name: string;
  folder_token: string;
}

export interface FeishuFolderCreateResult {
  token?: string;
  url?: string;
}

export interface FeishuDocsService {
  resolveDocumentId(input: FeishuDocRefInput | string): string;
  createDocument(input: FeishuDocCreateInput): Promise<FeishuDocCreateResult>;
  readDocument(input: FeishuDocRefInput): Promise<FeishuDocReadResult>;
  listRootChildren(input: FeishuDocRefInput | string): Promise<FeishuDocBlock[]>;
  appendContent(input: FeishuDocWriteInput): Promise<FeishuDocWriteResult>;
  replaceContent(input: FeishuDocWriteInput): Promise<FeishuDocReplaceResult>;
  deleteRootChildRange(input: FeishuDocDeleteBlocksInput): Promise<FeishuDocDeleteBlocksResult>;
  deleteDocument(input: FeishuDocRefInput): Promise<FeishuDocDeleteDocumentResult>;
  createFolder(input: FeishuFolderCreateInput): Promise<FeishuFolderCreateResult>;
}

const DOCX_URL_PATTERN = /\/docx\/([A-Za-z0-9]+)(?:[/?#]|$)/i;
const WIKI_URL_PATTERN = /\/wiki\//i;

export function createFeishuDocsService(client: FeishuDocsClient): FeishuDocsService {
  function resolveDocumentId(input: FeishuDocRefInput | string): string {
    if (typeof input === "string") {
      return resolveDocumentIdFromValue(input);
    }

    if (typeof input.document_id === "string" && input.document_id.trim()) {
      return input.document_id.trim();
    }

    if (typeof input.document_url === "string" && input.document_url.trim()) {
      return resolveDocumentIdFromValue(input.document_url);
    }

    throw new Error("必须提供 document_id 或 document_url");
  }

  async function createDocument(input: FeishuDocCreateInput): Promise<FeishuDocCreateResult> {
    const response = await client.docx.v1.document.create({
      data: {
        title: input.title?.trim() || undefined,
        folder_token: input.folder_token?.trim() || undefined,
      },
    });

    const document = response.data?.document;
    const documentId = document?.document_id;
    if (!documentId) {
      throw new Error("飞书创建文档失败，没拿到 document_id");
    }

    let revisionId = document.revision_id;
    let insertedBlockIds: string[] = [];

    if (hasContent(input.content)) {
      const insertResult = await insertContentBlocks({
        documentId,
        content: input.content ?? "",
        format: normalizeFormat(input.format),
        documentRevisionId: revisionId,
      });
      revisionId = insertResult.revision_id ?? revisionId;
      insertedBlockIds = insertResult.inserted_block_ids;
    }

    logger.info("飞书 docx 文档已创建", {
      documentId,
      hasContent: hasContent(input.content),
    });

    return {
      document_id: documentId,
      title: document.title ?? input.title?.trim() ?? undefined,
      revision_id: revisionId,
      inserted_block_ids: insertedBlockIds,
    };
  }

  async function readDocument(input: FeishuDocRefInput): Promise<FeishuDocReadResult> {
    const documentId = resolveDocumentId(input);
    const [meta, rawContentResponse] = await Promise.all([
      getDocumentMetaById(documentId),
      client.docx.v1.document.rawContent({
        path: { document_id: documentId },
      }),
    ]);

    return {
      ...meta,
      raw_content: rawContentResponse.data?.content ?? "",
    };
  }

  async function listRootChildren(input: FeishuDocRefInput | string): Promise<FeishuDocBlock[]> {
    return listRootChildrenById(resolveDocumentId(input));
  }

  async function appendContent(input: FeishuDocWriteInput): Promise<FeishuDocWriteResult> {
    const documentId = resolveDocumentId(input);
    const meta = await getDocumentMetaById(documentId);
    const result = await insertContentBlocks({
      documentId,
      content: input.content,
      format: normalizeFormat(input.format),
      documentRevisionId: meta.revision_id,
    });

    return {
      document_id: documentId,
      title: meta.title,
      revision_id: result.revision_id ?? meta.revision_id,
      inserted_block_ids: result.inserted_block_ids,
    };
  }

  async function replaceContent(input: FeishuDocWriteInput): Promise<FeishuDocReplaceResult> {
    const documentId = resolveDocumentId(input);
    const meta = await getDocumentMetaById(documentId);
    const children = await listRootChildrenById(documentId);

    let revisionId = meta.revision_id;
    if (children.length > 0) {
      const deleteResponse = await client.docx.v1.documentBlockChildren.batchDelete({
        path: {
          document_id: documentId,
          block_id: documentId,
        },
        params: {
          document_revision_id: revisionId,
          client_token: randomUUID(),
        },
        data: {
          start_index: 0,
          end_index: children.length,
        },
      });
      revisionId = deleteResponse.data?.document_revision_id ?? revisionId;
    }

    const insertResult = await insertContentBlocks({
      documentId,
      content: input.content,
      format: normalizeFormat(input.format),
      documentRevisionId: revisionId,
    });

    return {
      document_id: documentId,
      title: meta.title,
      revision_id: insertResult.revision_id ?? revisionId,
      deleted_block_count: children.length,
      inserted_block_ids: insertResult.inserted_block_ids,
    };
  }

  async function deleteRootChildRange(
    input: FeishuDocDeleteBlocksInput,
  ): Promise<FeishuDocDeleteBlocksResult> {
    const documentId = resolveDocumentId(input);
    const meta = await getDocumentMetaById(documentId);
    const children = await listRootChildrenById(documentId);

    assertDeleteRange(input.start_index, input.end_index, children.length);
    if (input.start_index === input.end_index) {
      return {
        document_id: documentId,
        title: meta.title,
        revision_id: meta.revision_id,
        deleted_block_count: 0,
      };
    }

    const response = await client.docx.v1.documentBlockChildren.batchDelete({
      path: {
        document_id: documentId,
        block_id: documentId,
      },
      params: {
        document_revision_id: meta.revision_id,
        client_token: randomUUID(),
      },
      data: {
        start_index: input.start_index,
        end_index: input.end_index,
      },
    });

    return {
      document_id: documentId,
      title: meta.title,
      revision_id: response.data?.document_revision_id ?? meta.revision_id,
      deleted_block_count: input.end_index - input.start_index,
    };
  }

  async function deleteDocument(
    input: FeishuDocRefInput,
  ): Promise<FeishuDocDeleteDocumentResult> {
    const documentId = resolveDocumentId(input);
    const response = await client.drive.v1.file.delete({
      path: {
        file_token: documentId,
      },
      params: {
        type: "docx",
      },
    });

    logger.info("飞书 docx 文档已删除", { documentId });

    return {
      document_id: documentId,
      task_id: response.data?.task_id,
    };
  }

  async function createFolder(
    input: FeishuFolderCreateInput,
  ): Promise<FeishuFolderCreateResult> {
    const response = await client.drive.v1.file.createFolder({
      data: {
        name: input.name.trim(),
        folder_token: input.folder_token.trim(),
      },
    });

    return {
      token: response.data?.token,
      url: response.data?.url,
    };
  }

  async function getDocumentMetaById(documentId: string): Promise<FeishuDocMeta> {
    const response = await client.docx.v1.document.get({
      path: {
        document_id: documentId,
      },
    });
    const document = response.data?.document;
    if (!document?.document_id) {
      throw new Error("飞书文档不存在，或者当前应用没权限访问");
    }

    return {
      document_id: document.document_id,
      title: document.title,
      revision_id: document.revision_id,
    };
  }

  async function listRootChildrenById(documentId: string): Promise<FeishuDocBlock[]> {
    const iterator = await client.docx.v1.documentBlockChildren.getWithIterator({
      path: {
        document_id: documentId,
        block_id: documentId,
      },
      params: {
        with_descendants: false,
        page_size: 200,
      },
    });

    const items: FeishuDocBlock[] = [];
    for await (const page of iterator) {
      if (!page) {
        break;
      }
      items.push(...(page.items ?? []));
    }

    return items;
  }

  async function insertContentBlocks(args: {
    documentId: string;
    content: string;
    format: FeishuDocFormat;
    documentRevisionId?: number;
  }): Promise<FeishuDocWriteResult> {
    if (!hasContent(args.content)) {
      return {
        document_id: args.documentId,
        revision_id: args.documentRevisionId,
        inserted_block_ids: [],
      };
    }

    const converted = await client.docx.v1.document.convert({
      data: {
        content_type: args.format,
        content: args.content,
      },
    });

    const firstLevelBlockIds = converted.data?.first_level_block_ids ?? [];
    const descendants = sanitizeConvertedBlocks(converted.data?.blocks ?? []);
    if (firstLevelBlockIds.length === 0 || descendants.length === 0) {
      return {
        document_id: args.documentId,
        revision_id: args.documentRevisionId,
        inserted_block_ids: [],
      };
    }

    const response = await client.docx.v1.documentBlockDescendant.create({
      path: {
        document_id: args.documentId,
        block_id: args.documentId,
      },
      params: {
        document_revision_id: args.documentRevisionId,
        client_token: randomUUID(),
      },
      data: {
        children_id: firstLevelBlockIds,
        descendants,
        index: -1,
      },
    });

    return {
      document_id: args.documentId,
      revision_id: response.data?.document_revision_id ?? args.documentRevisionId,
      inserted_block_ids: (response.data?.children ?? [])
        .map((block) => block.block_id)
        .filter((blockId): blockId is string => Boolean(blockId)),
    };
  }

  return {
    resolveDocumentId,
    createDocument,
    readDocument,
    listRootChildren,
    appendContent,
    replaceContent,
    deleteRootChildRange,
    deleteDocument,
    createFolder,
  };
}

function resolveDocumentIdFromValue(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error("文档引用不能为空");
  }

  if (WIKI_URL_PATTERN.test(trimmed)) {
    throw new Error("暂不支持飞书 wiki 文档，只支持新版文档 docx");
  }

  const docxMatch = trimmed.match(DOCX_URL_PATTERN);
  if (docxMatch?.[1]) {
    return docxMatch[1];
  }

  if (/^https?:\/\//i.test(trimmed)) {
    throw new Error("只支持 docx 文档链接，当前链接里没解析出 document_id");
  }

  return trimmed;
}

function normalizeFormat(format?: string): FeishuDocFormat {
  if (!format || format === "markdown") {
    return "markdown";
  }
  if (format === "html") {
    return "html";
  }
  throw new Error("format 只支持 markdown 或 html");
}

function hasContent(content?: string): boolean {
  return typeof content === "string" && content.trim().length > 0;
}

function assertDeleteRange(startIndex: number, endIndex: number, childCount: number) {
  if (!Number.isInteger(startIndex) || !Number.isInteger(endIndex)) {
    throw new Error("start_index 和 end_index 必须是整数");
  }
  if (startIndex < 0 || endIndex < 0) {
    throw new Error("start_index 和 end_index 不能小于 0");
  }
  if (startIndex > endIndex) {
    throw new Error("start_index 不能大于 end_index");
  }
  if (endIndex > childCount) {
    throw new Error(`end_index 超出范围，当前根级块数量是 ${childCount}`);
  }
}

function sanitizeConvertedBlocks(blocks: FeishuDocBlock[]): FeishuDocBlock[] {
  return blocks.map((block) => sanitizeValue(block));
}

function sanitizeValue<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item)) as T;
  }
  if (!value || typeof value !== "object") {
    return value;
  }

  const output: Record<string, unknown> = {};
  for (const [key, innerValue] of Object.entries(value)) {
    if (key === "merge_info") {
      continue;
    }
    output[key] = sanitizeValue(innerValue);
  }
  return output as T;
}
