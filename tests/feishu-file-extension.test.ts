import { describe, expect, it, vi } from "vitest";
import { createFeishuFilesExtension } from "../src/pi/extensions/feishu-files.js";

function collectTools(
  messengerOverrides?: Record<string, unknown>,
  resolveIdentityByWorkspace: (cwd: string) => { openId: string; userId?: string } | null = () => ({
    openId: "ou_1",
    userId: "u_1",
  }),
) {
  const messenger = {
    sendLocalFileMessage: vi.fn().mockResolvedValue({
      fileKey: "file_v2_1",
      fileName: "日报.txt",
      fileType: "stream",
      messageId: "om_file_1",
    }),
    ...messengerOverrides,
  };

  const tools: any[] = [];
  createFeishuFilesExtension(messenger as any, resolveIdentityByWorkspace)({
    registerTool(tool) {
      tools.push(tool);
    },
  } as any);

  return { messenger, tools };
}

function createToolContext(cwd: string) {
  return {
    cwd,
    sessionManager: {
      getBranch: () => [],
    },
  };
}

describe("feishu files extension", () => {
  it("会注册发送飞书文件工具", () => {
    const { tools } = collectTools();

    expect(tools.map((tool) => tool.name)).toEqual(["feishu_file_send"]);
  });

  it("会把 camelCase 文件名兼容成 snake_case，并按 workspace 解析相对路径", async () => {
    const { tools, messenger } = collectTools();
    const sendTool = tools[0];

    const prepared = sendTool.prepareArguments({
      path: "exports/report.txt",
      fileName: "日报.txt",
    });
    await sendTool.execute(
      "call-1",
      prepared,
      undefined,
      undefined,
      createToolContext("/tmp/workspace/ou_1"),
    );

    expect(messenger.sendLocalFileMessage).toHaveBeenCalledWith("ou_1", {
      path: "/tmp/workspace/ou_1/exports/report.txt",
      fileName: "日报.txt",
    });
  });

  it("越出 workspace 的路径会被直接拦住", async () => {
    const { tools, messenger } = collectTools();
    const sendTool = tools[0];

    await expect(
      sendTool.execute(
        "call-1",
        { path: "../secret.txt" },
        undefined,
        undefined,
        createToolContext("/tmp/workspace/ou_1"),
      ),
    ).rejects.toThrow("只能发送当前 workspace 里的文件");
    expect(messenger.sendLocalFileMessage).not.toHaveBeenCalled();
  });

  it("当前 workspace 没有关联到用户时会报错", async () => {
    const { tools, messenger } = collectTools(undefined, () => null);
    const sendTool = tools[0];

    await expect(
      sendTool.execute(
        "call-1",
        { path: "report.txt" },
        undefined,
        undefined,
        createToolContext("/tmp/workspace/ou_1"),
      ),
    ).rejects.toThrow("当前 workspace 没有关联到飞书用户");
    expect(messenger.sendLocalFileMessage).not.toHaveBeenCalled();
  });
});
