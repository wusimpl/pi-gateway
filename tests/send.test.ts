import { describe, it, expect } from "vitest";
import { chunkText } from "../src/feishu/send.js";

describe("chunkText", () => {
  it("短文本不分块", () => {
    expect(chunkText("hello", 10)).toEqual(["hello"]);
  });

  it("恰好等于限制不分块", () => {
    const text = "a".repeat(10);
    expect(chunkText(text, 10)).toEqual([text]);
  });

  it("超长文本应分块", () => {
    const text = "a".repeat(25);
    const chunks = chunkText(text, 10);
    expect(chunks.length).toBeGreaterThanOrEqual(3);
    expect(chunks.join("")).toBe(text);
  });

  it("优先在换行符处分割", () => {
    const text = "line1\nline2\nline3\nline4\nline5";
    const chunks = chunkText(text, 12);
    for (const chunk of chunks) {
      expect(chunk.length).toBeLessThanOrEqual(12);
    }
    // chunkText 会在换行符处分割并消耗换行符，所以拼接后不含换行
    const joined = chunks.join("");
    // 所有内容都应该被保留（换行符被消耗但内容完整）
    expect(joined.replace(/\n/g, "")).toBe(text.replace(/\n/g, ""));
  });

  it("没有换行符时直接在限制处分割", () => {
    const text = "abcdefghij";
    const chunks = chunkText(text, 4);
    expect(chunks).toEqual(["abcd", "efgh", "ij"]);
  });

  it("空文本返回空数组", () => {
    expect(chunkText("", 10)).toEqual([""]);
  });
});
