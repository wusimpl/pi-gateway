import { describe, expect, it, vi } from "vitest";
import {
  createFeishuDocsService,
  type FeishuDocsClient,
} from "../src/feishu/doc-service.js";

function createClient(): FeishuDocsClient {
  return {
    docx: {
      v1: {
        documentBlock: {
          get: vi.fn(),
          batchUpdate: vi.fn(),
        },
        document: {
          create: vi.fn(),
          get: vi.fn(),
          rawContent: vi.fn(),
          convert: vi.fn(),
        },
        documentBlockChildren: {
          getWithIterator: vi.fn(),
          batchDelete: vi.fn(),
        },
        documentBlockDescendant: {
          create: vi.fn(),
        },
      },
    },
    drive: {
      v1: {
        media: {
          uploadAll: vi.fn(),
        },
        file: {
          delete: vi.fn(),
          createFolder: vi.fn(),
        },
      },
    },
  };
}

function createAsyncIterable<T>(pages: T[]): AsyncIterable<T> {
  return {
    async *[Symbol.asyncIterator]() {
      for (const page of pages) {
        yield page;
      }
    },
  };
}

describe("FeishuDocsService", () => {
  it("能从 docx 链接里解析 document_id，并拒绝 wiki 链接", () => {
    const service = createFeishuDocsService(createClient());

    expect(
      service.resolveDocumentId("https://example.feishu.cn/docx/doxcnAbC123?from=copy"),
    ).toBe("doxcnAbC123");
    expect(() =>
      service.resolveDocumentId({
        document_url: "https://example.feishu.cn/wiki/abc123",
      }),
    ).toThrow();
  });

  it("创建文档时会先建 docx，再把 markdown 转成块插进去", async () => {
    const client = createClient();
    client.docx.v1.document.create = vi.fn().mockResolvedValue({
      data: {
        document: {
          document_id: "doxcn_new_1",
          revision_id: 11,
          title: "周报",
        },
      },
    });
    client.docx.v1.document.convert = vi.fn().mockResolvedValue({
      data: {
        first_level_block_ids: ["tmp-block-1"],
        blocks: [
          {
            block_id: "tmp-block-1",
            block_type: 2,
            children: [],
            table: {
              property: {
                merge_info: { row: 1, col: 1 },
                row_size: 1,
              },
            },
          },
        ],
      },
    });
    client.docx.v1.documentBlockDescendant.create = vi.fn().mockResolvedValue({
      data: {
        children: [{ block_id: "real-block-1", block_type: 2 }],
        document_revision_id: 12,
      },
    });

    const service = createFeishuDocsService(client);
    const result = await service.createDocument({
      title: "周报",
      content: "# 本周进展",
    });

    expect(client.docx.v1.document.create).toHaveBeenCalledWith({
      data: {
        title: "周报",
        folder_token: undefined,
      },
    });
    expect(client.docx.v1.document.convert).toHaveBeenCalledWith({
      data: {
        content_type: "markdown",
        content: "# 本周进展",
      },
    });
    expect(client.docx.v1.documentBlockDescendant.create).toHaveBeenCalledWith(
      expect.objectContaining({
        path: {
          document_id: "doxcn_new_1",
          block_id: "doxcn_new_1",
        },
        data: expect.objectContaining({
          children_id: ["tmp-block-1"],
        }),
      }),
    );

    const insertedPayload = vi.mocked(
      client.docx.v1.documentBlockDescendant.create,
    ).mock.calls[0]?.[0];
    expect(JSON.stringify(insertedPayload)).not.toContain("merge_info");
    expect(result).toEqual({
      document_id: "doxcn_new_1",
      title: "周报",
      revision_id: 12,
      inserted_block_ids: ["real-block-1"],
    });
  });

  it("整篇替换时会先写入新正文，再删除旧块", async () => {
    const client = createClient();
    client.docx.v1.document.get = vi.fn().mockResolvedValue({
      data: {
        document: {
          document_id: "doxcn_existing_1",
          title: "旧文档",
          revision_id: 5,
        },
      },
    });
    client.docx.v1.documentBlockChildren.getWithIterator = vi
      .fn()
      .mockResolvedValue(
        createAsyncIterable([
          {
            items: [
              { block_id: "block-1", block_type: 2 },
              { block_id: "block-2", block_type: 2 },
            ],
          },
        ]),
      );
    client.docx.v1.documentBlockChildren.batchDelete = vi.fn().mockResolvedValue({
      data: {
        document_revision_id: 8,
      },
    });
    client.docx.v1.document.convert = vi.fn().mockResolvedValue({
      data: {
        first_level_block_ids: ["tmp-replace-1"],
        blocks: [{ block_id: "tmp-replace-1", block_type: 2 }],
      },
    });
    client.docx.v1.documentBlockDescendant.create = vi.fn().mockResolvedValue({
      data: {
        children: [{ block_id: "new-block-1", block_type: 2 }],
        document_revision_id: 7,
      },
    });

    const service = createFeishuDocsService(client);
    const result = await service.replaceContent({
      document_id: "doxcn_existing_1",
      content: "新的正文",
    });

    expect(
      vi.mocked(client.docx.v1.documentBlockDescendant.create).mock.invocationCallOrder[0],
    ).toBeLessThan(
      vi.mocked(client.docx.v1.documentBlockChildren.batchDelete).mock.invocationCallOrder[0],
    );
    expect(client.docx.v1.documentBlockDescendant.create).toHaveBeenCalledWith(
      expect.objectContaining({
        params: expect.objectContaining({
          document_revision_id: 5,
        }),
      }),
    );
    expect(client.docx.v1.documentBlockChildren.batchDelete).toHaveBeenCalledWith(
      expect.objectContaining({
        path: {
          document_id: "doxcn_existing_1",
          block_id: "doxcn_existing_1",
        },
        data: {
          start_index: 0,
          end_index: 2,
        },
      }),
    );
    expect(result).toEqual({
      document_id: "doxcn_existing_1",
      title: "旧文档",
      revision_id: 8,
      deleted_block_count: 2,
      inserted_block_ids: ["new-block-1"],
    });
  });

  it("整篇替换时如果新正文转换失败，不会先把旧内容删掉", async () => {
    const client = createClient();
    client.docx.v1.document.get = vi.fn().mockResolvedValue({
      data: {
        document: {
          document_id: "doxcn_existing_1",
          title: "旧文档",
          revision_id: 5,
        },
      },
    });
    client.docx.v1.documentBlockChildren.getWithIterator = vi
      .fn()
      .mockResolvedValue(
        createAsyncIterable([
          {
            items: [
              { block_id: "block-1", block_type: 2 },
              { block_id: "block-2", block_type: 2 },
            ],
          },
        ]),
      );
    client.docx.v1.document.convert = vi.fn().mockRejectedValue(new Error("convert failed"));

    const service = createFeishuDocsService(client);

    await expect(
      service.replaceContent({
        document_id: "doxcn_existing_1",
        content: "新的正文",
      }),
    ).rejects.toThrow("convert failed");
    expect(client.docx.v1.documentBlockChildren.batchDelete).not.toHaveBeenCalled();
  });

  it("带图片的 markdown 会上传素材并回填到真实图片块", async () => {
    const client = createClient();
    client.docx.v1.document.create = vi.fn().mockResolvedValue({
      data: {
        document: {
          document_id: "doxcn_img_1",
          revision_id: 11,
          title: "图文",
        },
      },
    });
    client.docx.v1.document.convert = vi.fn().mockResolvedValue({
      data: {
        first_level_block_ids: ["tmp-image-1"],
        blocks: [
          {
            block_id: "tmp-image-1",
            block_type: 27,
            children: [],
            image: {},
          },
        ],
      },
    });
    client.docx.v1.documentBlockDescendant.create = vi.fn().mockResolvedValue({
      data: {
        children: [{ block_id: "img-real-1", block_type: 27 }],
        document_revision_id: 12,
      },
    });
    client.docx.v1.documentBlock.get = vi.fn().mockResolvedValue({
      data: {
        block: {
          block_id: "img-real-1",
          block_type: 27,
          children: [],
          image: {},
        },
      },
    });
    client.docx.v1.documentBlockChildren.getWithIterator = vi
      .fn()
      .mockResolvedValue(createAsyncIterable([]));
    client.drive.v1.media.uploadAll = vi.fn().mockResolvedValue({
      file_token: "file-token-1",
    });
    client.docx.v1.documentBlock.batchUpdate = vi.fn().mockResolvedValue({
      data: {
        document_revision_id: 13,
      },
    });

    const service = createFeishuDocsService(client);
    const result = await service.createDocument({
      title: "图文",
      content: "![logo](data:image/png;base64,aGVsbG8=)",
    });

    expect(client.drive.v1.media.uploadAll).toHaveBeenCalledWith({
      data: expect.objectContaining({
        parent_type: "docx_image",
        parent_node: "img-real-1",
        extra: JSON.stringify({ drive_route_token: "doxcn_img_1" }),
        size: 5,
      }),
    });
    expect(client.docx.v1.documentBlock.batchUpdate).toHaveBeenCalledWith({
      path: {
        document_id: "doxcn_img_1",
      },
      params: expect.objectContaining({
        document_revision_id: 12,
      }),
      data: {
        requests: [
          {
            block_id: "img-real-1",
            replace_image: {
              token: "file-token-1",
            },
          },
        ],
      },
    });
    expect(result).toEqual({
      document_id: "doxcn_img_1",
      title: "图文",
      revision_id: 13,
      inserted_block_ids: ["img-real-1"],
    });
  });

  it("单个子树超过 1000 块时会拆成多次创建", async () => {
    const client = createClient();
    const childIds = Array.from({ length: 1002 }, (_, index) => `tmp-child-${index + 1}`);

    client.docx.v1.document.create = vi.fn().mockResolvedValue({
      data: {
        document: {
          document_id: "doxcn_big_1",
          revision_id: 20,
          title: "长文档",
        },
      },
    });
    client.docx.v1.document.convert = vi.fn().mockResolvedValue({
      data: {
        first_level_block_ids: ["tmp-root"],
        blocks: [
          {
            block_id: "tmp-root",
            block_type: 2,
            children: childIds,
          },
          ...childIds.map((childId) => ({
            block_id: childId,
            block_type: 2,
            children: [],
          })),
        ],
      },
    });
    client.docx.v1.documentBlockDescendant.create = vi
      .fn()
      .mockResolvedValueOnce({
        data: {
          children: [{ block_id: "real-root", block_type: 2 }],
          document_revision_id: 21,
        },
      })
      .mockResolvedValueOnce({
        data: {
          children: childIds.slice(999).map((childId, index) => ({
            block_id: `real-tail-${index + 1}`,
            block_type: 2,
            parent_id: "real-root",
            origin: childId,
          })),
          document_revision_id: 22,
        },
      });

    const service = createFeishuDocsService(client);
    const result = await service.createDocument({
      title: "长文档",
      content: "超长正文",
    });

    expect(client.docx.v1.documentBlockDescendant.create).toHaveBeenCalledTimes(2);
    expect(client.docx.v1.documentBlockDescendant.create).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        path: {
          document_id: "doxcn_big_1",
          block_id: "doxcn_big_1",
        },
        data: expect.objectContaining({
          children_id: ["tmp-root"],
        }),
      }),
    );
    expect(
      vi.mocked(client.docx.v1.documentBlockDescendant.create).mock.calls[0]?.[0]?.data.descendants,
    ).toHaveLength(1000);
    expect(client.docx.v1.documentBlockDescendant.create).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        path: {
          document_id: "doxcn_big_1",
          block_id: "real-root",
        },
        data: expect.objectContaining({
          children_id: childIds.slice(999),
        }),
      }),
    );
    expect(result).toEqual({
      document_id: "doxcn_big_1",
      title: "长文档",
      revision_id: 22,
      inserted_block_ids: ["real-root"],
    });
  });

  it("删除整篇文档时会走 drive 文件删除接口", async () => {
    const client = createClient();
    client.drive.v1.file.delete = vi.fn().mockResolvedValue({
      data: {
        task_id: "task-1",
      },
    });

    const service = createFeishuDocsService(client);
    const result = await service.deleteDocument({
      document_url: "https://example.feishu.cn/docx/doxcnDelete1",
    });

    expect(client.drive.v1.file.delete).toHaveBeenCalledWith({
      path: {
        file_token: "doxcnDelete1",
      },
      params: {
        type: "docx",
      },
    });
    expect(result).toEqual({
      document_id: "doxcnDelete1",
      task_id: "task-1",
    });
  });
});
