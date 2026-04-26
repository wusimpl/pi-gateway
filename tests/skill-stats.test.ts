import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { createSkillStatsStore } from "../src/pi/skill-stats.js";

let tempDir: string | null = null;

async function createTempDir() {
  tempDir = await mkdtemp(join(tmpdir(), "pi-skill-stats-"));
  return tempDir;
}

afterEach(async () => {
  if (tempDir) {
    await rm(tempDir, { recursive: true, force: true });
    tempDir = null;
  }
});

describe("skill stats store", () => {
  it("会按调用次数降序列出 skill 使用统计", async () => {
    const dir = await createTempDir();
    const store = createSkillStatsStore(dir);

    await store.incrementSkillUsage({ name: "pdf2md", usedAt: "2026-04-16T10:00:00.000Z" });
    await store.incrementSkillUsage({ name: "asr-transcribe", usedAt: "2026-04-16T11:00:00.000Z" });
    await store.incrementSkillUsage({ name: "pdf2md", usedAt: "2026-04-16T12:00:00.000Z" });

    expect(await store.listSkillUsage()).toEqual([
      {
        name: "pdf2md",
        count: 2,
        firstUsedAt: "2026-04-16T10:00:00.000Z",
        lastUsedAt: "2026-04-16T12:00:00.000Z",
        path: undefined,
        scope: undefined,
      },
      {
        name: "asr-transcribe",
        count: 1,
        firstUsedAt: "2026-04-16T11:00:00.000Z",
        lastUsedAt: "2026-04-16T11:00:00.000Z",
        path: undefined,
        scope: undefined,
      },
    ]);
  });

  it("reset 会清空统计数据", async () => {
    const dir = await createTempDir();
    const store = createSkillStatsStore(dir);

    await store.incrementSkillUsage({ name: "pdf2md" });
    await store.reset();

    expect(await store.listSkillUsage()).toEqual([]);
  });

  it("会忽略损坏记录里的无效项", async () => {
    const dir = await createTempDir();
    await writeFile(
      join(dir, "skill-usage-stats.json"),
      JSON.stringify({
        version: 1,
        skills: {
          valid: { name: "valid", count: 1, firstUsedAt: "a", lastUsedAt: "b" },
          invalid: { name: "invalid", count: 0 },
        },
      }),
      "utf8",
    );

    const store = createSkillStatsStore(dir);

    expect(await store.listSkillUsage()).toEqual([
      {
        name: "valid",
        count: 1,
        firstUsedAt: "a",
        lastUsedAt: "b",
        path: undefined,
        scope: undefined,
      },
    ]);
  });
});
