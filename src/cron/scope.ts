import {
  createGroupConversationTarget,
  getConversationTargetKey,
  type ConversationTarget,
} from "../conversation.js";
import type {
  CreateCronJobInput,
  CronJob,
  CronScopeInput,
  CronScopeSelector,
  CronScopeType,
} from "./types.js";

export function createCronScopeSelector(
  openId: string,
  conversationTarget?: ConversationTarget,
): CronScopeSelector {
  return {
    scopeKey: getConversationTargetKey(conversationTarget, openId),
    scopeType: getCronScopeType(conversationTarget),
  };
}

export function getCronScopeType(conversationTarget?: ConversationTarget): CronScopeType {
  if (!conversationTarget || conversationTarget.kind === "p2p") {
    return "dm";
  }
  return conversationTarget.kind;
}

export function getCronConversationTargetForStorage(
  conversationTarget?: ConversationTarget,
): ConversationTarget | undefined {
  if (!conversationTarget || conversationTarget.kind === "p2p") {
    return undefined;
  }
  return { ...conversationTarget };
}

export function resolveCronScopeInput(input: CronScopeInput): CronScopeSelector {
  if (typeof input === "string") {
    return {
      scopeKey: input.trim(),
      scopeType: "dm",
    };
  }

  return {
    scopeKey: input.scopeKey.trim(),
    scopeType: input.scopeType,
  };
}

export function resolveCreateCronJobScope(
  input: Pick<CreateCronJobInput, "openId" | "scopeKey" | "scopeType" | "conversationTarget">,
): {
  scopeKey: string;
  scopeType: CronScopeType;
  conversationTarget?: ConversationTarget;
} {
  const conversationTarget = getCronConversationTargetForStorage(input.conversationTarget);
  const scopeType = input.scopeType ?? getCronScopeType(input.conversationTarget);
  const scopeKey = input.scopeKey?.trim() || conversationTarget?.key.trim() || input.openId;

  return {
    scopeKey,
    scopeType,
    conversationTarget,
  };
}

export function resolveLoadedCronJobScope(
  job: Pick<CronJob, "openId" | "scopeKey" | "scopeType" | "conversationTarget" | "prompt">,
): {
  scopeKey: string;
  scopeType: CronScopeType;
  conversationTarget?: ConversationTarget;
} {
  const persistedTarget = getCronConversationTargetForStorage(job.conversationTarget);
  const explicitScopeType = normalizeCronScopeType(job.scopeType);
  const explicitScopeKey = job.scopeKey?.trim();

  if (explicitScopeType) {
    return {
      scopeKey: explicitScopeKey || persistedTarget?.key.trim() || job.openId,
      scopeType: explicitScopeType,
      conversationTarget: persistedTarget ?? createTargetFromScope(explicitScopeType, explicitScopeKey),
    };
  }

  if (persistedTarget) {
    return {
      scopeKey: explicitScopeKey || persistedTarget.key,
      scopeType: getCronScopeType(persistedTarget),
      conversationTarget: persistedTarget,
    };
  }

  const inferredGroupTarget = inferGroupTargetFromPrompt(job.prompt);
  if (inferredGroupTarget) {
    return {
      scopeKey: inferredGroupTarget.key,
      scopeType: "group",
      conversationTarget: inferredGroupTarget,
    };
  }

  return {
    scopeKey: explicitScopeKey || job.openId,
    scopeType: "dm",
  };
}

function normalizeCronScopeType(value: unknown): CronScopeType | null {
  return value === "dm" || value === "group" || value === "thread" ? value : null;
}

function createTargetFromScope(
  scopeType: CronScopeType,
  scopeKey: string | undefined,
): ConversationTarget | undefined {
  if (scopeType !== "group" || !scopeKey) {
    return undefined;
  }
  return createGroupConversationTarget(scopeKey) ?? undefined;
}

function inferGroupTargetFromPrompt(prompt: string): ConversationTarget | undefined {
  if (!/群聊|chat[_ ]?id|chatId/i.test(prompt)) {
    return undefined;
  }

  const chatId = prompt.match(/\boc_[a-zA-Z0-9_]+\b/)?.[0];
  if (!chatId) {
    return undefined;
  }

  return createGroupConversationTarget(chatId) ?? undefined;
}
