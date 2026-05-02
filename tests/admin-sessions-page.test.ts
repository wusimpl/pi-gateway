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
});
