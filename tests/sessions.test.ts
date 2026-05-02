import { beforeEach, describe, expect, it, vi } from "vitest";
import { createSessionService, getSessionDefaultToolNames } from "../src/pi/sessions.js";
import { clearWorkspaceIdentities, getWorkspaceIdentity } from "../src/pi/workspace-identity.js";

function createDeps() {
  const modelRegistry = {
    find: vi.fn((provider: string, id: string) => ({ provider, id })),
    hasConfiguredAuth: vi.fn(() => true),
  };
  const runtime = {
    createPiSession: vi.fn(),
    continueRecentPiSession: vi.fn(),
    openPiSession: vi.fn(),
    listPiSessions: vi.fn(),
    getModelRegistry: vi.fn(() => modelRegistry),
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
    ensureConversationWorkspace: vi.fn().mockResolvedValue("/tmp/workspace/conversations/oc_1"),
  };

  return { runtime, modelRegistry, userStateStore, workspaceService };
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

  it("为群目标创建 session 时使用 conversation 状态和 workspace", async () => {
    const deps = createDeps();
    const conversationStateStore = {
      readConversationState: vi.fn().mockResolvedValue(null),
      writeConversationState: vi.fn().mockResolvedValue(undefined),
      createConversationState: vi.fn().mockImplementation(async (_key: string, sessionId: string) => ({
        activeSessionId: sessionId,
        createdAt: "2026-04-15T00:00:00.000Z",
        updatedAt: "2026-04-15T00:00:00.000Z",
        lastActiveAt: "2026-04-15T00:00:00.000Z",
      })),
      touchConversationState: vi.fn().mockResolvedValue(undefined),
      conversationSessionsDir: vi.fn().mockReturnValue("/tmp/conversations/oc_1/sessions"),
    };
    deps.runtime.createPiSession.mockResolvedValue({
      sessionId: "pi-session-group",
      sessionFile: "/tmp/conversations/oc_1/sessions/session.jsonl",
      dispose: vi.fn(),
    });

    const service = createSessionService({
      ...deps,
      conversationStateStore,
    } as any);
    const identity = { openId: "ou_1", userId: "u_1" };
    const target = {
      kind: "group",
      key: "oc_1",
      receiveIdType: "chat_id",
      receiveId: "oc_1",
      chatId: "oc_1",
    } as const;

    const result = await service.createNewSessionForTarget(identity, target);

    expect(result.activeSessionId).toBe("pi-session-group");
    expect(conversationStateStore.createConversationState).toHaveBeenCalledWith("oc_1", "pi-session-group");
    expect(deps.userStateStore.createUserState).not.toHaveBeenCalled();
    expect(deps.runtime.createPiSession).toHaveBeenCalledWith(
      "/tmp/workspace/conversations/oc_1",
      "/tmp/conversations/oc_1/sessions",
      undefined,
    );
    expect(getWorkspaceIdentity("/tmp/workspace/conversations/oc_1")).toEqual(identity);
  });

  it("为群目标创建 session 时写入一次群聊说明", async () => {
    const deps = createDeps();
    const conversationStateStore = {
      readConversationState: vi.fn().mockResolvedValue(null),
      writeConversationState: vi.fn().mockResolvedValue(undefined),
      createConversationState: vi.fn().mockImplementation(async (_key: string, sessionId: string) => ({
        activeSessionId: sessionId,
        createdAt: "2026-04-15T00:00:00.000Z",
        updatedAt: "2026-04-15T00:00:00.000Z",
        lastActiveAt: "2026-04-15T00:00:00.000Z",
      })),
      touchConversationState: vi.fn().mockResolvedValue(undefined),
      conversationSessionsDir: vi.fn().mockReturnValue("/tmp/conversations/oc_1/sessions"),
    };
    const appendCustomMessageEntry = vi.fn();
    deps.runtime.createPiSession.mockResolvedValue({
      sessionId: "pi-session-group",
      sessionFile: "/tmp/conversations/oc_1/sessions/session.jsonl",
      sessionManager: {
        appendCustomMessageEntry,
        getBranch: vi.fn().mockReturnValue([]),
      },
      dispose: vi.fn(),
    });

    const service = createSessionService({
      ...deps,
      conversationStateStore,
    } as any);
    const identity = { openId: "ou_1", userId: "u_1" };
    const target = {
      kind: "group",
      key: "oc_1",
      receiveIdType: "chat_id",
      receiveId: "oc_1",
      chatId: "oc_1",
    } as const;

    await service.createNewSessionForTarget(identity, target);

    expect(appendCustomMessageEntry).toHaveBeenCalledTimes(1);
    expect(appendCustomMessageEntry).toHaveBeenCalledWith(
      "feishu-group-chat-context",
      expect.stringContaining("飞书群聊"),
      false,
      { scopeKind: "group" },
    );
  });

  it("创建新会话时应使用当前私聊保存的模型偏好", async () => {
    const deps = createDeps();
    deps.userStateStore.readUserState.mockResolvedValue({
      activeSessionId: "old-session",
      piSessionFile: "/tmp/sessions/ou_1/old.jsonl",
      createdAt: "2026-04-15T00:00:00.000Z",
      updatedAt: "2026-04-15T00:00:00.000Z",
      lastActiveAt: "2026-04-15T00:00:00.000Z",
      modelPreference: { provider: "cpa", id: "gpt-5.5" },
    });
    deps.runtime.createPiSession.mockResolvedValue({
      sessionId: "pi-session-new",
      sessionFile: "/tmp/sessions/ou_1/new.jsonl",
      model: { provider: "cpa", id: "gpt-5.5" },
      dispose: vi.fn(),
    });

    const service = createSessionService(deps as any);
    await service.createNewSession({ openId: "ou_1", userId: "u_1" });

    expect(deps.runtime.createPiSession).toHaveBeenCalledWith(
      "/tmp/workspace/ou_1",
      "/tmp/sessions/ou_1",
      { provider: "cpa", id: "gpt-5.5" },
    );
    expect(deps.userStateStore.writeUserState).toHaveBeenCalledWith(
      "ou_1",
      expect.objectContaining({ modelPreference: { provider: "cpa", id: "gpt-5.5" } }),
    );
  });

  it("创建新会话时应使用当前私聊保存的 skill 目录开关", async () => {
    const deps = createDeps();
    deps.userStateStore.readUserState.mockResolvedValue({
      activeSessionId: "old-session",
      createdAt: "2026-04-15T00:00:00.000Z",
      updatedAt: "2026-04-15T00:00:00.000Z",
      lastActiveAt: "2026-04-15T00:00:00.000Z",
      globalAgentsSkillsEnabled: true,
    });
    deps.runtime.createPiSession.mockResolvedValue({
      sessionId: "pi-session-new",
      sessionFile: "/tmp/sessions/ou_1/new.jsonl",
      dispose: vi.fn(),
    });

    const service = createSessionService(deps as any);
    await service.createNewSession({ openId: "ou_1", userId: "u_1" });

    expect(deps.runtime.createPiSession).toHaveBeenCalledWith(
      "/tmp/workspace/ou_1",
      "/tmp/sessions/ou_1",
      undefined,
      { loadGlobalAgentsSkills: true },
    );
  });

  it("创建新会话时应使用当前群聊保存的模型偏好", async () => {
    const deps = createDeps();
    const conversationStateStore = {
      readConversationState: vi.fn().mockResolvedValue({
        activeSessionId: "old-group-session",
        piSessionFile: "/tmp/conversations/oc_1/sessions/old.jsonl",
        createdAt: "2026-04-15T00:00:00.000Z",
        updatedAt: "2026-04-15T00:00:00.000Z",
        lastActiveAt: "2026-04-15T00:00:00.000Z",
        modelPreference: { provider: "rightcodes", id: "gpt-5.4-high" },
      }),
      writeConversationState: vi.fn().mockResolvedValue(undefined),
      createConversationState: vi.fn(),
      touchConversationState: vi.fn().mockResolvedValue(undefined),
      conversationSessionsDir: vi.fn().mockReturnValue("/tmp/conversations/oc_1/sessions"),
    };
    deps.runtime.createPiSession.mockResolvedValue({
      sessionId: "pi-session-group-new",
      sessionFile: "/tmp/conversations/oc_1/sessions/new.jsonl",
      model: { provider: "rightcodes", id: "gpt-5.4-high" },
      sessionManager: {
        appendCustomMessageEntry: vi.fn(),
        getBranch: vi.fn().mockReturnValue([]),
      },
      dispose: vi.fn(),
    });
    const service = createSessionService({
      ...deps,
      conversationStateStore,
    } as any);
    const target = {
      kind: "group",
      key: "oc_1",
      receiveIdType: "chat_id",
      receiveId: "oc_1",
      chatId: "oc_1",
    } as const;

    await service.createNewSessionForTarget({ openId: "ou_1", userId: "u_1" }, target);

    expect(deps.runtime.createPiSession).toHaveBeenCalledWith(
      "/tmp/workspace/conversations/oc_1",
      "/tmp/conversations/oc_1/sessions",
      { provider: "rightcodes", id: "gpt-5.4-high" },
    );
    expect(conversationStateStore.writeConversationState).toHaveBeenCalledWith(
      "oc_1",
      expect.objectContaining({ modelPreference: { provider: "rightcodes", id: "gpt-5.4-high" } }),
    );
  });

  it("创建新会话时如果模型偏好不可用，应退回 Pi 默认模型", async () => {
    const deps = createDeps();
    deps.modelRegistry.find.mockReturnValue(null);
    deps.userStateStore.readUserState.mockResolvedValue({
      activeSessionId: "old-session",
      createdAt: "2026-04-15T00:00:00.000Z",
      updatedAt: "2026-04-15T00:00:00.000Z",
      lastActiveAt: "2026-04-15T00:00:00.000Z",
      modelPreference: { provider: "missing", id: "model" },
    });
    deps.runtime.createPiSession.mockResolvedValue({
      sessionId: "pi-session-new",
      sessionFile: "/tmp/sessions/ou_1/new.jsonl",
      dispose: vi.fn(),
    });

    const service = createSessionService(deps as any);
    await service.createNewSession({ openId: "ou_1", userId: "u_1" });

    expect(deps.runtime.createPiSession).toHaveBeenCalledWith(
      "/tmp/workspace/ou_1",
      "/tmp/sessions/ou_1",
      undefined,
    );
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

  it("恢复 session 时应应用状态里按目标保存的 tools 选择", async () => {
    const deps = createDeps();
    const setActiveToolsByName = vi.fn();
    const session = {
      sessionId: "pi-session-789",
      sessionFile: "/tmp/sessions/ou_1/session.jsonl",
      getActiveToolNames: vi.fn().mockReturnValue(["read", "bash", "edit"]),
      getAllTools: vi.fn().mockReturnValue([
        { name: "read" },
        { name: "bash" },
        { name: "edit" },
        { name: "grep" },
      ]),
      setActiveToolsByName,
      sessionManager: {
        getBranch: vi.fn().mockReturnValue([]),
      },
      dispose: vi.fn(),
    };
    deps.userStateStore.readUserState.mockResolvedValue({
      openId: "ou_1",
      activeSessionId: "legacy-session-id",
      piSessionFile: "/tmp/sessions/ou_1/session.jsonl",
      createdAt: "2026-04-15T00:00:00.000Z",
      updatedAt: "2026-04-15T00:00:00.000Z",
      lastActiveAt: "2026-04-15T00:00:00.000Z",
      lastMessageId: undefined,
      enabledTools: ["read", "bash"],
    });
    deps.runtime.openPiSession.mockResolvedValue(session);

    const service = createSessionService(deps as any);
    const result = await service.getOrCreateActiveSession({ openId: "ou_1", userId: "u_1" });

    expect(result.activeSessionId).toBe("pi-session-789");
    expect(setActiveToolsByName).toHaveBeenCalledWith(["read", "bash"]);
    expect(getSessionDefaultToolNames(session as any)).toEqual(["read", "bash", "edit"]);
  });

  it("恢复 session 时不读取 session 文件里的旧 tools-config", async () => {
    const deps = createDeps();
    const setActiveToolsByName = vi.fn();
    const session = {
      sessionId: "pi-session-789",
      sessionFile: "/tmp/sessions/ou_1/session.jsonl",
      getActiveToolNames: vi.fn().mockReturnValue(["read", "bash", "edit"]),
      getAllTools: vi.fn().mockReturnValue([
        { name: "read" },
        { name: "bash" },
        { name: "edit" },
        { name: "grep" },
      ]),
      setActiveToolsByName,
      sessionManager: {
        getBranch: vi.fn().mockReturnValue([
          { type: "custom", customType: "tools-config", data: { enabledTools: ["read", "grep"] } },
        ]),
      },
      dispose: vi.fn(),
    };
    deps.userStateStore.readUserState.mockResolvedValue({
      openId: "ou_1",
      activeSessionId: "legacy-session-id",
      piSessionFile: "/tmp/sessions/ou_1/session.jsonl",
      createdAt: "2026-04-15T00:00:00.000Z",
      updatedAt: "2026-04-15T00:00:00.000Z",
      lastActiveAt: "2026-04-15T00:00:00.000Z",
      lastMessageId: undefined,
    });
    deps.runtime.openPiSession.mockResolvedValue(session);

    const service = createSessionService(deps as any);
    await service.getOrCreateActiveSession({ openId: "ou_1", userId: "u_1" });

    expect(setActiveToolsByName).not.toHaveBeenCalled();
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
