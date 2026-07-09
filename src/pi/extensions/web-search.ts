import { Type } from "@mariozechner/pi-ai";
import {
  defineTool,
  type ExtensionFactory,
} from "@mariozechner/pi-coding-agent";

export interface WebSearchOptions {
  baseUrl?: string;
  fetch?: typeof fetch;
}

interface WebSearchParams {
  query: string;
  limit?: number;
  language?: string;
  country?: string;
  freshness?: "day" | "week" | "month" | "year";
  dateAfter?: string;
  dateBefore?: string;
  domainFilter?: string[];
}

interface SearXNGResult {
  url: string;
  title: string;
  content: string;
  publishedDate: string | null;
  engine: string;
  category: string;
  score: number;
  engines: string[];
}

interface SearXNGResponse {
  query: string;
  results: SearXNGResult[];
  answers: unknown[];
  corrections: unknown[];
  infoboxes: unknown[];
  suggestions: string[];
  unresponsive_engines: Array<[string, string]>;
}

const DEFAULT_BASE_URL = "https://sx.hkun.top";
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 20;
const MIN_LIMIT = 1;

function toToolResult(details: unknown) {
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(details, null, 2),
      },
    ],
    details,
  };
}

function normalizeArgs(args: unknown): Record<string, unknown> {
  if (!args || typeof args !== "object" || Array.isArray(args)) {
    return {};
  }

  const raw = args as Record<string, unknown>;
  return {
    ...raw,
    query: raw.query ?? raw.question ?? raw.q,
    domainFilter: raw.domainFilter ?? raw.domain_filter ?? raw.include_domains ?? raw.includeDomains,
  };
}

function clampLimit(value: unknown, fallback: number): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return fallback;
  }
  const rounded = Math.round(value);
  if (rounded < MIN_LIMIT) return MIN_LIMIT;
  if (rounded > MAX_LIMIT) return MAX_LIMIT;
  return rounded;
}

function sanitizeDomainFilter(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const result: string[] = [];
  for (const item of value) {
    if (typeof item !== "string") continue;
    const trimmed = item.trim().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
    if (!trimmed) continue;
    if (!result.includes(trimmed)) result.push(trimmed);
  }
  return result;
}

function formatSearchResults(
  query: string,
  results: SearXNGResult[],
  answers: unknown[],
): string {
  const lines: string[] = [];

  // 优先展示 answers（SearXNG 的即时回答）
  if (answers.length > 0) {
    const answerTexts = answers
      .filter((a): a is string => typeof a === "string")
      .map((a) => a.trim())
      .filter(Boolean);
    if (answerTexts.length > 0) {
      lines.push("📌 即时回答：", answerTexts.join("\n"), "");
    }
  }

  if (results.length === 0) {
    lines.push(`搜索：${query}`, "没有找到结果。");
    return lines.join("\n");
  }

  lines.push(`搜索：${query}`, `找到 ${results.length} 条结果：`, "");

  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    lines.push(`${i + 1}. ${result.title}`);
    lines.push(`   URL：${result.url}`);
    if (result.content) {
      lines.push(`   摘要：${result.content}`);
    }
    if (result.publishedDate) {
      lines.push(`   日期：${result.publishedDate}`);
    }
    lines.push(`   来源：${result.engine}`);
    lines.push("");
  }

  return lines.join("\n");
}

export function createWebSearchExtension(options: WebSearchOptions = {}): ExtensionFactory {
  const baseUrl = normalizeBaseUrl(options.baseUrl ?? DEFAULT_BASE_URL);
  const requestFetch = options.fetch ?? fetch;

  const searchTool = defineTool({
    name: "web_search",
    label: "网页搜索",
    description:
      "通过 SearXNG 元搜索引擎搜索公开网页结果，返回标题、URL 和摘要。支持按语言、时间和站点过滤。",
    promptSnippet:
      "web_search: 搜索公开网页结果，只返回标题、摘要和 URL，不读取网页全文。按语言、地区、时间和站点过滤。",
    promptGuidelines: [
      "web_search 是默认主搜索工具，通过 SearXNG 元搜索引擎聚合多个搜索引擎的结果。",
      "调用 web_search 时，提取 2-5 个核心关键词作为 query，而不是直接扔一段完整句子。",
      "需要按时间过滤时传 freshness（day/week/month/year）；需要限定域名时传 domainFilter。",
      "只返回摘要不返回全文。需要抓取全文时，对感兴趣的 URL 使用 webclaw。",
    ],
    parameters: Type.Object({
      query: Type.String({ description: "搜索关键词。" }),
      limit: Type.Optional(Type.Number({ description: "返回结果数，1-20，默认 10。" })),
      language: Type.Optional(Type.String({ description: "语言代码，例如 zh-CN、en-US。" })),
      country: Type.Optional(Type.String({ description: "地区代码，例如 cn、us。SearXNG 暂不完全支持此参数。" })),
      freshness: Type.Optional(
        Type.Union([
          Type.Literal("day"),
          Type.Literal("week"),
          Type.Literal("month"),
          Type.Literal("year"),
        ]),
      ),
      dateAfter: Type.Optional(Type.String({ description: "起始日期，格式 YYYY-MM-DD。SearXNG 暂不完全支持。" })),
      dateBefore: Type.Optional(Type.String({ description: "结束日期，格式 YYYY-MM-DD。SearXNG 暂不完全支持。" })),
      domainFilter: Type.Optional(Type.Array(Type.String(), { description: "限定域名列表。" })),
    }),
    prepareArguments: normalizeArgs as any,
    async execute(_toolCallId, params: WebSearchParams, signal) {
      const query = params.query?.trim();
      if (!query) {
        throw new Error("query 不能为空");
      }

      const limit = clampLimit(params.limit, DEFAULT_LIMIT);
      const language = params.language?.trim() || undefined;
      const freshness = params.freshness ?? undefined;
      const domainFilter = sanitizeDomainFilter(params.domainFilter);

      const searchParams = new URLSearchParams();
      searchParams.set("format", "json");
      searchParams.set("q", query);
      if (language) searchParams.set("language", language);
      if (freshness) searchParams.set("time_range", freshness);
      searchParams.set("safesearch", "1");

      const url = `${baseUrl}/search?${searchParams.toString()}`;

      let data: SearXNGResponse;
      try {
        const response = await requestFetch(url, { signal });
        const text = await response.text();
        if (!response.ok) {
          throw new Error(`网页搜索请求失败: ${response.status} ${text.slice(0, 300)}`);
        }
        if (!text.trim()) {
          throw new Error("网页搜索返回空响应");
        }
        try {
          data = JSON.parse(text) as SearXNGResponse;
        } catch {
          throw new Error("网页搜索返回格式无效");
        }
      } catch (err) {
        if (err instanceof Error && err.message.startsWith("网页搜索")) {
          throw err;
        }
        throw new Error(`网页搜索请求异常: ${err instanceof Error ? err.message : String(err)}`);
      }

      let results = data.results ?? [];
      // 应用域名过滤（服务端不支持时客户端过滤）
      if (domainFilter.length > 0) {
        results = results.filter((r) =>
          domainFilter.some((domain) => {
            try {
              const host = new URL(r.url).hostname;
              return host === domain || host.endsWith(`.${domain}`);
            } catch {
              return false;
            }
          }),
        );
      }

      // 截取到 limit
      const sliced = results.slice(0, limit);

      // 合并 answers（SearXNG 即时回答）
      const answers = (data.answers ?? []) as unknown[];

      return toToolResult({
        query,
        resultCount: sliced.length,
        totalResults: results.length,
        results: sliced.map((r) => ({
          title: r.title,
          url: r.url,
          snippet: r.content,
          publishedDate: r.publishedDate,
          engine: r.engine,
          category: r.category,
        })),
        answers: answers.length > 0 ? answers : undefined,
        suggestions: data.suggestions?.length ? data.suggestions : undefined,
      });
    },
  });

  return (pi) => {
    pi.registerTool(searchTool);
  };
}

function normalizeBaseUrl(value: string): string {
  return value.trim().replace(/\/+$/, "");
}
