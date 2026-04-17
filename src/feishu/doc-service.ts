import { randomUUID } from "node:crypto";
import { basename, extname } from "node:path";
import { marked } from "marked";
import { logger } from "../app/logger.js";
import {
  buildFeishuDocUrl,
  type FeishuWebDomain,
} from "./doc-links.js";

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
      documentBlock: {
        get(payload?: {
          params?: {
            document_revision_id?: number;
          };
          path: {
            document_id: string;
            block_id: string;
          };
        }): Promise<{
          data?: {
            block?: FeishuDocBlock;
          };
        }>;
        batchUpdate(payload?: {
          data: {
            requests: Array<{
              block_id?: string;
              replace_image?: {
                token: string;
                width?: number;
                height?: number;
                align?: number;
                caption?: {
                  content?: string;
                };
                scale?: number;
              };
            }>;
          };
          params?: {
            document_revision_id?: number;
            client_token?: string;
          };
          path?: {
            document_id?: string;
          };
        }): Promise<{
          data?: {
            blocks?: FeishuDocBlock[];
            document_revision_id?: number;
            client_token?: string;
          };
        }>;
      };
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
  wiki: {
    v2: {
      space: {
        getNode(payload?: {
          params: {
            token: string;
            obj_type?: "doc" | "docx" | "sheet" | "mindnote" | "bitable" | "file" | "slides" | "wiki";
          };
        }): Promise<{
          data?: {
            node?: {
              obj_token?: string;
              obj_type?: "doc" | "sheet" | "mindnote" | "bitable" | "file" | "docx" | "slides";
            };
          };
        }>;
      };
    };
  };
  drive: {
    v1: {
      media: {
        uploadAll(payload?: {
          data: {
            file_name: string;
            parent_type: "docx_image";
            parent_node: string;
            size: number;
            extra?: string;
            file: Buffer;
          };
        }): Promise<{
          file_token?: string;
        } | null>;
      };
      permissionMember: {
        transferOwner(payload?: {
          data: {
            member_type: "email" | "openid" | "userid";
            member_id: string;
          };
          params: {
            type: "docx";
            need_notification?: boolean;
            remove_old_owner?: boolean;
            stay_put?: boolean;
            old_owner_perm?: "view" | "edit" | "full_access";
          };
          path: {
            token: string;
          };
        }): Promise<{
          data?: Record<string, never>;
        }>;
      };
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
  document_url: string;
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
  document_url: string;
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

export interface FeishuDocTransferOwnerInput extends FeishuDocRefInput {
  member_id: string;
  member_type?: "email" | "openid" | "userid";
  need_notification?: boolean;
  remove_old_owner?: boolean;
  stay_put?: boolean;
  old_owner_perm?: "view" | "edit" | "full_access";
}

export interface FeishuDocTransferOwnerResult extends FeishuDocMeta {
  member_id: string;
  member_type: "email" | "openid" | "userid";
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
  transferDocumentOwner(input: FeishuDocTransferOwnerInput): Promise<FeishuDocTransferOwnerResult>;
}

const DOCX_URL_PATTERN = /\/docx\/([A-Za-z0-9]+)(?:[/?#]|$)/i;
const WIKI_URL_PATTERN = /\/wiki\/([A-Za-z0-9]+)(?:[/?#]|$)/i;
const MAX_BLOCKS_PER_BATCH = 1000;
const MAX_IMAGE_UPLOAD_BYTES = 20 * 1024 * 1024;
const IMAGE_REPLACE_BATCH_SIZE = 100;

interface PreparedImageAsset {
  alt?: string;
  source: string;
  file_name: string;
  size: number;
  file: Buffer;
}

interface BlockTreeNode {
  block: FeishuDocBlock;
  childIds: string[];
}

interface BlockInsertContinuation {
  tempBlockId: string;
  remainingChildIds: string[];
}

interface BlockInsertResult {
  revision_id?: number;
  inserted_block_ids: string[];
}

export function createFeishuDocsService(
  client: FeishuDocsClient,
  options?: {
    feishuDomain?: FeishuWebDomain;
  },
): FeishuDocsService {
  const feishuDomain = options?.feishuDomain ?? "feishu";

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
        initialRootChildCount: 0,
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
      document_url: buildDocumentUrl(documentId),
      title: document.title ?? input.title?.trim() ?? undefined,
      revision_id: revisionId,
      inserted_block_ids: insertedBlockIds,
    };
  }

  async function readDocument(input: FeishuDocRefInput): Promise<FeishuDocReadResult> {
    const documentId = await resolveReadableDocumentId(input);
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
    const [meta, children] = await Promise.all([
      getDocumentMetaById(documentId),
      listRootChildrenById(documentId),
    ]);
    const result = await insertContentBlocks({
      documentId,
      content: input.content,
      format: normalizeFormat(input.format),
      documentRevisionId: meta.revision_id,
      initialRootChildCount: children.length,
    });

    return {
      document_id: documentId,
      document_url: buildDocumentUrl(documentId),
      title: meta.title,
      revision_id: result.revision_id ?? meta.revision_id,
      inserted_block_ids: result.inserted_block_ids,
    };
  }

  async function replaceContent(input: FeishuDocWriteInput): Promise<FeishuDocReplaceResult> {
    const documentId = resolveDocumentId(input);
    const meta = await getDocumentMetaById(documentId);
    const children = await listRootChildrenById(documentId);

    const insertResult = await insertContentBlocks({
      documentId,
      content: input.content,
      format: normalizeFormat(input.format),
      documentRevisionId: meta.revision_id,
      initialRootChildCount: children.length,
    });

    let revisionId = insertResult.revision_id ?? meta.revision_id;
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

    return {
      document_id: documentId,
      document_url: buildDocumentUrl(documentId),
      title: meta.title,
      revision_id: revisionId,
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
        document_url: buildDocumentUrl(documentId),
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
      document_url: buildDocumentUrl(documentId),
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
      document_url: buildDocumentUrl(documentId),
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

  async function transferDocumentOwner(
    input: FeishuDocTransferOwnerInput,
  ): Promise<FeishuDocTransferOwnerResult> {
    const documentId = resolveDocumentId(input);
    const memberId = input.member_id.trim();
    if (!memberId) {
      throw new Error("member_id 不能为空");
    }

    const memberType = input.member_type ?? "openid";
    await client.drive.v1.permissionMember.transferOwner({
      path: {
        token: documentId,
      },
      params: {
        type: "docx",
        need_notification: input.need_notification,
        remove_old_owner: input.remove_old_owner,
        stay_put: input.stay_put,
        old_owner_perm: input.old_owner_perm,
      },
      data: {
        member_id: memberId,
        member_type: memberType,
      },
    });

    logger.info("飞书 docx 文档所有者已转移", {
      documentId,
      memberId,
      memberType,
    });

    return {
      document_id: documentId,
      document_url: buildDocumentUrl(documentId),
      member_id: memberId,
      member_type: memberType,
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
      document_url: buildDocumentUrl(document.document_id),
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
    initialRootChildCount: number;
  }): Promise<FeishuDocWriteResult> {
    if (!hasContent(args.content)) {
      return {
        document_id: args.documentId,
        document_url: buildDocumentUrl(args.documentId),
        revision_id: args.documentRevisionId,
        inserted_block_ids: [],
      };
    }

    const imageAssets = await prepareImageAssets(args.content, args.format);
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
        document_url: buildDocumentUrl(args.documentId),
        revision_id: args.documentRevisionId,
        inserted_block_ids: [],
      };
    }

    let revisionId = args.documentRevisionId;
    let insertedBlockIds: string[] = [];

    try {
      const insertResult = await createDescendantBlocksInBatches({
        documentId: args.documentId,
        parentBlockId: args.documentId,
        childIds: firstLevelBlockIds,
        descendants,
        documentRevisionId: revisionId,
        collectInsertedRootIds: true,
      });

      revisionId = insertResult.revision_id ?? revisionId;
      insertedBlockIds = insertResult.inserted_block_ids;

      if (imageAssets.length > 0) {
        const imageBlockIds = await collectInsertedImageBlockIds(args.documentId, insertedBlockIds);
        if (imageBlockIds.length !== imageAssets.length) {
          throw new Error(
            `图片块数量和原始内容里的图片数量不一致，预期 ${imageAssets.length} 张，实际 ${imageBlockIds.length} 张`,
          );
        }

        revisionId = await uploadAndReplaceImages({
          documentId: args.documentId,
          documentRevisionId: revisionId,
          imageBlockIds,
          images: imageAssets,
        });
      }

      return {
        document_id: args.documentId,
        document_url: buildDocumentUrl(args.documentId),
        revision_id: revisionId,
        inserted_block_ids: insertedBlockIds,
      };
    } catch (error) {
      if (insertedBlockIds.length > 0) {
        try {
          revisionId = await rollbackInsertedRootBlocks({
            documentId: args.documentId,
            startIndex: args.initialRootChildCount,
            insertedRootCount: insertedBlockIds.length,
            documentRevisionId: revisionId,
          });
        } catch (rollbackError) {
          logger.warn("飞书 docx 内容写入失败，且回滚追加块失败", {
            documentId: args.documentId,
            rollbackError,
          });
        }
      }
      throw error;
    }
  }

  async function createDescendantBlocksInBatches(args: {
    documentId: string;
    parentBlockId: string;
    childIds: string[];
    descendants: FeishuDocBlock[];
    documentRevisionId?: number;
    collectInsertedRootIds: boolean;
  }): Promise<BlockInsertResult> {
    const tree = buildBlockTree(args.descendants);
    const subtreeSizes = buildSubtreeSizeMap(args.childIds, tree);
    let revisionId = args.documentRevisionId;
    const insertedBlockIds: string[] = [];
    let cursor = 0;

    while (cursor < args.childIds.length) {
      let used = 0;
      const batchChildIds: string[] = [];
      const batchDescendants: FeishuDocBlock[] = [];
      const continuations: BlockInsertContinuation[] = [];

      while (cursor < args.childIds.length && used < MAX_BLOCKS_PER_BATCH) {
        const childId = args.childIds[cursor];
        const fullSize = subtreeSizes.get(childId);
        if (!fullSize) {
          throw new Error(`飞书 convert 返回了缺失的块树节点: ${childId}`);
        }

        if (fullSize <= MAX_BLOCKS_PER_BATCH - used) {
          batchChildIds.push(childId);
          batchDescendants.push(...collectFullSubtree(childId, tree));
          used += fullSize;
          cursor += 1;
          continue;
        }

        if (used > 0) {
          break;
        }

        const partial = collectPartialSubtree(childId, tree);
        batchChildIds.push(childId);
        batchDescendants.push(...partial.blocks);
        used = partial.blocks.length;
        if (partial.remainingChildIds.length > 0) {
          continuations.push({
            tempBlockId: childId,
            remainingChildIds: partial.remainingChildIds,
          });
        }
        cursor += 1;
      }

      const response = await client.docx.v1.documentBlockDescendant.create({
        path: {
          document_id: args.documentId,
          block_id: args.parentBlockId,
        },
        params: {
          document_revision_id: revisionId,
          client_token: randomUUID(),
        },
        data: {
          children_id: batchChildIds,
          descendants: batchDescendants,
          index: -1,
        },
      });

      revisionId = response.data?.document_revision_id ?? revisionId;

      const insertedChildren = (response.data?.children ?? [])
        .map((block) => block.block_id)
        .filter((blockId): blockId is string => Boolean(blockId));

      if (insertedChildren.length !== batchChildIds.length) {
        throw new Error("飞书创建嵌套块后返回的子块数量不完整");
      }

      if (args.collectInsertedRootIds) {
        insertedBlockIds.push(...insertedChildren);
      }

      const insertedChildMap = new Map<string, string>();
      for (let index = 0; index < batchChildIds.length; index++) {
        insertedChildMap.set(batchChildIds[index], insertedChildren[index]);
      }

      for (const continuation of continuations) {
        const realBlockId = insertedChildMap.get(continuation.tempBlockId);
        if (!realBlockId) {
          throw new Error(`飞书没有返回块 ${continuation.tempBlockId} 的真实 block_id`);
        }

        const continuationResult = await createDescendantBlocksInBatches({
          documentId: args.documentId,
          parentBlockId: realBlockId,
          childIds: continuation.remainingChildIds,
          descendants: args.descendants,
          documentRevisionId: revisionId,
          collectInsertedRootIds: false,
        });
        revisionId = continuationResult.revision_id ?? revisionId;
      }
    }

    return {
      revision_id: revisionId,
      inserted_block_ids: insertedBlockIds,
    };
  }

  async function collectInsertedImageBlockIds(
    documentId: string,
    insertedRootBlockIds: string[],
  ): Promise<string[]> {
    const imageBlockIds: string[] = [];

    for (const rootBlockId of insertedRootBlockIds) {
      const [rootBlock, descendants] = await Promise.all([
        getBlockById(client, documentId, rootBlockId),
        listDescendantBlocksById(client, documentId, rootBlockId),
      ]);
      const blocksById = new Map<string, FeishuDocBlock>();
      blocksById.set(rootBlockId, rootBlock);

      for (const block of descendants) {
        if (typeof block.block_id === "string" && block.block_id) {
          blocksById.set(block.block_id, block);
        }
      }

      traverseBlockTree(rootBlockId, blocksById, (blockId, block) => {
        if (isImageBlock(block)) {
          imageBlockIds.push(blockId);
        }
      });
    }

    return imageBlockIds;
  }

  async function uploadAndReplaceImages(args: {
    documentId: string;
    documentRevisionId?: number;
    imageBlockIds: string[];
    images: PreparedImageAsset[];
  }): Promise<number | undefined> {
    let revisionId = args.documentRevisionId;
    const requests: Array<{
      block_id: string;
      replace_image: {
        token: string;
      };
    }> = [];

    for (let index = 0; index < args.imageBlockIds.length; index++) {
      const imageBlockId = args.imageBlockIds[index];
      const image = args.images[index];
      const upload = await client.drive.v1.media.uploadAll({
        data: {
          file_name: image.file_name,
          parent_type: "docx_image",
          parent_node: imageBlockId,
          size: image.size,
          extra: JSON.stringify({ drive_route_token: args.documentId }),
          file: image.file,
        },
      });

      const fileToken = upload?.file_token;
      if (!fileToken) {
        throw new Error(`飞书图片上传成功后没返回 file_token: ${image.source}`);
      }

      requests.push({
        block_id: imageBlockId,
        replace_image: {
          token: fileToken,
        },
      });
    }

    for (let index = 0; index < requests.length; index += IMAGE_REPLACE_BATCH_SIZE) {
      const response = await client.docx.v1.documentBlock.batchUpdate({
        path: {
          document_id: args.documentId,
        },
        params: {
          document_revision_id: revisionId,
          client_token: randomUUID(),
        },
        data: {
          requests: requests.slice(index, index + IMAGE_REPLACE_BATCH_SIZE),
        },
      });
      revisionId = response.data?.document_revision_id ?? revisionId;
    }

    return revisionId;
  }

  async function rollbackInsertedRootBlocks(args: {
    documentId: string;
    startIndex: number;
    insertedRootCount: number;
    documentRevisionId?: number;
  }): Promise<number | undefined> {
    const response = await client.docx.v1.documentBlockChildren.batchDelete({
      path: {
        document_id: args.documentId,
        block_id: args.documentId,
      },
      params: {
        document_revision_id: args.documentRevisionId,
        client_token: randomUUID(),
      },
      data: {
        start_index: args.startIndex,
        end_index: args.startIndex + args.insertedRootCount,
      },
    });

    return response.data?.document_revision_id ?? args.documentRevisionId;
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
    transferDocumentOwner,
  };

  function buildDocumentUrl(documentId: string): string {
    return buildFeishuDocUrl(documentId, feishuDomain);
  }

  async function resolveReadableDocumentId(input: FeishuDocRefInput): Promise<string> {
    if (typeof input.document_id === "string" && input.document_id.trim()) {
      return input.document_id.trim();
    }

    if (typeof input.document_url !== "string" || !input.document_url.trim()) {
      throw new Error("必须提供 document_id 或 document_url");
    }

    return resolveReadableDocumentIdFromValue(input.document_url.trim());
  }

  async function resolveReadableDocumentIdFromValue(value: string): Promise<string> {
    const docxMatch = value.match(DOCX_URL_PATTERN);
    if (docxMatch?.[1]) {
      return docxMatch[1];
    }

    const wikiMatch = value.match(WIKI_URL_PATTERN);
    if (wikiMatch?.[1]) {
      const response = await client.wiki.v2.space.getNode({
        params: {
          token: wikiMatch[1],
        },
      });
      const node = response.data?.node;
      if (node?.obj_type !== "docx" || !node.obj_token) {
        throw new Error("当前 wiki 节点不是 docx 文档，暂不支持读取");
      }
      return node.obj_token;
    }

    if (/^https?:\/\//i.test(value)) {
      throw new Error("只支持 docx 或 wiki 文档链接，当前链接里没解析出 document_id");
    }

    return value;
  }
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

function buildBlockTree(descendants: FeishuDocBlock[]): Map<string, BlockTreeNode> {
  const tree = new Map<string, BlockTreeNode>();

  for (const block of descendants) {
    if (typeof block.block_id !== "string" || !block.block_id) {
      throw new Error("飞书 convert 返回了没有 block_id 的块");
    }

    tree.set(block.block_id, {
      block,
      childIds: Array.isArray(block.children)
        ? block.children.filter((childId): childId is string => typeof childId === "string" && childId.length > 0)
        : [],
    });
  }

  return tree;
}

function buildSubtreeSizeMap(rootIds: string[], tree: Map<string, BlockTreeNode>): Map<string, number> {
  const cache = new Map<string, number>();
  for (const rootId of rootIds) {
    countSubtreeSize(rootId, tree, cache);
  }
  return cache;
}

function countSubtreeSize(
  blockId: string,
  tree: Map<string, BlockTreeNode>,
  cache: Map<string, number>,
): number {
  const cached = cache.get(blockId);
  if (cached) {
    return cached;
  }

  const node = tree.get(blockId);
  if (!node) {
    throw new Error(`飞书 convert 返回的块树不完整，缺少 block_id=${blockId}`);
  }

  const total = 1 + node.childIds.reduce((sum, childId) => sum + countSubtreeSize(childId, tree, cache), 0);
  cache.set(blockId, total);
  return total;
}

function collectFullSubtree(blockId: string, tree: Map<string, BlockTreeNode>): FeishuDocBlock[] {
  const node = tree.get(blockId);
  if (!node) {
    throw new Error(`飞书 convert 返回的块树不完整，缺少 block_id=${blockId}`);
  }

  const current = cloneBlock(node.block);
  current.children = [...node.childIds];

  const result = [current];
  for (const childId of node.childIds) {
    result.push(...collectFullSubtree(childId, tree));
  }
  return result;
}

function collectPartialSubtree(
  blockId: string,
  tree: Map<string, BlockTreeNode>,
): { blocks: FeishuDocBlock[]; remainingChildIds: string[] } {
  const node = tree.get(blockId);
  if (!node) {
    throw new Error(`飞书 convert 返回的块树不完整，缺少 block_id=${blockId}`);
  }

  let used = 1;
  const includedChildIds: string[] = [];
  const blocks: FeishuDocBlock[] = [];
  const subtreeSizes = buildSubtreeSizeMap(node.childIds, tree);

  for (const childId of node.childIds) {
    const childSize = subtreeSizes.get(childId);
    if (!childSize) {
      throw new Error(`飞书 convert 返回的块树不完整，缺少 block_id=${childId}`);
    }
    if (used + childSize > MAX_BLOCKS_PER_BATCH) {
      break;
    }

    includedChildIds.push(childId);
    blocks.push(...collectFullSubtree(childId, tree));
    used += childSize;
  }

  const root = cloneBlock(node.block);
  root.children = includedChildIds;

  return {
    blocks: [root, ...blocks],
    remainingChildIds: node.childIds.slice(includedChildIds.length),
  };
}

function cloneBlock(block: FeishuDocBlock): FeishuDocBlock {
  return sanitizeValue(block);
}

function traverseBlockTree(
  rootBlockId: string,
  blocksById: Map<string, FeishuDocBlock>,
  visit: (blockId: string, block: FeishuDocBlock) => void,
) {
  const visited = new Set<string>();

  const walk = (blockId: string) => {
    if (visited.has(blockId)) {
      return;
    }
    visited.add(blockId);

    const block = blocksById.get(blockId);
    if (!block) {
      return;
    }

    visit(blockId, block);
    const childIds = Array.isArray(block.children)
      ? block.children.filter((childId): childId is string => typeof childId === "string" && childId.length > 0)
      : [];
    for (const childId of childIds) {
      walk(childId);
    }
  };

  walk(rootBlockId);
}

function isImageBlock(block: FeishuDocBlock): boolean {
  return Object.prototype.hasOwnProperty.call(block, "image");
}

async function prepareImageAssets(
  content: string,
  format: FeishuDocFormat,
): Promise<PreparedImageAsset[]> {
  const refs = extractImageRefs(content, format);
  const assets: PreparedImageAsset[] = [];

  for (let index = 0; index < refs.length; index++) {
    assets.push(await loadImageAsset(refs[index], index));
  }

  return assets;
}

function extractImageRefs(content: string, format: FeishuDocFormat): Array<{ alt?: string; source: string }> {
  if (format === "html") {
    return parseHtmlImageRefs(content);
  }

  const refs: Array<{ alt?: string; source: string }> = [];
  const seen = new WeakSet<object>();
  collectMarkdownImageRefs(marked.lexer(content, { gfm: true }), refs, seen);
  return refs;
}

function collectMarkdownImageRefs(
  value: unknown,
  refs: Array<{ alt?: string; source: string }>,
  seen: WeakSet<object>,
) {
  if (Array.isArray(value)) {
    for (const item of value) {
      collectMarkdownImageRefs(item, refs, seen);
    }
    return;
  }

  if (!value || typeof value !== "object") {
    return;
  }

  if (seen.has(value as object)) {
    return;
  }
  seen.add(value as object);

  const record = value as Record<string, unknown>;
  if (record.type === "image" && typeof record.href === "string" && record.href.trim()) {
    refs.push({
      alt: typeof record.text === "string" ? record.text : undefined,
      source: record.href.trim(),
    });
    return;
  }

  if (record.type === "html") {
    const raw = typeof record.raw === "string"
      ? record.raw
      : typeof record.text === "string"
        ? record.text
        : "";
    refs.push(...parseHtmlImageRefs(raw));
  }

  for (const child of Object.values(record)) {
    collectMarkdownImageRefs(child, refs, seen);
  }
}

function parseHtmlImageRefs(fragment: string): Array<{ alt?: string; source: string }> {
  const refs: Array<{ alt?: string; source: string }> = [];
  const imgTagPattern = /<img\b[^>]*>/gi;

  for (const match of fragment.matchAll(imgTagPattern)) {
    const tag = match[0];
    const src = extractHtmlAttribute(tag, "src");
    if (!src) {
      continue;
    }

    refs.push({
      alt: extractHtmlAttribute(tag, "alt") ?? undefined,
      source: src,
    });
  }

  return refs;
}

function extractHtmlAttribute(tag: string, attribute: string): string | undefined {
  const pattern = new RegExp(`${attribute}\\s*=\\s*(?:\"([^\"]*)\"|'([^']*)'|([^\\s\"'=<>\\\`]+))`, "i");
  const match = tag.match(pattern);
  return match?.[1] ?? match?.[2] ?? match?.[3];
}

async function loadImageAsset(
  ref: { alt?: string; source: string },
  index: number,
): Promise<PreparedImageAsset> {
  if (ref.source.startsWith("data:")) {
    return loadImageAssetFromDataUri(ref, index);
  }

  let url: URL;
  try {
    url = new URL(ref.source);
  } catch {
    throw new Error(`图片地址不是有效的 URL: ${ref.source}`);
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error(`只支持 http(s) 或 data URL 图片，当前是: ${ref.source}`);
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`下载图片失败 (${response.status} ${response.statusText}): ${ref.source}`);
  }

  const contentType = normalizeMimeType(response.headers.get("content-type"));
  if (!contentType.startsWith("image/")) {
    throw new Error(`图片地址返回的不是图片内容: ${ref.source}`);
  }

  const file = Buffer.from(await response.arrayBuffer());
  assertImageUploadSize(file.length, ref.source);

  return {
    alt: ref.alt,
    source: ref.source,
    file_name: buildImageFileName({
      source: ref.source,
      alt: ref.alt,
      mimeType: contentType,
      index,
    }),
    size: file.length,
    file,
  };
}

function loadImageAssetFromDataUri(
  ref: { alt?: string; source: string },
  index: number,
): PreparedImageAsset {
  const match = ref.source.match(/^data:([^;,]+)?(?:;charset=[^;,]+)?(;base64)?,(.*)$/i);
  if (!match) {
    throw new Error("data URL 图片格式不合法");
  }

  const mimeType = normalizeMimeType(match[1]);
  if (!mimeType.startsWith("image/")) {
    throw new Error("data URL 里不是图片内容");
  }

  const isBase64 = Boolean(match[2]);
  const payload = match[3] ?? "";
  const file = isBase64
    ? Buffer.from(payload, "base64")
    : Buffer.from(decodeURIComponent(payload), "utf-8");

  assertImageUploadSize(file.length, ref.source);

  return {
    alt: ref.alt,
    source: ref.source,
    file_name: buildImageFileName({
      source: ref.source,
      alt: ref.alt,
      mimeType,
      index,
    }),
    size: file.length,
    file,
  };
}

function assertImageUploadSize(size: number, source: string) {
  if (size > MAX_IMAGE_UPLOAD_BYTES) {
    throw new Error(`图片超过 20MB，当前不能写入飞书文档: ${source}`);
  }
}

function buildImageFileName(args: {
  source: string;
  alt?: string;
  mimeType: string;
  index: number;
}): string {
  const sourceName = args.source.startsWith("data:")
    ? ""
    : basename(new URL(args.source).pathname || "");
  const base = sanitizeFileName(stripExtension(sourceName || args.alt || `image-${args.index + 1}`)) || `image-${args.index + 1}`;
  const extension = extname(sourceName) || MIME_EXTENSIONS[args.mimeType] || ".png";
  return `${base}${extension}`;
}

function stripExtension(fileName: string): string {
  const extension = extname(fileName);
  return extension ? fileName.slice(0, -extension.length) : fileName;
}

function sanitizeFileName(fileName: string): string {
  return fileName.trim().replace(/[^a-zA-Z0-9._-]/g, "_");
}

function normalizeMimeType(value: string | null | undefined): string {
  if (!value) {
    return "image/png";
  }
  return value.split(";")[0]?.trim().toLowerCase() || "image/png";
}

async function getBlockById(
  client: FeishuDocsClient,
  documentId: string,
  blockId: string,
): Promise<FeishuDocBlock> {
  const response = await client.docx.v1.documentBlock.get({
    path: {
      document_id: documentId,
      block_id: blockId,
    },
  });

  const block = response.data?.block;
  if (!block) {
    throw new Error(`飞书文档块不存在，block_id=${blockId}`);
  }
  return block;
}

async function listDescendantBlocksById(
  client: FeishuDocsClient,
  documentId: string,
  blockId: string,
): Promise<FeishuDocBlock[]> {
  const iterator = await client.docx.v1.documentBlockChildren.getWithIterator({
    path: {
      document_id: documentId,
      block_id: blockId,
    },
    params: {
      with_descendants: true,
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

const MIME_EXTENSIONS: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/bmp": ".bmp",
};
