import { describe, expect, it, vi } from "vitest";
import { createFeishuDocsExtension } from "../src/pi/extensions/feishu-docs.js";

function collectTools(
  serviceOverrides?: Record<string, unknown>,
  resolveIdentityByWorkspace?: (cwd: string) => { openId: string; userId?: string } | null,
) {
  const service = {
    createDocument: vi.fn().mockResolvedValue({
      document_id: "doxcn_1",
      revision_id: 1,
      document_url: "https://feishu.cn/docx/doxcn_1",
      inserted_block_ids: [],
    }),
    transferDocumentOwner: vi.fn().mockResolvedValue({
      document_id: "doxcn_1",
      document_url: "https://feishu.cn/docx/doxcn_1",
      member_id: "ou_1",
      member_type: "openid",
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
  createFeishuDocsExtension(service as any, resolveIdentityByWorkspace as any)({
    registerTool(tool) {
      tools.push(tool);
    },
  } as any);

  return { service, tools };
}

function createToolContext(lastUserText?: string, cwd = "/tmp/workspace/ou_1") {
  const branch = lastUserText
    ? [
        {
          type: "message",
          message: {
            role: "user",
            content: lastUserText,
          },
        },
      ]
    : [];

  return {
    cwd,
    sessionManager: {
      getBranch: () => branch,
    },
  };
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

  it("新建文档后会把所有权转给当前 workspace 对应的飞书用户", async () => {
    const { tools, service } = collectTools(
      undefined,
      (cwd) => (cwd === "/tmp/workspace/ou_1" ? { openId: "ou_1" } : null),
    );
    const createTool = tools.find((tool) => tool.name === "feishu_doc_create");

    const result = await createTool.execute(
      "call-1",
      {
        title: "日报",
      },
      undefined,
      undefined,
      createToolContext(undefined, "/tmp/workspace/ou_1"),
    );

    expect(service.transferDocumentOwner).toHaveBeenCalledWith({
      document_id: "doxcn_1",
      member_id: "ou_1",
      member_type: "openid",
      remove_old_owner: false,
      old_owner_perm: "full_access",
      stay_put: false,
    });
    expect(result.details.owner_transfer).toEqual({
      status: "transferred",
      member_id: "ou_1",
      member_type: "openid",
    });
  });

  it("如果当前 workspace 没有关联飞书用户，就跳过所有权转移", async () => {
    const { tools, service } = collectTools(undefined, () => null);
    const createTool = tools.find((tool) => tool.name === "feishu_doc_create");

    const result = await createTool.execute(
      "call-1",
      {
        title: "日报",
      },
      undefined,
      undefined,
      createToolContext(undefined, "/tmp/workspace/unknown"),
    );

    expect(service.transferDocumentOwner).not.toHaveBeenCalled();
    expect(result.details.owner_transfer).toEqual({
      status: "skipped_no_identity",
    });
  });

  it("所有权转移失败时，会明确告诉用户文档虽然建好了但仍没转成功", async () => {
    const { tools } = collectTools(
      {
        transferDocumentOwner: vi.fn().mockRejectedValue(new Error("permission denied")),
      },
      () => ({ openId: "ou_1" }),
    );
    const createTool = tools.find((tool) => tool.name === "feishu_doc_create");

    await expect(
      createTool.execute(
        "call-1",
        {
          title: "日报",
        },
        undefined,
        undefined,
        createToolContext(undefined, "/tmp/workspace/ou_1"),
      ),
    ).rejects.toThrow(
      "文档已创建，但转给当前飞书用户失败：permission denied。文档链接：https://feishu.cn/docx/doxcn_1",
    );
  });

  it("读取工具会明确标注支持 wiki，写工具仍保持 docx 限制", () => {
    const { tools } = collectTools();
    const readTool = tools.find((tool) => tool.name === "feishu_doc_read");
    const appendTool = tools.find((tool) => tool.name === "feishu_doc_append");

    expect(readTool.description).toContain("/wiki/");
    expect(JSON.stringify(readTool.parameters)).toContain("/wiki/");
    expect(appendTool.description).toContain("只支持 docx，不支持 wiki");
  });

  it("创建和写入工具会明确图片语法、权限前提和失败回退规则", () => {
    const { tools } = collectTools();
    const createTool = tools.find((tool) => tool.name === "feishu_doc_create");
    const appendTool = tools.find((tool) => tool.name === "feishu_doc_append");
    const replaceTool = tools.find((tool) => tool.name === "feishu_doc_replace");

    for (const tool of [createTool, appendTool, replaceTool]) {
      expect(tool.promptGuidelines).toEqual(
        expect.arrayContaining([
          expect.stringContaining("Markdown `![alt](url)`"),
          expect.stringContaining("裸图片 URL 或普通 Markdown 链接 `[文字](url)` 不算图片"),
          expect.stringContaining("图片上传权限"),
          expect.stringContaining("才退回成图片链接"),
        ]),
      );
    }
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

  it("删整篇文档时，就算 confirm=true，没有真实用户确认也会拦住", async () => {
    const { tools, service } = collectTools();
    const deleteTool = tools.find((tool) => tool.name === "feishu_doc_delete_document");

    await expect(
      deleteTool.execute(
        "call-1",
        {
          document_id: "doxcn_1",
          confirm: true,
        },
        undefined,
        undefined,
        createToolContext("你先看看这篇文档"),
      ),
    ).rejects.toThrow("用户必须在对话里明确确认");
    expect(service.deleteDocument).not.toHaveBeenCalled();
  });

  it("删整篇文档时，只有用户明确说确认删除整篇文档才会放行", async () => {
    const { tools, service } = collectTools();
    const deleteTool = tools.find((tool) => tool.name === "feishu_doc_delete_document");

    await deleteTool.execute(
      "call-1",
      {
        document_id: "doxcn_1",
        confirm: true,
      },
      undefined,
      undefined,
      createToolContext("确认删除整篇文档"),
    );

    expect(service.deleteDocument).toHaveBeenCalledWith({
      document_id: "doxcn_1",
      document_url: undefined,
    });
  });
});
