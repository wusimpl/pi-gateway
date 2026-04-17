import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getResource: vi.fn(),
}));

vi.mock("../src/feishu/client.js", () => ({
  getLarkClient: () => ({
    im: {
      messageResource: {
        get: mocks.getResource,
      },
    },
  }),
}));

import {
  createFeishuResourceDownloader,
  downloadFeishuResource,
  getFeishuInboxDir,
  resolveDownloadType,
} from "../src/feishu/inbound/resource.js";

describe("downloadFeishuResource", () => {
  const tempDirs: string[] = [];

  beforeEach(() => {
    mocks.getResource.mockReset();
  });

  afterEach(async () => {
    await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
  });

  it("图片资源应使用 image 下载类型并写入消息目录", async () => {
    const workspaceDir = await mkdtemp(join(tmpdir(), "pi-gateway-image-"));
    tempDirs.push(workspaceDir);
    mocks.getResource.mockResolvedValue({
      headers: { "Content-Type": "image/png" },
      writeFile: async (filePath: string) => {
        await writeFile(filePath, "image-binary");
      },
    });

    const result = await downloadFeishuResource({
      workspaceDir,
      messageId: "om:1",
      fileKey: "img_123",
      resourceType: "image",
    });

    expect(mocks.getResource).toHaveBeenCalledWith({
      params: { type: "image" },
      path: { message_id: "om:1", file_key: "img_123" },
    });
    expect(result.filePath.replace(/\\/g, "/")).toContain(".feishu-inbox/om_1/");
    expect(result.fileName.endsWith(".png")).toBe(true);
    expect(await readFile(result.filePath, "utf8")).toBe("image-binary");
  });

  it("语音资源应使用 file 下载类型并优先采用响应里的文件名", async () => {
    const workspaceDir = await mkdtemp(join(tmpdir(), "pi-gateway-audio-"));
    tempDirs.push(workspaceDir);
    mocks.getResource.mockResolvedValue({
      headers: {
        "content-type": "audio/mp4; charset=binary",
        "content-disposition": "attachment; filename*=UTF-8''voice%20note.m4a",
      },
      writeFile: async (filePath: string) => {
        await writeFile(filePath, "audio-binary");
      },
    });

    const result = await downloadFeishuResource({
      workspaceDir,
      messageId: "om_2",
      fileKey: "file_123",
      resourceType: "audio",
    });

    expect(mocks.getResource).toHaveBeenCalledWith({
      params: { type: "file" },
      path: { message_id: "om_2", file_key: "file_123" },
    });
    expect(result.fileName).toBe("voice_note.m4a");
    expect(result.mimeType).toBe("audio/mp4");
    expect(await readFile(result.filePath, "utf8")).toBe("audio-binary");
  });

  it("普通文件资源应使用 file 下载类型并优先采用消息里的文件名", async () => {
    const workspaceDir = await mkdtemp(join(tmpdir(), "pi-gateway-file-"));
    tempDirs.push(workspaceDir);
    mocks.getResource.mockResolvedValue({
      headers: { "content-type": "application/pdf" },
      writeFile: async (filePath: string) => {
        await writeFile(filePath, "file-binary");
      },
    });

    const result = await downloadFeishuResource({
      workspaceDir,
      messageId: "om_file_1",
      fileKey: "file_v2_123",
      resourceType: "file",
      fileNameHint: "report.pdf",
    });

    expect(mocks.getResource).toHaveBeenCalledWith({
      params: { type: "file" },
      path: { message_id: "om_file_1", file_key: "file_v2_123" },
    });
    expect(result.fileName).toBe("report.pdf");
    expect(result.mimeType).toBe("application/pdf");
    expect(await readFile(result.filePath, "utf8")).toBe("file-binary");
  });

  it("显式资源下载器应优先使用传入的 client", async () => {
    const workspaceDir = await mkdtemp(join(tmpdir(), "pi-gateway-explicit-"));
    tempDirs.push(workspaceDir);
    const explicitGetResource = vi.fn().mockResolvedValue({
      headers: { "content-type": "audio/ogg" },
      writeFile: async (filePath: string) => {
        await writeFile(filePath, "explicit-audio");
      },
    });
    const downloadWithExplicitClient = createFeishuResourceDownloader({
      im: {
        messageResource: {
          get: explicitGetResource,
        },
      },
    });

    const result = await downloadWithExplicitClient({
      workspaceDir,
      messageId: "om_3",
      fileKey: "file_explicit",
      resourceType: "audio",
    });

    expect(explicitGetResource).toHaveBeenCalledWith({
      params: { type: "file" },
      path: { message_id: "om_3", file_key: "file_explicit" },
    });
    expect(mocks.getResource).not.toHaveBeenCalled();
    expect(await readFile(result.filePath, "utf8")).toBe("explicit-audio");
  });
});

describe("resource helper", () => {
  it("应生成消息专属 inbox 目录", () => {
    expect(getFeishuInboxDir("/tmp/workspace", "om:1")).toBe("/tmp/workspace/.feishu-inbox/om_1");
  });

  it("应把资源类型映射成飞书下载类型", () => {
    expect(resolveDownloadType("image")).toBe("image");
    expect(resolveDownloadType("audio")).toBe("file");
    expect(resolveDownloadType("file")).toBe("file");
  });
});
