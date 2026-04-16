import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { logger } from "../app/logger.js";
import type { CronJob } from "./types.js";

export interface CronStore {
  getFilePath(): string;
  loadJobs(): Promise<CronJob[]>;
  saveJobs(jobs: CronJob[]): Promise<void>;
}

export function createCronStore(dataDir: string): CronStore {
  const cronDir = join(dataDir, "cron");
  const jobsFile = join(cronDir, "jobs.json");

  async function ensureCronDir(): Promise<void> {
    await mkdir(cronDir, { recursive: true });
  }

  async function loadJobs(): Promise<CronJob[]> {
    try {
      const raw = await readFile(jobsFile, "utf-8");
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        throw new Error("cron jobs.json 必须是数组");
      }
      return parsed as CronJob[];
    } catch (error) {
      if ((error as NodeJS.ErrnoException)?.code === "ENOENT") {
        return [];
      }
      throw error;
    }
  }

  async function saveJobs(jobs: CronJob[]): Promise<void> {
    await ensureCronDir();
    await writeFile(jobsFile, JSON.stringify(jobs, null, 2), "utf-8");
    logger.debug("cron jobs 已写入", { jobsFile, count: jobs.length });
  }

  return {
    getFilePath: () => jobsFile,
    loadJobs,
    saveJobs,
  };
}

