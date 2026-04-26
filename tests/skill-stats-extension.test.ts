import { describe, expect, it, vi } from "vitest";
import { createSkillStatsExtension } from "../src/pi/extensions/skill-stats.js";

function createPiMock(skillPath = "/tmp/skills/pdf2md/SKILL.md") {
  const handlers = new Map<string, Function>();
  const pi = {
    on: vi.fn((event: string, handler: Function) => {
      handlers.set(event, handler);
    }),
    getCommands: vi.fn(() => [
      {
        name: "skill:pdf2md",
        source: "skill",
        sourceInfo: {
          path: skillPath,
          source: "local",
          scope: "user",
          origin: "top-level",
        },
      },
    ]),
  };
  const ctx = {
    cwd: "/tmp/workspace",
    sessionManager: {
      getSessionId: () => "session_1",
    },
  };
  return { pi, handlers, ctx };
}

describe("skill stats extension", () => {
  it("read 到 SKILL.md 时会统计一次", async () => {
    const store = { incrementSkillUsage: vi.fn().mockResolvedValue(undefined) };
    const { pi, handlers, ctx } = createPiMock();

    createSkillStatsExtension(store as any)(pi as any);
    await handlers.get("turn_start")?.({ type: "turn_start" }, ctx);
    await handlers.get("tool_call")?.(
      {
        type: "tool_call",
        toolCallId: "call_1",
        toolName: "read",
        input: { path: "/tmp/skills/pdf2md/SKILL.md" },
      },
      ctx,
    );

    expect(store.incrementSkillUsage).toHaveBeenCalledWith({
      name: "pdf2md",
      path: "/tmp/skills/pdf2md/SKILL.md",
      scope: "user",
    });
  });

  it("同一轮重复读取同一个 skill 只统计一次", async () => {
    const store = { incrementSkillUsage: vi.fn().mockResolvedValue(undefined) };
    const { pi, handlers, ctx } = createPiMock();

    createSkillStatsExtension(store as any)(pi as any);
    await handlers.get("turn_start")?.({ type: "turn_start" }, ctx);
    const event = {
      type: "tool_call",
      toolCallId: "call_1",
      toolName: "read",
      input: { path: "/tmp/skills/pdf2md/SKILL.md" },
    };
    await handlers.get("tool_call")?.(event, ctx);
    await handlers.get("tool_call")?.({ ...event, toolCallId: "call_2" }, ctx);

    expect(store.incrementSkillUsage).toHaveBeenCalledTimes(1);
  });

  it("非 skill 的 read 不统计", async () => {
    const store = { incrementSkillUsage: vi.fn().mockResolvedValue(undefined) };
    const { pi, handlers, ctx } = createPiMock();

    createSkillStatsExtension(store as any)(pi as any);
    await handlers.get("tool_call")?.(
      {
        type: "tool_call",
        toolCallId: "call_1",
        toolName: "read",
        input: { path: "/tmp/README.md" },
      },
      ctx,
    );

    expect(store.incrementSkillUsage).not.toHaveBeenCalled();
  });
});
