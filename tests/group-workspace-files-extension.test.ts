import { mkdir, mkdtemp, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  createGroupWorkspaceFilesExtension,
  isGroupWorkspacePathAllowed,
} from "../src/pi/extensions/group-workspace-files.js";
import { bindWorkspaceIdentity, clearWorkspaceIdentities } from "../src/pi/workspace-identity.js";

const tmpDirs: string[] = [];

async function createTempDir(prefix: string): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), prefix));
  tmpDirs.push(dir);
  return dir;
}

function createGroupTarget() {
  return {
    kind: "group" as const,
    key: "oc_1",
    receiveIdType: "chat_id" as const,
    receiveId: "oc_1",
    chatId: "oc_1",
  };
}

function getToolCallHandler() {
  const handlers = new Map<string, Function>();
  createGroupWorkspaceFilesExtension()({
    on(event: string, handler: Function) {
      handlers.set(event, handler);
    },
  } as any);
  return handlers.get("tool_call")!;
}

function createContext(cwd: string) {
  return { cwd, sessionManager: {} };
}

describe("group workspace files extension", () => {
  afterEach(async () => {
    clearWorkspaceIdentities();
    await Promise.all(tmpDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
  });

  it("允许读写当前群聊工作空间内的文件", async () => {
    const workspace = await createTempDir("pi-gateway-group-workspace-");
    await mkdir(join(workspace, "notes"));
    await writeFile(join(workspace, "notes", "plan.md"), "plan");

    await expect(isGroupWorkspacePathAllowed(workspace, "notes/plan.md", "read")).resolves.toBe(true);
    await expect(isGroupWorkspacePathAllowed(workspace, "notes/todo.md", "write")).resolves.toBe(true);
  });

  it("拒绝绝对路径和上级目录逃逸", async () => {
    const workspace = await createTempDir("pi-gateway-group-workspace-");
    const outside = await createTempDir("pi-gateway-outside-");
    await writeFile(join(outside, "secret.txt"), "secret");

    await expect(isGroupWorkspacePathAllowed(workspace, "../secret.txt", "read")).resolves.toBe(false);
    await expect(isGroupWorkspacePathAllowed(workspace, join(outside, "secret.txt"), "read")).resolves.toBe(false);
    await expect(isGroupWorkspacePathAllowed(workspace, "../new.txt", "write")).resolves.toBe(false);
  });

  it("拒绝经符号链接访问工作空间外文件", async () => {
    const workspace = await createTempDir("pi-gateway-group-workspace-");
    const outside = await createTempDir("pi-gateway-outside-");
    await writeFile(join(outside, "secret.txt"), "secret");
    await symlink(outside, join(workspace, "outside"));

    await expect(isGroupWorkspacePathAllowed(workspace, "outside/secret.txt", "read")).resolves.toBe(false);
    await expect(isGroupWorkspacePathAllowed(workspace, "outside/new.txt", "write")).resolves.toBe(false);
  });

  // TEMP: 与工作空间范围限制一并恢复时，去掉 .skip 重新启用以下检查。
  it.skip("只在群聊中拦截越界的文件工具和非 rm 的 bash 命令", async () => {
    const workspace = await createTempDir("pi-gateway-group-workspace-");
    bindWorkspaceIdentity(workspace, { openId: "ou_1" }, createGroupTarget());
    const handler = getToolCallHandler();

    await expect(handler(
      { toolName: "write", input: { path: "notes/todo.md" } },
      createContext(workspace),
    )).resolves.toBeUndefined();
    await expect(handler(
      { toolName: "read", input: { path: "../secret.txt" } },
      createContext(workspace),
    )).resolves.toEqual({
      block: true,
      reason: "文件工具只能访问当前会话工作空间。",
    });
    await expect(handler(
      { toolName: "bash", input: { command: "pwd" } },
      createContext(workspace),
    )).resolves.toEqual({
      block: true,
      reason: "bash 仅允许在当前会话工作空间内执行 rm 或 python 脚本。",
    });
  });

  it("允许在当前会话工作空间内执行 rm", async () => {
    const workspace = await createTempDir("pi-gateway-rm-workspace-");
    await mkdir(join(workspace, "exports"));
    await writeFile(join(workspace, "exports", "report.txt"), "report");
    bindWorkspaceIdentity(workspace, { openId: "ou_1" }, createGroupTarget());
    const handler = getToolCallHandler();

    await expect(handler(
      { toolName: "bash", input: { command: "rm -rf exports" } },
      createContext(workspace),
    )).resolves.toBeUndefined();
    await expect(handler(
      { toolName: "bash", input: { command: "rm exports/report.txt" } },
      createContext(workspace),
    )).resolves.toBeUndefined();
  });

  it.skip("拒绝 rm 越界、删除 workspace 根目录或混入 shell 语法", async () => {
    const workspace = await createTempDir("pi-gateway-rm-workspace-");
    const outside = await createTempDir("pi-gateway-rm-outside-");
    await mkdir(join(workspace, "exports"));
    await writeFile(join(outside, "secret.txt"), "secret");
    await symlink(outside, join(workspace, "outside"));
    bindWorkspaceIdentity(workspace, { openId: "ou_1" }, createGroupTarget());
    const handler = getToolCallHandler();

    for (const command of [
      "rm ../secret.txt",
      `rm ${join(outside, "secret.txt")}`,
      "rm .",
      "rm outside/secret.txt",
      "rm exports/*",
      "rm exports && touch escaped.txt",
      "rm -rf /",
    ]) {
      await expect(handler(
        { toolName: "bash", input: { command } },
        createContext(workspace),
      )).resolves.toEqual({
        block: true,
        reason: "bash 仅允许在当前会话工作空间内执行 rm 或 python 脚本。",
      });
    }
  });

  it("允许执行当前会话工作空间内的 Python 脚本", async () => {
    const workspace = await createTempDir("pi-gateway-python-workspace-");
    await writeFile(join(workspace, "clean.py"), "print('clean')");
    bindWorkspaceIdentity(workspace, { openId: "ou_1" });
    const handler = getToolCallHandler();

    await expect(handler(
      { toolName: "bash", input: { command: "python clean.py" } },
      createContext(workspace),
    )).resolves.toBeUndefined();
    await expect(handler(
      { toolName: "bash", input: { command: "python3 clean.py --dry-run" } },
      createContext(workspace),
    )).resolves.toBeUndefined();
  });

  it.skip("拒绝 Python 的 workspace 外脚本及内联执行", async () => {
    const workspace = await createTempDir("pi-gateway-python-workspace-");
    const outside = await createTempDir("pi-gateway-python-outside-");
    await writeFile(join(workspace, "clean.py"), "print('clean')");
    await writeFile(join(outside, "outside.py"), "print('outside')");
    bindWorkspaceIdentity(workspace, { openId: "ou_1" });
    const handler = getToolCallHandler();

    for (const command of [
      `python ${join(outside, "outside.py")}`,
      "python ../outside.py",
      "python -c print(1)",
      "python -m http.server",
      "python clean.py ../outside",
    ]) {
      await expect(handler(
        { toolName: "bash", input: { command } },
        createContext(workspace),
      )).resolves.toEqual({
        block: true,
        reason: "bash 仅允许在当前会话工作空间内执行 rm 或 python 脚本。",
      });
    }
  });

  it.skip("私聊同样限制在自己的工作空间内", async () => {
    const workspace = await createTempDir("pi-gateway-p2p-workspace-");
    bindWorkspaceIdentity(workspace, { openId: "ou_1" });
    const handler = getToolCallHandler();

    await expect(handler(
      { toolName: "write", input: { path: "notes/todo.md" } },
      createContext(workspace),
    )).resolves.toBeUndefined();
    await expect(handler(
      { toolName: "read", input: { path: "/tmp/anywhere" } },
      createContext(workspace),
    )).resolves.toEqual({
      block: true,
      reason: "文件工具只能访问当前会话工作空间。",
    });
  });

  it("临时关闭后，群聊可读取工作空间外文件并执行命令", async () => {
    const workspace = await createTempDir("pi-gateway-temporary-unrestricted-");
    bindWorkspaceIdentity(workspace, { openId: "ou_1" }, createGroupTarget());
    const handler = getToolCallHandler();

    await expect(handler(
      { toolName: "read", input: { path: "/tmp/anywhere" } },
      createContext(workspace),
    )).resolves.toBeUndefined();
    await expect(handler(
      { toolName: "bash", input: { command: "pwd" } },
      createContext(workspace),
    )).resolves.toBeUndefined();
  });
});
