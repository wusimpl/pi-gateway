import { logger } from "../app/logger.js";
import type { UserIdentity } from "../types.js";

export type FeishuUserIdType = "open_id" | "union_id" | "user_id";

export interface FeishuUserClient {
  contact?: {
    user?: {
      get?(payload: {
        path: { user_id: string };
        params: { user_id_type: FeishuUserIdType };
      }): Promise<unknown>;
    };
  };
}

export type FeishuSenderNameResolver = (identity: Pick<UserIdentity, "openId" | "userId">) => Promise<string | null>;

interface CachedSenderName {
  name: string | null;
  expiresAt: number;
}

interface FeishuSenderNameResolverOptions {
  now?: () => number;
  successTtlMs?: number;
  failureTtlMs?: number;
}

const DEFAULT_SUCCESS_TTL_MS = 10 * 60 * 1000;
const DEFAULT_FAILURE_TTL_MS = 60 * 1000;

export function createFeishuSenderNameResolver(
  client: FeishuUserClient,
  options: FeishuSenderNameResolverOptions = {},
): FeishuSenderNameResolver {
  const cache = new Map<string, CachedSenderName>();
  const now = options.now ?? (() => Date.now());
  const successTtlMs = options.successTtlMs ?? DEFAULT_SUCCESS_TTL_MS;
  const failureTtlMs = options.failureTtlMs ?? DEFAULT_FAILURE_TTL_MS;

  return async (identity) => {
    const lookup = resolveSenderLookup(identity);
    if (!lookup) {
      return null;
    }

    const cacheKey = `${lookup.userIdType}:${lookup.userId}`;
    const cached = cache.get(cacheKey);
    const currentTime = now();
    if (cached && cached.expiresAt > currentTime) {
      return cached.name;
    }

    if (typeof client.contact?.user?.get !== "function") {
      cache.set(cacheKey, { name: null, expiresAt: currentTime + failureTtlMs });
      logger.warn("飞书用户资料接口不可用，群聊发送者昵称降级为 open_id", {
        userIdType: lookup.userIdType,
      });
      return null;
    }

    try {
      const response = await client.contact.user.get({
        path: { user_id: lookup.userId },
        params: { user_id_type: lookup.userIdType },
      });
      const name = extractFeishuUserName(response);
      cache.set(cacheKey, {
        name,
        expiresAt: currentTime + (name ? successTtlMs : failureTtlMs),
      });
      return name;
    } catch (error) {
      cache.set(cacheKey, { name: null, expiresAt: currentTime + failureTtlMs });
      logger.warn("飞书发送者昵称解析失败，已降级为 open_id", {
        userIdType: lookup.userIdType,
        error: String(error),
      });
      return null;
    }
  };
}

function resolveSenderLookup(
  identity: Pick<UserIdentity, "openId" | "userId">,
): { userId: string; userIdType: FeishuUserIdType } | null {
  const openId = identity.openId?.trim();
  if (openId) {
    return {
      userId: openId,
      userIdType: resolveUserIdType(openId),
    };
  }

  const userId = identity.userId?.trim();
  if (userId) {
    return {
      userId,
      userIdType: "user_id",
    };
  }

  return null;
}

function resolveUserIdType(userId: string): FeishuUserIdType {
  if (userId.startsWith("ou_")) {
    return "open_id";
  }
  if (userId.startsWith("on_")) {
    return "union_id";
  }
  return "user_id";
}

function extractFeishuUserName(response: unknown): string | null {
  const user = readRecord(readRecord(response)?.data)?.user;
  const userRecord = readRecord(user);
  if (!userRecord) {
    return null;
  }

  const candidates = [
    userRecord.name,
    userRecord.en_name,
    userRecord.nickname,
    userRecord.display_name,
  ];
  for (const candidate of candidates) {
    if (typeof candidate !== "string") {
      continue;
    }
    const name = candidate.trim();
    if (name) {
      return name;
    }
  }

  return null;
}

function readRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? value as Record<string, unknown> : null;
}
