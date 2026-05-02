import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import type { Config } from "../config.js";
import {
  createGroupConversationTarget,
  createP2PConversationTarget,
} from "../conversation.js";
import type { CronJob } from "../cron/types.js";
import type { PersistedGroupRoutingConfig } from "../storage/group-settings.js";
import type { UserIdentity } from "../types.js";
import type { AdminTarget, ResolvedAdminTarget } from "./types.js";

type TargetSource =
  | "历史私聊"
  | "历史群聊"
  | "管理员配置"
  | "群白名单"
  | "定时任务";

export interface AdminTargetService {
  listTargets(): Promise<AdminTarget[]>;
  resolveTarget(targetKey: string): Promise<ResolvedAdminTarget | null>;
}

export function createAdminTargetService(config: Pick<
  Config,
  "DATA_DIR" | "FEISHU_OWNER_OPEN_IDS" | "FEISHU_GROUP_CHAT_ALLOWLIST"
>): AdminTargetService {
  async function listTargets(): Promise<AdminTarget[]> {
    const collected = new Map<string, AdminTarget>();

    for (const openId of config.FEISHU_OWNER_OPEN_IDS) {
      addTarget(collected, {
        key: openId,
        kind: "p2p",
        source: "管理员配置",
      });
    }

    for (const openId of await listUserOpenIds(config.DATA_DIR)) {
      addTarget(collected, {
        key: openId,
        kind: "p2p",
        source: "历史私聊",
      });
    }

    for (const chatId of await listConversationChatIds(config.DATA_DIR)) {
      addTarget(collected, {
        key: chatId,
        kind: "group",
        source: "历史群聊",
      });
    }

    for (const chatId of config.FEISHU_GROUP_CHAT_ALLOWLIST) {
      addTarget(collected, {
        key: chatId,
        kind: "group",
        source: "群白名单",
      });
    }

    for (const chatId of await listGroupRoutingAllowlist(config.DATA_DIR)) {
      addTarget(collected, {
        key: chatId,
        kind: "group",
        source: "群白名单",
      });
    }

    for (const job of await listCronJobs(config.DATA_DIR)) {
      if (job.conversationTarget?.kind === "group" && job.conversationTarget.chatId) {
        addTarget(collected, {
          key: job.conversationTarget.chatId,
          kind: "group",
          source: "定时任务",
          ownerOpenId: job.openId,
        });
        continue;
      }
      if (job.scopeType === "group") {
        addTarget(collected, {
          key: job.scopeKey,
          kind: "group",
          source: "定时任务",
          ownerOpenId: job.openId,
        });
        continue;
      }
      if (job.scopeType === "dm") {
        addTarget(collected, {
          key: job.openId,
          kind: "p2p",
          source: "定时任务",
          ownerOpenId: job.openId,
        });
      }
    }

    return [...collected.values()].sort(compareTargets);
  }

  async function resolveTarget(targetKey: string): Promise<ResolvedAdminTarget | null> {
    const target = (await listTargets()).find((item) => item.key === targetKey);
    if (!target) {
      return null;
    }

    const conversationTarget = target.kind === "group"
      ? createGroupConversationTarget(target.key)
      : createP2PConversationTarget(target.key);
    if (!conversationTarget) {
      return null;
    }

    return {
      target,
      identity: resolveIdentity(target, config.FEISHU_OWNER_OPEN_IDS),
      conversationTarget,
    };
  }

  return {
    listTargets,
    resolveTarget,
  };
}

function addTarget(
  collected: Map<string, AdminTarget>,
  input: {
    key: string;
    kind: AdminTarget["kind"];
    source: TargetSource;
    ownerOpenId?: string;
  },
): void {
  const key = input.key.trim();
  if (!key) {
    return;
  }

  const existing = collected.get(key);
  if (existing) {
    if (!existing.sources.includes(input.source)) {
      existing.sources.push(input.source);
    }
    existing.ownerOpenId ??= input.ownerOpenId;
    return;
  }

  const kindLabel = input.kind === "group" ? "群聊" : "私聊";
  collected.set(key, {
    key,
    kind: input.kind,
    label: `${kindLabel} · ${shortenId(key)}`,
    detail: key,
    sources: [input.source],
    ownerOpenId: input.ownerOpenId,
  });
}

async function listUserOpenIds(dataDir: string): Promise<string[]> {
  return listChildNames(join(dataDir, "users"));
}

async function listConversationChatIds(dataDir: string): Promise<string[]> {
  const names = await listChildNames(join(dataDir, "conversations"));
  return names
    .map((name) => safeDecodeURIComponent(name))
    .filter((key) => key && !key.includes(":"));
}

async function listGroupRoutingAllowlist(dataDir: string): Promise<string[]> {
  const chatIds = await listConversationChatIds(dataDir);
  const result: string[] = [];
  for (const chatId of chatIds) {
    try {
      const raw = await readFile(
        join(dataDir, "conversations", encodeURIComponent(chatId), "group-routing.json"),
        "utf-8",
      );
      const parsed = JSON.parse(raw) as Partial<PersistedGroupRoutingConfig>;
      for (const allowlistChatId of parsed.FEISHU_GROUP_CHAT_ALLOWLIST ?? []) {
        if (typeof allowlistChatId === "string" && allowlistChatId.trim()) {
          result.push(allowlistChatId.trim());
        }
      }
    } catch {
      // 没有单群配置时跳过
    }
  }
  return result;
}

async function listCronJobs(dataDir: string): Promise<CronJob[]> {
  try {
    const raw = await readFile(join(dataDir, "cron", "jobs.json"), "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed as CronJob[] : [];
  } catch {
    return [];
  }
}

async function listChildNames(dir: string): Promise<string[]> {
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name);
  } catch {
    return [];
  }
}

function safeDecodeURIComponent(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function resolveIdentity(target: AdminTarget, ownerOpenIds: string[]): UserIdentity {
  const openId = target.kind === "p2p"
    ? target.key
    : target.ownerOpenId ?? ownerOpenIds[0] ?? "admin";
  return { openId };
}

function compareTargets(left: AdminTarget, right: AdminTarget): number {
  if (left.kind !== right.kind) {
    return left.kind === "p2p" ? -1 : 1;
  }
  return left.key.localeCompare(right.key);
}

function shortenId(value: string): string {
  if (value.length <= 18) {
    return value;
  }
  return `${value.slice(0, 8)}...${value.slice(-6)}`;
}
