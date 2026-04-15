import { beforeEach, describe, expect, it, vi } from "vitest";
import { createSessionService } from "../src/pi/sessions.js";
import { clearWorkspaceIdentities, getWorkspaceIdentity } from "../src/pi/workspace-identity.js";

function createDeps() {
  const runtime = {
    createPiSession: vi.fn(),
    continueRecentPiSession: vi.fn(),
    openPiSession: vi.fn(),
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
});
