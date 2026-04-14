import { describe, it, expect } from "vitest";
import { parseBridgeCommand, handleBridgeCommand } from "../src/app/commands.js";

describe("parseBridgeCommand", () => {
  it("should parse /new", () => {
    expect(parseBridgeCommand("/new")).toBe("new");
  });

  it("should parse /reset", () => {
    expect(parseBridgeCommand("/reset")).toBe("reset");
  });

  it("should parse /status", () => {
    expect(parseBridgeCommand("/status")).toBe("status");
  });

  it("should return null for plain text", () => {
    expect(parseBridgeCommand("hello")).toBeNull();
  });

  it("should return null for unknown command", () => {
    expect(parseBridgeCommand("/unknown")).toBeNull();
  });

  it("should trim whitespace", () => {
    expect(parseBridgeCommand("  /new  ")).toBe("new");
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
    expect(result).toContain(ctx.createdAt!);
    expect(result).toContain(ctx.piSessionFile!.split("/").pop());
  });

  it("should handle /status without optional fields", () => {
    const minimalCtx = { openId: "ou_test", sessionId: "20260414-120000" };
    const result = handleBridgeCommand("status", minimalCtx);
    expect(result).toContain("20260414-120000");
    expect(result).not.toContain("创建时间");
  });
});
