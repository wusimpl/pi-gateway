import { describe, it, expect } from "vitest";
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

  it("should parse /stop", () => {
    expect(parseBridgeCommand("/stop")).toEqual({
      name: "stop",
      args: "",
    });
  });

  it("should parse /restart", () => {
    expect(parseBridgeCommand("/restart")).toEqual({
      name: "restart",
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
        "    /Users/williamsandy/.pi/agent/skills/feishu-docs\n" +
        "  project\n" +
        "    /Users/williamsandy/code/pi-gateway/.agents/skills/local",
    );
  });

  it("`/restart` 应返回重启提示", () => {
    expect(handleBridgeCommand("restart", {})).toBe("🔄 正在重启网关...");
  });
});
