import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { logger } from "../app/logger.js";

export interface AdminSettingsStore {
  readAdminOpenIds(): Promise<string[]>;
  writeAdminOpenIds(openIds: string[]): Promise<void>;
}

export function createAdminSettingsStore(dataDir: string): AdminSettingsStore {
  function settingsDir(): string {
    return join(dataDir, "settings");
  }

  function configPath(): string {
    return join(settingsDir(), "admins.json");
  }

  async function readAdminOpenIds(): Promise<string[]> {
    try {
      const raw = await readFile(configPath(), "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return dedupeOpenIds(parsed.filter((item): item is string => typeof item === "string"));
      }
      return [];
    } catch {
      return [];
    }
  }

  async function writeAdminOpenIds(openIds: string[]): Promise<void> {
    await mkdir(settingsDir(), { recursive: true });
    const normalized = dedupeOpenIds(openIds);
    await writeFile(configPath(), JSON.stringify(normalized, null, 2), "utf-8");
    logger.debug("admin 列表已写入", { count: normalized.length });
  }

  function dedupeOpenIds(items: readonly string[]): string[] {
    const seen = new Set<string>();
    const result: string[] = [];
    for (const item of items) {
      const normalized = item.trim();
      if (!normalized || seen.has(normalized)) continue;
      seen.add(normalized);
      result.push(normalized);
    }
    return result;
  }

  return { readAdminOpenIds, writeAdminOpenIds };
}
