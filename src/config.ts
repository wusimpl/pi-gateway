import { z } from "zod";
import "dotenv/config";
import { logger } from "./app/logger.js";
import { sanitizeFeishuReactionType } from "./feishu/reaction-types.js";

const envSchema = z.object({
  FEISHU_APP_ID: z.string().min(1, "FEISHU_APP_ID is required"),
  FEISHU_APP_SECRET: z.string().min(1, "FEISHU_APP_SECRET is required"),
  FEISHU_DOMAIN: z.enum(["feishu", "larksuite"]).default("feishu"),
  DATA_DIR: z.string().default("./data"),
  PI_WORKSPACE_ROOT: z.string().default("~/code/pi-workspace"),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
  STREAMING_ENABLED: z
    .string()
    .transform((v) => v === "true")
    .default("true"),
  TEXT_CHUNK_LIMIT: z.coerce.number().int().positive().default(2000),
  FEISHU_PROCESSING_REACTION_TYPE: z.string().optional(),
});

export type Config = z.infer<typeof envSchema>;

let _config: Config | null = null;

export function loadConfig(): Config {
  if (_config) return _config;

  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const errors = result.error.errors
      .map((e) => `  - ${e.path.join(".")}: ${e.message}`)
      .join("\n");
    throw new Error(`配置校验失败:\n${errors}`);
  }

  _config = {
    ...result.data,
    FEISHU_PROCESSING_REACTION_TYPE: resolveProcessingReactionType(
      result.data.FEISHU_PROCESSING_REACTION_TYPE
    ),
    PI_WORKSPACE_ROOT: expandHomeDir(result.data.PI_WORKSPACE_ROOT),
  };
  return _config;
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
