import { mkdir, readdir, stat, unlink, rm } from "node:fs/promises";
import { join } from "node:path";
import { logger } from "../app/logger.js";

/** 确保目录存在 */
export async function ensureDir(dir: string): Promise<void> {
  await mkdir(dir, { recursive: true });
}

/** 安全删除文件 */
export async function safeDelete(filePath: string): Promise<boolean> {
  try {
    await unlink(filePath);
    return true;
  } catch {
    return false;
  }
}

/** 列出目录下的子目录名 */
export async function listSubDirs(dir: string): Promise<string[]> {
  try {
    const entries = await readdir(dir);
    const dirs: string[] = [];
    for (const entry of entries) {
      const s = await stat(join(dir, entry));
      if (s.isDirectory()) {
        dirs.push(entry);
      }
    }
    return dirs;
  } catch {
    return [];
  }
}
