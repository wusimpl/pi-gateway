import { describe, expect, it, vi } from "vitest";
import { createFeishuDocsExtension } from "../src/pi/extensions/feishu-docs.js";

function collectTools(serviceOverrides?: Record<string, unknown>) {
  const service = {
    createDocument: vi.fn().mockResolvedValue({
      document_id: "doxcn_1",
      revision_id: 1,
      inserted_block_ids: [],
    }),
    readDocument: vi.fn().mockResolvedValue({
      document_id: "doxcn_1",
      revision_id: 1,
      raw_content: "hello",
    }),
    appendContent: vi.fn().mockResolvedValue({
      document_id: "doxcn_1",
      revision_id: 2,
      inserted_block_ids: ["block-1"],
    }),
    replaceContent: vi.fn().mockResolvedValue({
      document_id: "doxcn_1",
      revision_id: 3,
      deleted_block_count: 2,
      inserted_block_ids: ["block-2"],
    }),
    deleteRootChildRange: vi.fn().mockResolvedValue({
      document_id: "doxcn_1",
      revision_id: 4,
      deleted_block_count: 1,
    }),
    deleteDocument: vi.fn().mockResolvedValue({
      document_id: "doxcn_1",
      task_id: "task-1",
    }),
    createFolder: vi.fn().mockResolvedValue({
      token: "folder-1",
      url: "https://example.feishu.cn/drive/folder/folder-1",
    }),
    ...serviceOverrides,
  };

  const tools: any[] = [];
  createFeishuDocsExtension(service as any)({
    registerTool(tool) {
      tools.push(tool);
    },
  } as any);

  return { service, tools };
}

describe("feishu docs extension", () => {
  it("会注册完整的飞书 docx 工具集", () => {
    const { tools } = collectTools();

    expect(tools.map((tool) => tool.name)).toEqual([
      "feishu_doc_create",
      "feishu_doc_read",
      "feishu_doc_append",
      "feishu_doc_replace",
      "feishu_doc_delete_blocks",
      "feishu_doc_delete_document",
      "feishu_folder_create",
    ]);
  });

  it("会把 camelCase 参数兼容成 snake_case 再交给 service", async () => {
    const { tools, service } = collectTools();
    const createTool = tools.find((tool) => tool.name === "feishu_doc_create");

    const prepared = createTool.prepareArguments({
      title: "日报",
      content: "正文",
      folderToken: "folder-123",
    });

    await createTool.execute("call-1", prepared, undefined, undefined, {} as any);

    expect(service.createDocument).toHaveBeenCalledWith({
      title: "日报",
      content: "正文",
      format: undefined,
      folder_token: "folder-123",
    });
  });

  it("删整篇文档时，没有 confirm=true 就会直接拦住", async () => {
    const { tools, service } = collectTools();
    const deleteTool = tools.find((tool) => tool.name === "feishu_doc_delete_document");

    await expect(
      deleteTool.execute(
        "call-1",
        {
          document_id: "doxcn_1",
          confirm: false,
        },
        undefined,
        undefined,
        {} as any,
      ),
    ).rejects.toThrow();
    expect(service.deleteDocument).not.toHaveBeenCalled();
  });
});
