import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { createCronStore } from "../src/cron/store.js";

describe("cron store", () => {
  it("jobs.json 不存在时返回空数组", async () => {
    const dataDir = await mkdtemp(join(tmpdir(), "pi-gateway-cron-store-"));
    const store = createCronStore(dataDir);

    await expect(store.loadJobs()).resolves.toEqual([]);
  });

  it("会把任务持久化到 data/cron/jobs.json", async () => {
    const dataDir = await mkdtemp(join(tmpdir(), "pi-gateway-cron-store-"));
    const store = createCronStore(dataDir);

    await store.saveJobs([
      {
        id: "cron_1",
        openId: "ou_1",
        userId: "u_1",
        name: "提醒我喝水",
        enabled: true,
        prompt: "提醒我喝水。",
        schedule: {
          kind: "at",
          atMs: 1,
        },
        deleteAfterRun: true,
        createdAtMs: 1,
        updatedAtMs: 1,
        state: {
          nextRunAtMs: 1,
        },
      },
    ]);

    await expect(store.loadJobs()).resolves.toMatchObject([
      {
        id: "cron_1",
        name: "提醒我喝水",
      },
    ]);
    await expect(readFile(join(dataDir, "cron", "jobs.json"), "utf-8")).resolves.toContain("cron_1");
  });
});

