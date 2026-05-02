import { describe, expect, it, vi } from "vitest";
import { createAdminPageDataService } from "../src/admin/page-data.js";
import type { AdminTargetService } from "../src/admin/targets.js";

describe("admin sessions page", () => {
  it("返回当前目标的会话状态、历史会话和上下文", async () => {
    const targets: AdminTargetService = {
      listTargets: vi.fn(),
      resolveTarget: vi.fn().mockResolvedValue({
        target: {
          key: "ou_1",
          kind: "p2p",
          label: "私聊 · ou_1",
          detail: "ou_1",
          sources: ["历史私聊"],
        },
        identity: { openId: "ou_1" },
        conversationTarget: {
          kind: "p2p",
          key: "ou_1",
          receiveIdType: "open_id",
          receiveId: "ou_1",
        },
      }),
    };
    const service = createAdminPageDataService({
      targets,
      runtimeState: { isLocked: vi.fn(() => true) },
      sessionService: {
        getOrCreateActiveSession: vi.fn().mockResolvedValue({
          activeSessionId: "sess_1",
          piSession: {
            model: { provider: "openai", id: "gpt-5.5" },
            resourceLoader: {
              getAgentsFiles: () => ({ agentsFiles: [{ path: "README.md" }] }),
            },
          },
        }),
        getOrCreateActiveSessionForTarget: vi.fn(),
        listSessions: vi.fn().mockResolvedValue([
          {
            order: 1,
            sessionId: "sess_1",
            sessionFile: "/tmp/sess.json",
            isActive: true,
            messageCount: 3,
            updatedAt: "2026-05-02T08:00:00.000Z",
          },
        ]),
        listSessionsForTarget: vi.fn(),
        readSessionState: vi.fn().mockResolvedValue({
          activeSessionId: "sess_1",
          createdAt: "2026-05-02T08:00:00.000Z",
          updatedAt: "2026-05-02T08:00:00.000Z",
          lastActiveAt: "2026-05-02T08:00:00.000Z",
        }),
      },
    });

    const data = await service.getSessionsPage("ou_1");

    expect(data.status).toMatchObject({
      running: true,
      activeSessionId: "sess_1",
      currentModel: "openai/gpt-5.5",
      contextCount: 1,
    });
    expect(data.sessions[0]).toMatchObject({
      title: "sess_1",
      messageCount: 3,
      isActive: true,
    });
    expect(data.contextFiles).toEqual(["README.md"]);
  });

  it("返回模型配置和可用模型", async () => {
    const targets: AdminTargetService = {
      listTargets: vi.fn(),
      resolveTarget: vi.fn().mockResolvedValue({
        target: {
          key: "ou_1",
          kind: "p2p",
          label: "私聊 · ou_1",
          detail: "ou_1",
          sources: ["历史私聊"],
        },
        identity: { openId: "ou_1" },
        conversationTarget: {
          kind: "p2p",
          key: "ou_1",
          receiveIdType: "open_id",
          receiveId: "ou_1",
        },
      }),
    };
    const service = createAdminPageDataService({
      targets,
      runtimeState: { isLocked: vi.fn(() => false) },
      listAvailableModels: vi.fn().mockResolvedValue([
        {
          order: 1,
          provider: "openai",
          id: "gpt-5.5",
          label: "openai/gpt-5.5",
          model: {},
        },
      ]),
      sessionService: {
        getOrCreateActiveSession: vi.fn().mockResolvedValue({
          activeSessionId: "sess_1",
          piSession: { model: { provider: "openai", id: "gpt-5.5" } },
        }),
        getOrCreateActiveSessionForTarget: vi.fn(),
        listSessions: vi.fn(),
        listSessionsForTarget: vi.fn(),
        readSessionState: vi.fn().mockResolvedValue({
          activeSessionId: "sess_1",
          createdAt: "2026-05-02T08:00:00.000Z",
          updatedAt: "2026-05-02T08:00:00.000Z",
          lastActiveAt: "2026-05-02T08:00:00.000Z",
          modelRouting: {
            enabled: true,
            routerModel: { provider: "openai", id: "gpt-5.5" },
            lightModel: { provider: "openai", id: "gpt-5.5" },
            heavyModel: { provider: "openai", id: "gpt-5.5" },
          },
        }),
      },
    });

    const data = await service.getModelsPage("ou_1");

    expect(data.routeEnabled).toBe(true);
    expect(data.routeModels).toEqual({
      router: "openai/gpt-5.5",
      light: "openai/gpt-5.5",
      heavy: "openai/gpt-5.5",
    });
    expect(data.availableModels).toEqual([
      expect.objectContaining({ order: 1, label: "openai/gpt-5.5" }),
    ]);
  });

  it("返回当前目标设置", async () => {
    const targets: AdminTargetService = {
      listTargets: vi.fn(),
      resolveTarget: vi.fn().mockResolvedValue({
        target: {
          key: "ou_1",
          kind: "p2p",
          label: "私聊 · ou_1",
          detail: "ou_1",
          sources: ["历史私聊"],
        },
        identity: { openId: "ou_1" },
        conversationTarget: {
          kind: "p2p",
          key: "ou_1",
          receiveIdType: "open_id",
          receiveId: "ou_1",
        },
      }),
    };
    const service = createAdminPageDataService({
      targets,
      runtimeState: { isLocked: vi.fn(() => false) },
      runtimeConfig: {
        getStreamingEnabled: vi.fn(() => false),
        getAudioTranscribeProvider: vi.fn(() => "sensevoice"),
        getProcessingReactionType: vi.fn(() => "OnIt"),
      },
      sessionService: {
        getOrCreateActiveSession: vi.fn(),
        getOrCreateActiveSessionForTarget: vi.fn(),
        listSessions: vi.fn(),
        listSessionsForTarget: vi.fn(),
        readSessionState: vi.fn().mockResolvedValue({
          activeSessionId: "sess_1",
          createdAt: "2026-05-02T08:00:00.000Z",
          updatedAt: "2026-05-02T08:00:00.000Z",
          lastActiveAt: "2026-05-02T08:00:00.000Z",
          streamingEnabled: true,
          toolCallsDisplayMode: "name",
          globalAgentsSkillsEnabled: true,
        }),
      },
    });

    await expect(service.getSettingsPage("ou_1")).resolves.toEqual({
      targetKey: "ou_1",
      streamingEnabled: true,
      audioTranscribeProvider: "sensevoice",
      processingReactionEnabled: true,
      toolCallsDisplayMode: "name",
      skillFolderEnabled: true,
    });
  });

  it("返回当前目标的定时任务", async () => {
    const targets: AdminTargetService = {
      listTargets: vi.fn(),
      resolveTarget: vi.fn().mockResolvedValue({
        target: {
          key: "ou_1",
          kind: "p2p",
          label: "私聊 · ou_1",
          detail: "ou_1",
          sources: ["历史私聊"],
        },
        identity: { openId: "ou_1" },
        conversationTarget: {
          kind: "p2p",
          key: "ou_1",
          receiveIdType: "open_id",
          receiveId: "ou_1",
        },
      }),
    };
    const service = createAdminPageDataService({
      targets,
      runtimeState: { isLocked: vi.fn(() => false) },
      cronService: {
        isEnabled: vi.fn(() => true),
        listJobs: vi.fn().mockResolvedValue([
          {
            id: "cron_1",
            openId: "ou_1",
            scopeType: "dm",
            scopeKey: "ou_1",
            name: "daily",
            enabled: true,
            prompt: "run",
            schedule: { kind: "at", atMs: 1000 },
            deleteAfterRun: false,
            createdAtMs: 1,
            updatedAtMs: 2,
            state: { nextRunAtMs: 3000, lastRunStatus: "success" },
          },
        ]),
      },
      sessionService: {
        getOrCreateActiveSession: vi.fn(),
        getOrCreateActiveSessionForTarget: vi.fn(),
        listSessions: vi.fn(),
        listSessionsForTarget: vi.fn(),
        readSessionState: vi.fn(),
      },
    });

    await expect(service.getCronPage("ou_1")).resolves.toMatchObject({
      targetKey: "ou_1",
      enabled: true,
      jobs: [
        {
          id: "cron_1",
          name: "daily",
          nextRunAtMs: 3000,
          lastRunStatus: "success",
        },
      ],
    });
  });

  it("返回当前群聊设置", async () => {
    const targets: AdminTargetService = {
      listTargets: vi.fn(),
      resolveTarget: vi.fn().mockResolvedValue({
        target: {
          key: "oc_1",
          kind: "group",
          label: "群聊 · oc_1",
          detail: "oc_1",
          sources: ["历史群聊"],
        },
        identity: { openId: "ou_1" },
        conversationTarget: {
          kind: "group",
          key: "oc_1",
          receiveIdType: "chat_id",
          receiveId: "oc_1",
          chatId: "oc_1",
        },
      }),
    };
    const service = createAdminPageDataService({
      targets,
      runtimeState: { isLocked: vi.fn(() => false) },
      groupSettingsStore: {
        readGroupRoutingConfig: vi.fn().mockResolvedValue({
          FEISHU_GROUP_CHAT_POLICY: "allowlist",
          FEISHU_GROUP_CHAT_ALLOWLIST: ["oc_1", "oc_2"],
          FEISHU_GROUP_MESSAGE_MODE: "keyword",
          FEISHU_GROUP_MESSAGE_KEYWORDS: ["日报", "总结"],
        }),
      },
      sessionService: {
        getOrCreateActiveSession: vi.fn(),
        getOrCreateActiveSessionForTarget: vi.fn(),
        listSessions: vi.fn(),
        listSessionsForTarget: vi.fn(),
        readSessionState: vi.fn(),
      },
    });

    await expect(service.getGroupPage("oc_1")).resolves.toEqual({
      targetKey: "oc_1",
      chatId: "oc_1",
      policy: "allowlist",
      mode: "keyword",
      allowlist: ["oc_1", "oc_2"],
      keywords: ["日报", "总结"],
      currentInAllowlist: true,
    });
  });

  it("返回当前目标的工具状态", async () => {
    const targets: AdminTargetService = {
      listTargets: vi.fn(),
      resolveTarget: vi.fn().mockResolvedValue({
        target: {
          key: "ou_1",
          kind: "p2p",
          label: "私聊 · ou_1",
          detail: "ou_1",
          sources: ["历史私聊"],
        },
        identity: { openId: "ou_1" },
        conversationTarget: {
          kind: "p2p",
          key: "ou_1",
          receiveIdType: "open_id",
          receiveId: "ou_1",
        },
      }),
    };
    const service = createAdminPageDataService({
      targets,
      runtimeState: { isLocked: vi.fn(() => false) },
      sessionService: {
        getOrCreateActiveSession: vi.fn().mockResolvedValue({
          activeSessionId: "sess_1",
          piSession: {
            getAllTools: vi.fn(() => [{ name: "read" }, { name: "bash" }, { name: "edit" }]),
            getActiveToolNames: vi.fn(() => ["read", "edit", "missing"]),
            setActiveToolsByName: vi.fn(),
          },
        }),
        getOrCreateActiveSessionForTarget: vi.fn(),
        listSessions: vi.fn(),
        listSessionsForTarget: vi.fn(),
        readSessionState: vi.fn(),
      },
    });

    await expect(service.getToolsPage("ou_1")).resolves.toEqual({
      targetKey: "ou_1",
      supported: true,
      enabledCount: 2,
      tools: [
        { name: "read", enabled: true },
        { name: "bash", enabled: false },
        { name: "edit", enabled: true },
      ],
    });
  });

  it("返回当前目标的控制状态", async () => {
    const targets: AdminTargetService = {
      listTargets: vi.fn(),
      resolveTarget: vi.fn().mockResolvedValue({
        target: {
          key: "ou_1",
          kind: "p2p",
          label: "私聊 · ou_1",
          detail: "ou_1",
          sources: ["历史私聊"],
        },
        identity: { openId: "ou_1" },
        conversationTarget: {
          kind: "p2p",
          key: "ou_1",
          receiveIdType: "open_id",
          receiveId: "ou_1",
        },
      }),
    };
    const service = createAdminPageDataService({
      targets,
      runtimeState: {
        isLocked: vi.fn((key: string) => key === "ou_1"),
        isDraining: vi.fn(() => true),
      },
      sessionService: {
        getOrCreateActiveSession: vi.fn(),
        getOrCreateActiveSessionForTarget: vi.fn(),
        listSessions: vi.fn(),
        listSessionsForTarget: vi.fn(),
        readSessionState: vi.fn(),
      },
    });

    await expect(service.getControlPage("ou_1")).resolves.toEqual({
      targetKey: "ou_1",
      running: true,
      draining: true,
    });
  });
});
