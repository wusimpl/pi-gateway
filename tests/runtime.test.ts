import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const loaderInstances: Array<{ options: Record<string, unknown>; reload: ReturnType<typeof vi.fn> }> = [];

  return {
    loaderInstances,
    authStorage: { tag: "auth-storage" },
    modelRegistry: { tag: "model-registry" },
    sessionManager: { tag: "session-manager" },
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
    open: vi.fn(() => mocks.sessionManager),
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
      extensionFactories: [extensionFactory],
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
});
