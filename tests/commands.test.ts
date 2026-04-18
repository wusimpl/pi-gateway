import { afterEach, beforeEach, describe, it, expect, vi } from "vitest";
import { handleBridgeCommand, parseBridgeCommand } from "../src/app/commands.js";

describe("parseBridgeCommand", () => {
  it("should parse /new", () => {
    expect(parseBridgeCommand("/new")).toEqual({ name: "new", args: "" });
  });

  it("should parse /reset", () => {
    expect(parseBridgeCommand("/reset")).toEqual({ name: "reset", args: "" });
  });

  it("should parse /status", () => {
    expect(parseBridgeCommand("/status")).toEqual({ name: "status", args: "" });
  });

  it("should parse /context", () => {
    expect(parseBridgeCommand("/context")).toEqual({ name: "context", args: "" });
  });

  it("should parse /skills", () => {
    expect(parseBridgeCommand("/skills")).toEqual({ name: "skills", args: "" });
  });

  it("should parse /model with args", () => {
    expect(parseBridgeCommand("/model openai/gpt-4o")).toEqual({
      name: "model",
      args: "openai/gpt-4o",
    });
  });

  it("should parse /models with provider filter", () => {
    expect(parseBridgeCommand("/models zen2api")).toEqual({
      name: "models",
      args: "zen2api",
    });
  });

  it("should parse /sessions", () => {
    expect(parseBridgeCommand("/sessions")).toEqual({
      name: "sessions",
      args: "",
    });
  });

  it("should parse /resume with args", () => {
    expect(parseBridgeCommand("/resume abc123")).toEqual({
      name: "resume",
      args: "abc123",
    });
  });

  it("should parse /stop", () => {
    expect(parseBridgeCommand("/stop")).toEqual({
      name: "stop",
      args: "",
    });
  });

  it("should parse /next with args", () => {
    expect(parseBridgeCommand("/next after this")).toEqual({
      name: "next",
      args: "after this",
    });
  });

  it("should parse /restart", () => {
    expect(parseBridgeCommand("/restart")).toEqual({
      name: "restart",
      args: "",
    });
  });

  it("should parse /cron with args", () => {
    expect(parseBridgeCommand("/cron list")).toEqual({
      name: "cron",
      args: "list",
    });
  });

  it("should parse /stt with args", () => {
    expect(parseBridgeCommand("/stt provider sensevoice")).toEqual({
      name: "stt",
      args: "provider sensevoice",
    });
  });

  it("should parse /stream with args", () => {
    expect(parseBridgeCommand("/stream on")).toEqual({
      name: "stream",
      args: "on",
    });
  });

  it("should parse /reaction with args", () => {
    expect(parseBridgeCommand("/reaction off")).toEqual({
      name: "reaction",
      args: "off",
    });
  });

  it("should return null for plain text", () => {
    expect(parseBridgeCommand("hello")).toBeNull();
  });

  it("should return null for unknown command", () => {
    expect(parseBridgeCommand("/unknown")).toBeNull();
  });

  it("should trim whitespace", () => {
    expect(parseBridgeCommand("  /new  ")).toEqual({ name: "new", args: "" });
  });

  it("should not match partial text like /newday", () => {
    expect(parseBridgeCommand("/newday")).toBeNull();
  });
});

describe("handleBridgeCommand", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-16T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("`/new` 应带上当前模型", () => {
    expect(
      handleBridgeCommand("new", {
        currentModel: "rightcodes/gpt-5.4-high",
      }),
    ).toBe("✅ 已创建新会话\n🤖 当前模型: rightcodes/gpt-5.4-high");
  });

  it("模型拿不到时，`/new` 仍返回原文案", () => {
    expect(handleBridgeCommand("new", {})).toBe("✅ 已创建新会话");
  });

  it("`/skills` 只显示到技能目录", () => {
    expect(
      handleBridgeCommand("skills", {
        skills: [
          {
            filePath: "/Users/williamsandy/.pi/agent/skills/feishu-docs/SKILL.md",
            scope: "user",
          },
          {
            filePath: "/Users/williamsandy/code/pi-gateway/.agents/skills/local/SKILL.md",
            scope: "project",
          },
        ],
      }),
    ).toBe(
      "[Skills]\n" +
        "  user\n" +
        "    ~/.pi/agent/skills/feishu-docs\n" +
        "  project\n" +
        "    ~/code/pi-gateway/.agents/skills/local",
    );
  });

  it("`/restart` 应返回重启提示", () => {
    expect(handleBridgeCommand("restart", {})).toBe("🔄 正在重启网关...");
  });

  it("`/next` 没有正文时应返回用法", () => {
    expect(handleBridgeCommand("next", {})).toBe("用法：/next <要排到当前任务后处理的内容>");
  });

  it("`/sessions` 应返回最近会话列表", () => {
    expect(
      handleBridgeCommand("sessions", {
        sessionsPage: 1,
        sessionsTotalPages: 2,
        sessionsTotalCount: 22,
        sessions: [
          {
            order: 1,
            sessionId: "session_003",
            isActive: true,
            firstMessage: "这个项目",
            messageCount: 2,
            updatedAt: "2026-04-16T11:48:00.000Z",
          },
          {
            order: 2,
            sessionId: "session_002",
            isActive: false,
            firstMessage: "hello!",
            messageCount: 14,
            updatedAt: "2026-04-14T12:00:00.000Z",
          },
        ],
      } as any),
    ).toBe(
      "📚 最近会话（第 1/2 页，共 22 个）\n" +
        "用 /resume <序号> 切换。翻页：/sessions -n <页码>。\n" +
        "\n" +
        "| 序号 | 会话 | 消息 | 时间 |\n" +
        "| --- | --- | --- | --- |\n" +
        "| 1 | 这个项目 | 2 | 12m |\n" +
        "| 2 | hello! | 14 | 2d |",
    );
  });

  it("`/sessions` 标题里的竖线应转义，避免把表格切坏", () => {
    expect(
      handleBridgeCommand("sessions", {
        sessionsPage: 1,
        sessionsTotalPages: 1,
        sessionsTotalCount: 1,
        sessions: [
          {
            order: 1,
            sessionId: "session_001",
            isActive: false,
            firstMessage: "hello | world",
            messageCount: 3,
            updatedAt: "2026-04-16T11:48:00.000Z",
          },
        ],
      } as any),
    ).toContain("| 1 | hello \\| world | 3 | 12m |");
  });

  it("`/resume` 应返回切换后的会话", () => {
    expect(
      handleBridgeCommand("resume", {
        sessionId: "session_002",
        currentModel: "rightcodes/gpt-5.4-high",
      }),
    ).toBe("✅ 已切换到会话: session_002\n🤖 当前模型: rightcodes/gpt-5.4-high");
  });
});
