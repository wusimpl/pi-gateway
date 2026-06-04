import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { Config } from "../config.js";
import { logger } from "../app/logger.js";

export type PersistedP2PRoutingConfig = Pick<
  Config,
  "FEISHU_P2P_CHAT_POLICY" | "FEISHU_P2P_CHAT_ALLOWLIST"
>;

export interface P2PSettingsStore {
  readP2PRoutingConfig(): Promise<PersistedP2PRoutingConfig | null>;
  writeP2PRoutingConfig(config: PersistedP2PRoutingConfig): Promise<void>;
}

export function createP2PSettingsStore(dataDir: string): P2PSettingsStore {
  function configDir(): string {
    return join(dataDir, "settings");
  }

  function configPath(): string {
    return join(configDir(), "p2p-routing.json");
  }

  async function readP2PRoutingConfig(): Promise<PersistedP2PRoutingConfig | null> {
    try {
      const raw = await readFile(configPath(), "utf-8");
      return normalizePersistedP2PRoutingConfig(JSON.parse(raw) as Partial<PersistedP2PRoutingConfig>);
    } catch {
      return null;
    }
  }

  async function writeP2PRoutingConfig(config: PersistedP2PRoutingConfig): Promise<void> {
    await mkdir(configDir(), { recursive: true });
    const normalized = normalizePersistedP2PRoutingConfig(config);
    await writeFile(configPath(), JSON.stringify(normalized, null, 2), "utf-8");
    logger.debug("私聊路由配置已写入", {
      policy: normalized.FEISHU_P2P_CHAT_POLICY,
      allowlistCount: normalized.FEISHU_P2P_CHAT_ALLOWLIST.length,
    });
  }

  return {
    readP2PRoutingConfig,
    writeP2PRoutingConfig,
  };
}

export function normalizePersistedP2PRoutingConfig(
  config: Partial<PersistedP2PRoutingConfig>,
): PersistedP2PRoutingConfig {
  return {
    FEISHU_P2P_CHAT_POLICY: normalizeP2PPolicy(config.FEISHU_P2P_CHAT_POLICY),
    FEISHU_P2P_CHAT_ALLOWLIST: normalizeStringList(config.FEISHU_P2P_CHAT_ALLOWLIST ?? []),
  };
}

function normalizeP2PPolicy(
  policy: Config["FEISHU_P2P_CHAT_POLICY"] | undefined,
): Config["FEISHU_P2P_CHAT_POLICY"] {
  return policy === "whitelist" ? "whitelist" : "all";
}

function normalizeStringList(items: readonly string[]): string[] {
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
