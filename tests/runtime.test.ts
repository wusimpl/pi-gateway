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
    expect(mocks.loaderInstances[0]?.options).toEqual({
      cwd: "/tmp/workspace/ou_1",
      agentDir: "/Users/test/.pi/agent",
      extensionFactories: [extensionFactory],
      agentsFilesOverride: undefined,
    });
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
