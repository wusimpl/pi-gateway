import { describe, expect, it, vi } from "vitest";
import { createRuntimeMetadataExtension } from "../src/pi/extensions/runtime-metadata.js";

function createPiMock() {
  const handlers = new Map<string, Function>();
  const pi = {
    on: vi.fn((event: string, handler: Function) => {
      handlers.set(event, handler);
    }),
  };
  return { pi, handlers };
}

describe("runtime metadata extension", () => {
  it("在每次 prompt 前把当前模型追加到 system prompt", async () => {
    const { pi, handlers } = createPiMock();
    createRuntimeMetadataExtension()(pi as any);

    const result = await handlers.get("before_agent_start")?.(
      {
        type: "before_agent_start",
        prompt: "hi",
        images: [],
        systemPrompt: "Base prompt",
        systemPromptOptions: {},
      },
      {
        model: { provider: "rightcodes", id: "gpt-5.4-high" },
      },
    );

    expect(result).toEqual({
      systemPrompt: "Base prompt\n\n## Gateway Runtime Metadata\n\n- Current model: rightcodes/gpt-5.4-high",
    });
  });

  it("当前没有模型时不追加元信息", async () => {
    const { pi, handlers } = createPiMock();
    createRuntimeMetadataExtension()(pi as any);

    const result = await handlers.get("before_agent_start")?.(
      {
        type: "before_agent_start",
        prompt: "hi",
        images: [],
        systemPrompt: "Base prompt",
        systemPromptOptions: {},
      },
      {
        model: undefined,
      },
    );

    expect(result).toBeUndefined();
  });
});
