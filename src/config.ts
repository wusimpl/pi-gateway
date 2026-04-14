import { z } from "zod";
import "dotenv/config";

const envSchema = z.object({
  FEISHU_APP_ID: z.string().min(1, "FEISHU_APP_ID is required"),
  FEISHU_APP_SECRET: z.string().min(1, "FEISHU_APP_SECRET is required"),
  FEISHU_DOMAIN: z.enum(["feishu", "larksuite"]).default("feishu"),
  DATA_DIR: z.string().default("./data"),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
  STREAMING_ENABLED: z
    .string()
    .transform((v) => v === "true")
    .default("true"),
  TEXT_CHUNK_LIMIT: z.coerce.number().int().positive().default(2000),
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

  _config = result.data;
  return _config;
}
