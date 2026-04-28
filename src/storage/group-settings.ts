import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { Config } from "../config.js";
import { logger } from "../app/logger.js";

export type PersistedGroupRoutingConfig = Pick<
  Config,
  | "FEISHU_GROUP_CHAT_POLICY"
  | "FEISHU_GROUP_CHAT_ALLOWLIST"
  | "FEISHU_GROUP_MESSAGE_MODE"
  | "FEISHU_GROUP_MESSAGE_KEYWORDS"
>;

export interface GroupSettingsStore {
  readGroupRoutingConfig(chatId: string): Promise<PersistedGroupRoutingConfig | null>;
  writeGroupRoutingConfig(chatId: string, config: PersistedGroupRoutingConfig): Promise<void>;
}

export function createGroupSettingsStore(dataDir: string): GroupSettingsStore {
  function conversationDir(chatId: string): string {
    return join(dataDir, "conversations", encodeURIComponent(chatId));
  }

  function configPath(chatId: string): string {
    return join(conversationDir(chatId), "group-routing.json");
  }

  async function ensureDir(dir: string): Promise<void> {
    await mkdir(dir, { recursive: true });
  }

  async function readGroupRoutingConfig(chatId: string): Promise<PersistedGroupRoutingConfig | null> {
    try {
      const raw = await readFile(configPath(chatId), "utf-8");
      return normalizePersistedGroupRoutingConfig(JSON.parse(raw) as Partial<PersistedGroupRoutingConfig>);
    } catch {
      return null;
    }
  }

  async function writeGroupRoutingConfig(chatId: string, config: PersistedGroupRoutingConfig): Promise<void> {
    await ensureDir(conversationDir(chatId));
    const normalized = normalizePersistedGroupRoutingConfig(config);
    await writeFile(configPath(chatId), JSON.stringify(normalized, null, 2), "utf-8");
    logger.debug("群聊路由配置已写入", {
      chatId,
      policy: normalized.FEISHU_GROUP_CHAT_POLICY,
      mode: normalized.FEISHU_GROUP_MESSAGE_MODE,
    });
  }

  return {
    readGroupRoutingConfig,
    writeGroupRoutingConfig,
  };
}

export function normalizePersistedGroupRoutingConfig(
  config: Partial<PersistedGroupRoutingConfig>,
): PersistedGroupRoutingConfig {
  return {
    FEISHU_GROUP_CHAT_POLICY: normalizeGroupPolicy(config.FEISHU_GROUP_CHAT_POLICY),
    FEISHU_GROUP_CHAT_ALLOWLIST: normalizeStringList(config.FEISHU_GROUP_CHAT_ALLOWLIST ?? []),
    FEISHU_GROUP_MESSAGE_MODE: normalizeGroupMode(config.FEISHU_GROUP_MESSAGE_MODE),
    FEISHU_GROUP_MESSAGE_KEYWORDS: normalizeStringList(config.FEISHU_GROUP_MESSAGE_KEYWORDS ?? []),
  };
}

function normalizeGroupPolicy(
  policy: Config["FEISHU_GROUP_CHAT_POLICY"] | undefined,
): Config["FEISHU_GROUP_CHAT_POLICY"] {
  if (policy === "disabled" || policy === "allowlist" || policy === "open") {
    return policy;
  }
  return "disabled";
}

function normalizeGroupMode(
  mode: Config["FEISHU_GROUP_MESSAGE_MODE"] | undefined,
): Config["FEISHU_GROUP_MESSAGE_MODE"] {
  if (mode === "mention" || mode === "all" || mode === "keyword") {
    return mode;
  }
  return "mention";
}

function normalizeStringList(items: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const item of items) {
    const normalized = item.trim();
    if (!normalized || seen.has(normalized)) {
      continue;
    }
    seen.add(normalized);
    result.push(normalized);
  }
  return result;
}
