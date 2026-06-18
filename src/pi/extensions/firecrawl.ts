import { Type } from "@mariozechner/pi-ai";
import {
  defineTool,
  type ExtensionFactory,
} from "@mariozechner/pi-coding-agent";

export interface FirecrawlOptions {
  apiKey?: string;
  baseUrl?: string;
  allowKeyless?: boolean;
  fetch?: typeof fetch;
}

interface FirecrawlSearchParams {
  query: string;
  limit?: number;
  sources?: string[];
  categories?: string[];
  include_domains?: string[];
  exclude_domains?: string[];
  tbs?: string;
  with_content?: boolean;
  location?: string;
  timeout?: number;
}

interface FirecrawlScrapeParams {
  url: string;
  formats?: string[];
  only_main_content?: boolean;
  include_tags?: string[];
  exclude_tags?: string[];
  wait_for?: number;
  timeout?: number;
  max_age?: number;
  location?: string;
  country?: string;
  languages?: string[];
}

interface FirecrawlSearchResponse {
  success?: boolean;
  data?:
    | Array<{
        url?: string;
        title?: string;
        description?: string;
        markdown?: string;
        html?: string;
        links?: string[];
        metadata?: Record<string, unknown>;
      }>
    | {
        web?: FirecrawlSearchResultItem[];
        news?: FirecrawlSearchResultItem[];
        images?: FirecrawlSearchResultItem[];
      };
  warning?: string;
  error?: string;
}

interface FirecrawlSearchResultItem {
  url?: string;
  title?: string;
  description?: string;
  snippet?: string;
  markdown?: string;
  html?: string;
  links?: string[];
  imageUrl?: string;
  date?: string;
  position?: number;
  category?: string;
  metadata?: Record<string, unknown>;
}

interface FirecrawlScrapeResponse {
  success?: boolean;
  data?: {
    markdown?: string;
    html?: string;
    rawHtml?: string;
    links?: string[];
    screenshot?: string;
    metadata?: {
      title?: string;
      description?: string;
      language?: string;
      sourceURL?: string;
      statusCode?: number;
      contentType?: string;
      [key: string]: unknown;
    };
    warning?: string;
  };
  error?: string;
}

const DEFAULT_BASE_URL = "https://api.firecrawl.dev";
const SEARCH_PATH = "/v2/search";
const SCRAPE_PATH = "/v2/scrape";
const DEFAULT_SEARCH_LIMIT = 5;
const DEFAULT_SCRAPE_FORMAT = "markdown";
const SUPPORTED_SCRAPE_FORMATS = new Set([
  "markdown",
  "html",
  "rawHtml",
  "links",
  "screenshot",
  "summary",
  "images",
]);
const SUPPORTED_SEARCH_SOURCES = new Set(["web", "news", "images"]);
const SUPPORTED_SEARCH_CATEGORIES = new Set(["github", "research", "pdf"]);
const MAX_SEARCH_LIMIT = 20;
const MIN_SEARCH_LIMIT = 1;

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
    include_domains: raw.include_domains ?? raw.includeDomains,
    exclude_domains: raw.exclude_domains ?? raw.excludeDomains,
    with_content: raw.with_content ?? raw.withContent,
    only_main_content: raw.only_main_content ?? raw.onlyMainContent,
    include_tags: raw.include_tags ?? raw.includeTags,
    exclude_tags: raw.exclude_tags ?? raw.excludeTags,
    wait_for: raw.wait_for ?? raw.waitFor,
    max_age: raw.max_age ?? raw.maxAge,
  };
}

export function createFirecrawlExtension(options: FirecrawlOptions = {}): ExtensionFactory {
  const apiKey = options.apiKey?.trim() || "";
  const baseUrl = normalizeBaseUrl(options.baseUrl ?? DEFAULT_BASE_URL);
  const allowKeyless = options.allowKeyless === true;
  const requestFetch = options.fetch ?? fetch;

  const searchTool = defineTool({
    name: "firecrawl_search",
    label: "Firecrawl Search",
    description: [
      "使用 Firecrawl 联网搜索，返回标题、URL 和摘要；",
      "开启 with_content=true 时可一次性拿到每条结果的正文 Markdown。",
      "适合需要搜索同时拿全文、或其它搜索工具拿不到的场景。",
    ].join(""),
    promptSnippet:
      "firecrawl_search: 联网搜索，with_content=true 可同时拿到每条结果正文。普通搜索优先 serper/grok，官方资料优先 exa。",
    promptGuidelines: [
      "Firecrawl 不是默认主搜索工具：普通搜索优先 serper_search 或 grok_search，官方/低噪音资料优先 exa-search。",
      "当需要搜索同时拿到每条结果正文、或 serper/grok/exa 不够用时，再调用 firecrawl_search。",
      "默认只返回标题+URL+摘要；需要正文时显式传 with_content=true，避免无谓消耗额度。",
      "不要把 API Key 或 base URL 传入 query。",
    ],
    parameters: Type.Object({
      query: Type.String({ description: "搜索关键词。" }),
      limit: Type.Optional(Type.Number({ description: "返回结果数，1-20，默认 5。" })),
      sources: Type.Optional(Type.Array(Type.String(), { description: "结果来源：web、news、images。" })),
      categories: Type.Optional(Type.Array(Type.String(), { description: "结果分类：github、research、pdf。" })),
      include_domains: Type.Optional(Type.Array(Type.String(), { description: "只包含这些域名。" })),
      exclude_domains: Type.Optional(Type.Array(Type.String(), { description: "排除这些域名。" })),
      tbs: Type.Optional(Type.String({ description: "时间过滤，例如 qdr:d、qdr:w、qdr:m。" })),
      with_content: Type.Optional(Type.Boolean({ description: "true 时同时抓取每条结果的正文 Markdown。" })),
      location: Type.Optional(Type.String({ description: "搜索地区，例如 Germany、US。" })),
      timeout: Type.Optional(Type.Number({ description: "超时毫秒数。" })),
    }),
    prepareArguments: normalizeArgs as any,
    async execute(_toolCallId, params: FirecrawlSearchParams, signal) {
      const query = params.query?.trim();
      if (!query) {
        throw new Error("query 不能为空");
      }

      const auth = resolveAuth(apiKey, allowKeyless);
      const limit = clampLimit(params.limit, DEFAULT_SEARCH_LIMIT);
      const sources = sanitizeList(params.sources, SUPPORTED_SEARCH_SOURCES, "sources");
      const categories = sanitizeList(params.categories, SUPPORTED_SEARCH_CATEGORIES, "categories");
      const includeDomains = sanitizeDomains(params.include_domains);
      const excludeDomains = sanitizeDomains(params.exclude_domains);
      if (includeDomains.length && excludeDomains.length) {
        throw new Error("include_domains 和 exclude_domains 不能同时使用");
      }

      const body = compactObject({
        query,
        limit,
        sources: sources.length ? sources : undefined,
        categories: categories.length ? categories : undefined,
        includeDomains: includeDomains.length ? includeDomains : undefined,
        excludeDomains: excludeDomains.length ? excludeDomains : undefined,
        tbs: params.tbs?.trim() || undefined,
        location: params.location?.trim() || undefined,
        timeout: typeof params.timeout === "number" ? params.timeout : undefined,
        scrapeOptions: params.with_content
          ? { formats: [DEFAULT_SCRAPE_FORMAT] }
          : undefined,
      });

      const response = await postJson<FirecrawlSearchResponse>(
        requestFetch,
        `${baseUrl}${SEARCH_PATH}`,
        auth,
        body,
        signal,
      );

      return toToolResult({
        query,
        results: extractSearchResults(response),
        with_content: params.with_content === true,
        credits_hint: params.with_content
          ? "with_content=true 已对每条结果触发一次 scrape，按页计费"
          : undefined,
        warning: response.warning,
      });
    },
  });

  const scrapeTool = defineTool({
    name: "firecrawl_scrape",
    label: "Firecrawl Scrape",
    description: [
      "使用 Firecrawl 抓取单个 URL 的正文，默认返回 Markdown。",
      "适合 webclaw 抓不到、JS 重页面、PDF URL、需要简单交互的页面。",
    ].join(""),
    promptSnippet:
      "firecrawl_scrape: 抓单个 URL 正文，默认 Markdown。普通网页正文优先 webclaw，抓不到或 JS/PDF 页面再用本工具。",
    promptGuidelines: [
      "Firecrawl 不是默认主抓取工具：普通网页正文优先 webclaw-reader，抓不到、JS 重页面、PDF URL 再用 firecrawl_scrape。",
      "默认 formats=[\"markdown\"]；需要 HTML、链接、截图等再加，每多一种格式可能多耗 credits。",
      "只传公网可访问 URL；不要传本地路径或登录后的私链。",
      "失败时不要自动切到其它工具兜底，把 Firecrawl 返回的错误暴露出来，让 agent 决定下一步。",
    ],
    parameters: Type.Object({
      url: Type.String({ description: "要抓取的公网 URL。" }),
      formats: Type.Optional(Type.Array(Type.String(), { description: "输出格式：markdown、html、rawHtml、links、screenshot、summary、images。" })),
      only_main_content: Type.Optional(Type.Boolean({ description: "true 只抓主内容，默认 true。" })),
      include_tags: Type.Optional(Type.Array(Type.String(), { description: "只保留这些 CSS selector 命中的内容。" })),
      exclude_tags: Type.Optional(Type.Array(Type.String(), { description: "排除这些 CSS selector 命中的内容。" })),
      wait_for: Type.Optional(Type.Number({ description: "抓取前等待毫秒数。" })),
      timeout: Type.Optional(Type.Number({ description: "超时毫秒数。" })),
      max_age: Type.Optional(Type.Number({ description: "缓存最大年龄毫秒数；0 表示强制重新抓取。" })),
      location: Type.Optional(Type.String({ description: "地区，已弃用，优先用 country。" })),
      country: Type.Optional(Type.String({ description: "ISO 3166-1 alpha-2 国家代码，例如 US、CN。" })),
      languages: Type.Optional(Type.Array(Type.String(), { description: "优先语言列表，例如 [\"zh\", \"en\"]。" })),
    }),
    prepareArguments: normalizeArgs as any,
    async execute(_toolCallId, params: FirecrawlScrapeParams, signal) {
      const url = sanitizeUrl(params.url);
      const formats = sanitizeFormats(params.formats);
      const includeTags = sanitizeStringList(params.include_tags);
      const excludeTags = sanitizeStringList(params.exclude_tags);

      const auth = resolveAuth(apiKey, allowKeyless);

      const locationObj = buildLocation(params);

      const body = compactObject({
        url,
        formats,
        onlyMainContent: params.only_main_content !== false,
        includeTags: includeTags.length ? includeTags : undefined,
        excludeTags: excludeTags.length ? excludeTags : undefined,
        waitFor: typeof params.wait_for === "number" ? params.wait_for : undefined,
        timeout: typeof params.timeout === "number" ? params.timeout : undefined,
        maxAge: typeof params.max_age === "number" ? params.max_age : undefined,
        location: Object.keys(locationObj).length ? locationObj : undefined,
      });

      const response = await postJson<FirecrawlScrapeResponse>(
        requestFetch,
        `${baseUrl}${SCRAPE_PATH}`,
        auth,
        body,
        signal,
      );

      const data = response.data ?? {};
      return toToolResult({
        url,
        markdown: data.markdown,
        html: data.html,
        rawHtml: data.rawHtml,
        links: data.links,
        screenshot: data.screenshot,
        metadata: data.metadata,
        warning: data.warning,
      });
    },
  });

  return (pi) => {
    pi.registerTool(searchTool);
    pi.registerTool(scrapeTool);
  };
}

interface FirecrawlAuth {
  apiKey: string;
  keyless: boolean;
}

function resolveAuth(apiKey: string, allowKeyless: boolean): FirecrawlAuth {
  if (apiKey) {
    return { apiKey, keyless: false };
  }
  if (allowKeyless) {
    return { apiKey: "", keyless: true };
  }
  throw new Error(
    "缺少 FIRECRAWL_API_KEY；如需无 key 试用，请显式设置 FIRECRAWL_ALLOW_KEYLESS=true（匿名额度有限且不稳定）",
  );
}

function normalizeBaseUrl(value: string): string {
  return value.trim().replace(/\/+$/, "");
}

function clampLimit(value: unknown, fallback: number): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return fallback;
  }
  const rounded = Math.round(value);
  if (rounded < MIN_SEARCH_LIMIT) return MIN_SEARCH_LIMIT;
  if (rounded > MAX_SEARCH_LIMIT) return MAX_SEARCH_LIMIT;
  return rounded;
}

function sanitizeList(value: unknown, allowed: Set<string>, field: string): string[] {
  if (!Array.isArray(value)) return [];
  const result: string[] = [];
  for (const item of value) {
    if (typeof item !== "string") continue;
    const trimmed = item.trim();
    if (!trimmed) continue;
    if (!allowed.has(trimmed)) {
      throw new Error(`${field} 不支持 "${trimmed}"，可选：${[...allowed].join(", ")}`);
    }
    if (!result.includes(trimmed)) result.push(trimmed);
  }
  return result;
}

function sanitizeDomains(value: unknown): string[] {
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

function sanitizeStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const result: string[] = [];
  for (const item of value) {
    if (typeof item !== "string") continue;
    const trimmed = item.trim();
    if (!trimmed) continue;
    if (!result.includes(trimmed)) result.push(trimmed);
  }
  return result;
}

function sanitizeFormats(value: unknown): string[] {
  if (!Array.isArray(value) || value.length === 0) {
    return [DEFAULT_SCRAPE_FORMAT];
  }
  const result: string[] = [];
  for (const item of value) {
    if (typeof item !== "string") continue;
    const trimmed = item.trim();
    if (!trimmed) continue;
    if (!SUPPORTED_SCRAPE_FORMATS.has(trimmed)) {
      throw new Error(
        `formats 不支持 "${trimmed}"，可选：${[...SUPPORTED_SCRAPE_FORMATS].join(", ")}`,
      );
    }
    if (!result.includes(trimmed)) result.push(trimmed);
  }
  return result.length ? result : [DEFAULT_SCRAPE_FORMAT];
}

function sanitizeUrl(value: string): string {
  const trimmed = value?.trim();
  if (!trimmed) {
    throw new Error("url 不能为空");
  }
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      throw new Error("url 必须是 http 或 https");
    }
    return parsed.toString();
  } catch (err) {
    if (err instanceof Error && err.message.startsWith("url ")) {
      throw err;
    }
    throw new Error("url 格式无效");
  }
}

function buildLocation(params: FirecrawlScrapeParams): Record<string, unknown> {
  const country = params.country?.trim();
  const languages = sanitizeStringList(params.languages);
  const obj: Record<string, unknown> = {};
  if (country) obj.country = country;
  if (languages.length) obj.languages = languages;
  return obj;
}

function compactObject<T extends Record<string, unknown>>(value: T): T {
  return Object.fromEntries(
    Object.entries(value).filter(
      ([, item]) => item !== undefined && item !== null && item !== "",
    ),
  ) as T;
}

function buildHeaders(auth: FirecrawlAuth): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (auth.apiKey) {
    headers.Authorization = `Bearer ${auth.apiKey}`;
  }
  return headers;
}

async function postJson<T>(
  requestFetch: typeof fetch,
  url: string,
  auth: FirecrawlAuth,
  body: unknown,
  signal?: AbortSignal,
): Promise<T> {
  const response = await requestFetch(url, {
    method: "POST",
    headers: buildHeaders(auth),
    body: JSON.stringify(body),
    signal,
  });

  const text = await response.text();
  if (!response.ok) {
    const trimmed = text.trim();
    const summary = trimmed
      ? `${response.status} ${trimmed.slice(0, 600)}`
      : `${response.status}`;
    const suffix = auth.keyless
      ? "（当前为无 key 模式，匿名额度有限且可能被风控；配置 FIRECRAWL_API_KEY 可提升稳定性）"
      : "";
    throw new Error(`Firecrawl 请求失败: ${summary}${suffix}`);
  }

  if (!text.trim()) {
    throw new Error("Firecrawl 返回空响应");
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error("Firecrawl 返回格式无效");
  }
}

function extractSearchResults(response: FirecrawlSearchResponse): FirecrawlSearchResultItem[] {
  const data = response.data;
  if (!data) return [];

  if (Array.isArray(data)) {
    return data.map((item) => ({
      url: item.url,
      title: item.title,
      description: item.description,
      markdown: item.markdown,
      html: item.html,
      links: item.links,
      metadata: item.metadata,
    }));
  }

  const merged: FirecrawlSearchResultItem[] = [];
  for (const source of ["web", "news", "images"] as const) {
    const list = data[source];
    if (Array.isArray(list)) {
      for (const item of list) {
        merged.push({
          url: item.url,
          title: item.title,
          description: item.description ?? item.snippet,
          markdown: item.markdown,
          html: item.html,
          links: item.links,
          imageUrl: item.imageUrl,
          date: item.date,
          position: item.position,
          category: item.category,
          metadata: item.metadata,
        });
      }
    }
  }
  return merged;
}
