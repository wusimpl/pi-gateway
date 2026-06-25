import { Type } from "@mariozechner/pi-ai";
import {
  defineTool,
  type ExtensionFactory,
} from "@mariozechner/pi-coding-agent";

export interface GrokSearchOptions {
  apiKey?: string;
  baseUrl?: string;
  model?: string;
  fetch?: typeof fetch;
}

interface GrokSearchParams {
  query: string;
}

interface ChatCompletionResponse {
  id?: string;
  model?: string;
  choices?: Array<{
    message?: {
      content?: string | Array<{ type?: string; text?: string }>;
    };
    finish_reason?: string;
  }>;
  usage?: unknown;
}

interface ChatCompletionChunk {
  id?: string;
  model?: string;
  choices?: Array<{
    delta?: {
      content?: string;
    };
    finish_reason?: string;
  }>;
  usage?: unknown;
}

const SEARCH_SYSTEM_PROMPT = [
  "你是 Pi 的联网搜索和事实核验助手。",
  "请优先使用你的实时搜索能力核验用户问题。",
  "用简体中文回答，先给结论，再给关键依据。",
  "涉及时间敏感信息时写出明确日期。",
  "能给来源链接时列出来源；不确定或查不到时直接说明。",
].join("\n");
const MAX_EMPTY_RESPONSE_ATTEMPTS = 2;

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
  };
}

export function createGrokSearchExtension(options: GrokSearchOptions = {}): ExtensionFactory {
  const apiKey = options.apiKey?.trim() || "";
  const baseUrl = normalizeBaseUrl(options.baseUrl ?? "");
  const model = options.model?.trim() || "";
  const requestFetch = options.fetch ?? fetch;

  const searchTool = defineTool({
    name: "grok_search",
    label: "Grok Search",
    description: "使用配置好的 Grok 模型进行联网搜索和事实核验，可返回最新信息、来源链接和跨网页查证结果。",
    promptSnippet: "grok_search: 联网搜索、事实核验、最新信息和来源链接查询。",
    promptGuidelines: [
      "grok_search 提供联网搜索、事实核验、最新信息查询、来源链接整理和跨网页查证能力。",
      "调用 grok_search 时，把用户问题和必要上下文合并成一个清楚的 query。",
    ],
    parameters: Type.Object({
      query: Type.String({ description: "要交给 Grok 搜索和核验的完整问题。" }),
    }),
    prepareArguments: normalizeArgs as any,
    async execute(_toolCallId, params: GrokSearchParams, signal) {
      ensureConfigured(apiKey, baseUrl, model);
      const query = params.query.trim();
      if (!query) {
        throw new Error("query 不能为空");
      }

      const response = await postChatCompletion(
        requestFetch,
        `${baseUrl}/v1/chat/completions`,
        apiKey,
        {
          model,
          messages: [
            { role: "system", content: SEARCH_SYSTEM_PROMPT },
            { role: "user", content: query },
          ],
          temperature: 0.2,
          max_tokens: 2000,
        },
        signal,
      );
      const answer = extractAssistantContent(response);
      if (!answer.trim()) {
        throw new Error("Grok 搜索没有返回内容");
      }

      return toToolResult({
        answer,
        model: response.model ?? model,
        id: response.id,
        finish_reason: response.choices?.[0]?.finish_reason,
        usage: response.usage,
      });
    },
  });

  return (pi) => {
    pi.registerTool(searchTool);
  };
}

function ensureConfigured(apiKey: string, baseUrl: string, model: string): void {
  if (!apiKey) {
    throw new Error("缺少 GROK_SEARCH_API_KEY，无法调用 Grok 搜索");
  }
  if (!baseUrl) {
    throw new Error("缺少 GROK_SEARCH_BASE_URL，无法调用 Grok 搜索");
  }
  if (!model) {
    throw new Error("缺少 GROK_SEARCH_MODEL，无法调用 Grok 搜索");
  }
}

function normalizeBaseUrl(value: string): string {
  return value.trim().replace(/\/+$/, "");
}

async function postChatCompletion(
  requestFetch: typeof fetch,
  url: string,
  apiKey: string,
  body: unknown,
  signal?: AbortSignal,
): Promise<ChatCompletionResponse> {
  for (let attempt = 1; attempt <= MAX_EMPTY_RESPONSE_ATTEMPTS; attempt += 1) {
    const response = await requestFetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal,
    });
    const text = await response.text();
    if (!response.ok) {
      throw new Error(`Grok 搜索请求失败: ${response.status} ${text}`);
    }
    if (!text.trim() && attempt < MAX_EMPTY_RESPONSE_ATTEMPTS) {
      continue;
    }

    try {
      return parseChatCompletionText(text);
    } catch {
      throw new Error("Grok 搜索返回格式无效");
    }
  }
  throw new Error("Grok 搜索返回格式无效");
}

function parseChatCompletionText(text: string): ChatCompletionResponse {
  if (text.trimStart().startsWith("data:")) {
    return parseEventStreamChatCompletion(text);
  }
  return JSON.parse(text) as ChatCompletionResponse;
}

function parseEventStreamChatCompletion(text: string): ChatCompletionResponse {
  let id: string | undefined;
  let model: string | undefined;
  let content = "";
  let finishReason: string | undefined;
  let usage: unknown;

  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("data:")) {
      continue;
    }

    const data = trimmed.slice("data:".length).trim();
    if (!data || data === "[DONE]") {
      continue;
    }

    const chunk = JSON.parse(data) as ChatCompletionChunk;
    id ??= chunk.id;
    model ??= chunk.model;
    const choice = chunk.choices?.[0];
    if (typeof choice?.delta?.content === "string") {
      content += choice.delta.content;
    }
    if (typeof choice?.finish_reason === "string") {
      finishReason = choice.finish_reason;
    }
    if (chunk.usage !== undefined) {
      usage = chunk.usage;
    }
  }

  return {
    id,
    model,
    choices: [
      {
        message: {
          content,
        },
        finish_reason: finishReason,
      },
    ],
    usage,
  };
}

function extractAssistantContent(response: ChatCompletionResponse): string {
  const content = response.choices?.[0]?.message?.content;
  if (typeof content === "string") {
    return content;
  }
  if (Array.isArray(content)) {
    return content
      .map((part) => part.type === "text" && typeof part.text === "string" ? part.text : "")
      .join("")
      .trim();
  }
  return "";
}
