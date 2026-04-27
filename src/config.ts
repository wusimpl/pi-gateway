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
  FEISHU_AUDIO_TRANSCRIBE_PROVIDER: z.enum(["whisper", "sensevoice", "doubao"]).default("whisper"),
  FEISHU_AUDIO_TRANSCRIBE_SCRIPT: z.string().default("~/.openclaw/skills/audio-transcribe/transcribe.sh"),
  FEISHU_AUDIO_TRANSCRIBE_LANGUAGE: z.string().default(""),
  FEISHU_AUDIO_TRANSCRIBE_SENSEVOICE_PYTHON: z.string().default("python3"),
  FEISHU_AUDIO_TRANSCRIBE_SENSEVOICE_MODEL: z.string().default("iic/SenseVoiceSmall"),
  FEISHU_AUDIO_TRANSCRIBE_SENSEVOICE_DEVICE: z.string().default("cpu"),
  FEISHU_AUDIO_TRANSCRIBE_DOUBAO_API_KEY: z.string().default(""),
  FEISHU_GROUP_CHAT_POLICY: z.enum(["disabled", "allowlist", "open"]).default("disabled"),
  FEISHU_GROUP_CHAT_ALLOWLIST: z.string().default("").transform(parseCommaSeparatedList),
  FEISHU_GROUP_MESSAGE_MODE: z.enum(["mention", "all"]).default("mention"),
  FEISHU_BOT_OPEN_ID: z.string().default("").transform((value) => value.trim() || undefined),
  FEISHU_OWNER_OPEN_IDS: z.string().default("").transform(parseCommaSeparatedList),
  DATA_DIR: z.string().default("./data"),
  PI_WORKSPACE_ROOT: z.string().default("~/code/pi-workspace"),
  PI_DISABLE_GLOBAL_AGENTS: z
    .string()
    .transform((v) => v === "true")
    .default("false"),
  CRON_ENABLED: z
    .string()
    .transform((v) => v === "true")
    .default("true"),
  CRON_DEFAULT_TZ: z.string().default("Asia/Shanghai"),
  CRON_JOB_TIMEOUT_MS: z.coerce.number().int().positive().default(30 * 60 * 1000),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
  STREAMING_ENABLED: z
    .string()
    .transform((v) => v === "true")
    .default("false"),
  TEXT_CHUNK_LIMIT: z.coerce.number().int().positive().default(2000),
  FEISHU_PROCESSING_REACTION_TYPE: z.string().optional(),
  FEISHU_STEERING_REACTION_TYPE: z.string().default("OnIt"),
});

type ParsedConfig = z.infer<typeof envSchema>;

export interface Config extends Omit<ParsedConfig, "FEISHU_PROCESSING_REACTION_TYPE" | "FEISHU_STEERING_REACTION_TYPE"> {
  FEISHU_PROCESSING_REACTION_TYPE: string | undefined;
  FEISHU_STEERING_REACTION_TYPE: string | undefined;
}

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
    FEISHU_PROCESSING_REACTION_TYPE: resolveReactionType(
      "FEISHU_PROCESSING_REACTION_TYPE",
      result.data.FEISHU_PROCESSING_REACTION_TYPE,
    ),
    FEISHU_STEERING_REACTION_TYPE: resolveReactionType(
      "FEISHU_STEERING_REACTION_TYPE",
      result.data.FEISHU_STEERING_REACTION_TYPE,
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

function resolveReactionType(envName: string, value?: string): string | undefined {
  const reactionType = sanitizeFeishuReactionType(value);
  if (!value || reactionType) return reactionType;

  logger.warn(`${envName} 非法，已自动禁用 reaction`, {
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

function parseCommaSeparatedList(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}
