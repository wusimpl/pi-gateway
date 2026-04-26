import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

export interface SkillUsageRecord {
  name: string;
  count: number;
  firstUsedAt: string;
  lastUsedAt: string;
  path?: string;
  scope?: string;
}

export interface SkillUsageIncrement {
  name: string;
  path?: string;
  scope?: string;
  usedAt?: string;
}

export interface SkillStatsStore {
  filePath: string;
  incrementSkillUsage(usage: SkillUsageIncrement): Promise<void>;
  listSkillUsage(): Promise<SkillUsageRecord[]>;
  reset(): Promise<void>;
}

interface SkillStatsFile {
  version: 1;
  skills: Record<string, SkillUsageRecord>;
}

export function createSkillStatsStore(dataDir: string): SkillStatsStore {
  const filePath = join(dataDir, "skill-usage-stats.json");
  let queue = Promise.resolve();

  function enqueue<T>(task: () => Promise<T>): Promise<T> {
    const next = queue.then(task, task);
    queue = next.then(() => undefined, () => undefined);
    return next;
  }

  return {
    filePath,
    incrementSkillUsage(usage) {
      return enqueue(async () => {
        const stats = await readStatsFile(filePath);
        const usedAt = usage.usedAt ?? new Date().toISOString();
        const current = stats.skills[usage.name];
        stats.skills[usage.name] = {
          name: usage.name,
          count: (current?.count ?? 0) + 1,
          firstUsedAt: current?.firstUsedAt ?? usedAt,
          lastUsedAt: usedAt,
          path: usage.path ?? current?.path,
          scope: usage.scope ?? current?.scope,
        };
        await writeStatsFile(filePath, stats);
      });
    },
    listSkillUsage() {
      return enqueue(async () => {
        const stats = await readStatsFile(filePath);
        return Object.values(stats.skills).sort(compareSkillUsageRecords);
      });
    },
    reset() {
      return enqueue(async () => {
        await writeStatsFile(filePath, emptyStatsFile());
      });
    },
  };
}

function compareSkillUsageRecords(left: SkillUsageRecord, right: SkillUsageRecord): number {
  if (left.count !== right.count) {
    return right.count - left.count;
  }
  if (left.lastUsedAt !== right.lastUsedAt) {
    return right.lastUsedAt.localeCompare(left.lastUsedAt);
  }
  return left.name.localeCompare(right.name);
}

async function readStatsFile(filePath: string): Promise<SkillStatsFile> {
  try {
    const raw = await readFile(filePath, "utf8");
    return normalizeStatsFile(JSON.parse(raw));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return emptyStatsFile();
    }
    throw error;
  }
}

async function writeStatsFile(filePath: string, stats: SkillStatsFile): Promise<void> {
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(stats, null, 2)}\n`, "utf8");
}

function emptyStatsFile(): SkillStatsFile {
  return {
    version: 1,
    skills: {},
  };
}

function normalizeStatsFile(value: unknown): SkillStatsFile {
  if (!value || typeof value !== "object") {
    return emptyStatsFile();
  }

  const raw = value as { skills?: unknown };
  if (!raw.skills || typeof raw.skills !== "object" || Array.isArray(raw.skills)) {
    return emptyStatsFile();
  }

  const skills: Record<string, SkillUsageRecord> = {};
  for (const [name, record] of Object.entries(raw.skills as Record<string, unknown>)) {
    const normalized = normalizeSkillUsageRecord(name, record);
    if (normalized) {
      skills[normalized.name] = normalized;
    }
  }

  return {
    version: 1,
    skills,
  };
}

function normalizeSkillUsageRecord(name: string, value: unknown): SkillUsageRecord | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const raw = value as Partial<SkillUsageRecord>;
  const normalizedName = typeof raw.name === "string" && raw.name.trim() ? raw.name : name;
  const count = typeof raw.count === "number" && Number.isFinite(raw.count) ? Math.max(0, Math.floor(raw.count)) : 0;
  if (count <= 0) {
    return null;
  }

  const now = new Date().toISOString();
  return {
    name: normalizedName,
    count,
    firstUsedAt: typeof raw.firstUsedAt === "string" ? raw.firstUsedAt : now,
    lastUsedAt: typeof raw.lastUsedAt === "string" ? raw.lastUsedAt : now,
    path: typeof raw.path === "string" ? raw.path : undefined,
    scope: typeof raw.scope === "string" ? raw.scope : undefined,
  };
}
