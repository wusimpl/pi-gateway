import { describe, expect, it } from "vitest";
import {
  filterAvailableModels,
  findAvailableModel,
  formatModelLabel,
  listAvailableModels,
  parseModelReference,
  parseModelSelectionOrder,
} from "../src/pi/models.js";

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

describe("parseModelSelectionOrder", () => {
  it("能解析正整数序号", () => {
    expect(parseModelSelectionOrder("7")).toBe(7);
    expect(parseModelSelectionOrder("  12  ")).toBe(12);
  });

  it("0、负数和非纯数字都不认", () => {
    expect(parseModelSelectionOrder("0")).toBeNull();
    expect(parseModelSelectionOrder("-1")).toBeNull();
    expect(parseModelSelectionOrder("1a")).toBeNull();
    expect(parseModelSelectionOrder("openai/gpt-4o")).toBeNull();
  });
});

describe("filterAvailableModels", () => {
  const models = [
    { order: 1, provider: "openai", id: "gpt-4o", label: "openai/gpt-4o", model: {} as any },
    { order: 2, provider: "zen2api", id: "minimax-m2.5-free", label: "zen2api/minimax-m2.5-free", model: {} as any },
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

describe("listAvailableModels", () => {
  it("会按排序结果补上固定序号", async () => {
    const registry = {
      getAvailable: async () => [
        { provider: "zen2api", id: "minimax-m2.5-free" },
        { provider: "openai", id: "gpt-4o" },
      ],
    } as any;

    await expect(listAvailableModels(registry)).resolves.toEqual([
      {
        order: 1,
        provider: "openai",
        id: "gpt-4o",
        name: undefined,
        label: "openai/gpt-4o",
        model: { provider: "openai", id: "gpt-4o" },
      },
      {
        order: 2,
        provider: "zen2api",
        id: "minimax-m2.5-free",
        name: undefined,
        label: "zen2api/minimax-m2.5-free",
        model: { provider: "zen2api", id: "minimax-m2.5-free" },
      },
    ]);
  });
});

describe("findAvailableModel", () => {
  const registry = {
    getAvailable: async () => [
      { provider: "zen2api", id: "minimax-m2.5-free" },
      { provider: "rightcodes", id: "gpt-5.4-high" },
    ],
  } as any;

  it("支持按序号找模型", async () => {
    await expect(findAvailableModel("2", registry)).resolves.toMatchObject({
      order: 2,
      provider: "zen2api",
      id: "minimax-m2.5-free",
      label: "zen2api/minimax-m2.5-free",
    });
  });

  it("支持按 provider/model 找模型", async () => {
    await expect(findAvailableModel("rightcodes/gpt-5.4-high", registry)).resolves.toMatchObject({
      order: 1,
      provider: "rightcodes",
      id: "gpt-5.4-high",
      label: "rightcodes/gpt-5.4-high",
    });
  });
});
