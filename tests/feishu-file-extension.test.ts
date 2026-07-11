import { mkdir, mkdtemp, realpath, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createFeishuFilesExtension } from "../src/pi/extensions/feishu-files.js";

const tmpDirs: string[] = [];

async function createTempWorkspace(): Promise<string> {
  const workspace = await mkdtemp(join(tmpdir(), "pi-gateway-files-"));
  tmpDirs.push(workspace);
  return workspace;
}

async function createWorkspaceFile(relativePath: string, contents = "file-data") {
  const workspace = await createTempWorkspace();
  const filePath = join(workspace, relativePath);
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, contents);
  return { workspace, filePath: await realpath(filePath) };
}

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
  afterEach(async () => {
    await Promise.all(tmpDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
  });

  it("会注册发送飞书图片和文件工具", () => {
    const { tools } = collectTools();

    expect(tools.map((tool) => tool.name)).toEqual(["feishu_image_send", "feishu_file_send"]);
  });

  it("图片工具会把本地图片发成可直接查看的飞书图片", async () => {
    const { tools, messenger } = collectTools();
    const sendTool = tools.find((tool) => tool.name === "feishu_image_send");
    const { workspace, filePath } = await createWorkspaceFile("exports/preview.png");

    const result = await sendTool.execute(
      "call-1",
      { path: "exports/preview.png" },
      undefined,
      undefined,
      createToolContext(workspace),
    );

    expect(messenger.sendLocalImageMessage).toHaveBeenCalledWith("ou_1", {
      path: filePath,
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
    const { workspace, filePath } = await createWorkspaceFile("exports/report.txt");

    const prepared = sendTool.prepareArguments({
      path: "exports/report.txt",
      fileName: "日报.txt",
    });
    await sendTool.execute(
      "call-1",
      prepared,
      undefined,
      undefined,
      createToolContext(workspace),
    );

    expect(messenger.sendLocalFileMessage).toHaveBeenCalledWith("ou_1", {
      path: filePath,
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
    const { workspace, filePath } = await createWorkspaceFile("exports/report.txt");

    const result = await sendTool.execute(
      "call-1",
      { path: "exports/report.txt" },
      undefined,
      undefined,
      createToolContext(workspace),
    );

    expect(messenger.sendLocalFileMessage).toHaveBeenCalledWith(target, {
      path: filePath,
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
    const { workspace, filePath } = await createWorkspaceFile("exports/chart.webp");

    const result = await sendTool.execute(
      "call-1",
      { path: "exports/chart.webp" },
      undefined,
      undefined,
      createToolContext(workspace),
    );

    expect(messenger.sendLocalImageMessage).toHaveBeenCalledWith("ou_1", {
      path: filePath,
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
    const workspace = await createTempWorkspace();

    await expect(
      sendTool.execute(
        "call-1",
        { path: "../secret.txt" },
        undefined,
        undefined,
        createToolContext(workspace),
      ),
    ).rejects.toThrow("只能发送当前 workspace 里的文件");
    expect(messenger.sendLocalFileMessage).not.toHaveBeenCalled();
    expect(messenger.sendLocalImageMessage).not.toHaveBeenCalled();
  });

  it("workspace 内指向外部文件的符号链接会被拦住", async () => {
    const { tools, messenger } = collectTools();
    const sendTool = tools.find((tool) => tool.name === "feishu_file_send");
    const workspace = await createTempWorkspace();
    const outside = await createWorkspaceFile("secret.txt", "secret");
    const linkPath = join(workspace, "exports/secret.txt");
    await mkdir(dirname(linkPath), { recursive: true });
    await symlink(outside.filePath, linkPath);

    await expect(
      sendTool.execute(
        "call-1",
        { path: "exports/secret.txt" },
        undefined,
        undefined,
        createToolContext(workspace),
      ),
    ).rejects.toThrow("符号链接不能指向工作目录外");
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
