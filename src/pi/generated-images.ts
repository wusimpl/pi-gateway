import { mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { tmpdir } from "node:os";
import type { ConversationTarget } from "../conversation.js";
import type { FeishuMessenger } from "../feishu/send.js";
import { logger } from "../app/logger.js";

export type GeneratedImageRecipient = string | ConversationTarget;

export interface GeneratedImageDispatchResult {
  text: string;
  sentCount: number;
}

type GeneratedImageMessenger = Pick<FeishuMessenger, "sendLocalImageMessage">;

interface GeneratedImageCandidate {
  url: string;
  rawUrl: string;
  start: number;
  end: number;
}

const GENERATED_IMAGE_URL_RE = /https?:\/\/(?:localhost|127\.0\.0\.1|\[::1\])(?::\d+)?\/v1\/generated-images\/([a-f0-9]{32}\.(?:png|jpg|jpeg|webp|gif|bmp))(?=[\s)\]}>"'。！？；，、]|$)/gi;
const MARKDOWN_IMAGE_RE = /!\[[^\]\r\n]*\]\(([^)\s]+)\)/g;
const GENERATED_IMAGE_MAX_BYTES = 10 * 1024 * 1024;
const GENERATED_IMAGE_FETCH_TIMEOUT_MS = 30_000;
const CONTENT_TYPE_BY_EXT: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
  bmp: "image/bmp",
};

export async function dispatchGeneratedImagesFromText(
  messenger: GeneratedImageMessenger | undefined,
  recipient: GeneratedImageRecipient,
  text: string,
): Promise<GeneratedImageDispatchResult> {
  if (!messenger || !hasGeneratedImageURL(text)) {
    return { text, sentCount: 0 };
  }

  const candidates = collectGeneratedImageCandidates(text);
  if (candidates.length === 0) {
    return { text, sentCount: 0 };
  }

  const sentRanges: Array<{ start: number; end: number }> = [];
  let sentCount = 0;
  for (const candidate of candidates) {
    try {
      const downloaded = await downloadGeneratedImage(candidate.url);
      const tempPath = await writeGeneratedImageTempFile(downloaded.fileName, downloaded.data);
      try {
        await messenger.sendLocalImageMessage(recipient, {
          path: tempPath,
          fileName: downloaded.fileName,
        });
        sentRanges.push({ start: candidate.start, end: candidate.end });
        sentCount += 1;
      } finally {
        await rm(tempPath, { force: true }).catch(() => undefined);
      }
    } catch (error) {
      logger.warn("CPA 生成图片转飞书图片失败，保留原始链接", {
        url: candidate.url,
        error: String(error),
      });
    }
  }

  if (sentRanges.length === 0) {
    return { text, sentCount: 0 };
  }

  return {
    text: removeRangesFromText(text, sentRanges),
    sentCount,
  };
}

export function hasGeneratedImageURL(text: string): boolean {
  GENERATED_IMAGE_URL_RE.lastIndex = 0;
  return GENERATED_IMAGE_URL_RE.test(text);
}

function collectGeneratedImageCandidates(text: string): GeneratedImageCandidate[] {
  const candidates: GeneratedImageCandidate[] = [];
  const seen = new Set<string>();

  MARKDOWN_IMAGE_RE.lastIndex = 0;
  for (const match of text.matchAll(MARKDOWN_IMAGE_RE)) {
    const rawUrl = match[1] ?? "";
    const normalizedUrl = normalizeGeneratedImageURL(rawUrl);
    if (!normalizedUrl) {
      continue;
    }
    const key = normalizedUrl.toLowerCase();
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    candidates.push({
      url: normalizedUrl,
      rawUrl,
      start: match.index ?? 0,
      end: (match.index ?? 0) + match[0].length,
    });
  }

  GENERATED_IMAGE_URL_RE.lastIndex = 0;
  for (const match of text.matchAll(GENERATED_IMAGE_URL_RE)) {
    const rawUrl = match[0];
    const normalizedUrl = normalizeGeneratedImageURL(rawUrl);
    if (!normalizedUrl) {
      continue;
    }
    const key = normalizedUrl.toLowerCase();
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    candidates.push({
      url: normalizedUrl,
      rawUrl,
      start: match.index ?? 0,
      end: (match.index ?? 0) + rawUrl.length,
    });
  }

  return candidates.sort((a, b) => a.start - b.start);
}

function normalizeGeneratedImageURL(rawUrl: string): string | null {
  const trimmed = rawUrl.trim();
  if (!trimmed) {
    return null;
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return null;
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return null;
  }
  if (!isLocalGeneratedImageHost(parsed.hostname)) {
    return null;
  }
  if (!/^\/v1\/generated-images\/[a-f0-9]{32}\.(?:png|jpg|jpeg|webp|gif|bmp)$/i.test(parsed.pathname)) {
    return null;
  }
  return parsed.toString();
}

function isLocalGeneratedImageHost(hostname: string): boolean {
  const normalized = hostname.toLowerCase();
  return normalized === "localhost" || normalized === "127.0.0.1" || normalized === "[::1]" || normalized === "::1";
}

async function downloadGeneratedImage(url: string): Promise<{ data: Buffer; fileName: string }> {
  let lastError: unknown;
  for (const fetchUrl of generatedImageFetchURLs(url)) {
    try {
      return await downloadGeneratedImageOnce(fetchUrl, url);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError instanceof Error ? lastError : new Error("下载生成图片失败");
}

async function downloadGeneratedImageOnce(fetchUrl: string, originalUrl: string): Promise<{ data: Buffer; fileName: string }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), GENERATED_IMAGE_FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(fetchUrl, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`下载失败: HTTP ${response.status}`);
    }

    const contentType = response.headers.get("content-type")?.split(";")[0]?.trim().toLowerCase() ?? "";
    if (contentType && !contentType.startsWith("image/")) {
      throw new Error(`返回的不是图片: ${contentType}`);
    }

    const contentLength = Number(response.headers.get("content-length") ?? "0");
    if (Number.isFinite(contentLength) && contentLength > GENERATED_IMAGE_MAX_BYTES) {
      throw new Error("图片超过飞书 10MB 限制");
    }

    const data = Buffer.from(await response.arrayBuffer());
    if (data.length === 0) {
      throw new Error("图片内容为空");
    }
    if (data.length > GENERATED_IMAGE_MAX_BYTES) {
      throw new Error("图片超过飞书 10MB 限制");
    }

    const fileName = fileNameFromGeneratedImageURL(originalUrl, contentType);
    return { data, fileName };
  } finally {
    clearTimeout(timeout);
  }
}

function generatedImageFetchURLs(url: string): string[] {
  const parsed = new URL(url);
  const urls = [parsed.toString()];
  if (parsed.protocol === "https:" && isLocalGeneratedImageHost(parsed.hostname)) {
    parsed.protocol = "http:";
    urls.push(parsed.toString());
  }
  return urls;
}

function fileNameFromGeneratedImageURL(url: string, contentType: string): string {
  const parsed = new URL(url);
  const rawName = parsed.pathname.split("/").pop() ?? `generated-${randomUUID()}.png`;
  const ext = rawName.split(".").pop()?.toLowerCase() ?? "png";
  const expectedContentType = CONTENT_TYPE_BY_EXT[ext];
  if (!contentType || !expectedContentType || contentType === expectedContentType) {
    return rawName;
  }
  return replaceFileExtension(rawName, extensionFromContentType(contentType));
}

function extensionFromContentType(contentType: string): string {
  switch (contentType) {
    case "image/jpeg":
    case "image/jpg":
      return ".jpg";
    case "image/webp":
      return ".webp";
    case "image/gif":
      return ".gif";
    case "image/bmp":
      return ".bmp";
    default:
      return ".png";
  }
}

function replaceFileExtension(fileName: string, ext: string): string {
  const dotIndex = fileName.lastIndexOf(".");
  if (dotIndex === -1) {
    return fileName + ext;
  }
  return fileName.slice(0, dotIndex) + ext;
}

async function writeGeneratedImageTempFile(fileName: string, data: Buffer): Promise<string> {
  const dir = join(tmpdir(), "pi-gateway-generated-images");
  await mkdir(dir, { recursive: true });
  const path = join(dir, `${randomUUID()}-${sanitizeFileName(fileName)}`);
  await writeFile(path, data, { mode: 0o600 });
  return path;
}

function sanitizeFileName(fileName: string): string {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "_") || "generated.png";
}

function removeRangesFromText(text: string, ranges: Array<{ start: number; end: number }>): string {
  const sorted = ranges.slice().sort((a, b) => b.start - a.start);
  let result = text;
  for (const range of sorted) {
    result = result.slice(0, range.start) + result.slice(range.end);
  }
  return normalizeGeneratedImageText(result);
}

function normalizeGeneratedImageText(text: string): string {
  return text
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
