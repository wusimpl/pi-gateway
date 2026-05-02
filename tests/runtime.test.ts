import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const loaderInstances: Array<{ options: Record<string, unknown>; reload: ReturnType<typeof vi.fn> }> = [];

  return {
    loaderInstances,
    authStorage: { tag: "auth-storage" },
    modelRegistry: { tag: "model-registry" },
    sessionManager: { tag: "session-manager" },
    sessionManagerOpen: vi.fn(),
    getAgentDir: vi.fn(() => "/Users/test/.pi/agent"),
    loaderReload: vi.fn().mockResolvedValue(undefined),
    createAgentSession: vi.fn().mockResolvedValue({
      session: {
        sessionId: "session-1",
        sessionFile: "/tmp/session-1.json",
      },
    }),
    logger: {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
    },
  };
});

vi.mock("@mariozechner/pi-coding-agent", () => ({
  AuthStorage: {
    create: vi.fn(() => mocks.authStorage),
  },
  ModelRegistry: {
    create: vi.fn(() => mocks.modelRegistry),
  },
  SessionManager: {
    create: vi.fn(() => mocks.sessionManager),
    continueRecent: vi.fn(() => mocks.sessionManager),
    open: vi.fn((...args: unknown[]) => {
      mocks.sessionManagerOpen(...args);
      return mocks.sessionManager;
    }),
  },
  DefaultResourceLoader: vi.fn(function DefaultResourceLoader(options: Record<string, unknown>) {
    const instance = {
      options,
      reload: mocks.loaderReload,
    };
    mocks.loaderInstances.push(instance);
    return instance;
  }),
  createAgentSession: mocks.createAgentSession,
  getAgentDir: mocks.getAgentDir,
}));

vi.mock("../src/app/logger.js", () => ({
  logger: mocks.logger,
}));

import { createPiRuntime } from "../src/pi/runtime.js";

describe("pi runtime", () => {
  beforeEach(() => {
    mocks.loaderInstances.length = 0;
    mocks.loaderReload.mockClear();
    mocks.createAgentSession.mockClear();
    mocks.sessionManagerOpen.mockClear();
    mocks.getAgentDir.mockClear();
    mocks.logger.info.mockClear();
    mocks.logger.warn.mockClear();
    mocks.logger.error.mockClear();
    mocks.logger.debug.mockClear();
  });

  it("创建 session 时会先构造 resource loader，再把 extension factory 传进去", async () => {
    const extensionFactory = vi.fn();
    const runtime = createPiRuntime({
      extensionFactories: [extensionFactory],
    });

    const session = await runtime.createPiSession("/tmp/workspace/ou_1", "/tmp/sessions/ou_1");

    expect(mocks.loaderInstances).toHaveLength(1);
    expect(mocks.loaderInstances[0]?.options).toMatchObject({
      cwd: "/tmp/workspace/ou_1",
      agentDir: "/Users/test/.pi/agent",
      agentsFilesOverride: undefined,
    });
    expect(mocks.loaderInstances[0]?.options.extensionFactories).toEqual(
      expect.arrayContaining([extensionFactory]),
    );
    expect((mocks.loaderInstances[0]?.options.extensionFactories as unknown[]) ?? []).toHaveLength(2);
    expect(mocks.loaderReload).toHaveBeenCalledTimes(1);
    expect(mocks.createAgentSession).toHaveBeenCalledWith({
      cwd: "/tmp/workspace/ou_1",
      sessionManager: mocks.sessionManager,
      authStorage: mocks.authStorage,
      modelRegistry: mocks.modelRegistry,
      resourceLoader: mocks.loaderInstances[0],
    });
    expect(session).toMatchObject({
      sessionId: "session-1",
      sessionFile: "/tmp/session-1.json",
    });
  });

  it("开启 disableGlobalAgents 时会过滤全局 AGENTS.md 和 CLAUDE.md", async () => {
    const runtime = createPiRuntime({
      disableGlobalAgents: true,
    });

    await runtime.createPiSession("/tmp/workspace/ou_1", "/tmp/sessions/ou_1");

    const agentsFilesOverride = mocks.loaderInstances[0]?.options.agentsFilesOverride as
      | ((base: { agentsFiles: Array<{ path: string; content: string }> }) => { agentsFiles: Array<{ path: string; content: string }> })
      | undefined;

    expect(agentsFilesOverride).toBeTypeOf("function");
    expect(
      agentsFilesOverride?.({
        agentsFiles: [
          { path: "/Users/test/.pi/agent/AGENTS.md", content: "global agents" },
          { path: "/Users/test/.pi/agent/CLAUDE.md", content: "global claude" },
          { path: "/tmp/workspace/AGENTS.md", content: "project agents" },
        ],
      }).agentsFiles,
    ).toEqual([
      { path: "/tmp/workspace/AGENTS.md", content: "project agents" },
    ]);
  });

  it("默认会过滤 ~/.agents/skills 目录下的 skill", async () => {
    const runtime = createPiRuntime();

    await runtime.createPiSession("/tmp/workspace/ou_1", "/tmp/sessions/ou_1");

    const skillsOverride = mocks.loaderInstances[0]?.options.skillsOverride as
      | ((base: {
        skills: Array<{ filePath: string }>;
        diagnostics: Array<{ type: "warning" | "error" | "collision"; message: string; path?: string }>;
      }) => {
        skills: Array<{ filePath: string }>;
        diagnostics: Array<{ type: "warning" | "error" | "collision"; message: string; path?: string }>;
      })
      | undefined;
    const homeDir = process.env.HOME ?? "/Users/test";

    expect(skillsOverride).toBeTypeOf("function");
    expect(
      skillsOverride?.({
        skills: [
          { filePath: `${homeDir}/.agents/skills/exa-search/SKILL.md` },
          { filePath: `${homeDir}/.pi/agent/skills/feishu-docs/SKILL.md` },
          { filePath: "/tmp/workspace/.agents/skills/local/SKILL.md" },
        ],
        diagnostics: [
          { type: "warning", message: "blocked", path: `${homeDir}/.agents/skills/bad/SKILL.md` },
          { type: "warning", message: "kept", path: `${homeDir}/.pi/agent/skills/bad/SKILL.md` },
        ],
      }).skills,
    ).toEqual([
      { filePath: `${homeDir}/.pi/agent/skills/feishu-docs/SKILL.md` },
      { filePath: "/tmp/workspace/.agents/skills/local/SKILL.md" },
    ]);
  });

  it("开启 loadGlobalAgentsSkills 时保留 Pi 默认 skill 加载结果", async () => {
    const runtime = createPiRuntime();

    await runtime.createPiSession(
      "/tmp/workspace/ou_1",
      "/tmp/sessions/ou_1",
      undefined,
      { loadGlobalAgentsSkills: true },
    );

    expect(mocks.loaderInstances[0]?.options.skillsOverride).toBeUndefined();
  });

  it("会把飞书网关专属 AGENTS.md 插入到全局和项目规则之间", async () => {
    const dir = await mkdtemp(join(tmpdir(), "pi-gateway-agents-"));
    const gatewayAgentsFile = join(dir, "AGENTS.md");
    await writeFile(gatewayAgentsFile, "gateway agents", "utf-8");

    const runtime = createPiRuntime({
      gatewayAgentsFile,
    });

    await runtime.createPiSession("/tmp/workspace/ou_1", "/tmp/sessions/ou_1");

    const agentsFilesOverride = mocks.loaderInstances[0]?.options.agentsFilesOverride as
      | ((base: { agentsFiles: Array<{ path: string; content: string }> }) => { agentsFiles: Array<{ path: string; content: string }> })
      | undefined;

    expect(agentsFilesOverride).toBeTypeOf("function");
    expect(
      agentsFilesOverride?.({
        agentsFiles: [
          { path: "/Users/test/.pi/agent/AGENTS.md", content: "global agents" },
          { path: "/tmp/workspace/AGENTS.md", content: "project agents" },
        ],
      }).agentsFiles,
    ).toEqual([
      { path: "/Users/test/.pi/agent/AGENTS.md", content: "global agents" },
      { path: gatewayAgentsFile, content: "gateway agents" },
      { path: "/tmp/workspace/AGENTS.md", content: "project agents" },
    ]);
  });

  it("禁用全局 AGENTS 时仍会加载飞书网关专属 AGENTS.md", async () => {
    const dir = await mkdtemp(join(tmpdir(), "pi-gateway-agents-"));
    const gatewayAgentsFile = join(dir, "AGENTS.md");
    await writeFile(gatewayAgentsFile, "gateway agents", "utf-8");

    const runtime = createPiRuntime({
      disableGlobalAgents: true,
      gatewayAgentsFile,
    });

    await runtime.createPiSession("/tmp/workspace/ou_1", "/tmp/sessions/ou_1");

    const agentsFilesOverride = mocks.loaderInstances[0]?.options.agentsFilesOverride as
      | ((base: { agentsFiles: Array<{ path: string; content: string }> }) => { agentsFiles: Array<{ path: string; content: string }> })
      | undefined;

    expect(agentsFilesOverride).toBeTypeOf("function");
    expect(
      agentsFilesOverride?.({
        agentsFiles: [
          { path: "/Users/test/.pi/agent/AGENTS.md", content: "global agents" },
          { path: "/tmp/workspace/AGENTS.md", content: "project agents" },
        ],
      }).agentsFiles,
    ).toEqual([
      { path: gatewayAgentsFile, content: "gateway agents" },
      { path: "/tmp/workspace/AGENTS.md", content: "project agents" },
    ]);
  });

  it("打开历史 session 时应把当前 workspace cwd 传给 SessionManager.open", async () => {
    const runtime = createPiRuntime();

    await runtime.openPiSession("/tmp/sessions/ou_1/session.jsonl", "/tmp/workspace/new-ou_1");

    expect(mocks.sessionManagerOpen).toHaveBeenCalledWith(
      "/tmp/sessions/ou_1/session.jsonl",
      undefined,
      "/tmp/workspace/new-ou_1",
    );
  });
});
