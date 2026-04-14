import { describe, it, expect } from "vitest";
import { formatError, formatThinking, formatToolCall } from "../src/feishu/format.js";

describe("formatError", () => {
  it("应包含错误前缀和消息", () => {
    expect(formatError("出错了")).toContain("出错了");
    expect(formatError("出错了")).toContain("❌");
  });
});

describe("formatThinking", () => {
  it("应返回思考中提示", () => {
    expect(formatThinking()).toContain("思考");
  });
});

describe("formatToolCall", () => {
  it("无参数时应返回工具名", () => {
    expect(formatToolCall("read")).toContain("read");
  });

  it("有参数时应包含截断后的参数", () => {
    const result = formatToolCall("edit", "some long args");
    expect(result).toContain("edit");
    expect(result).toContain("some long args");
  });

  it("超长参数应被截断", () => {
    const longArgs = "a".repeat(300);
    const result = formatToolCall("edit", longArgs);
    expect(result).toContain("...");
    expect(result.length).toBeLessThan(300 + 50);
  });
});
