import { describe, expect, it, vi } from "vitest";
import { createFeishuFilesExtension } from "../src/pi/extensions/feishu-files.js";

function collectTools(
  messengerOverrides?: Record<string, unknown>,
  resolveIdentityByWorkspace: (cwd: string) => any = () => ({
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
    sendLocalImageMessage: vi.fn().mockResolvedValue({
      imageKey: "img_1",
      fileName: "预览.png",
      messageId: "om_image_1",
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
  it("会注册发送飞书图片和文件工具", () => {
    const { tools } = collectTools();

    expect(tools.map((tool) => tool.name)).toEqual(["feishu_image_send", "feishu_file_send"]);
  });

  it("图片工具会把本地图片发成可直接查看的飞书图片", async () => {
    const { tools, messenger } = collectTools();
    const sendTool = tools.find((tool) => tool.name === "feishu_image_send");

    const result = await sendTool.execute(
      "call-1",
      { path: "exports/preview.png" },
      undefined,
      undefined,
      createToolContext("/tmp/workspace/ou_1"),
    );

    expect(messenger.sendLocalImageMessage).toHaveBeenCalledWith("ou_1", {
      path: "/tmp/workspace/ou_1/exports/preview.png",
      fileName: undefined,
    });
    expect(result.details).toMatchObject({
      image_key: "img_1",
      message_id: "om_image_1",
    });
    expect(messenger.sendLocalFileMessage).not.toHaveBeenCalled();
  });

  it("会把 camelCase 文件名兼容成 snake_case，并按 workspace 解析相对路径", async () => {
    const { tools, messenger } = collectTools();
    const sendTool = tools.find((tool) => tool.name === "feishu_file_send");

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

  it("群聊 workspace 会把文件发回当前群聊", async () => {
    const target = {
      kind: "group",
      key: "oc_1",
      receiveIdType: "chat_id",
      receiveId: "oc_1",
      chatId: "oc_1",
    } as const;
    const { tools, messenger } = collectTools(undefined, () => ({
      identity: {
        openId: "ou_1",
        userId: "u_1",
      },
      conversationTarget: target,
    }));
    const sendTool = tools.find((tool) => tool.name === "feishu_file_send");

    const result = await sendTool.execute(
      "call-1",
      { path: "exports/report.txt" },
      undefined,
      undefined,
      createToolContext("/tmp/workspace/conversations/oc_1"),
    );

    expect(messenger.sendLocalFileMessage).toHaveBeenCalledWith(target, {
      path: "/tmp/workspace/conversations/oc_1/exports/report.txt",
      fileName: undefined,
    });
    expect(result.details).toMatchObject({
      receive_id_type: "chat_id",
      receive_id: "oc_1",
    });
  });

  it("文件工具误传图片时会自动改成图片发送", async () => {
    const { tools, messenger } = collectTools();
    const sendTool = tools.find((tool) => tool.name === "feishu_file_send");

    const result = await sendTool.execute(
      "call-1",
      { path: "exports/chart.webp" },
      undefined,
      undefined,
      createToolContext("/tmp/workspace/ou_1"),
    );

    expect(messenger.sendLocalImageMessage).toHaveBeenCalledWith("ou_1", {
      path: "/tmp/workspace/ou_1/exports/chart.webp",
      fileName: undefined,
    });
    expect(messenger.sendLocalFileMessage).not.toHaveBeenCalled();
    expect(result.details).toMatchObject({
      image_key: "img_1",
      sent_as: "image",
    });
  });

  it("越出 workspace 的路径会被直接拦住", async () => {
    const { tools, messenger } = collectTools();
    const sendTool = tools.find((tool) => tool.name === "feishu_file_send");

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
    expect(messenger.sendLocalImageMessage).not.toHaveBeenCalled();
  });

  it("当前 workspace 没有关联到用户时会报错", async () => {
    const { tools, messenger } = collectTools(undefined, () => null);
    const sendTool = tools.find((tool) => tool.name === "feishu_file_send");

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
    expect(messenger.sendLocalImageMessage).not.toHaveBeenCalled();
  });
});
