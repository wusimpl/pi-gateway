import { logger } from "../app/logger.js";
import type { GroupOwnerResolver } from "../app/command-permissions.js";
import type { UserIdentity } from "../types.js";

const DEFAULT_OWNER_CACHE_TTL_MS = 10 * 60 * 1000;

export interface FeishuChatInfoClient {
  im: {
    chat: {
      get(args: {
        path: { chat_id: string };
        params: { user_id_type: "open_id" };
      }): Promise<FeishuChatGetResponse>;
    };
  };
}

interface FeishuChatGetResponse {
  data?: {
    owner_id?: string | null;
    owner_id_type?: string | null;
  } | null;
}

interface CachedGroupOwner {
  ownerOpenId: string | null;
  expiresAt: number;
}

export interface FeishuChatInfoService extends GroupOwnerResolver {
  getGroupOwnerOpenId(chatId: string): Promise<string | null>;
}

export function createFeishuChatInfoService(
  client: FeishuChatInfoClient,
  options: { ownerCacheTtlMs?: number; now?: () => number } = {},
): FeishuChatInfoService {
  const ownerCacheTtlMs = options.ownerCacheTtlMs ?? DEFAULT_OWNER_CACHE_TTL_MS;
  const now = options.now ?? (() => Date.now());
  const ownerCache = new Map<string, CachedGroupOwner>();
  const inflight = new Map<string, Promise<string | null>>();

  async function getGroupOwnerOpenId(chatId: string): Promise<string | null> {
    const normalizedChatId = chatId.trim();
    if (!normalizedChatId) {
      return null;
    }

    const cached = ownerCache.get(normalizedChatId);
    if (cached && cached.expiresAt > now()) {
      return cached.ownerOpenId;
    }

    const pending = inflight.get(normalizedChatId);
    if (pending) {
      return pending;
    }

    const request = fetchGroupOwnerOpenId(normalizedChatId);
    inflight.set(normalizedChatId, request);
    try {
      return await request;
    } finally {
      inflight.delete(normalizedChatId);
    }
  }

  async function fetchGroupOwnerOpenId(chatId: string): Promise<string | null> {
    try {
      const response = await client.im.chat.get({
        path: { chat_id: chatId },
        params: { user_id_type: "open_id" },
      });
      const ownerOpenId = response.data?.owner_id?.trim() || null;
      ownerCache.set(chatId, {
        ownerOpenId,
        expiresAt: now() + ownerCacheTtlMs,
      });
      if (!ownerOpenId) {
        logger.warn("飞书群聊 owner 为空，群主权限判断将不通过", { chatId });
      }
      return ownerOpenId;
    } catch (error) {
      logger.warn("获取飞书群聊 owner 失败，群主权限判断将不通过", {
        chatId,
        error: String(error),
      });
      return null;
    }
  }

  async function isGroupOwner(chatId: string, identity: UserIdentity): Promise<boolean> {
    const ownerOpenId = await getGroupOwnerOpenId(chatId);
    return Boolean(ownerOpenId && ownerOpenId === identity.openId);
  }

  return {
    getGroupOwnerOpenId,
    isGroupOwner,
  };
}
