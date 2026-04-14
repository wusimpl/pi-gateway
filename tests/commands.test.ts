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

  it("should render only available models for /models", () => {
    const result = handleBridgeCommand(
      { name: "models", args: "" },
      {
        availableModels: [
          { id: "gpt-4o", label: "openai/gpt-4o", name: "GPT-4o" },
          { id: "gpt-5.4-high", label: "rightcodes/gpt-5.4-high", name: "gpt5.4-high" },
        ],
      },
    );
    expect(result).toContain("只显示当前环境真的能用的模型");
    expect(result).toContain("openai/gpt-4o");
    expect(result).toContain("rightcodes/gpt-5.4-high");
  });
});
