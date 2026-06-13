import { mkdir, writeFile } from "node:fs/promises";
import { basename, extname, isAbsolute, relative, resolve } from "node:path";
import { Type } from "@mariozechner/pi-ai";
import {
  defineTool,
  type ExtensionFactory,
} from "@mariozechner/pi-coding-agent";

type AudioFormat = "mp3" | "wav" | "pcm" | "opus";

export interface AliyunTtsOptions {
  apiKey?: string;
  baseUrl?: string;
  model?: string;
  voice?: string;
  format?: AudioFormat;
  sampleRate?: number;
  fetch?: typeof fetch;
}

interface SynthesizeParams {
  text: string;
  voice?: string;
  model?: string;
  format?: string;
  sample_rate?: number;
  output_name?: string;
  output_dir?: string;
  volume?: number;
  rate?: number;
  pitch?: number;
  language?: string;
  instruction?: string;
  enable_ssml?: boolean;
  enable_markdown_filter?: boolean;
  seed?: number;
}

interface CloneVoiceParams {
  audio_url: string;
  prefix: string;
  model?: string;
  language?: string;
  max_prompt_audio_length?: number;
  enable_preprocess?: boolean;
}

interface QueryVoiceParams {
  voice_id: string;
}

const DEFAULT_BASE_URL = "https://dashscope.aliyuncs.com/api/v1";
const DEFAULT_MODEL = "cosyvoice-v3-flash";
const DEFAULT_VOICE = "longlaoyi_v3";
const DEFAULT_FORMAT: AudioFormat = "mp3";
const DEFAULT_SAMPLE_RATE = 24000;
const DEFAULT_RATE = 0.85;
const DEFAULT_OUTPUT_DIR = "tts";
const SUPPORTED_FORMATS = new Set<AudioFormat>(["mp3", "wav", "pcm", "opus"]);

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
    audio_url: raw.audio_url ?? raw.audioUrl,
    output_name: raw.output_name ?? raw.outputName,
    output_dir: raw.output_dir ?? raw.outputDir,
    sample_rate: raw.sample_rate ?? raw.sampleRate,
    enable_ssml: raw.enable_ssml ?? raw.enableSsml,
    enable_markdown_filter: raw.enable_markdown_filter ?? raw.enableMarkdownFilter,
    max_prompt_audio_length: raw.max_prompt_audio_length ?? raw.maxPromptAudioLength,
    enable_preprocess: raw.enable_preprocess ?? raw.enablePreprocess,
    voice_id: raw.voice_id ?? raw.voiceId,
  };
}

export function createAliyunTtsExtension(options: AliyunTtsOptions = {}): ExtensionFactory {
  const apiKey = options.apiKey?.trim() || "";
  const baseUrl = normalizeBaseUrl(options.baseUrl ?? DEFAULT_BASE_URL);
  const defaultModel = options.model?.trim() || DEFAULT_MODEL;
  const defaultVoice = options.voice?.trim() || DEFAULT_VOICE;
  const defaultFormat = normalizeAudioFormat(options.format ?? DEFAULT_FORMAT);
  const defaultSampleRate = options.sampleRate ?? DEFAULT_SAMPLE_RATE;
  const requestFetch = options.fetch ?? fetch;

  const synthesizeTool = defineTool({
    name: "tts_synthesize",
    label: "TTS Synthesize",
    description: "使用阿里云百炼 CosyVoice 把文字生成音频文件。生成后如需发回飞书，可继续调用 feishu_file_send。",
    promptSnippet:
      "tts_synthesize: 把文字转成语音文件；需要发送给用户时，先生成音频文件，再用 feishu_file_send 发回当前飞书会话。",
    promptGuidelines: [
      "用户要求配音、朗读、文字转语音、生成语音文件时，调用 tts_synthesize。",
      "用户指定音色时，把它作为 voice 传入；没有指定时使用默认音色。",
      "生成音频后，如果用户希望在飞书里收到文件，继续调用 feishu_file_send 发送生成的音频文件。",
    ],
    parameters: Type.Object({
      text: Type.String({ description: "要生成语音的文字。" }),
      voice: Type.Optional(Type.String({ description: "音色 ID；不传时使用默认音色。" })),
      model: Type.Optional(Type.String({ description: "CosyVoice 模型名；默认使用环境配置。" })),
      format: Type.Optional(Type.String({ description: "音频格式：mp3、wav、pcm 或 opus。" })),
      sample_rate: Type.Optional(Type.Number({ description: "采样率，例如 24000。" })),
      output_name: Type.Optional(Type.String({ description: "输出文件名，可不传。" })),
      output_dir: Type.Optional(Type.String({ description: "输出目录，必须在当前 workspace 里；默认 tts。" })),
      volume: Type.Optional(Type.Number({ description: "音量，0 到 100。" })),
      rate: Type.Optional(Type.Number({ description: "语速，0.5 到 2.0。" })),
      pitch: Type.Optional(Type.Number({ description: "音调，0.5 到 2.0。" })),
      language: Type.Optional(Type.String({ description: "目标语言代码，例如 zh、en、ja。" })),
      instruction: Type.Optional(Type.String({ description: "控制方言、情感或角色的指令。" })),
      enable_ssml: Type.Optional(Type.Boolean({ description: "文本为 SSML 时设为 true。" })),
      enable_markdown_filter: Type.Optional(Type.Boolean({ description: "是否过滤 Markdown 标记。" })),
      seed: Type.Optional(Type.Number({ description: "随机种子，0 到 65535。" })),
    }),
    prepareArguments: normalizeArgs as any,
    async execute(_toolCallId, params, signal, _onUpdate, ctx) {
      ensureApiKey(apiKey);
      const text = params.text.trim();
      if (!text) {
        throw new Error("text 不能为空");
      }

      const format = normalizeAudioFormat(params.format ?? defaultFormat);
      const outputDir = resolveWorkspacePath(ctx.cwd, params.output_dir ?? DEFAULT_OUTPUT_DIR);
      const outputName = resolveOutputName(params.output_name, format);
      const outputPath = resolveWorkspacePath(outputDir, outputName);

      const response = await postJson<DashScopeTtsResponse>(
        requestFetch,
        `${baseUrl}/services/audio/tts/SpeechSynthesizer`,
        apiKey,
        {
          model: params.model?.trim() || defaultModel,
          input: compactObject({
            text,
            voice: params.voice?.trim() || defaultVoice,
            format,
            sample_rate: params.sample_rate ?? defaultSampleRate,
            volume: params.volume,
            rate: params.rate ?? DEFAULT_RATE,
            pitch: params.pitch,
            language_hints: params.language?.trim() ? [params.language.trim()] : undefined,
            instruction: params.instruction?.trim() || undefined,
            enable_ssml: params.enable_ssml,
            enable_markdown_filter: params.enable_markdown_filter,
            seed: params.seed,
          }),
        },
        signal,
      );

      const audio = response.output?.audio;
      const audioBytes = audio?.data
        ? Buffer.from(audio.data, "base64")
        : await downloadAudio(requestFetch, audio?.url, signal);
      await mkdir(outputDir, { recursive: true });
      await writeFile(outputPath, audioBytes);

      return toToolResult({
        path: outputPath,
        file_name: outputName,
        model: params.model?.trim() || defaultModel,
        voice: params.voice?.trim() || defaultVoice,
        format,
        sample_rate: params.sample_rate ?? defaultSampleRate,
        request_id: response.request_id,
        audio_id: audio?.id,
        expires_at: audio?.expires_at,
        size_bytes: audioBytes.length,
        send_hint: "如需发回飞书，请调用 feishu_file_send 发送这个文件。",
      });
    },
  });

  const cloneVoiceTool = defineTool({
    name: "tts_clone_voice",
    label: "TTS Clone Voice",
    description: "使用阿里云百炼 CosyVoice 根据公网音频 URL 创建声音复刻音色，返回可用于 tts_synthesize 的 voice_id。",
    promptSnippet:
      "tts_clone_voice: 用公网可访问的参考音频 URL 创建声音复刻音色，拿到 voice_id 后再调用 tts_synthesize 合成。",
    promptGuidelines: [
      "只有用户提供了可公开访问的参考音频 URL，并明确要做声音复刻时，才调用 tts_clone_voice。",
      "不要把本地文件路径当作 audio_url；阿里云声音复刻要求公网可访问 URL。",
      "prefix 只能使用小写字母和数字，长度不超过 10。",
      "创建后可调用 tts_query_voice 查询状态；状态 OK 后可把 voice_id 用于 tts_synthesize。",
    ],
    parameters: Type.Object({
      audio_url: Type.String({ description: "公网可访问的参考音频 URL。" }),
      prefix: Type.String({ description: "音色名前缀，只能是小写字母和数字，最多 10 个字符。" }),
      model: Type.Optional(Type.String({ description: "驱动音色的 CosyVoice 模型名；合成时必须使用同一个模型。" })),
      language: Type.Optional(Type.String({ description: "参考音频语言代码，例如 zh、en。" })),
      max_prompt_audio_length: Type.Optional(Type.Number({ description: "用于复刻的最大音频时长，3 到 30 秒。" })),
      enable_preprocess: Type.Optional(Type.Boolean({ description: "是否开启降噪等预处理。" })),
    }),
    prepareArguments: normalizeArgs as any,
    async execute(_toolCallId, params, signal) {
      ensureApiKey(apiKey);
      const audioUrl = normalizePublicUrl(params.audio_url);
      const prefix = normalizeVoicePrefix(params.prefix);
      const model = params.model?.trim() || defaultModel;

      const response = await postJson<DashScopeVoiceResponse>(
        requestFetch,
        `${baseUrl}/services/audio/tts/customization`,
        apiKey,
        {
          model: "voice-enrollment",
          input: compactObject({
            action: "create_voice",
            target_model: model,
            prefix,
            url: audioUrl,
            language_hints: params.language?.trim() ? [params.language.trim()] : undefined,
            max_prompt_audio_length: params.max_prompt_audio_length,
            enable_preprocess: params.enable_preprocess,
          }),
        },
        signal,
      );

      return toToolResult({
        voice_id: response.output?.voice_id,
        status: response.output?.status,
        target_model: response.output?.target_model ?? model,
        request_id: response.request_id,
        query_hint: "可调用 tts_query_voice 查询状态；状态 OK 后，把 voice_id 作为 tts_synthesize 的 voice 使用。",
      });
    },
  });

  const queryVoiceTool = defineTool({
    name: "tts_query_voice",
    label: "TTS Query Voice",
    description: "查询阿里云百炼 CosyVoice 声音复刻音色状态。",
    promptSnippet: "tts_query_voice: 查询声音复刻 voice_id 是否已经可用。",
    promptGuidelines: [
      "创建声音复刻音色后，调用 tts_query_voice 查询状态。",
      "状态 OK 表示可用于 tts_synthesize；状态 UNDEPLOYED 表示不可用。",
    ],
    parameters: Type.Object({
      voice_id: Type.String({ description: "要查询的 voice_id。" }),
    }),
    prepareArguments: normalizeArgs as any,
    async execute(_toolCallId, params, signal) {
      ensureApiKey(apiKey);
      const voiceId = params.voice_id.trim();
      if (!voiceId) {
        throw new Error("voice_id 不能为空");
      }

      const response = await postJson<DashScopeVoiceResponse>(
        requestFetch,
        `${baseUrl}/services/audio/tts/customization`,
        apiKey,
        {
          model: "voice-enrollment",
          input: {
            action: "query_voice",
            voice_id: voiceId,
          },
        },
        signal,
      );

      return toToolResult({
        voice_id: response.output?.voice_id ?? voiceId,
        status: response.output?.status,
        target_model: response.output?.target_model,
        resource_link: response.output?.resource_link,
        gmt_create: response.output?.gmt_create,
        gmt_modified: response.output?.gmt_modified,
        request_id: response.request_id,
      });
    },
  });

  return (pi) => {
    pi.registerTool(synthesizeTool);
    pi.registerTool(cloneVoiceTool);
    pi.registerTool(queryVoiceTool);
  };
}

interface DashScopeTtsResponse {
  request_id?: string;
  output?: {
    audio?: {
      data?: string;
      url?: string;
      id?: string;
      expires_at?: number;
    };
  };
}

interface DashScopeVoiceResponse {
  request_id?: string;
  output?: {
    voice_id?: string;
    status?: string;
    target_model?: string;
    resource_link?: string;
    gmt_create?: string;
    gmt_modified?: string;
  };
}

function ensureApiKey(apiKey: string): void {
  if (!apiKey) {
    throw new Error("缺少 DASHSCOPE_API_KEY，无法调用阿里云语音服务");
  }
}

function normalizeBaseUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error("阿里云语音服务地址不能为空");
  }
  return trimmed.replace(/\/+$/, "");
}

function normalizeAudioFormat(value: string): AudioFormat {
  const format = value.trim().toLowerCase() as AudioFormat;
  if (!SUPPORTED_FORMATS.has(format)) {
    throw new Error("format 只能是 mp3、wav、pcm 或 opus");
  }
  return format;
}

function normalizePublicUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error("audio_url 不能为空");
  }
  const url = new URL(trimmed);
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error("audio_url 必须是公网可访问的 HTTP 或 HTTPS 地址");
  }
  return url.toString();
}

function normalizeVoicePrefix(value: string): string {
  const prefix = value.trim();
  if (!/^[a-z0-9]{1,10}$/.test(prefix)) {
    throw new Error("prefix 只能包含小写字母和数字，长度不超过 10");
  }
  return prefix;
}

function resolveWorkspacePath(cwd: string, rawPath: string): string {
  const trimmed = rawPath.trim();
  if (!trimmed) {
    throw new Error("路径不能为空");
  }

  const resolvedPath = resolve(cwd, trimmed);
  ensurePathUnderRoot(resolvedPath, cwd);
  return resolvedPath;
}

function ensurePathUnderRoot(resolvedPath: string, root: string): void {
  const relativePath = relative(resolve(root), resolvedPath);
  if (
    relativePath === ".."
    || relativePath.startsWith("../")
    || relativePath.startsWith("..\\")
    || isAbsolute(relativePath)
  ) {
    throw new Error("路径必须在当前 workspace 里");
  }
}

function resolveOutputName(rawName: string | undefined, format: AudioFormat): string {
  if (!rawName?.trim()) {
    return `tts-${new Date().toISOString().replace(/[:.]/g, "-")}.${format}`;
  }

  const name = rawName.trim();
  if (basename(name) !== name) {
    throw new Error("output_name 只能是文件名，不能包含路径");
  }

  const ext = extname(name);
  if (!ext) {
    return `${name}.${format}`;
  }
  if (ext.toLowerCase() !== `.${format}`) {
    throw new Error(`output_name 必须以 .${format} 结尾`);
  }
  return name;
}

function compactObject<T extends Record<string, unknown>>(value: T): T {
  return Object.fromEntries(
    Object.entries(value).filter(([, item]) => item !== undefined && item !== ""),
  ) as T;
}

async function postJson<T>(
  requestFetch: typeof fetch,
  url: string,
  apiKey: string,
  body: unknown,
  signal?: AbortSignal,
): Promise<T> {
  const response = await requestFetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    signal,
  });

  if (!response.ok) {
    throw new Error(`阿里云语音服务请求失败: ${response.status} ${await response.text()}`);
  }

  return await response.json() as T;
}

async function downloadAudio(
  requestFetch: typeof fetch,
  url: string | undefined,
  signal?: AbortSignal,
): Promise<Buffer> {
  if (!url) {
    throw new Error("阿里云语音服务没有返回音频地址");
  }

  const response = await requestFetch(url, { signal });
  if (!response.ok) {
    throw new Error(`下载音频失败: ${response.status} ${await response.text()}`);
  }

  return Buffer.from(await response.arrayBuffer());
}
