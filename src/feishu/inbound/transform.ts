import { execFile } from "node:child_process";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
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
const DOUBAO_FLASH_ENDPOINT = "https://openspeech.bytedance.com/api/v3/auc/bigmodel/recognize/flash";
const DOUBAO_RESOURCE_ID = "volc.bigasr.auc_turbo";
const DOUBAO_SUCCESS_STATUS_CODE = "20000000";
const DOUBAO_UID = "pi-gateway";
const DOUBAO_MODEL_NAME = "bigmodel";

interface DoubaoFlashResponse {
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
      const transcript = await transcribeAudio(resource.filePath, options);
      const durationLine = typeof message.durationMs === "number" ? `\n语音时长：${message.durationMs}ms` : "";
      return {
        text: withQuotedMessageContext(
          message,
          `用户发来了一段语音，音频已保存到本地：${resource.filePath}${durationLine}\n以下是语音转写结果：\n${transcript}`,
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
): Promise<string> {
  if (options.audioTranscribeProvider === "sensevoice") {
    return transcribeAudioWithSenseVoice(audioPath, options);
  }

  if (options.audioTranscribeProvider === "doubao") {
    return transcribeAudioWithDoubao(audioPath, options);
  }

  return transcribeAudioWithScript(audioPath, options);
}

async function transcribeAudioWithScript(
  audioPath: string,
  options: Pick<FeishuMediaProcessingOptions, "audioTranscribeScript" | "audioLanguage">,
): Promise<string> {
  const result = await execFileAsync(
    "bash",
    [options.audioTranscribeScript, audioPath, options.audioLanguage],
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
      options.audioLanguage,
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
  options: Pick<FeishuMediaProcessingOptions, "audioTranscribeDoubaoApiKey">,
): Promise<string> {
  const apiKey = options.audioTranscribeDoubaoApiKey.trim();
  if (!apiKey) {
    throw new Error("豆包语音未配置 FEISHU_AUDIO_TRANSCRIBE_DOUBAO_API_KEY");
  }

  const audioData = await readFile(audioPath);
  const response = await fetch(DOUBAO_FLASH_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": apiKey,
      "X-Api-Resource-Id": DOUBAO_RESOURCE_ID,
      "X-Api-Request-Id": randomUUID(),
      "X-Api-Sequence": "-1",
    },
    body: JSON.stringify({
      user: {
        uid: DOUBAO_UID,
      },
      audio: {
        data: audioData.toString("base64"),
      },
      request: {
        model_name: DOUBAO_MODEL_NAME,
      },
    }),
    signal: AbortSignal.timeout(EXTERNAL_PROCESS_TIMEOUT_MS),
  });

  const statusCode = response.headers.get("X-Api-Status-Code")?.trim();
  const apiMessage = response.headers.get("X-Api-Message")?.trim();
  const logId = response.headers.get("X-Tt-Logid")?.trim();
  const responseText = await response.text();

  let payload: DoubaoFlashResponse | null = null;
  if (responseText.trim()) {
    try {
      payload = JSON.parse(responseText) as DoubaoFlashResponse;
    } catch {
      throw new Error(formatDoubaoFailure("服务返回格式不正确", logId));
    }
  }

  if (!response.ok) {
    const reason = apiMessage || `HTTP ${response.status}`;
    throw new Error(formatDoubaoFailure(reason, logId));
  }

  if (statusCode && statusCode !== DOUBAO_SUCCESS_STATUS_CODE) {
    throw new Error(formatDoubaoFailure(apiMessage || `状态码 ${statusCode}`, logId));
  }

  const transcript = extractDoubaoTranscript(payload);
  if (!transcript) {
    throw new Error(`豆包语音转写没有产出文本${logId ? `（logid: ${logId}）` : ""}`);
  }

  return transcript;
}

function extractDoubaoTranscript(payload: DoubaoFlashResponse | null): string {
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
