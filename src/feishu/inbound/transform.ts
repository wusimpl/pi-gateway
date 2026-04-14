import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import { promisify } from "node:util";
import type { AgentSession } from "@mariozechner/pi-coding-agent";
import type { FeishuInboundMessage, FeishuMediaProcessingOptions, PreparedPromptInput } from "./types.js";
import { downloadFeishuResource } from "./resource.js";

const execFileAsync = promisify(execFile);
const OCR_PROMPT = "请提取这张图片里的全部文字，按阅读顺序输出；如果没有可读文字，就简短描述主要内容。";
const EXTERNAL_PROCESS_TIMEOUT_MS = 10 * 60 * 1000;

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
        text: message.text,
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
          text: `用户发来了一张图片，图片已保存到本地：${resource.filePath}\n请直接查看图片内容并继续对话；如果用户没写额外说明，就先简短描述图片里有什么。`,
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
        text: `用户发来了一张图片，图片已保存到本地：${resource.filePath}\n当前模型不支持直接看图，以下是本地 OCR/视觉结果：\n${ocrText}`,
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
        text: `用户发来了一段语音，音频已保存到本地：${resource.filePath}${durationLine}\n以下是本地转写结果：\n${transcript}`,
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
