import type { RuntimeStateStore } from "../app/state.js";
import type { RuntimeConfigStore } from "../app/runtime-config.js";
import { getConversationTargetKey } from "../conversation.js";
import type { CronService } from "../cron/service.js";
import { createCronScopeSelector } from "../cron/scope.js";
import { getModelRoutingConfig } from "../pi/model-routing.js";
import { formatModelLabel, type AvailableModelInfo } from "../pi/models.js";
import type { ListedSession, SessionService } from "../pi/sessions.js";
import type { SkillStatsStore } from "../pi/skill-stats.js";
import type { GroupSettingsStore, PersistedGroupRoutingConfig } from "../storage/group-settings.js";
import type { UserState } from "../types.js";
import type { AdminTargetService } from "./targets.js";

export interface AdminPageDataService {
  getSessionsPage(targetKey: string): Promise<AdminSessionsPageData>;
  getModelsPage(targetKey: string): Promise<AdminModelsPageData>;
  getSettingsPage(targetKey: string): Promise<AdminSettingsPageData>;
  getCronPage(targetKey: string): Promise<AdminCronPageData>;
  getGroupPage(targetKey: string): Promise<AdminGroupPageData>;
  getToolsPage(targetKey: string): Promise<AdminToolsPageData>;
  getControlPage(targetKey: string): Promise<AdminControlPageData>;
  getSkillsPage(targetKey: string): Promise<AdminSkillsPageData>;
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

export interface AdminModelsPageData {
  targetKey: string;
  currentModel: string;
  routeEnabled: boolean;
  routeModels: {
    router?: string;
    light?: string;
    heavy?: string;
  };
  availableModels: Array<{
    order: number;
    label: string;
    name?: string;
    provider: string;
    id: string;
  }>;
}

export interface AdminSettingsPageData {
  targetKey: string;
  streamingEnabled: boolean;
  audioTranscribeProvider: "whisper" | "sensevoice" | "doubao";
  processingReactionEnabled: boolean;
  toolCallsDisplayMode: "off" | "name" | "full";
  skillFolderEnabled: boolean;
}

export interface AdminCronPageData {
  targetKey: string;
  enabled: boolean;
  jobs: Array<{
    id: string;
    name: string;
    enabled: boolean;
    prompt: string;
    nextRunAtMs?: number;
    runningAtMs?: number;
    lastRunAtMs?: number;
    lastRunStatus?: string;
  }>;
}

export interface AdminGroupPageData {
  targetKey: string;
  chatId: string;
  policy: PersistedGroupRoutingConfig["FEISHU_GROUP_CHAT_POLICY"];
  mode: PersistedGroupRoutingConfig["FEISHU_GROUP_MESSAGE_MODE"];
  allowlist: string[];
  keywords: string[];
  currentInAllowlist: boolean;
}

export interface AdminToolsPageData {
  targetKey: string;
  supported: boolean;
  enabledCount: number;
  tools: Array<{
    name: string;
    enabled: boolean;
  }>;
}

export interface AdminControlPageData {
  targetKey: string;
  running: boolean;
  draining: boolean;
}

export interface AdminSkillsPageData {
  targetKey: string;
  skills: Array<{
    name: string;
    path: string;
    scope?: string;
  }>;
  statsEnabled: boolean;
  usage: Array<{
    name: string;
    count: number;
    lastUsedAt: string;
    path?: string;
    scope?: string;
  }>;
}

export function createAdminPageDataService(deps: {
  targets: AdminTargetService;
  sessionService: Pick<
    SessionService,
    "getOrCreateActiveSession" | "getOrCreateActiveSessionForTarget" | "listSessions" | "listSessionsForTarget" | "readSessionState"
  >;
  runtimeState: Pick<RuntimeStateStore, "isLocked"> & Partial<Pick<RuntimeStateStore, "isDraining">>;
  listAvailableModels?: () => Promise<AvailableModelInfo[]>;
  runtimeConfig?: Pick<
    RuntimeConfigStore,
    "getStreamingEnabled" | "getAudioTranscribeProvider" | "getProcessingReactionType"
  > & Partial<Pick<RuntimeConfigStore, "getGroupRoutingConfig">>;
  cronService?: Pick<CronService, "isEnabled" | "listJobs">;
  groupSettingsStore?: Pick<GroupSettingsStore, "readGroupRoutingConfig">;
  skillStatsStore?: Pick<SkillStatsStore, "listSkillUsage">;
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

  async function getModelsPage(targetKey: string): Promise<AdminModelsPageData> {
    const resolved = await deps.targets.resolveTarget(targetKey);
    if (!resolved) {
      throw new Error("ADMIN_TARGET_NOT_FOUND");
    }

    const sessionState = resolved.target.kind === "group" && deps.sessionService.getOrCreateActiveSessionForTarget
      ? await deps.sessionService.getOrCreateActiveSessionForTarget(resolved.identity, resolved.conversationTarget)
      : await deps.sessionService.getOrCreateActiveSession(resolved.identity);
    const userState = await readTargetState(resolved);
    const modelRouting = getModelRoutingConfig(userState ?? undefined);
    const models = await deps.listAvailableModels?.() ?? [];

    return {
      targetKey: resolved.target.key,
      currentModel: getCurrentModelLabel(sessionState.piSession) ?? formatConfiguredHeavyModel(userState) ?? "未知",
      routeEnabled: modelRouting.enabled === true,
      routeModels: {
        router: formatModelPreference(modelRouting.routerModel),
        light: formatModelPreference(modelRouting.lightModel),
        heavy: formatModelPreference(modelRouting.heavyModel),
      },
      availableModels: models.map((model) => ({
        order: model.order,
        label: model.label,
        name: model.name,
        provider: model.provider,
        id: model.id,
      })),
    };
  }

  async function getSettingsPage(targetKey: string): Promise<AdminSettingsPageData> {
    const resolved = await deps.targets.resolveTarget(targetKey);
    if (!resolved) {
      throw new Error("ADMIN_TARGET_NOT_FOUND");
    }
    const userState = await readTargetState(resolved);

    return {
      targetKey: resolved.target.key,
      streamingEnabled: userState?.streamingEnabled ?? deps.runtimeConfig?.getStreamingEnabled() ?? false,
      audioTranscribeProvider: deps.runtimeConfig?.getAudioTranscribeProvider() ?? "whisper",
      processingReactionEnabled: Boolean(deps.runtimeConfig?.getProcessingReactionType()),
      toolCallsDisplayMode: userState?.toolCallsDisplayMode ?? "off",
      skillFolderEnabled: userState?.globalAgentsSkillsEnabled === true,
    };
  }

  async function getCronPage(targetKey: string): Promise<AdminCronPageData> {
    const resolved = await deps.targets.resolveTarget(targetKey);
    if (!resolved) {
      throw new Error("ADMIN_TARGET_NOT_FOUND");
    }
    if (!deps.cronService?.isEnabled()) {
      return {
        targetKey: resolved.target.key,
        enabled: false,
        jobs: [],
      };
    }

    const scope = createCronScopeSelector(resolved.identity.openId, resolved.conversationTarget);
    const jobs = await deps.cronService.listJobs(scope);
    return {
      targetKey: resolved.target.key,
      enabled: true,
      jobs: jobs.map((job) => ({
        id: job.id,
        name: job.name,
        enabled: job.enabled,
        prompt: job.prompt,
        nextRunAtMs: job.state.nextRunAtMs,
        runningAtMs: job.state.runningAtMs,
        lastRunAtMs: job.state.lastRunAtMs,
        lastRunStatus: job.state.lastRunStatus,
      })),
    };
  }

  async function getGroupPage(targetKey: string): Promise<AdminGroupPageData> {
    const resolved = await deps.targets.resolveTarget(targetKey);
    if (!resolved) {
      throw new Error("ADMIN_TARGET_NOT_FOUND");
    }
    if (resolved.target.kind !== "group" || resolved.conversationTarget.kind !== "group") {
      throw new Error("ADMIN_GROUP_TARGET_REQUIRED");
    }

    const chatId = resolved.conversationTarget.chatId;
    if (!chatId) {
      throw new Error("ADMIN_GROUP_TARGET_REQUIRED");
    }
    const settings = await readGroupRoutingConfig(chatId);
    return {
      targetKey: resolved.target.key,
      chatId,
      policy: settings.FEISHU_GROUP_CHAT_POLICY,
      mode: settings.FEISHU_GROUP_MESSAGE_MODE,
      allowlist: [...settings.FEISHU_GROUP_CHAT_ALLOWLIST],
      keywords: [...settings.FEISHU_GROUP_MESSAGE_KEYWORDS],
      currentInAllowlist: settings.FEISHU_GROUP_CHAT_ALLOWLIST.includes(chatId),
    };
  }

  async function getToolsPage(targetKey: string): Promise<AdminToolsPageData> {
    const resolved = await deps.targets.resolveTarget(targetKey);
    if (!resolved) {
      throw new Error("ADMIN_TARGET_NOT_FOUND");
    }
    const sessionState = resolved.target.kind === "group" && deps.sessionService.getOrCreateActiveSessionForTarget
      ? await deps.sessionService.getOrCreateActiveSessionForTarget(resolved.identity, resolved.conversationTarget)
      : await deps.sessionService.getOrCreateActiveSession(resolved.identity);
    const toolSession = getToolConfigSession(sessionState.piSession);
    if (!toolSession) {
      return {
        targetKey: resolved.target.key,
        supported: false,
        enabledCount: 0,
        tools: [],
      };
    }

    const allToolNames = toolSession.getAllTools().map((tool) => tool.name);
    const allToolNameSet = new Set(allToolNames);
    const activeToolNames = new Set(toolSession.getActiveToolNames().filter((name) => allToolNameSet.has(name)));
    return {
      targetKey: resolved.target.key,
      supported: true,
      enabledCount: activeToolNames.size,
      tools: allToolNames.map((name) => ({
        name,
        enabled: activeToolNames.has(name),
      })),
    };
  }

  async function getControlPage(targetKey: string): Promise<AdminControlPageData> {
    const resolved = await deps.targets.resolveTarget(targetKey);
    if (!resolved) {
      throw new Error("ADMIN_TARGET_NOT_FOUND");
    }
    const conversationKey = getConversationTargetKey(resolved.conversationTarget, resolved.identity.openId);
    return {
      targetKey: resolved.target.key,
      running: deps.runtimeState.isLocked(conversationKey),
      draining: deps.runtimeState.isDraining?.() === true,
    };
  }

  async function getSkillsPage(targetKey: string): Promise<AdminSkillsPageData> {
    const resolved = await deps.targets.resolveTarget(targetKey);
    if (!resolved) {
      throw new Error("ADMIN_TARGET_NOT_FOUND");
    }
    const sessionState = resolved.target.kind === "group" && deps.sessionService.getOrCreateActiveSessionForTarget
      ? await deps.sessionService.getOrCreateActiveSessionForTarget(resolved.identity, resolved.conversationTarget)
      : await deps.sessionService.getOrCreateActiveSession(resolved.identity);
    const skills = getLoadedSkills(sessionState.piSession);
    const usage = await deps.skillStatsStore?.listSkillUsage();
    return {
      targetKey: resolved.target.key,
      skills: skills.map((skill) => ({
        name: getSkillName(skill.filePath),
        path: skill.filePath,
        scope: skill.scope,
      })),
      statsEnabled: Boolean(deps.skillStatsStore),
      usage: (usage ?? []).map((record) => ({
        name: record.name,
        count: record.count,
        lastUsedAt: record.lastUsedAt,
        path: record.path,
        scope: record.scope,
      })),
    };
  }

  async function readGroupRoutingConfig(chatId: string): Promise<PersistedGroupRoutingConfig> {
    return (await deps.groupSettingsStore?.readGroupRoutingConfig(chatId)) ?? getDefaultGroupRoutingConfig();
  }

  function getDefaultGroupRoutingConfig(): PersistedGroupRoutingConfig {
    const config = deps.runtimeConfig?.getGroupRoutingConfig?.();
    return {
      FEISHU_GROUP_CHAT_POLICY: config?.FEISHU_GROUP_CHAT_POLICY ?? "disabled",
      FEISHU_GROUP_CHAT_ALLOWLIST: [...(config?.FEISHU_GROUP_CHAT_ALLOWLIST ?? [])],
      FEISHU_GROUP_MESSAGE_MODE: config?.FEISHU_GROUP_MESSAGE_MODE ?? "mention",
      FEISHU_GROUP_MESSAGE_KEYWORDS: [...(config?.FEISHU_GROUP_MESSAGE_KEYWORDS ?? [])],
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
    getModelsPage,
    getSettingsPage,
    getCronPage,
    getGroupPage,
    getToolsPage,
    getControlPage,
    getSkillsPage,
  };
}

interface ToolConfigSession {
  getAllTools(): Array<{ name: string }>;
  getActiveToolNames(): string[];
  setActiveToolsByName(toolNames: string[]): void;
}

function getToolConfigSession(session: unknown): ToolConfigSession | null {
  if (
    !session
    || typeof (session as ToolConfigSession).getAllTools !== "function"
    || typeof (session as ToolConfigSession).getActiveToolNames !== "function"
    || typeof (session as ToolConfigSession).setActiveToolsByName !== "function"
  ) {
    return null;
  }
  return session as ToolConfigSession;
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

function formatModelPreference(preference?: { provider: string; id: string }): string | undefined {
  if (!preference?.provider || !preference.id) {
    return undefined;
  }
  return formatModelLabel(preference.provider, preference.id);
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

function getLoadedSkills(session: {
  resourceLoader?: {
    getSkills?: () => {
      skills?: Array<{ filePath: string; sourceInfo?: { scope?: string } }>;
    };
  };
}): Array<{ filePath: string; scope?: string }> {
  const skills = session.resourceLoader?.getSkills?.().skills ?? [];
  return skills.map((skill) => ({
    filePath: skill.filePath,
    scope: skill.sourceInfo?.scope,
  }));
}

function getSkillName(filePath: string): string {
  const normalized = filePath.replace(/\\/g, "/");
  const skillDir = normalized.endsWith("/SKILL.md")
    ? normalized.slice(0, -"/SKILL.md".length)
    : normalized;
  return skillDir.split("/").filter(Boolean).at(-1) ?? skillDir;
}
