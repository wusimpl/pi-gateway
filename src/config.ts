import { z } from "zod";
import "dotenv/config";
import { logger } from "./app/logger.js";
import { sanitizeFeishuReactionType } from "./feishu/reaction-types.js";

const envSchema = z.object({
  FEISHU_APP_ID: z.string().min(1, "FEISHU_APP_ID is required"),
  FEISHU_APP_SECRET: z.string().min(1, "FEISHU_APP_SECRET is required"),
  FEISHU_DOMAIN: z.enum(["feishu", "larksuite"]).default("feishu"),
  FEISHU_MEDIA_OLLAMA_BASE_URL: z.string().url().default("http://127.0.0.1:11434"),
  FEISHU_MEDIA_OCR_MODEL: z.string().default("glm-ocr:latest"),
  FEISHU_AUDIO_TRANSCRIBE_PROVIDER: z.enum(["whisper", "sensevoice"]).default("whisper"),
  FEISHU_AUDIO_TRANSCRIBE_SCRIPT: z.string().default("~/.openclaw/skills/audio-transcribe/transcribe.sh"),
  FEISHU_AUDIO_TRANSCRIBE_LANGUAGE: z.string().default("zh"),
  FEISHU_AUDIO_TRANSCRIBE_SENSEVOICE_PYTHON: z.string().default("python3"),
  FEISHU_AUDIO_TRANSCRIBE_SENSEVOICE_MODEL: z.string().default("iic/SenseVoiceSmall"),
  FEISHU_AUDIO_TRANSCRIBE_SENSEVOICE_DEVICE: z.string().default("cpu"),
  DATA_DIR: z.string().default("./data"),
  PI_WORKSPACE_ROOT: z.string().default("~/code/pi-workspace"),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
  STREAMING_ENABLED: z
    .string()
    .transform((v) => v === "true")
    .default("false"),
  TEXT_CHUNK_LIMIT: z.coerce.number().int().positive().default(2000),
  FEISHU_PROCESSING_REACTION_TYPE: z.string().optional(),
});

export type Config = z.infer<typeof envSchema>;

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const result = envSchema.safeParse(env);
  if (!result.success) {
    const errors = result.error.errors
      .map((e) => `  - ${e.path.join(".")}: ${e.message}`)
      .join("\n");
    throw new Error(`配置校验失败:\n${errors}`);
  }

  return {
    ...result.data,
    FEISHU_PROCESSING_REACTION_TYPE: resolveProcessingReactionType(
      result.data.FEISHU_PROCESSING_REACTION_TYPE,
    ),
    FEISHU_AUDIO_TRANSCRIBE_SCRIPT: expandHomeDir(result.data.FEISHU_AUDIO_TRANSCRIBE_SCRIPT),
    FEISHU_AUDIO_TRANSCRIBE_SENSEVOICE_PYTHON: expandHomeDir(
      result.data.FEISHU_AUDIO_TRANSCRIBE_SENSEVOICE_PYTHON,
    ),
    FEISHU_AUDIO_TRANSCRIBE_SENSEVOICE_MODEL: expandHomeDir(
      result.data.FEISHU_AUDIO_TRANSCRIBE_SENSEVOICE_MODEL,
    ),
    PI_WORKSPACE_ROOT: expandHomeDir(result.data.PI_WORKSPACE_ROOT),
  };
}

function resolveProcessingReactionType(value?: string): string | undefined {
  const reactionType = sanitizeFeishuReactionType(value);
  if (!value || reactionType) return reactionType;

  logger.warn("FEISHU_PROCESSING_REACTION_TYPE 非法，已自动禁用 reaction", {
    reactionType: value,
  });
  return undefined;
}

function expandHomeDir(value: string): string {
  if (value === "~") {
    return process.env.HOME || process.env.USERPROFILE || value;
  }

  if (value.startsWith("~/") || value.startsWith("~\\")) {
    const home = process.env.HOME || process.env.USERPROFILE;
    if (!home) return value;
    return `${home}${value.slice(1)}`;
  }

  return value;
}
