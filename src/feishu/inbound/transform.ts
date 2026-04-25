import { execFile } from "node:child_process";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { extname } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import type { AgentSession } from "@mariozechner/pi-coding-agent";
import type { FeishuInboundMessage, FeishuMediaProcessingOptions, PreparedPromptInput } from "./types.js";
import { downloadFeishuResource } from "./resource.js";

const execFileAsync = promisify(execFile);
const OCR_PROMPT = "请提取这张图片里的全部文字，按阅读顺序输出；如果没有可读文字，就简短描述主要内容。";
const EXTERNAL_PROCESS_TIMEOUT_MS = 10 * 60 * 1000;
const SENSEVOICE_TRANSCRIBE_SCRIPT = fileURLToPath(
  new URL("../../../scripts/sensevoice_transcribe.py", import.meta.url),
);
const DOUBAO_STANDARD_SUBMIT_ENDPOINT = "https://openspeech.bytedance.com/api/v3/auc/bigmodel/submit";
const DOUBAO_STANDARD_QUERY_ENDPOINT = "https://openspeech.bytedance.com/api/v3/auc/bigmodel/query";
const DOUBAO_RESOURCE_ID = "volc.seedasr.auc";
const DOUBAO_SUCCESS_STATUS_CODE = "20000000";
const DOUBAO_PENDING_STATUS_CODES = new Set(["20000001", "20000002"]);
const DOUBAO_POLL_INTERVAL_MS = 1000;
const DOUBAO_UID = "pi-gateway";
const DOUBAO_MODEL_NAME = "bigmodel";
const DOUBAO_AUDIO_CONFIG_BY_EXTENSION = new Map<string, { format: string; codec?: string }>([
  [".wav", { format: "wav", codec: "raw" }],
  [".mp3", { format: "mp3" }],
  [".ogg", { format: "ogg", codec: "opus" }],
  [".opus", { format: "ogg", codec: "opus" }],
]);
const DOUBAO_AUDIO_CONFIG_BY_MIME_TYPE = new Map<string, { format: string; codec?: string }>([
  ["audio/wav", { format: "wav", codec: "raw" }],
  ["audio/x-wav", { format: "wav", codec: "raw" }],
  ["audio/wave", { format: "wav", codec: "raw" }],
  ["audio/mpeg", { format: "mp3" }],
  ["audio/mp3", { format: "mp3" }],
  ["audio/ogg", { format: "ogg", codec: "opus" }],
  ["application/ogg", { format: "ogg", codec: "opus" }],
  ["audio/opus", { format: "ogg", codec: "opus" }],
]);

interface DoubaoRecognitionResponse {
  result?: {
    text?: string;
    utterances?: Array<{
      text?: string;
    }>;
  };
}

interface TransformDeps {
  downloadResource?: typeof downloadFeishuResource;
  readBinaryFile?: typeof readFile;
  runImageOcr?: typeof runImageOcr;
  transcribeAudio?: typeof transcribeAudioFile;
}

export async function prepareFeishuPromptInput(
  message: FeishuInboundMessage,
  session: AgentSession,
  options: FeishuMediaProcessingOptions,
  deps: TransformDeps = {},
): Promise<PreparedPromptInput> {
  const downloadResource = deps.downloadResource ?? downloadFeishuResource;
  const readBinaryFile = deps.readBinaryFile ?? readFile;
  const runOcr = deps.runImageOcr ?? runImageOcr;
  const transcribeAudio = deps.transcribeAudio ?? transcribeAudioFile;

  switch (message.kind) {
    case "text":
      return {
        text: withQuotedMessageContext(message, message.text),
        localFiles: [],
      };
    case "image": {
      const resource = await downloadResource({
        workspaceDir: options.workspaceDir,
        messageId: message.messageId,
        fileKey: message.imageKey,
        resourceType: "image",
      });

      if (supportsImageInput(session)) {
        const binary = await readBinaryFile(resource.filePath);
        return {
          text: withQuotedMessageContext(
            message,
            `用户发来了一张图片，图片已保存到本地：${resource.filePath}\n请直接查看图片内容并继续对话；如果用户没写额外说明，就先简短描述图片里有什么。`,
          ),
          images: [
            {
              type: "image",
              data: binary.toString("base64"),
              mimeType: resource.mimeType,
            },
          ],
          localFiles: [resource.filePath],
        };
      }

      const ocrText = await runOcr(resource.filePath, options);
      return {
        text: withQuotedMessageContext(
          message,
          `用户发来了一张图片，图片已保存到本地：${resource.filePath}\n当前模型不支持直接看图，以下是本地 OCR/视觉结果：\n${ocrText}`,
        ),
        preludeText: formatDisplaySection("OCR 识别结果", ocrText),
        localFiles: [resource.filePath],
      };
    }
    case "audio": {
      const resource = await downloadResource({
        workspaceDir: options.workspaceDir,
        messageId: message.messageId,
        fileKey: message.fileKey,
        resourceType: "audio",
      });
      const transcript = await transcribeAudio(resource.filePath, options, resource.mimeType);
      const durationLine = typeof message.durationMs === "number" ? `\n语音时长：${message.durationMs}ms` : "";
      return {
        text: withQuotedMessageContext(
          message,
          `用户发来了一段语音，音频已保存到本地：${resource.filePath}${durationLine}\n以下是语音转写结果：\n${transcript}`,
        ),
        preludeText: formatDisplaySection("语音转录结果", transcript),
        localFiles: [resource.filePath],
      };
    }
    case "file": {
      const resource = await downloadResource({
        workspaceDir: options.workspaceDir,
        messageId: message.messageId,
        fileKey: message.fileKey,
        resourceType: "file",
        fileNameHint: message.fileName,
      });
      const fileNameLine = message.fileName ? `文件名：${message.fileName}\n` : "";
      return {
        text: withQuotedMessageContext(
          message,
          `用户发来了一个文件。\n${fileNameLine}文件已保存到本地，请使用这个路径查看文件并继续处理：\n${resource.filePath}`,
        ),
        localFiles: [resource.filePath],
      };
    }
  }
}

export function supportsImageInput(session: AgentSession): boolean {
  return Boolean(session.model?.input.includes("image"));
}

export async function runImageOcr(
  imagePath: string,
  options: Pick<FeishuMediaProcessingOptions, "ollamaBaseUrl" | "ocrModel">,
): Promise<string> {
  const imageData = await readFile(imagePath, { encoding: "base64" });
  const baseUrl = options.ollamaBaseUrl.replace(/\/+$/, "");
  const response = await fetch(`${baseUrl}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: options.ocrModel,
      prompt: OCR_PROMPT,
      stream: false,
      images: [imageData],
    }),
    signal: AbortSignal.timeout(EXTERNAL_PROCESS_TIMEOUT_MS),
  });

  const payload = (await response.json()) as { response?: string; error?: string };
  if (!response.ok) {
    throw new Error(payload.error || `OCR 请求失败: HTTP ${response.status}`);
  }

  const result = payload.response?.trim();
  if (!result) {
    throw new Error("OCR 没返回可用结果");
  }

  return result;
}

export async function transcribeAudioFile(
  audioPath: string,
  options: Pick<
    FeishuMediaProcessingOptions,
    | "audioTranscribeProvider"
    | "audioTranscribeScript"
    | "audioLanguage"
    | "audioTranscribeSenseVoicePython"
    | "audioTranscribeSenseVoiceModel"
    | "audioTranscribeSenseVoiceDevice"
    | "audioTranscribeDoubaoApiKey"
  >,
  audioMimeType?: string,
): Promise<string> {
  if (options.audioTranscribeProvider === "sensevoice") {
    return transcribeAudioWithSenseVoice(audioPath, options);
  }

  if (options.audioTranscribeProvider === "doubao") {
    return transcribeAudioWithDoubao(audioPath, options, audioMimeType);
  }

  return transcribeAudioWithScript(audioPath, options);
}

async function transcribeAudioWithScript(
  audioPath: string,
  options: Pick<FeishuMediaProcessingOptions, "audioTranscribeScript" | "audioLanguage">,
): Promise<string> {
  const result = await execFileAsync(
    "bash",
    [options.audioTranscribeScript, audioPath, options.audioLanguage || "zh"],
    {
      encoding: "utf8",
      timeout: EXTERNAL_PROCESS_TIMEOUT_MS,
      maxBuffer: 10 * 1024 * 1024,
    },
  );

  const transcript = result.stdout.trim();
  if (!transcript) {
    throw new Error("语音转写没有产出文本");
  }

  return transcript;
}

async function transcribeAudioWithSenseVoice(
  audioPath: string,
  options: Pick<
    FeishuMediaProcessingOptions,
    | "audioLanguage"
    | "audioTranscribeSenseVoicePython"
    | "audioTranscribeSenseVoiceModel"
    | "audioTranscribeSenseVoiceDevice"
  >,
): Promise<string> {
  const result = await execFileAsync(
    options.audioTranscribeSenseVoicePython,
    [
      SENSEVOICE_TRANSCRIBE_SCRIPT,
      "--audio",
      audioPath,
      "--language",
      options.audioLanguage || "zh",
      "--model",
      options.audioTranscribeSenseVoiceModel,
      "--device",
      options.audioTranscribeSenseVoiceDevice,
    ],
    {
      encoding: "utf8",
      timeout: EXTERNAL_PROCESS_TIMEOUT_MS,
      maxBuffer: 10 * 1024 * 1024,
      env: {
        ...process.env,
        PYTHONUNBUFFERED: "1",
      },
    },
  );

  const transcript = result.stdout.trim();
  if (!transcript) {
    throw new Error("SenseVoice 语音转写没有产出文本");
  }

  return transcript;
}

async function transcribeAudioWithDoubao(
  audioPath: string,
  options: Pick<FeishuMediaProcessingOptions, "audioTranscribeDoubaoApiKey" | "audioLanguage">,
  audioMimeType?: string,
): Promise<string> {
  const apiKey = options.audioTranscribeDoubaoApiKey.trim();
  if (!apiKey) {
    throw new Error("豆包语音未配置 FEISHU_AUDIO_TRANSCRIBE_DOUBAO_API_KEY");
  }

  const requestId = randomUUID();
  const audioConfig = resolveDoubaoAudioConfig(audioPath, audioMimeType);
  const audioLanguage = normalizeDoubaoLanguage(options.audioLanguage);
  const audioData = await readFile(audioPath);

  const submitResponse = await fetch(DOUBAO_STANDARD_SUBMIT_ENDPOINT, {
    method: "POST",
    headers: createDoubaoHeaders(apiKey, requestId, true),
    body: JSON.stringify({
      user: {
        uid: DOUBAO_UID,
      },
      audio: {
        data: audioData.toString("base64"),
        ...audioConfig,
        ...(audioLanguage ? { language: audioLanguage } : {}),
      },
      request: {
        model_name: DOUBAO_MODEL_NAME,
        enable_ddc: false,
        show_utterances: true,
      },
    }),
    signal: AbortSignal.timeout(EXTERNAL_PROCESS_TIMEOUT_MS),
  });

  const submitMeta = getDoubaoResponseMeta(submitResponse);
  if (!submitResponse.ok) {
    throw new Error(formatDoubaoFailure(submitMeta.message || `HTTP ${submitResponse.status}`, submitMeta.logId));
  }
  if (submitMeta.statusCode && submitMeta.statusCode !== DOUBAO_SUCCESS_STATUS_CODE) {
    throw new Error(formatDoubaoFailure(submitMeta.message || `状态码 ${submitMeta.statusCode}`, submitMeta.logId));
  }

  const deadline = Date.now() + EXTERNAL_PROCESS_TIMEOUT_MS;
  while (Date.now() < deadline) {
    await delay(DOUBAO_POLL_INTERVAL_MS);

    const queryResponse = await fetch(DOUBAO_STANDARD_QUERY_ENDPOINT, {
      method: "POST",
      headers: createDoubaoHeaders(apiKey, requestId, false),
      body: JSON.stringify({}),
      signal: AbortSignal.timeout(EXTERNAL_PROCESS_TIMEOUT_MS),
    });

    const queryMeta = getDoubaoResponseMeta(queryResponse);
    const payload = await parseDoubaoRecognitionResponse(queryResponse, queryMeta.logId);

    if (!queryResponse.ok) {
      throw new Error(formatDoubaoFailure(queryMeta.message || `HTTP ${queryResponse.status}`, queryMeta.logId));
    }

    if (queryMeta.statusCode && DOUBAO_PENDING_STATUS_CODES.has(queryMeta.statusCode)) {
      continue;
    }

    if (queryMeta.statusCode && queryMeta.statusCode !== DOUBAO_SUCCESS_STATUS_CODE) {
      throw new Error(formatDoubaoFailure(queryMeta.message || `状态码 ${queryMeta.statusCode}`, queryMeta.logId));
    }

    const transcript = extractDoubaoTranscript(payload);
    if (transcript) {
      return transcript;
    }

    throw new Error(`豆包语音转写没有产出文本${queryMeta.logId ? `（logid: ${queryMeta.logId}）` : ""}`);
  }

  throw new Error("豆包语音转写超时，请稍后重试");
}

function resolveDoubaoAudioConfig(
  audioPath: string,
  audioMimeType?: string,
): { format: string; codec?: string } {
  const normalizedMimeType = audioMimeType?.split(";")[0]?.trim().toLowerCase();
  const normalizedExtension = extname(audioPath).trim().toLowerCase();

  if (normalizedMimeType) {
    const config = DOUBAO_AUDIO_CONFIG_BY_MIME_TYPE.get(normalizedMimeType);
    if (config) {
      return config;
    }
  }

  if (!normalizedMimeType || normalizedMimeType === "application/octet-stream") {
    const config = DOUBAO_AUDIO_CONFIG_BY_EXTENSION.get(normalizedExtension);
    if (config) {
      return config;
    }
  }

  const formatLabel =
    [normalizedMimeType, normalizedExtension]
      .filter((value, index, values) => Boolean(value) && values.indexOf(value) === index)
      .join(" / ") || "未知格式";

  throw new Error(
    `豆包语音暂不支持当前音频格式（${formatLabel}），请先改用 WAV、MP3 或 OGG/OPUS。`,
  );
}

function normalizeDoubaoLanguage(language: string): string | undefined {
  const normalized = language.trim();
  if (!normalized || normalized.toLowerCase() === "auto") {
    return undefined;
  }
  return normalized;
}

function createDoubaoHeaders(apiKey: string, requestId: string, includeSequence: boolean): HeadersInit {
  return {
    "Content-Type": "application/json",
    "X-Api-Key": apiKey,
    "X-Api-Resource-Id": DOUBAO_RESOURCE_ID,
    "X-Api-Request-Id": requestId,
    ...(includeSequence ? { "X-Api-Sequence": "-1" } : {}),
  };
}

function getDoubaoResponseMeta(response: Response): {
  statusCode?: string;
  message?: string;
  logId?: string;
} {
  return {
    statusCode: response.headers.get("X-Api-Status-Code")?.trim() || undefined,
    message: response.headers.get("X-Api-Message")?.trim() || undefined,
    logId: response.headers.get("X-Tt-Logid")?.trim() || undefined,
  };
}

async function parseDoubaoRecognitionResponse(
  response: Response,
  logId?: string,
): Promise<DoubaoRecognitionResponse | null> {
  const responseText = await response.text();
  if (!responseText.trim()) {
    return null;
  }

  try {
    return JSON.parse(responseText) as DoubaoRecognitionResponse;
  } catch {
    throw new Error(formatDoubaoFailure("服务返回格式不正确", logId));
  }
}

async function delay(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

function extractDoubaoTranscript(payload: DoubaoRecognitionResponse | null): string {
  const text = payload?.result?.text?.trim();
  if (text) {
    return text;
  }

  return (
    payload?.result?.utterances
      ?.map((utterance) => utterance.text?.trim())
      .filter((text): text is string => Boolean(text))
      .join("\n")
      .trim() || ""
  );
}

function formatDoubaoFailure(reason: string, logId?: string): string {
  return `豆包语音转写失败：${reason}${logId ? `（logid: ${logId}）` : ""}`;
}

function formatDisplaySection(title: string, content: string): string {
  return ` ---\n**${title}**\n${content}`;
}

function withQuotedMessageContext(message: FeishuInboundMessage, currentMessageText: string): string {
  if (!message.quotedMessage) {
    return currentMessageText;
  }

  return [
    "用户这次是在回复一条之前的消息。",
    "被引用消息：",
    message.quotedMessage.text,
    "",
    "用户这次的新消息：",
    currentMessageText,
  ].join("\n");
}
