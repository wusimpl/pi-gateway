import { describe, it, expect } from "vitest";
import { parseBridgeCommand, handleBridgeCommand } from "../src/app/commands.js";

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

  it("should parse /stop", () => {
    expect(parseBridgeCommand("/stop")).toEqual({
      name: "stop",
      args: "",
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
  const ctx = {
    openId: "ou_test123",
    sessionId: "20260414-120000",
    createdAt: "2026-04-14T12:00:00.000Z",
    piSessionFile: "/data/users/ou_test123/sessions/abc.json",
    workspaceDir: "C:/Users/Administrator/code/pi-workspace/cli_user_123",
    currentModel: "openai/gpt-4o",
  };

  it("should return new session message for /new", () => {
    const result = handleBridgeCommand("new", ctx);
    expect(result).toContain("新会话");
  });

  it("should return reset session message for /reset", () => {
    const result = handleBridgeCommand("reset", ctx);
    expect(result).toContain("重置会话");
  });

  it("should return session info for /status", () => {
    const result = handleBridgeCommand("status", ctx);
    expect(result).toContain(ctx.sessionId);
    expect(result).toContain(ctx.createdAt);
    expect(result).toContain(ctx.piSessionFile.split("/").pop()!);
    expect(result).toContain(ctx.workspaceDir);
    expect(result).toContain(ctx.currentModel);
  });

  it("should handle /status without optional fields", () => {
    const minimalCtx = { openId: "ou_test", sessionId: "20260414-120000" };
    const result = handleBridgeCommand("status", minimalCtx);
    expect(result).toContain("20260414-120000");
    expect(result).not.toContain("创建时间");
  });

  it("should render current model info for /model", () => {
    const result = handleBridgeCommand({ name: "model", args: "" }, {
      currentModel: "zen2api/minimax-m2.5-free",
      availableModelCount: 5,
    });
    expect(result).toContain("zen2api/minimax-m2.5-free");
    expect(result).toContain("5 个");
    expect(result).toContain("/model <序号>");
  });

  it("should render switch success for /model provider/model", () => {
    const result = handleBridgeCommand(
      { name: "model", args: "openai/gpt-4o" },
      { currentModel: "openai/gpt-4o", previousModel: "anthropic/claude-sonnet-4-6" },
    );
    expect(result).toContain("已切到模型");
    expect(result).toContain("openai/gpt-4o");
    expect(result).toContain("anthropic/claude-sonnet-4-6");
  });

  it("should render loaded context files for /context", () => {
    const result = handleBridgeCommand(
      { name: "context", args: "" },
      {
        contextFiles: [
          { path: "/Users/williamsandy/.pi/agent/AGENTS.md" },
          { path: "/Users/williamsandy/code/pi-gateway/AGENTS.md" },
        ],
      },
    );
    expect(result).toContain("[Context]");
    expect(result).toContain("~/.pi/agent/AGENTS.md");
    expect(result).toContain("~/code/pi-gateway/AGENTS.md");
  });

  it("should render loaded skills grouped by scope for /skills", () => {
    const result = handleBridgeCommand(
      { name: "skills", args: "" },
      {
        skills: [
          { filePath: "/Users/williamsandy/.agents/skills/exa-search/SKILL.md", scope: "user" },
          { filePath: "/Users/williamsandy/code/pi-gateway/.agents/skills/local/SKILL.md", scope: "project" },
        ],
      },
    );
    expect(result).toContain("[Skills]");
    expect(result).toContain("  user");
    expect(result).toContain("~/.agents/skills/exa-search/SKILL.md");
    expect(result).toContain("  project");
    expect(result).toContain("~/code/pi-gateway/.agents/skills/local/SKILL.md");
  });

  it("should render only available models for /models", () => {
    const result = handleBridgeCommand(
      { name: "models", args: "" },
      {
        availableModels: [
          { order: 1, id: "gpt-4o", label: "openai/gpt-4o", name: "GPT-4o" },
          { order: 2, id: "gpt-5.4-high", label: "rightcodes/gpt-5.4-high", name: "gpt5.4-high" },
        ],
      },
    );
    expect(result).toContain("只显示当前环境真的能用的模型");
    expect(result).toContain("1. openai/gpt-4o");
    expect(result).toContain("2. rightcodes/gpt-5.4-high");
    expect(result).toContain("/model <序号>");
  });

  it("should render stop message for /stop when stopping active task", () => {
    const result = handleBridgeCommand(
      { name: "stop", args: "" },
      { stopState: "requested" },
    );
    expect(result).toContain("正在停止当前任务");
  });

  it("should render no-running-task message for /stop when idle", () => {
    const result = handleBridgeCommand(
      { name: "stop", args: "" },
      { stopState: "not_running" },
    );
    expect(result).toContain("当前没有在跑的任务");
  });
});
