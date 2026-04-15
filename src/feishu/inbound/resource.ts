import { basename, extname, join, posix, sep } from "node:path";
import { ensureDir } from "../../storage/files.js";
import { getLarkClient } from "../client.js";
import type { DownloadedFeishuResource } from "./types.js";

export interface FeishuResourceResponse {
  headers: unknown;
  writeFile(filePath: string): Promise<void>;
}

export interface FeishuResourceClient {
  im: {
    messageResource: {
      get(args: {
        params: { type: "image" | "file" };
        path: {
          message_id: string;
          file_key: string;
        };
      }): Promise<FeishuResourceResponse>;
    };
  };
}

export interface DownloadFeishuResourceOptions {
  workspaceDir: string;
  messageId: string;
  fileKey: string;
  resourceType: DownloadedFeishuResource["resourceType"];
  fileNameHint?: string;
}

const DEFAULT_EXTENSIONS: Record<DownloadedFeishuResource["resourceType"], string> = {
  image: ".png",
  audio: ".ogg",
};

const MIME_EXTENSIONS: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/bmp": ".bmp",
  "audio/ogg": ".ogg",
  "audio/opus": ".opus",
  "audio/mpeg": ".mp3",
  "audio/mp4": ".m4a",
  "audio/x-m4a": ".m4a",
  "audio/wav": ".wav",
  "audio/x-wav": ".wav",
};

export function createFeishuResourceDownloader(client: FeishuResourceClient) {
  return (options: DownloadFeishuResourceOptions) => downloadFeishuResource(options, client);
}

export async function downloadFeishuResource(
  options: DownloadFeishuResourceOptions,
  client: FeishuResourceClient = getLarkClient() as unknown as FeishuResourceClient,
): Promise<DownloadedFeishuResource> {
  const inboxDir = getFeishuInboxDir(options.workspaceDir, options.messageId);
  await ensureDir(inboxDir);

  const downloadType = resolveDownloadType(options.resourceType);
  const response = await client.im.messageResource.get({
    params: { type: downloadType },
    path: {
      message_id: options.messageId,
      file_key: options.fileKey,
    },
  });

  const headers = normalizeHeaders(response.headers);
  const mimeType = normalizeMimeType(headers["content-type"], options.resourceType);
  const headerFileName = parseContentDisposition(headers["content-disposition"]);
  const fileName = buildResourceFileName({
    resourceType: options.resourceType,
    fileKey: options.fileKey,
    mimeType,
    fileNameHint: options.fileNameHint,
    headerFileName,
  });
  const filePath = join(inboxDir, fileName);

  await response.writeFile(filePath);

  return {
    resourceType: options.resourceType,
    downloadType,
    fileKey: options.fileKey,
    filePath,
    fileName,
    mimeType,
  };
}

export function getFeishuInboxDir(workspaceDir: string, messageId: string): string {
  return joinPreserveStyle(workspaceDir, ".feishu-inbox", sanitizePathSegment(messageId));
}

export function resolveDownloadType(resourceType: DownloadedFeishuResource["resourceType"]): "image" | "file" {
  return resourceType === "image" ? "image" : "file";
}

function buildResourceFileName(options: {
  resourceType: DownloadedFeishuResource["resourceType"];
  fileKey: string;
  mimeType: string;
  fileNameHint?: string;
  headerFileName?: string;
}): string {
  const preferredName = options.fileNameHint || options.headerFileName || `${options.resourceType}-${options.fileKey}`;
  const sanitizedBase = sanitizeFileName(stripExtension(preferredName)) || `${options.resourceType}-${options.fileKey}`;
  const currentExt = extname(preferredName);
  const resolvedExt = currentExt || MIME_EXTENSIONS[options.mimeType] || DEFAULT_EXTENSIONS[options.resourceType];
  return `${sanitizedBase}${resolvedExt}`;
}

function normalizeHeaders(headers: unknown): Record<string, string> {
  if (!headers || typeof headers !== "object") {
    return {};
  }

  return Object.entries(headers as Record<string, unknown>).reduce<Record<string, string>>((acc, [key, value]) => {
    if (typeof value === "string") {
      acc[key.toLowerCase()] = value;
    } else if (Array.isArray(value) && typeof value[0] === "string") {
      acc[key.toLowerCase()] = value[0];
    }
    return acc;
  }, {});
}

function normalizeMimeType(value: string | undefined, resourceType: DownloadedFeishuResource["resourceType"]): string {
  if (!value) {
    return resourceType === "image" ? "image/png" : "audio/ogg";
  }
  return value.split(";")[0]?.trim().toLowerCase() || (resourceType === "image" ? "image/png" : "audio/ogg");
}

function parseContentDisposition(value: string | undefined): string | undefined {
  if (!value) {
    return undefined;
  }

  const utf8Match = value.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    return safeDecodeURIComponent(utf8Match[1]);
  }

  const quotedMatch = value.match(/filename="([^"]+)"/i);
  if (quotedMatch?.[1]) {
    return quotedMatch[1];
  }

  const plainMatch = value.match(/filename=([^;]+)/i);
  if (plainMatch?.[1]) {
    return plainMatch[1].trim();
  }

  return undefined;
}

function stripExtension(fileName: string): string {
  const base = basename(fileName);
  const extension = extname(base);
  return extension ? base.slice(0, -extension.length) : base;
}

function sanitizeFileName(fileName: string): string {
  return fileName.trim().replace(/[^a-zA-Z0-9._-]/g, "_");
}

function sanitizePathSegment(value: string): string {
  const sanitized = value.trim().replace(/[^a-zA-Z0-9._-]/g, "_");
  return sanitized || "unknown";
}

function safeDecodeURIComponent(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function joinPreserveStyle(baseDir: string, ...segments: string[]): string {
  const usePosix = baseDir.includes("/") || !baseDir.includes(sep);
  return usePosix ? posix.join(baseDir, ...segments) : join(baseDir, ...segments);
}
