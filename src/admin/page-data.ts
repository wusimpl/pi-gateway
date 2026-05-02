import type { RuntimeStateStore } from "../app/state.js";
import { getConversationTargetKey } from "../conversation.js";
import { getModelRoutingConfig } from "../pi/model-routing.js";
import { formatModelLabel } from "../pi/models.js";
import type { ListedSession, SessionService } from "../pi/sessions.js";
import type { UserState } from "../types.js";
import type { AdminTargetService } from "./targets.js";

export interface AdminPageDataService {
  getSessionsPage(targetKey: string): Promise<AdminSessionsPageData>;
}

export interface AdminSessionsPageData {
  targetKey: string;
  status: {
    running: boolean;
    activeSessionId: string;
    currentModel: string;
    lastActiveAt?: string;
    contextCount: number;
  };
  sessions: Array<{
    order: number;
    title: string;
    messageCount: number;
    updatedAt?: string;
    isActive: boolean;
  }>;
  contextFiles: string[];
  rawResult: string;
}

export function createAdminPageDataService(deps: {
  targets: AdminTargetService;
  sessionService: Pick<
    SessionService,
    "getOrCreateActiveSession" | "getOrCreateActiveSessionForTarget" | "listSessions" | "listSessionsForTarget" | "readSessionState"
  >;
  runtimeState: Pick<RuntimeStateStore, "isLocked">;
}): AdminPageDataService {
  async function getSessionsPage(targetKey: string): Promise<AdminSessionsPageData> {
    const resolved = await deps.targets.resolveTarget(targetKey);
    if (!resolved) {
      throw new Error("ADMIN_TARGET_NOT_FOUND");
    }

    const sessionState = resolved.target.kind === "group" && deps.sessionService.getOrCreateActiveSessionForTarget
      ? await deps.sessionService.getOrCreateActiveSessionForTarget(resolved.identity, resolved.conversationTarget)
      : await deps.sessionService.getOrCreateActiveSession(resolved.identity);
    const userState = await readTargetState(resolved);
    const sessions = resolved.target.kind === "group" && deps.sessionService.listSessionsForTarget
      ? await deps.sessionService.listSessionsForTarget(resolved.identity, resolved.conversationTarget)
      : await deps.sessionService.listSessions(resolved.identity);
    const contextFiles = getLoadedContextFiles(sessionState.piSession).map((file) => file.path);
    const currentModel = getCurrentModelLabel(sessionState.piSession) ?? formatConfiguredHeavyModel(userState) ?? "未知";
    const conversationKey = getConversationTargetKey(resolved.conversationTarget, resolved.identity.openId);

    return {
      targetKey: resolved.target.key,
      status: {
        running: deps.runtimeState.isLocked(conversationKey),
        activeSessionId: sessionState.activeSessionId,
        currentModel,
        lastActiveAt: userState?.lastActiveAt,
        contextCount: contextFiles.length,
      },
      sessions: sessions.map(formatListedSession),
      contextFiles,
      rawResult: "",
    };
  }

  async function readTargetState(resolved: Awaited<ReturnType<AdminTargetService["resolveTarget"]>>): Promise<UserState | null> {
    if (!resolved) {
      return null;
    }
    return deps.sessionService.readSessionState(resolved.identity, resolved.conversationTarget);
  }

  return {
    getSessionsPage,
  };
}

function formatListedSession(session: ListedSession): AdminSessionsPageData["sessions"][number] {
  return {
    order: session.order,
    title: session.name?.trim() || session.firstMessage?.trim() || session.sessionId,
    messageCount: session.messageCount,
    updatedAt: session.updatedAt,
    isActive: session.isActive,
  };
}

function formatConfiguredHeavyModel(state: UserState | null): string | undefined {
  const modelRouting = getModelRoutingConfig(state ?? undefined);
  const heavy = modelRouting.heavyModel;
  if (!heavy) {
    return undefined;
  }
  return formatModelLabel(heavy.provider, heavy.id);
}

function getCurrentModelLabel(session: { model?: { provider: string; id: string } | undefined }): string | undefined {
  const provider = session.model?.provider?.trim();
  const id = session.model?.id?.trim();
  if (!provider || !id) {
    return undefined;
  }
  return formatModelLabel(provider, id);
}

function getLoadedContextFiles(session: {
  resourceLoader?: {
    getAgentsFiles?: () => {
      agentsFiles?: Array<{ path: string }>;
    };
  };
}): Array<{ path: string }> {
  return session.resourceLoader?.getAgentsFiles?.().agentsFiles ?? [];
}
