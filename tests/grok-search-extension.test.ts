import { describe, expect, it, vi } from "vitest";
import { createGrokSearchExtension } from "../src/pi/extensions/grok-search.js";

function collectTools(fetchMock: typeof fetch, overrides?: Record<string, unknown>) {
  const tools: any[] = [];
  createGrokSearchExtension({
    apiKey: "grok-key",
    baseUrl: "https://grok.test",
    model: "grok-search-model",
    fetch: fetchMock,
    ...overrides,
  })({
    registerTool(tool) {
      tools.push(tool);
    },
  } as any);

  return tools;
}

function createToolContext() {
  return {
    cwd: "/tmp/workspace",
    sessionManager: {
      getBranch: () => [],
    },
  };
}

describe("grok search extension", () => {
  it("会注册 Grok 搜索工具", () => {
    const tools = collectTools(vi.fn() as any);

    expect(tools.map((tool) => tool.name)).toEqual(["grok_search"]);
  });

  it("会调用配置好的 OpenAI 兼容接口并返回回答", async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({
      id: "chatcmpl_1",
      model: "grok-search-model",
      choices: [
        {
          message: {
            role: "assistant",
            content: "今天的结论。",
          },
          finish_reason: "stop",
        },
      ],
      usage: {
        prompt_tokens: 10,
        completion_tokens: 5,
        total_tokens: 15,
      },
    }), { status: 200 })) as any;
    const tools = collectTools(fetchMock);
    const searchTool = tools.find((tool) => tool.name === "grok_search");

    const result = await searchTool.execute(
      "call-1",
      { query: "今天有什么重要新闻？" },
      undefined,
      undefined,
      createToolContext(),
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0]?.[0]).toBe("https://grok.test/v1/chat/completions");
    expect(fetchMock.mock.calls[0]?.[1]?.headers).toMatchObject({
      Authorization: "Bearer grok-key",
      "Content-Type": "application/json",
    });
    expect(JSON.parse(fetchMock.mock.calls[0]?.[1]?.body as string)).toMatchObject({
      model: "grok-search-model",
      messages: [
        expect.objectContaining({ role: "system" }),
        { role: "user", content: "今天有什么重要新闻？" },
      ],
      temperature: 0.2,
      max_tokens: 2000,
    });
    expect(result.details).toMatchObject({
      answer: "今天的结论。",
      model: "grok-search-model",
      id: "chatcmpl_1",
      finish_reason: "stop",
    });
  });

  it("缺少 API Key 时会拒绝执行", async () => {
    const fetchMock = vi.fn() as any;
    const tools = collectTools(fetchMock, { apiKey: "" });
    const searchTool = tools.find((tool) => tool.name === "grok_search");

    await expect(
      searchTool.execute(
        "call-1",
        { query: "查一下" },
        undefined,
        undefined,
        createToolContext(),
      ),
    ).rejects.toThrow("缺少 GROK_SEARCH_API_KEY");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("成功状态但返回空内容时会重试一次", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response("", { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        choices: [
          {
            message: {
              content: "ok",
            },
          },
        ],
      }), { status: 200 })) as any;
    const tools = collectTools(fetchMock);
    const searchTool = tools.find((tool) => tool.name === "grok_search");

    const result = await searchTool.execute(
      "call-1",
      { query: "Reply ok" },
      undefined,
      undefined,
      createToolContext(),
    );

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result.details.answer).toBe("ok");
  });

  it("成功状态但没有回答内容时会重试", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({
        choices: [
          {
            message: {
              content: "",
            },
          },
        ],
      }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        choices: [
          {
            message: {
              content: "ok",
            },
          },
        ],
      }), { status: 200 })) as any;
    const tools = collectTools(fetchMock);
    const searchTool = tools.find((tool) => tool.name === "grok_search");

    const result = await searchTool.execute(
      "call-1",
      { query: "Reply ok" },
      undefined,
      undefined,
      createToolContext(),
    );

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result.details.answer).toBe("ok");
  });

  it("临时性失败最多重试三次后返回成功结果", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response("bad gateway", { status: 502 }))
      .mockResolvedValueOnce(new Response("bad gateway", { status: 502 }))
      .mockResolvedValueOnce(new Response("bad gateway", { status: 502 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        choices: [
          {
            message: {
              content: "ok",
            },
          },
        ],
      }), { status: 200 })) as any;
    const tools = collectTools(fetchMock);
    const searchTool = tools.find((tool) => tool.name === "grok_search");

    const result = await searchTool.execute(
      "call-1",
      { query: "Reply ok" },
      undefined,
      undefined,
      createToolContext(),
    );

    expect(fetchMock).toHaveBeenCalledTimes(4);
    expect(result.details.answer).toBe("ok");
  });

  it("临时性失败持续发生时最多请求四次", async () => {
    const fetchMock = vi.fn(async () => new Response("bad gateway", { status: 502 })) as any;
    const tools = collectTools(fetchMock);
    const searchTool = tools.find((tool) => tool.name === "grok_search");

    await expect(searchTool.execute(
      "call-1",
      { query: "Reply ok" },
      undefined,
      undefined,
      createToolContext(),
    )).rejects.toThrow("Grok 搜索请求失败: 502");
    expect(fetchMock).toHaveBeenCalledTimes(4);
  });

  it("配置类失败不会重试", async () => {
    const fetchMock = vi.fn(async () => new Response("unauthorized", { status: 401 })) as any;
    const tools = collectTools(fetchMock);
    const searchTool = tools.find((tool) => tool.name === "grok_search");

    await expect(searchTool.execute(
      "call-1",
      { query: "Reply ok" },
      undefined,
      undefined,
      createToolContext(),
    )).rejects.toThrow("Grok 搜索请求失败: 401");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("支持网关返回流式响应", async () => {
    const fetchMock = vi.fn(async () => new Response([
      'data: {"id":"chatcmpl_1","model":"grok-search-model","choices":[{"delta":{"content":"o"}}]}',
      "",
      'data: {"choices":[{"delta":{"content":"k"},"finish_reason":"stop"}],"usage":{"total_tokens":1}}',
      "",
      "data: [DONE]",
      "",
    ].join("\n"), {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream",
      },
    })) as any;
    const tools = collectTools(fetchMock);
    const searchTool = tools.find((tool) => tool.name === "grok_search");

    const result = await searchTool.execute(
      "call-1",
      { query: "Reply ok" },
      undefined,
      undefined,
      createToolContext(),
    );

    expect(result.details).toMatchObject({
      answer: "ok",
      model: "grok-search-model",
      id: "chatcmpl_1",
      finish_reason: "stop",
      usage: { total_tokens: 1 },
    });
  });

  it("支持把 question 参数兼容成 query", () => {
    const tools = collectTools(vi.fn() as any);
    const searchTool = tools.find((tool) => tool.name === "grok_search");

    expect(searchTool.prepareArguments({ question: "查一下" })).toMatchObject({
      query: "查一下",
    });
  });
});
