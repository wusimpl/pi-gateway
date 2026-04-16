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
    deps.runtime.createPiSession
      .mockResolvedValueOnce({
        sessionId: "pi-session-1",
        sessionFile: "/tmp/sessions/ou_1/session.json",
        dispose,
      })
      .mockResolvedValueOnce({
        sessionId: "pi-session-2",
        sessionFile: "/tmp/sessions/ou_1/session-2.json",
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

  it("创建新会话时应直接使用 Pi sessionId 作为 activeSessionId", async () => {
    const deps = createDeps();
    deps.runtime.createPiSession.mockResolvedValue({
      sessionId: "pi-session-123",
      sessionFile: "/tmp/sessions/ou_1/session.json",
      dispose: vi.fn(),
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
    const result = await service.createNewSession({ openId: "ou_1", userId: "u_1" });

    expect(result.activeSessionId).toBe("pi-session-123");
    expect(deps.userStateStore.createUserState).toHaveBeenCalledWith("ou_1", "pi-session-123");
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
        cwd: "/tmp/workspace/ou_1",
        name: "这个项目",
        created: new Date("2026-04-15T00:00:00.000Z"),
        modified: new Date("2026-04-15T00:30:00.000Z"),
        messageCount: 2,
        firstMessage: "这个项目",
      },
      {
        id: "session_1",
        path: "/tmp/sessions/ou_1/session_1.jsonl",
        cwd: "/tmp/workspace/ou_1",
        created: new Date("2026-04-14T00:00:00.000Z"),
        modified: new Date("2026-04-14T00:30:00.000Z"),
        messageCount: 4,
        firstMessage: "hello!",
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
        cwd: "/tmp/workspace/ou_1",
        name: "这个项目",
        firstMessage: "这个项目",
        messageCount: 2,
        createdAt: "2026-04-15T00:00:00.000Z",
        updatedAt: "2026-04-15T00:30:00.000Z",
      },
      {
        order: 2,
        sessionId: "session_1",
        sessionFile: "/tmp/sessions/ou_1/session_1.jsonl",
        isActive: false,
        cwd: "/tmp/workspace/ou_1",
        firstMessage: "hello!",
        messageCount: 4,
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
        messageCount: 2,
        firstMessage: "session 2",
      },
      {
        id: "session_1",
        path: "/tmp/sessions/ou_1/session_1.jsonl",
        created: new Date("2026-04-14T00:00:00.000Z"),
        modified: new Date("2026-04-14T00:30:00.000Z"),
        messageCount: 1,
        firstMessage: "session 1",
      },
    ]);
    deps.runtime.openPiSession.mockResolvedValue({
      sessionId: "session_2",
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
        messageCount: 1,
        firstMessage: "session",
      },
    ]);
    deps.runtime.openPiSession.mockResolvedValue({
      sessionId: "abc123xyz",
      sessionFile: "/tmp/sessions/ou_1/abc123xyz.jsonl",
      dispose: vi.fn(),
    });

    const service = createSessionService(deps as any);
    const result = await service.resumeSession({ openId: "ou_1", userId: "u_1" }, "abc123");

    expect(result.activeSessionId).toBe("abc123xyz");
    expect(deps.runtime.openPiSession).toHaveBeenCalledTimes(1);
  });

  it("从指定文件恢复时应把旧 activeSessionId 对齐到真实 sessionId", async () => {
    const deps = createDeps();
    deps.userStateStore.readUserState.mockResolvedValue({
      openId: "ou_1",
      activeSessionId: "legacy-session-id",
      piSessionFile: "/tmp/sessions/ou_1/session.jsonl",
      createdAt: "2026-04-15T00:00:00.000Z",
      updatedAt: "2026-04-15T00:00:00.000Z",
      lastActiveAt: "2026-04-15T00:00:00.000Z",
      lastMessageId: undefined,
    });
    deps.runtime.openPiSession.mockResolvedValue({
      sessionId: "pi-session-789",
      sessionFile: "/tmp/sessions/ou_1/session.jsonl",
      dispose: vi.fn(),
    });

    const service = createSessionService(deps as any);
    const result = await service.getOrCreateActiveSession({ openId: "ou_1", userId: "u_1" });

    expect(result.activeSessionId).toBe("pi-session-789");
    expect(deps.userStateStore.writeUserState).toHaveBeenCalledWith(
      "ou_1",
      expect.objectContaining({
        activeSessionId: "pi-session-789",
        piSessionFile: "/tmp/sessions/ou_1/session.jsonl",
      }),
    );
  });
});
