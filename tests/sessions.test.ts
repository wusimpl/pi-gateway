import { beforeEach, describe, expect, it, vi } from "vitest";
import { createSessionService } from "../src/pi/sessions.js";
import { clearWorkspaceIdentities, getWorkspaceIdentity } from "../src/pi/workspace-identity.js";

function createDeps() {
  const runtime = {
    createPiSession: vi.fn(),
    continueRecentPiSession: vi.fn(),
    openPiSession: vi.fn(),
    listPiSessions: vi.fn(),
  };
  const userStateStore = {
    readUserState: vi.fn().mockResolvedValue(null),
    writeUserState: vi.fn().mockResolvedValue(undefined),
    createUserState: vi.fn(),
    touchUserState: vi.fn().mockResolvedValue(undefined),
    userSessionsDir: vi.fn().mockReturnValue("/tmp/sessions/ou_1"),
  };
  const workspaceService = {
    ensureUserWorkspace: vi.fn().mockResolvedValue("/tmp/workspace/ou_1"),
  };

  return { runtime, userStateStore, workspaceService };
}

describe("session service", () => {
  beforeEach(() => {
    clearWorkspaceIdentities();
  });

  it("连续快速创建新会话时，sessionId 不应重复", async () => {
    const deps = createDeps();
    const dispose = vi.fn();
    deps.runtime.createPiSession.mockResolvedValue({
      sessionFile: "/tmp/sessions/ou_1/session.json",
      dispose,
    });
    deps.userStateStore.createUserState.mockImplementation(async (_openId: string, sessionId: string) => ({
      openId: "ou_1",
      activeSessionId: sessionId,
      createdAt: "2026-04-15T00:00:00.000Z",
      updatedAt: "2026-04-15T00:00:00.000Z",
      lastActiveAt: "2026-04-15T00:00:00.000Z",
      lastMessageId: undefined,
      piSessionFile: undefined,
    }));

    const service = createSessionService(deps as any);
    const identity = { openId: "ou_1", userId: "u_1" };

    const first = await service.createNewSession(identity);
    const second = await service.createNewSession(identity);

    expect(first.activeSessionId).not.toBe(second.activeSessionId);
    expect(deps.runtime.createPiSession).toHaveBeenCalledTimes(2);
    expect(dispose).toHaveBeenCalledTimes(1);
  });

  it("创建新会话时会把 workspace 绑定到当前用户 identity", async () => {
    const deps = createDeps();
    deps.runtime.createPiSession.mockResolvedValue({
      sessionFile: "/tmp/sessions/ou_1/session.json",
      dispose: vi.fn(),
    });
    deps.userStateStore.createUserState.mockImplementation(async (_openId: string, sessionId: string) => ({
      activeSessionId: sessionId,
      createdAt: "2026-04-15T00:00:00.000Z",
      updatedAt: "2026-04-15T00:00:00.000Z",
      lastActiveAt: "2026-04-15T00:00:00.000Z",
    }));

    const service = createSessionService(deps as any);
    const identity = { openId: "ou_1", userId: "u_1" };

    await service.createNewSession(identity);

    expect(getWorkspaceIdentity("/tmp/workspace/ou_1")).toEqual(identity);
  });

  it("应列出用户最近会话并标记当前会话", async () => {
    const deps = createDeps();
    deps.userStateStore.readUserState.mockResolvedValue({
      activeSessionId: "session_2",
      piSessionFile: "/tmp/sessions/ou_1/session_2.jsonl",
      createdAt: "2026-04-15T00:00:00.000Z",
      updatedAt: "2026-04-15T00:00:00.000Z",
      lastActiveAt: "2026-04-15T00:00:00.000Z",
    });
    deps.runtime.listPiSessions.mockResolvedValue([
      {
        id: "session_2",
        path: "/tmp/sessions/ou_1/session_2.jsonl",
        created: new Date("2026-04-15T00:00:00.000Z"),
        modified: new Date("2026-04-15T00:30:00.000Z"),
      },
      {
        id: "session_1",
        path: "/tmp/sessions/ou_1/session_1.jsonl",
        created: new Date("2026-04-14T00:00:00.000Z"),
        modified: new Date("2026-04-14T00:30:00.000Z"),
      },
    ]);

    const service = createSessionService(deps as any);

    const sessions = await service.listSessions({ openId: "ou_1", userId: "u_1" });

    expect(sessions).toEqual([
      {
        order: 1,
        sessionId: "session_2",
        sessionFile: "/tmp/sessions/ou_1/session_2.jsonl",
        isActive: true,
        createdAt: "2026-04-15T00:00:00.000Z",
        updatedAt: "2026-04-15T00:30:00.000Z",
      },
      {
        order: 2,
        sessionId: "session_1",
        sessionFile: "/tmp/sessions/ou_1/session_1.jsonl",
        isActive: false,
        createdAt: "2026-04-14T00:00:00.000Z",
        updatedAt: "2026-04-14T00:30:00.000Z",
      },
    ]);
  });

  it("应支持按序号恢复指定会话", async () => {
    const deps = createDeps();
    const dispose = vi.fn();
    deps.userStateStore.readUserState.mockResolvedValue({
      activeSessionId: "session_1",
      piSessionFile: "/tmp/sessions/ou_1/session_1.jsonl",
      createdAt: "2026-04-15T00:00:00.000Z",
      updatedAt: "2026-04-15T00:00:00.000Z",
      lastActiveAt: "2026-04-15T00:00:00.000Z",
    });
    deps.runtime.listPiSessions.mockResolvedValue([
      {
        id: "session_2",
        path: "/tmp/sessions/ou_1/session_2.jsonl",
        created: new Date("2026-04-15T00:00:00.000Z"),
        modified: new Date("2026-04-15T00:30:00.000Z"),
      },
      {
        id: "session_1",
        path: "/tmp/sessions/ou_1/session_1.jsonl",
        created: new Date("2026-04-14T00:00:00.000Z"),
        modified: new Date("2026-04-14T00:30:00.000Z"),
      },
    ]);
    deps.runtime.openPiSession.mockResolvedValue({
      sessionFile: "/tmp/sessions/ou_1/session_2.jsonl",
      model: { provider: "rightcodes", id: "gpt-5.4-high" },
      dispose: vi.fn(),
    });

    const service = createSessionService(deps as any);
    const result = await service.resumeSession({ openId: "ou_1", userId: "u_1" }, "1");

    expect(dispose).not.toHaveBeenCalled();
    expect(deps.runtime.openPiSession).toHaveBeenCalledWith(
      "/tmp/sessions/ou_1/session_2.jsonl",
      "/tmp/workspace/ou_1",
    );
    expect(deps.userStateStore.writeUserState).toHaveBeenCalledTimes(1);
    expect(result.activeSessionId).toBe("session_2");
  });

  it("应支持按 sessionId 前缀恢复指定会话", async () => {
    const deps = createDeps();
    deps.userStateStore.readUserState.mockResolvedValue({
      activeSessionId: "session_old",
      piSessionFile: "/tmp/sessions/ou_1/session_old.jsonl",
      createdAt: "2026-04-15T00:00:00.000Z",
      updatedAt: "2026-04-15T00:00:00.000Z",
      lastActiveAt: "2026-04-15T00:00:00.000Z",
    });
    deps.runtime.listPiSessions.mockResolvedValue([
      {
        id: "abc123xyz",
        path: "/tmp/sessions/ou_1/abc123xyz.jsonl",
        created: new Date("2026-04-15T00:00:00.000Z"),
        modified: new Date("2026-04-15T00:30:00.000Z"),
      },
    ]);
    deps.runtime.openPiSession.mockResolvedValue({
      sessionFile: "/tmp/sessions/ou_1/abc123xyz.jsonl",
      dispose: vi.fn(),
    });

    const service = createSessionService(deps as any);
    const result = await service.resumeSession({ openId: "ou_1", userId: "u_1" }, "abc123");

    expect(result.activeSessionId).toBe("abc123xyz");
    expect(deps.runtime.openPiSession).toHaveBeenCalledTimes(1);
  });
});
