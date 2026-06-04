import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  createWorkspaceService,
  setWorkspaceRoot,
  getWorkspaceRoot,
  getUserWorkspaceDir,
  getConversationWorkspaceDir,
} from "../src/pi/workspace.js";

const DEFAULT_AGENTS_CONTENT = "# 此文件为项目级别规则文件 请将用户的偏好习惯等默认写入到此文件\n";
const groupTarget = {
  kind: "group" as const,
  key: "oc:test/group",
  receiveIdType: "chat_id" as const,
  receiveId: "oc:test/group",
  chatId: "oc:test/group",
};

describe("workspace 路径", () => {
  const tempDirs: string[] = [];

  beforeEach(() => {
    setWorkspaceRoot(join(import.meta.dirname, "__workspace_root__"));
  });

  afterEach(async () => {
    await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
  });

  it("优先使用 userId 作为目录名", () => {
    const dir = getUserWorkspaceDir({ openId: "ou_test", userId: "cli_user_123" });
    expect(dir).toContain("cli_user_123");
  });

  it("userId 缺失时回退到 openId", () => {
    const dir = getUserWorkspaceDir({ openId: "ou_test_only" });
    expect(dir).toContain("ou_test_only");
  });

  it("应返回当前配置的 workspace 根目录", () => {
    expect(getWorkspaceRoot()).toContain("__workspace_root__");
  });

  it("应清洗非法目录字符", () => {
    const dir = getUserWorkspaceDir({ openId: "ou:test/user" });
    expect(dir).toContain("ou_test_user");
  });

  it("群聊 workspace 应按群会话目标隔离", () => {
    const dir = getConversationWorkspaceDir(
      { openId: "ou_1", userId: "u_1" },
      groupTarget,
    );

    expect(dir).toContain(join("conversations", "oc_test_group"));
  });

  it("创建用户 workspace 时应自动创建项目级规则文件", async () => {
    const root = await mkdtemp(join(tmpdir(), "pi-gateway-workspace-"));
    tempDirs.push(root);
    const service = createWorkspaceService(root);

    const dir = await service.ensureUserWorkspace({ openId: "ou_test" });

    await expect(readFile(join(dir, "AGENTS.md"), "utf-8")).resolves.toBe(DEFAULT_AGENTS_CONTENT);
  });

  it("创建群聊 workspace 时应自动创建项目级规则文件", async () => {
    const root = await mkdtemp(join(tmpdir(), "pi-gateway-workspace-"));
    tempDirs.push(root);
    const service = createWorkspaceService(root);

    const dir = await service.ensureConversationWorkspace({ openId: "ou_1", userId: "u_1" }, groupTarget);

    await expect(readFile(join(dir, "AGENTS.md"), "utf-8")).resolves.toBe(DEFAULT_AGENTS_CONTENT);
  });

  it("已有项目级规则文件时不应覆盖", async () => {
    const root = await mkdtemp(join(tmpdir(), "pi-gateway-workspace-"));
    tempDirs.push(root);
    const service = createWorkspaceService(root);
    const dir = service.getUserWorkspaceDir({ openId: "ou_test" });
    const customContent = "# 自定义规则\n";
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, "AGENTS.md"), customContent, "utf-8");

    await service.ensureUserWorkspace({ openId: "ou_test" });

    await expect(readFile(join(dir, "AGENTS.md"), "utf-8")).resolves.toBe(customContent);
  });
});
