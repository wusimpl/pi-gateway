import { describe, expect, it } from "vitest";
import { filterAvailableModels, formatModelLabel, parseModelReference } from "../src/pi/models.js";

describe("parseModelReference", () => {
  it("只切第一个斜杠，保留模型 id 里的剩余斜杠", () => {
    expect(parseModelReference("zen2api/zai-org/GLM-5.1-FP8")).toEqual({
      provider: "zen2api",
      id: "zai-org/GLM-5.1-FP8",
    });
  });

  it("缺少 provider 或 model 时返回 null", () => {
    expect(parseModelReference("openai")).toBeNull();
    expect(parseModelReference("/gpt-4o")).toBeNull();
    expect(parseModelReference("openai/")).toBeNull();
  });
});

describe("filterAvailableModels", () => {
  const models = [
    { provider: "openai", id: "gpt-4o", label: "openai/gpt-4o", model: {} as any },
    { provider: "zen2api", id: "minimax-m2.5-free", label: "zen2api/minimax-m2.5-free", model: {} as any },
  ];

  it("provider 过滤大小写不敏感", () => {
    expect(filterAvailableModels(models, "OPENAI")).toEqual([models[0]]);
  });

  it("不传 provider 时返回全部模型", () => {
    expect(filterAvailableModels(models)).toEqual(models);
  });
});

describe("formatModelLabel", () => {
  it("拼成 provider/model", () => {
    expect(formatModelLabel("rightcodes", "gpt-5.4-high")).toBe("rightcodes/gpt-5.4-high");
  });
});
