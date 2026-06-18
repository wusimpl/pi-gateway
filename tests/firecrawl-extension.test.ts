import { describe, expect, it, vi } from "vitest";
import { createFirecrawlExtension } from "../src/pi/extensions/firecrawl.js";

function collectTools(options: Record<string, unknown> = {}) {
  const tools: any[] = [];
  createFirecrawlExtension({
    apiKey: "fc-test-key",
    baseUrl: "https://firecrawl.test",
    fetch: vi.fn() as any,
    ...options,
  })({
    registerTool(tool: any) {
      tools.push(tool);
    },
  } as any);
  return tools;
}

function createToolContext() {
  return {
    cwd: "/tmp/workspace",
    sessionManager: { getBranch: () => [] },
  };
}

function expectHeaderAuth(call: any, expected: string | undefined) {
  if (expected === undefined) {
    expect(call[1]?.headers).not.toHaveProperty("Authorization");
  } else {
    expect(call[1]?.headers).toMatchObject({ Authorization: expected });
  }
}

describe("firecrawl extension", () => {
  it("会注册 search 和 scrape 两个工具", () => {
    const tools = collectTools();
    expect(tools.map((tool) => tool.name).sort()).toEqual([
      "firecrawl_scrape",
      "firecrawl_search",
    ]);
  });

  it("search 调用正确端点并带上 Authorization", async () => {
    const fetchMock = vi.fn(async () =>
      new Response(
        JSON.stringify({
          success: true,
          data: { web: [{ url: "https://a.test", title: "A", description: "desc" }] },
        }),
        { status: 200 },
      ),
    ) as any;
    const tools = collectTools({ fetch: fetchMock });
    const searchTool = tools.find((tool) => tool.name === "firecrawl_search");

    const result = await searchTool.execute(
      "call-1",
      { query: "firecrawl" },
      undefined,
      undefined,
      createToolContext(),
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe("https://firecrawl.test/v2/search");
    expectHeaderAuth(fetchMock.mock.calls[0], "Bearer fc-test-key");
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toMatchObject({
      query: "firecrawl",
      limit: 5,
    });
    expect(result.details.results).toHaveLength(1);
    expect(result.details.results[0]).toMatchObject({
      url: "https://a.test",
      title: "A",
      description: "desc",
    });
  });

  it("search with_content=true 会附加 scrapeOptions", async () => {
    const fetchMock = vi.fn(async () =>
      new Response(
        JSON.stringify({
          success: true,
          data: [
            { url: "https://a.test", title: "A", markdown: "# A\nbody" },
          ],
        }),
        { status: 200 },
      ),
    ) as any;
    const tools = collectTools({ fetch: fetchMock });
    const searchTool = tools.find((tool) => tool.name === "firecrawl_search");

    await searchTool.execute(
      "call-1",
      { query: "firecrawl", with_content: true, limit: 3 },
      undefined,
      undefined,
      createToolContext(),
    );

    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toMatchObject({
      query: "firecrawl",
      limit: 3,
      scrapeOptions: { formats: ["markdown"] },
    });
  });

  it("search 返回分组结果时会合并 web/news/images", async () => {
    const fetchMock = vi.fn(async () =>
      new Response(
        JSON.stringify({
          success: true,
          data: {
            web: [{ url: "https://w.test", title: "W" }],
            news: [{ url: "https://n.test", title: "N" }],
            images: [{ url: "https://i.test", title: "I" }],
          },
        }),
        { status: 200 },
      ),
    ) as any;
    const tools = collectTools({ fetch: fetchMock });
    const searchTool = tools.find((tool) => tool.name === "firecrawl_search");

    const result = await searchTool.execute(
      "call-1",
      { query: "x", sources: ["web", "news", "images"] },
      undefined,
      undefined,
      createToolContext(),
    );

    expect(result.details.results).toHaveLength(3);
  });

  it("search 会校验不支持的 sources", async () => {
    const tools = collectTools();
    const searchTool = tools.find((tool) => tool.name === "firecrawl_search");

    await expect(
      searchTool.execute(
        "call-1",
        { query: "x", sources: ["video"] },
        undefined,
        undefined,
        createToolContext(),
      ),
    ).rejects.toThrow('sources 不支持 "video"');
  });

  it("search 兼容 includeDomains / excludeDomains 驼峰参数", () => {
    const tools = collectTools();
    const searchTool = tools.find((tool) => tool.name === "firecrawl_search");

    const prepared = searchTool.prepareArguments({
      query: "x",
      includeDomains: ["a.test"],
      withContent: true,
    });
    expect(prepared).toMatchObject({
      query: "x",
      include_domains: ["a.test"],
      with_content: true,
    });
  });

  it("scrape 调用正确端点并默认只返回 markdown", async () => {
    const fetchMock = vi.fn(async () =>
      new Response(
        JSON.stringify({
          success: true,
          data: {
            markdown: "# Hello",
            metadata: { sourceURL: "https://example.com", title: "Example" },
          },
        }),
        { status: 200 },
      ),
    ) as any;
    const tools = collectTools({ fetch: fetchMock });
    const scrapeTool = tools.find((tool) => tool.name === "firecrawl_scrape");

    const result = await scrapeTool.execute(
      "call-1",
      { url: "https://example.com" },
      undefined,
      undefined,
      createToolContext(),
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe("https://firecrawl.test/v2/scrape");
    expectHeaderAuth(fetchMock.mock.calls[0], "Bearer fc-test-key");
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toMatchObject({
      url: "https://example.com/",
      formats: ["markdown"],
      onlyMainContent: true,
    });
    expect(result.details.markdown).toBe("# Hello");
  });

  it("scrape 支持多格式和 CSS selector", async () => {
    const fetchMock = vi.fn(async () =>
      new Response(
        JSON.stringify({
          success: true,
          data: { markdown: "# body", html: "<h1>body</h1>", links: ["https://x"] },
        }),
        { status: 200 },
      ),
    ) as any;
    const tools = collectTools({ fetch: fetchMock });
    const scrapeTool = tools.find((tool) => tool.name === "firecrawl_scrape");

    await scrapeTool.execute(
      "call-1",
      {
        url: "https://example.com",
        formats: ["markdown", "html", "links"],
        include_tags: ["article"],
        exclude_tags: ["nav", "footer"],
      },
      undefined,
      undefined,
      createToolContext(),
    );

    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toMatchObject({
      url: "https://example.com/",
      formats: ["markdown", "html", "links"],
      includeTags: ["article"],
      excludeTags: ["nav", "footer"],
    });
  });

  it("scrape 会校验不支持的 formats", async () => {
    const tools = collectTools();
    const scrapeTool = tools.find((tool) => tool.name === "firecrawl_scrape");

    await expect(
      scrapeTool.execute(
        "call-1",
        { url: "https://example.com", formats: ["pdf"] },
        undefined,
        undefined,
        createToolContext(),
      ),
    ).rejects.toThrow('formats 不支持 "pdf"');
  });

  it("scrape 会拒绝无效 URL", async () => {
    const tools = collectTools();
    const scrapeTool = tools.find((tool) => tool.name === "firecrawl_scrape");

    await expect(
      scrapeTool.execute(
        "call-1",
        { url: "ftp://example.com/file" },
        undefined,
        undefined,
        createToolContext(),
      ),
    ).rejects.toThrow("url 必须是 http 或 https");
  });

  it("无 API Key 且未开启 keyless 时拒绝调用 search", async () => {
    const tools = collectTools({ apiKey: "" });
    const searchTool = tools.find((tool) => tool.name === "firecrawl_search");

    await expect(
      searchTool.execute("call-1", { query: "x" }, undefined, undefined, createToolContext()),
    ).rejects.toThrow("缺少 FIRECRAWL_API_KEY");
  });

  it("无 API Key 且未开启 keyless 时拒绝调用 scrape", async () => {
    const tools = collectTools({ apiKey: "" });
    const scrapeTool = tools.find((tool) => tool.name === "firecrawl_scrape");

    await expect(
      scrapeTool.execute(
        "call-1",
        { url: "https://example.com" },
        undefined,
        undefined,
        createToolContext(),
      ),
    ).rejects.toThrow("缺少 FIRECRAWL_API_KEY");
  });

  it("无 API Key 但开启 allowKeyless 时不带 Authorization", async () => {
    const fetchMock = vi.fn(async () =>
      new Response(
        JSON.stringify({
          success: true,
          data: { markdown: "# ok", metadata: { sourceURL: "https://example.com" } },
        }),
        { status: 200 },
      ),
    ) as any;
    const tools = collectTools({ apiKey: "", allowKeyless: true, fetch: fetchMock });
    const scrapeTool = tools.find((tool) => tool.name === "firecrawl_scrape");

    await scrapeTool.execute(
      "call-1",
      { url: "https://example.com" },
      undefined,
      undefined,
      createToolContext(),
    );

    expectHeaderAuth(fetchMock.mock.calls[0], undefined);
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toMatchObject({
      url: "https://example.com/",
    });
  });

  it("请求失败时不兜底，直接暴露 Firecrawl 的错误", async () => {
    const fetchMock = vi.fn(async () =>
      new Response(
        JSON.stringify({ success: false, error: "IP blocked" }),
        { status: 403 },
      ),
    ) as any;
    const tools = collectTools({ fetch: fetchMock });
    const searchTool = tools.find((tool) => tool.name === "firecrawl_search");

    await expect(
      searchTool.execute("call-1", { query: "x" }, undefined, undefined, createToolContext()),
    ).rejects.toThrow("Firecrawl 请求失败: 403");
  });

  it("keyless 模式下请求失败会附加提示", async () => {
    const fetchMock = vi.fn(async () =>
      new Response(
        JSON.stringify({ success: false, error: "Forbidden" }),
        { status: 403 },
      ),
    ) as any;
    const tools = collectTools({ apiKey: "", allowKeyless: true, fetch: fetchMock });
    const searchTool = tools.find((tool) => tool.name === "firecrawl_search");

    await expect(
      searchTool.execute("call-1", { query: "x" }, undefined, undefined, createToolContext()),
    ).rejects.toThrow("当前为无 key 模式");
  });
});
