import type { Config } from "../config.js";
import type { ConversationTarget } from "../conversation.js";
import { getConversationTargetKey } from "../conversation.js";
import { formatError } from "../feishu/format.js";
import type { FeishuMessenger } from "../feishu/send.js";
import {
  type AvailableModelInfo,
  filterAvailableModels,
  formatModelLabel,
} from "../pi/models.js";
import {
  getModelRoutingConfig,
  hasCompleteModelRoutingConfig,
  parseModelRouteSlot,
  setModelRouteSlot,
} from "../pi/model-routing.js";
import {
  getSessionDefaultToolNames,
  type SessionService,
} from "../pi/sessions.js";
import type { SkillStatsStore } from "../pi/skill-stats.js";
import type { WorkspaceService } from "../pi/workspace.js";
import type { GroupSettingsStore, PersistedGroupRoutingConfig } from "../storage/group-settings.js";
import type { UserStateStore } from "../storage/users.js";
import type { ModelPreference, ModelRouteSlot, ThinkingLevel, ToolCallsDisplayMode, UserIdentity, UserState } from "../types.js";
import { handleBridgeCommand, formatUnsupportedSlashCommand, type BridgeCommand } from "./commands.js";
import { logger } from "./logger.js";
import {
  clearRestartReadyNotification,
  recordRestartReadyNotification,
  type RestartService,
} from "./restart.js";
import type { RuntimeStateStore } from "./state.js";
import type { CronService } from "../cron/service.js";
import type { DeferredCronRunService } from "../cron/deferred-run.js";
import type { CronScopeSelector } from "../cron/types.js";
import {
  createCronScopeSelector,
  getCronConversationTargetForStorage,
} from "../cron/scope.js";
import type { RuntimeConfigStore } from "./runtime-config.js";
import {
  formatCronHelp,
  formatCronJobAdded,
  formatCronJobList,
  formatCronJobRemoved,
  formatCronJobRunResult,
  formatCronJobStopResult,
  parseCronBridgeCommand,
} from "../cron/commands.js";
import { parseScheduleInput } from "../cron/schedule.js";

export interface CommandService {
  handleBridgeCommand(
    identity: UserIdentity,
    command: BridgeCommand,
    conversationTarget?: ConversationTarget,
  ): Promise<void>;
  handleUnsupportedSlashCommand(
    identity: UserIdentity,
    rawText: string,
    conversationTarget?: ConversationTarget,
  ): Promise<void>;
  handleUnauthorizedBridgeCommand(
    identity: UserIdentity,
    command: BridgeCommand,
    conversationTarget?: ConversationTarget,
  ): Promise<void>;
}

interface CommandServiceDeps {
  config: Pick<
    Config,
    "TEXT_CHUNK_LIMIT" | "CRON_DEFAULT_TZ" | "FEISHU_AUDIO_TRANSCRIBE_DOUBAO_API_KEY" | "DATA_DIR"
  >;
  messenger: Pick<FeishuMessenger, "sendRenderedMessage" | "sendTextMessage"> &
    Partial<Pick<FeishuMessenger, "sendRenderedMessageToTarget" | "sendTextMessageToTarget">>;
  sessionService: Pick<SessionService, "getOrCreateActiveSession" | "createNewSession" | "listSessions" | "resumeSession"> &
    Partial<
      Pick<
        SessionService,
        | "getOrCreateActiveSessionForTarget"
        | "createNewSessionForTarget"
        | "listSessionsForTarget"
        | "resumeSessionForTarget"
        | "readSessionState"
        | "writeSessionState"
      >
    >;
  userStateStore: Pick<UserStateStore, "readUserState" | "writeUserState">;
  workspaceService: Pick<WorkspaceService, "getUserWorkspaceDir"> &
    Partial<Pick<WorkspaceService, "getConversationWorkspaceDir">>;
  runtimeState: Pick<
    RuntimeStateStore,
    "isLocked" | "hasActiveLocks" | "beginRestartDrain" | "cancelRestartDrain" | "requestStop"
  >;
  restartService: Pick<RestartService, "restartGateway">;
  listAvailableModels(): Promise<AvailableModelInfo[]>;
  findAvailableModel(rawRef: string): Promise<AvailableModelInfo | null>;
  cronService?: Pick<CronService, "isEnabled" | "getDefaultTimezone" | "listJobs" | "addJob" | "removeJob" | "stopJob" | "runJobNow">;
  deferredCronRunService?: Pick<DeferredCronRunService, "queueRun">;
  skillStatsStore?: Pick<SkillStatsStore, "listSkillUsage" | "reset">;
  groupSettingsStore?: Pick<GroupSettingsStore, "readGroupRoutingConfig" | "writeGroupRoutingConfig">;
  runtimeConfig?: Pick<
    RuntimeConfigStore,
    | "getAudioTranscribeProvider"
    | "setAudioTranscribeProvider"
    | "getStreamingEnabled"
    | "setStreamingEnabled"
    | "getGroupRoutingConfig"
    | "getGroupChatPolicy"
    | "setGroupChatPolicy"
    | "getGroupChatAllowlist"
    | "setGroupChatAllowlist"
    | "getGroupMessageMode"
    | "setGroupMessageMode"
    | "getGroupMessageKeywords"
    | "setGroupMessageKeywords"
    | "enableProcessingReaction"
    | "disableProcessingReaction"
  >;
}

export function createCommandService(deps: CommandServiceDeps): CommandService {
  const SESSION_PAGE_SIZE = 20;
  const SKILL_STATS_PAGE_SIZE = 10;

  async function getActiveSession(identity: UserIdentity, conversationTarget?: ConversationTarget) {
    if (conversationTarget && conversationTarget.kind !== "p2p" && deps.sessionService.getOrCreateActiveSessionForTarget) {
      return deps.sessionService.getOrCreateActiveSessionForTarget(identity, conversationTarget);
    }
    return deps.sessionService.getOrCreateActiveSession(identity);
  }

  async function createSession(identity: UserIdentity, conversationTarget?: ConversationTarget) {
    if (conversationTarget && conversationTarget.kind !== "p2p" && deps.sessionService.createNewSessionForTarget) {
      return deps.sessionService.createNewSessionForTarget(identity, conversationTarget);
    }
    return deps.sessionService.createNewSession(identity);
  }

  async function listTargetSessions(identity: UserIdentity, conversationTarget?: ConversationTarget) {
    if (conversationTarget && conversationTarget.kind !== "p2p" && deps.sessionService.listSessionsForTarget) {
      return deps.sessionService.listSessionsForTarget(identity, conversationTarget);
    }
    return deps.sessionService.listSessions(identity);
  }

  async function resumeTargetSession(
    identity: UserIdentity,
    conversationTarget: ConversationTarget | undefined,
    ref: string,
  ) {
    if (conversationTarget && conversationTarget.kind !== "p2p" && deps.sessionService.resumeSessionForTarget) {
      return deps.sessionService.resumeSessionForTarget(identity, conversationTarget, ref);
    }
    return deps.sessionService.resumeSession(identity, ref);
  }

  function getWorkspaceDir(identity: UserIdentity, conversationTarget?: ConversationTarget): string {
    if (conversationTarget && conversationTarget.kind !== "p2p" && deps.workspaceService.getConversationWorkspaceDir) {
      return deps.workspaceService.getConversationWorkspaceDir(identity, conversationTarget);
    }
    return deps.workspaceService.getUserWorkspaceDir(identity);
  }

  async function readTargetState(
    identity: UserIdentity,
    conversationTarget?: ConversationTarget,
  ): Promise<UserState | null> {
    if (conversationTarget && conversationTarget.kind !== "p2p" && deps.sessionService.readSessionState) {
      return deps.sessionService.readSessionState(identity, conversationTarget);
    }
    return deps.userStateStore.readUserState(identity.openId);
  }

  async function writeTargetState(
    identity: UserIdentity,
    conversationTarget: ConversationTarget | undefined,
    state: UserState,
  ): Promise<void> {
    if (conversationTarget && conversationTarget.kind !== "p2p" && deps.sessionService.writeSessionState) {
      await deps.sessionService.writeSessionState(identity, conversationTarget, state);
      return;
    }
    await deps.userStateStore.writeUserState(identity.openId, state);
  }

  async function ensureTargetState(
    identity: UserIdentity,
    conversationTarget: ConversationTarget | undefined,
    sessionState: { activeSessionId: string; piSession: { sessionFile?: string } },
  ): Promise<UserState> {
    const existingState = await readTargetState(identity, conversationTarget);
    if (existingState) {
      return existingState;
    }

    const now = new Date().toISOString();
    return {
      activeSessionId: sessionState.activeSessionId,
      piSessionFile: sessionState.piSession.sessionFile ?? undefined,
      createdAt: now,
      updatedAt: now,
      lastActiveAt: now,
    };
  }

  async function sendTextReply(
    identity: UserIdentity,
    conversationTarget: ConversationTarget | undefined,
    text: string,
  ): Promise<void> {
    if (conversationTarget && conversationTarget.kind !== "p2p" && deps.messenger.sendTextMessageToTarget) {
      await deps.messenger.sendTextMessageToTarget(conversationTarget, text);
      return;
    }
    await deps.messenger.sendTextMessage(identity.openId, text);
  }

  async function sendCommandReply(
    identity: UserIdentity,
    conversationTarget: ConversationTarget | undefined,
    text: string,
  ): Promise<void> {
    if (conversationTarget && conversationTarget.kind !== "p2p" && deps.messenger.sendRenderedMessageToTarget) {
      await deps.messenger.sendRenderedMessageToTarget(conversationTarget, text, deps.config.TEXT_CHUNK_LIMIT);
      return;
    }
    await deps.messenger.sendRenderedMessage(identity.openId, text, deps.config.TEXT_CHUNK_LIMIT);
  }

  function isConversationLocked(identity: UserIdentity, conversationTarget?: ConversationTarget): boolean {
    return deps.runtimeState.isLocked(getConversationTargetKey(conversationTarget, identity.openId));
  }

  function getCronScope(identity: UserIdentity, conversationTarget?: ConversationTarget): CronScopeSelector {
    return createCronScopeSelector(identity.openId, conversationTarget);
  }

  function getDefaultGroupRoutingConfig(): PersistedGroupRoutingConfig {
    const runtimeConfig = deps.runtimeConfig;
    if (runtimeConfig?.getGroupRoutingConfig) {
      const config = runtimeConfig.getGroupRoutingConfig();
      return {
        FEISHU_GROUP_CHAT_POLICY: config.FEISHU_GROUP_CHAT_POLICY,
        FEISHU_GROUP_CHAT_ALLOWLIST: [...config.FEISHU_GROUP_CHAT_ALLOWLIST],
        FEISHU_GROUP_MESSAGE_MODE: config.FEISHU_GROUP_MESSAGE_MODE,
        FEISHU_GROUP_MESSAGE_KEYWORDS: [...config.FEISHU_GROUP_MESSAGE_KEYWORDS],
      };
    }

    return {
      FEISHU_GROUP_CHAT_POLICY: "disabled",
      FEISHU_GROUP_CHAT_ALLOWLIST: [],
      FEISHU_GROUP_MESSAGE_MODE: "mention",
      FEISHU_GROUP_MESSAGE_KEYWORDS: [],
    };
  }

  async function readEffectiveGroupRoutingConfig(chatId?: string): Promise<PersistedGroupRoutingConfig> {
    if (deps.groupSettingsStore && chatId) {
      return (await deps.groupSettingsStore.readGroupRoutingConfig(chatId)) ?? getDefaultGroupRoutingConfig();
    }

    const runtimeConfig = deps.runtimeConfig;
    if (!runtimeConfig) {
      return getDefaultGroupRoutingConfig();
    }

    return {
      FEISHU_GROUP_CHAT_POLICY: runtimeConfig.getGroupChatPolicy(),
      FEISHU_GROUP_CHAT_ALLOWLIST: runtimeConfig.getGroupChatAllowlist(),
      FEISHU_GROUP_MESSAGE_MODE: runtimeConfig.getGroupMessageMode(),
      FEISHU_GROUP_MESSAGE_KEYWORDS: runtimeConfig.getGroupMessageKeywords(),
    };
  }

  async function writeEffectiveGroupRoutingConfig(
    chatId: string | undefined,
    config: PersistedGroupRoutingConfig,
  ): Promise<void> {
    if (deps.groupSettingsStore && chatId) {
      await deps.groupSettingsStore.writeGroupRoutingConfig(chatId, config);
      return;
    }

    if (!deps.runtimeConfig) {
      return;
    }

    deps.runtimeConfig.setGroupChatPolicy(config.FEISHU_GROUP_CHAT_POLICY);
    deps.runtimeConfig.setGroupChatAllowlist(config.FEISHU_GROUP_CHAT_ALLOWLIST);
    deps.runtimeConfig.setGroupMessageMode(config.FEISHU_GROUP_MESSAGE_MODE);
    deps.runtimeConfig.setGroupMessageKeywords(config.FEISHU_GROUP_MESSAGE_KEYWORDS);
  }

  async function handleBridgeCommandFlow(
    identity: UserIdentity,
    command: BridgeCommand,
    conversationTarget?: ConversationTarget,
  ): Promise<void> {
    const openId = identity.openId;
    const conversationKey = getConversationTargetKey(conversationTarget, openId);
    try {
      if (command.name === "new" || command.name === "reset") {
        const sessionState = await createSession(identity, conversationTarget);
        const reply = handleBridgeCommand(command, {
          openId,
          sessionId: sessionState.activeSessionId,
          workspaceDir: getWorkspaceDir(identity, conversationTarget),
          currentModel: getCurrentModelLabel(sessionState.piSession),
        });
        await sendCommandReply(identity, conversationTarget, reply);
      } else if (command.name === "status") {
        const sessionState = await getActiveSession(identity, conversationTarget);
        const userState = await readTargetState(identity, conversationTarget);
        const reply = handleBridgeCommand(command, {
          openId,
          sessionId: sessionState.activeSessionId,
          createdAt: userState?.createdAt,
          piSessionFile: userState?.piSessionFile,
          workspaceDir: getWorkspaceDir(identity, conversationTarget),
          currentModel: getCurrentModelLabel(sessionState.piSession),
          currentThinkingLevel: getCurrentThinkingLevel(sessionState.piSession),
          streamingEnabled: userState?.streamingEnabled ?? deps.runtimeConfig?.getStreamingEnabled() ?? false,
        });
        await sendCommandReply(identity, conversationTarget, reply);
      } else if (command.name === "context" || command.name === "skills") {
        const sessionState = await getActiveSession(identity, conversationTarget);
        const reply = handleBridgeCommand(command, {
          openId,
          contextFiles: getLoadedContextFiles(sessionState.piSession),
          skills: getLoadedSkills(sessionState.piSession),
        });
        await sendCommandReply(identity, conversationTarget, reply);
      } else if (command.name === "models") {
        const availableModels = await deps.listAvailableModels();
        const filteredModels = filterAvailableModels(availableModels, command.args);
        const reply = handleBridgeCommand(command, {
          openId,
          requestedProvider: command.args,
          availableModels: filteredModels,
        });
        await sendCommandReply(identity, conversationTarget, reply);
      } else if (command.name === "sessions") {
        const pageResult = parsePageArg(command.args, {
          commandName: "sessions",
          extraUsage: "",
        });
        if (pageResult.error) {
          await sendTextReply(identity, conversationTarget, pageResult.error);
          return;
        }
        const page = pageResult.page;
        if (page === undefined) {
          await sendTextReply(identity, conversationTarget, "页码解析失败。");
          return;
        }

        const sessions = await listTargetSessions(identity, conversationTarget);
        const totalCount = sessions.length;
        const totalPages = Math.max(1, Math.ceil(totalCount / SESSION_PAGE_SIZE));
        if (totalCount > 0 && page > totalPages) {
          await sendTextReply(
            identity,
            conversationTarget,
            `页码超出范围，目前只有 ${totalPages} 页。\n\n用 /sessions 看第一页，或用 /sessions -n <页码> 翻页。`,
          );
          return;
        }

        const startIndex = (page - 1) * SESSION_PAGE_SIZE;
        const reply = handleBridgeCommand(command, {
          openId,
          sessions: sessions.slice(startIndex, startIndex + SESSION_PAGE_SIZE),
          sessionsPage: page,
          sessionsTotalPages: totalPages,
          sessionsTotalCount: totalCount,
        });
        await sendCommandReply(identity, conversationTarget, reply);
      } else if (command.name === "skillstat") {
        await handleSkillStatCommand(identity, command, conversationTarget);
      } else if (command.name === "resume") {
        await handleResumeCommand(identity, command, conversationTarget);
      } else if (command.name === "model") {
        await handleModelCommand(identity, command, conversationTarget);
      } else if (command.name === "route") {
        await handleRouteCommand(identity, command, conversationTarget);
      } else if (command.name === "settings") {
        await handleSettingsCommand(identity, command, conversationTarget);
      } else if (command.name === "tools") {
        await handleToolsCommand(identity, command, conversationTarget);
      } else if (command.name === "toolcalls") {
        await handleToolCallsCommand(identity, command, conversationTarget);
      } else if (command.name === "skill-folder") {
        await handleSkillFolderCommand(identity, command, conversationTarget);
      } else if (command.name === "cron") {
        await handleCronCommand(identity, command, conversationTarget);
      } else if (command.name === "stt") {
        await handleSttCommand(identity, command, conversationTarget);
      } else if (command.name === "stream") {
        await handleStreamCommand(identity, command, conversationTarget);
      } else if (command.name === "reaction") {
        await handleReactionCommand(identity, command, conversationTarget);
      } else if (command.name === "group") {
        await handleGroupCommand(identity, command, conversationTarget);
      } else if (command.name === "stop") {
        await handleStopCommand(identity, command, conversationKey, conversationTarget);
      } else if (command.name === "next") {
        await sendCommandReply(identity, conversationTarget, handleBridgeCommand(command, { openId }));
      } else if (command.name === "restart") {
        await handleRestartCommand(identity, command, conversationTarget);
      }
    } catch (err) {
      logger.error("桥接层命令处理失败", {
        openId,
        conversationKey,
        command: command.name,
        args: command.args,
        error: String(err),
      });
      await sendTextReply(identity, conversationTarget, formatError("命令处理失败，请稍后重试"));
    }
  }

  async function handleSkillStatCommand(
    identity: UserIdentity,
    command: BridgeCommand,
    conversationTarget?: ConversationTarget,
  ): Promise<void> {
    const openId = identity.openId;
    if (!deps.skillStatsStore) {
      await sendTextReply(identity, conversationTarget, "当前没有启用 skill 使用统计。");
      return;
    }

    const argText = command.args.trim();
    if (argText.toLowerCase() === "reset") {
      await deps.skillStatsStore.reset();
      await sendTextReply(identity, conversationTarget, "✅ 已清空 skill 使用统计。");
      return;
    }

    const pageResult = parsePageArg(argText, {
      commandName: "skillstat",
      extraUsage: " 或 /skillstat reset",
    });
    if (pageResult.error) {
      await sendTextReply(identity, conversationTarget, pageResult.error);
      return;
    }

    const page = pageResult.page;
    if (page === undefined) {
      await sendTextReply(identity, conversationTarget, "页码解析失败。");
      return;
    }

    const records = await deps.skillStatsStore.listSkillUsage();
    const totalCount = records.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / SKILL_STATS_PAGE_SIZE));
    if (totalCount > 0 && page > totalPages) {
      await sendTextReply(
        identity,
        conversationTarget,
        `页码超出范围，目前只有 ${totalPages} 页。\n\n用 /skillstat 看第一页，或用 /skillstat -n <页码> 翻页。`,
      );
      return;
    }

    const startIndex = (page - 1) * SKILL_STATS_PAGE_SIZE;
    const reply = handleBridgeCommand(command, {
      openId,
      skillUsage: records.slice(startIndex, startIndex + SKILL_STATS_PAGE_SIZE),
      skillUsagePage: page,
      skillUsageTotalPages: totalPages,
      skillUsageTotalCount: totalCount,
    });
    await sendCommandReply(identity, conversationTarget, reply);
  }

  async function handleStopCommand(
    identity: UserIdentity,
    command: BridgeCommand,
    conversationKey: string,
    conversationTarget?: ConversationTarget,
  ): Promise<void> {
    const openId = identity.openId;
    await deps.runtimeState.requestStop(conversationKey);
    const reply = handleBridgeCommand(command, { openId });
    await sendCommandReply(identity, conversationTarget, reply);
  }

  async function handleRestartCommand(
    identity: UserIdentity,
    command: BridgeCommand,
    conversationTarget?: ConversationTarget,
  ): Promise<void> {
    const openId = identity.openId;
    const drainState = deps.runtimeState.beginRestartDrain();
    if (drainState === "busy") {
      await sendTextReply(identity, conversationTarget, "当前还有任务在跑，等这条回复结束后再重启网关。");
      return;
    }
    if (drainState === "already_draining") {
      await sendTextReply(identity, conversationTarget, "网关正在重启，暂时不接新任务，请稍后再试。");
      return;
    }

    try {
      await recordRestartReadyNotification(deps.config.DATA_DIR, openId, conversationTarget);
      const reply = handleBridgeCommand(command, { openId });
      await sendCommandReply(identity, conversationTarget, reply);
      await deps.restartService.restartGateway();
    } catch (error) {
      deps.runtimeState.cancelRestartDrain();
      await clearRestartReadyNotification(deps.config.DATA_DIR);
      throw error;
    }
  }

  async function handleModelCommand(
    identity: UserIdentity,
    command: BridgeCommand,
    conversationTarget?: ConversationTarget,
  ): Promise<void> {
    const openId = identity.openId;
    const argText = command.args.trim();

    if (!argText || argText.toLowerCase() === "status") {
      const sessionState = await getActiveSession(identity, conversationTarget);
      const userState = await readTargetState(identity, conversationTarget);
      const availableModels = await deps.listAvailableModels();
      const reply = handleBridgeCommand(command, {
        openId,
        currentModel: getCurrentModelLabel(sessionState.piSession),
        availableModelCount: availableModels.length,
        modelRouting: getModelRoutingConfig(userState),
      });
      await sendCommandReply(identity, conversationTarget, reply);
      return;
    }

    if (isConversationLocked(identity, conversationTarget)) {
      await sendTextReply(identity, conversationTarget, "当前还有任务在跑，等这条回复结束后再切模型。");
      return;
    }

    const parsed = parseModelCommandArgs(argText);
    if (parsed.error) {
      await sendTextReply(identity, conversationTarget, parsed.error);
      return;
    }

    if (!parsed.modelRef || !parsed.slot) {
      await sendTextReply(identity, conversationTarget, "用法：/model router|light|heavy <序号或provider/model>。");
      return;
    }

    const targetModel = await deps.findAvailableModel(parsed.modelRef);
    if (!targetModel) {
      await sendTextReply(
        identity,
        conversationTarget,
        "没找到这个模型，或者它现在还不能用。\n\n先用 /models 看编号，再用 /model router|light|heavy <序号或provider/model> 设置。",
      );
      return;
    }

    const sessionState = await getActiveSession(identity, conversationTarget);
    const previousModel = getCurrentModelLabel(sessionState.piSession);
    const userState = await ensureTargetState(identity, conversationTarget, sessionState);
    const modelPreference = normalizeModelPreference(targetModel.model) ?? {
      provider: targetModel.provider,
      id: targetModel.id,
    };
    setModelRouteSlot(userState, parsed.slot, modelPreference);
    userState.updatedAt = new Date().toISOString();

    if (parsed.slot === "heavy") {
      await sessionState.piSession.setModel(targetModel.model);
      if (userState.thinkingLevel) {
        sessionState.piSession.setThinkingLevel(userState.thinkingLevel);
      }
    }

    await writeTargetState(identity, conversationTarget, userState);

    const reply = handleBridgeCommand(command, {
      openId,
      currentModel: getCurrentModelLabel(sessionState.piSession) ?? formatModelLabel(targetModel.provider, targetModel.id),
      currentThinkingLevel: getCurrentThinkingLevel(sessionState.piSession),
      previousModel,
      modelRouting: getModelRoutingConfig(userState),
      modelRouteSlot: parsed.slot,
    });
    await sendCommandReply(identity, conversationTarget, reply);
  }

  async function handleRouteCommand(
    identity: UserIdentity,
    command: BridgeCommand,
    conversationTarget?: ConversationTarget,
  ): Promise<void> {
    const openId = identity.openId;
    const parsed = parseOnOffArgs(command.args, "route");
    if (parsed.error) {
      await sendTextReply(identity, conversationTarget, parsed.error);
      return;
    }

    const sessionState = await getActiveSession(identity, conversationTarget);
    const userState = await ensureTargetState(identity, conversationTarget, sessionState);
    userState.modelRouting = getModelRoutingConfig(userState);

    if (parsed.enabled && !hasCompleteModelRoutingConfig(userState)) {
      await sendTextReply(
        identity,
        conversationTarget,
        "请先设置 router/light/heavy 三类模型。\n\n用法：/model router <模型>、/model light <模型>、/model heavy <模型>。",
      );
      return;
    }

    userState.modelRouting.enabled = parsed.enabled;
    userState.updatedAt = new Date().toISOString();
    await writeTargetState(identity, conversationTarget, userState);

    const reply = handleBridgeCommand(command, {
      openId,
      currentModel: getCurrentModelLabel(sessionState.piSession),
      modelRouting: getModelRoutingConfig(userState),
      routeEnabled: parsed.enabled,
    });
    await sendCommandReply(identity, conversationTarget, reply);
  }

  async function handleResumeCommand(
    identity: UserIdentity,
    command: BridgeCommand,
    conversationTarget?: ConversationTarget,
  ): Promise<void> {
    const openId = identity.openId;
    const argText = command.args.trim();

    if (!argText) {
      await sendTextReply(
        identity,
        conversationTarget,
        "请先给出要恢复的会话。\n\n先用 /sessions 看列表，再用 /resume <序号> 或 /resume <sessionId前缀>。",
      );
      return;
    }

    if (isConversationLocked(identity, conversationTarget)) {
      await sendTextReply(identity, conversationTarget, "当前还有任务在跑，等这条回复结束后再切会话。");
      return;
    }

    try {
      const sessionState = await resumeTargetSession(identity, conversationTarget, argText);
      const baseReply = handleBridgeCommand(command, {
        openId,
        sessionId: sessionState.activeSessionId,
        currentModel: getCurrentModelLabel(sessionState.piSession),
      });
      const reply = appendRecentHistory(baseReply, sessionState.piSession);
      await sendCommandReply(identity, conversationTarget, reply);
    } catch (error) {
      const code = error instanceof Error ? error.message : String(error);
      if (code === "RESUME_SESSION_NOT_FOUND") {
        await sendTextReply(
          identity,
          conversationTarget,
          "没找到这个会话。\n\n先用 /sessions 看列表，再用 /resume <序号> 或 /resume <sessionId前缀>。",
        );
        return;
      }
      throw error;
    }
  }

  async function handleCronCommand(
    identity: UserIdentity,
    command: BridgeCommand,
    conversationTarget?: ConversationTarget,
  ): Promise<void> {
    const openId = identity.openId;
    const cronScope = getCronScope(identity, conversationTarget);
    const cronScopeKey = cronScope.scopeKey;
    const cronService = deps.cronService;
    if (!cronService?.isEnabled()) {
      await sendTextReply(identity, conversationTarget, "当前网关没有开启定时任务。");
      return;
    }

    const parsed = parseCronBridgeCommand(command.args);
    if (parsed.error) {
      await sendTextReply(identity, conversationTarget, parsed.error);
      return;
    }

    const defaultTz = cronService.getDefaultTimezone?.() ?? deps.config.CRON_DEFAULT_TZ;
    switch (parsed.command?.action) {
      case "help":
        await sendCommandReply(identity, conversationTarget, formatCronHelp(defaultTz));
        return;
      case "list": {
        const jobs = await cronService.listJobs(cronScope);
        await sendCommandReply(identity, conversationTarget, formatCronJobList(jobs, defaultTz));
        return;
      }
      case "add": {
        const parsedSchedule = parseScheduleInput(
          parsed.command.time,
          parsed.command.tz?.trim() || defaultTz,
        );
        const schedule =
          parsedSchedule.schedule.kind === "cron" && parsed.command.tz?.trim()
            ? {
                ...parsedSchedule.schedule,
                tz: parsed.command.tz.trim(),
              }
            : parsedSchedule.schedule;
        const job = await cronService.addJob({
          openId,
          userId: identity.userId,
          scopeType: cronScope.scopeType,
          scopeKey: cronScope.scopeKey,
          conversationTarget: getCronConversationTargetForStorage(conversationTarget),
          name: parsed.command.name,
          prompt: parsed.command.prompt,
          schedule,
          deleteAfterRun: parsedSchedule.deleteAfterRun,
        });
        await sendCommandReply(identity, conversationTarget, formatCronJobAdded(job, defaultTz));
        return;
      }
      case "remove": {
        try {
          const removed = await cronService.removeJob(cronScope, parsed.command.jobId);
          if (!removed) {
            await sendTextReply(identity, conversationTarget, "没找到这个定时任务。");
            return;
          }
          await sendCommandReply(identity, conversationTarget, formatCronJobRemoved(removed));
        } catch (error) {
          if ((error instanceof Error ? error.message : String(error)) === "CRON_JOB_RUNNING") {
            await sendTextReply(identity, conversationTarget, "这个定时任务正在执行，先用 /stop 停掉再删。");
            return;
          }
          throw error;
        }
        return;
      }
      case "stop": {
        try {
          const result = await cronService.stopJob(cronScope, parsed.command.jobId);
          await sendCommandReply(identity, conversationTarget, formatCronJobStopResult(result));
        } catch (error) {
          const code = error instanceof Error ? error.message : String(error);
          if (code === "CRON_JOB_NOT_FOUND") {
            await sendTextReply(identity, conversationTarget, "没找到这个定时任务。");
            return;
          }
          if (code === "CRON_STOP_UNSUPPORTED") {
            await sendTextReply(identity, conversationTarget, "当前网关暂不支持停止定时任务。");
            return;
          }
          throw error;
        }
        return;
      }
      case "run": {
        try {
          const result =
            deps.runtimeState.isLocked(cronScopeKey) && deps.deferredCronRunService
              ? await deps.deferredCronRunService.queueRun(cronScope, parsed.command.jobId)
              : await cronService.runJobNow(cronScope, parsed.command.jobId);
          await sendCommandReply(identity, conversationTarget, formatCronJobRunResult(result, defaultTz));
        } catch (error) {
          const code = error instanceof Error ? error.message : String(error);
          if (code === "CRON_JOB_NOT_FOUND") {
            await sendTextReply(identity, conversationTarget, "没找到这个定时任务。");
            return;
          }
          if (code === "CRON_JOB_RUNNING") {
            await sendTextReply(identity, conversationTarget, "这个定时任务已经在执行中了。");
            return;
          }
          throw error;
        }
      }
    }
  }

  async function handleSettingsCommand(
    identity: UserIdentity,
    command: BridgeCommand,
    conversationTarget?: ConversationTarget,
  ): Promise<void> {
    const openId = identity.openId;
    const parsed = parseSettingsArgs(command.args);
    if (parsed.error) {
      await sendTextReply(identity, conversationTarget, parsed.error);
      return;
    }

    const sessionState = await getActiveSession(identity, conversationTarget);
    const userState = (await readTargetState(identity, conversationTarget)) ?? {
      activeSessionId: sessionState.activeSessionId,
      piSessionFile: sessionState.piSession.sessionFile ?? undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
    };

    if (parsed.kind === "show") {
      const reply = handleBridgeCommand(command, {
        openId,
        currentModel: getCurrentModelLabel(sessionState.piSession),
        currentThinkingLevel: userState.thinkingLevel ?? getCurrentThinkingLevel(sessionState.piSession),
        streamingEnabled: userState.streamingEnabled ?? deps.runtimeConfig?.getStreamingEnabled() ?? false,
      });
      await sendCommandReply(identity, conversationTarget, reply);
      return;
    }

    if (parsed.kind === "think") {
      userState.thinkingLevel = parsed.level;
      userState.updatedAt = new Date().toISOString();
      await writeTargetState(identity, conversationTarget, userState);
      sessionState.piSession.setThinkingLevel(parsed.level);
      const effectiveThinkingLevel = getCurrentThinkingLevel(sessionState.piSession);
      const reply = handleBridgeCommand(command, {
        openId,
        currentModel: getCurrentModelLabel(sessionState.piSession),
        currentThinkingLevel: effectiveThinkingLevel,
        requestedThinkingLevel: parsed.level,
        effectiveThinkingLevel,
      });
      await sendCommandReply(identity, conversationTarget, reply);
      return;
    }

    if (parsed.kind !== "stream") {
      await sendTextReply(identity, conversationTarget, "settings 参数解析失败。");
      return;
    }

    userState.streamingEnabled = parsed.enabled;
    userState.updatedAt = new Date().toISOString();
    await writeTargetState(identity, conversationTarget, userState);
    const reply = handleBridgeCommand(command, {
      openId,
      streamingEnabled: parsed.enabled,
    });
    await sendCommandReply(identity, conversationTarget, reply);
  }

  async function handleSttCommand(
    identity: UserIdentity,
    command: BridgeCommand,
    conversationTarget?: ConversationTarget,
  ): Promise<void> {
    const openId = identity.openId;
    if (!deps.runtimeConfig) {
      await sendTextReply(identity, conversationTarget, "当前环境不支持这个命令。");
      return;
    }

    const parsed = parseSttProviderArgs(command.args);
    if (parsed.error) {
      await sendTextReply(identity, conversationTarget, parsed.error);
      return;
    }

    if (!parsed.provider) {
      await sendTextReply(identity, conversationTarget, "语音转写 provider 解析失败。");
      return;
    }

    if (parsed.provider === "doubao" && !deps.config.FEISHU_AUDIO_TRANSCRIBE_DOUBAO_API_KEY.trim()) {
      await sendTextReply(
        identity,
        conversationTarget,
        "当前 .env 里没配置 FEISHU_AUDIO_TRANSCRIBE_DOUBAO_API_KEY，不能切到 doubao。",
      );
      return;
    }

    deps.runtimeConfig.setAudioTranscribeProvider(parsed.provider);
    await sendCommandReply(identity, conversationTarget, `✅ 语音转写已切到 ${parsed.provider}。`);
  }

  async function handleStreamCommand(
    identity: UserIdentity,
    command: BridgeCommand,
    conversationTarget?: ConversationTarget,
  ): Promise<void> {
    const openId = identity.openId;
    if (!deps.runtimeConfig) {
      await sendTextReply(identity, conversationTarget, "当前环境不支持这个命令。");
      return;
    }

    const parsed = parseOnOffArgs(command.args, "stream");
    if (parsed.error) {
      await sendTextReply(identity, conversationTarget, parsed.error);
      return;
    }

    if (parsed.enabled === undefined) {
      await sendTextReply(identity, conversationTarget, "stream 开关解析失败。");
      return;
    }

    deps.runtimeConfig.setStreamingEnabled(parsed.enabled);
    const action = parsed.enabled ? "开启" : "关闭";
    await sendCommandReply(identity, conversationTarget, `✅ 已${action}流式回复。`);
  }

  async function handleReactionCommand(
    identity: UserIdentity,
    command: BridgeCommand,
    conversationTarget?: ConversationTarget,
  ): Promise<void> {
    const openId = identity.openId;
    if (!deps.runtimeConfig) {
      await sendTextReply(identity, conversationTarget, "当前环境不支持这个命令。");
      return;
    }

    const parsed = parseOnOffArgs(command.args, "reaction");
    if (parsed.error) {
      await sendTextReply(identity, conversationTarget, parsed.error);
      return;
    }

    if (!parsed.enabled) {
      deps.runtimeConfig.disableProcessingReaction();
      await sendCommandReply(identity, conversationTarget, "✅ 已关闭处理中 reaction。");
      return;
    }

    const reactionType = deps.runtimeConfig.enableProcessingReaction();
    if (!reactionType) {
      await sendTextReply(
        identity,
        conversationTarget,
        "当前 .env 里没配置 FEISHU_PROCESSING_REACTION_TYPE，不能开启 reaction。",
      );
      return;
    }

    await sendCommandReply(identity, conversationTarget, `✅ 已开启处理中 reaction，表情继续使用 .env 里的 ${reactionType}。`);
  }

  async function handleGroupCommand(
    identity: UserIdentity,
    command: BridgeCommand,
    conversationTarget?: ConversationTarget,
  ): Promise<void> {
    if (!deps.runtimeConfig) {
      await sendTextReply(identity, conversationTarget, "当前环境不支持这个命令。");
      return;
    }

    const groupScopedSettings = Boolean(deps.groupSettingsStore);
    const parsed = parseGroupArgs(command.args, groupScopedSettings);
    if (parsed.error) {
      await sendTextReply(identity, conversationTarget, parsed.error);
      return;
    }

    const currentChatId = getCurrentGroupChatId(conversationTarget);
    if (deps.groupSettingsStore && !currentChatId) {
      await sendTextReply(identity, conversationTarget, "这个命令是按群单独保存的，请到目标群里使用。");
      return;
    }

    const settings = await readEffectiveGroupRoutingConfig(currentChatId);
    if (parsed.kind === "show") {
      await sendCommandReply(
        identity,
        conversationTarget,
        formatGroupSettingsReply(
          {
            policy: settings.FEISHU_GROUP_CHAT_POLICY,
            mode: settings.FEISHU_GROUP_MESSAGE_MODE,
            allowlist: settings.FEISHU_GROUP_CHAT_ALLOWLIST,
            keywords: settings.FEISHU_GROUP_MESSAGE_KEYWORDS,
          },
          currentChatId,
          undefined,
          groupScopedSettings,
        ),
      );
      return;
    }

    if (parsed.kind === "set-policy") {
      settings.FEISHU_GROUP_CHAT_POLICY = parsed.policy;
      await writeEffectiveGroupRoutingConfig(currentChatId, settings);
      await sendCommandReply(
        identity,
        conversationTarget,
        formatGroupSettingsReply(
          {
            policy: settings.FEISHU_GROUP_CHAT_POLICY,
            mode: settings.FEISHU_GROUP_MESSAGE_MODE,
            allowlist: settings.FEISHU_GROUP_CHAT_ALLOWLIST,
            keywords: settings.FEISHU_GROUP_MESSAGE_KEYWORDS,
          },
          currentChatId,
          `✅ 已切换群聊开关：${parsed.policy}`,
          groupScopedSettings,
        ),
      );
      return;
    }

    if (parsed.kind === "set-mode") {
      settings.FEISHU_GROUP_MESSAGE_MODE = parsed.mode;
      await writeEffectiveGroupRoutingConfig(currentChatId, settings);
      await sendCommandReply(
        identity,
        conversationTarget,
        formatGroupSettingsReply(
          {
            policy: settings.FEISHU_GROUP_CHAT_POLICY,
            mode: settings.FEISHU_GROUP_MESSAGE_MODE,
            allowlist: settings.FEISHU_GROUP_CHAT_ALLOWLIST,
            keywords: settings.FEISHU_GROUP_MESSAGE_KEYWORDS,
          },
          currentChatId,
          `✅ 已切换群消息触发方式：${parsed.mode}`,
          groupScopedSettings,
        ),
      );
      return;
    }

    if (parsed.kind === "show-allowlist") {
      await sendCommandReply(
        identity,
        conversationTarget,
        formatGroupAllowlistReply(settings.FEISHU_GROUP_CHAT_ALLOWLIST, currentChatId, undefined, groupScopedSettings),
      );
      return;
    }

    if (parsed.kind === "edit-allowlist") {
      const targetChatIds = resolveGroupAllowlistTargets(parsed.targets, currentChatId, groupScopedSettings);
      if (!targetChatIds.ok) {
        await sendTextReply(identity, conversationTarget, targetChatIds.error);
        return;
      }

      const chatIds = targetChatIds.chatIds;
      const currentAllowlist = [...settings.FEISHU_GROUP_CHAT_ALLOWLIST];
      const currentAllowlistSet = new Set(currentAllowlist);
      const changedChatIds = parsed.action === "add"
        ? chatIds.filter((chatId) => !currentAllowlistSet.has(chatId))
        : chatIds.filter((chatId) => currentAllowlistSet.has(chatId));

      if (parsed.action === "add") {
        settings.FEISHU_GROUP_CHAT_ALLOWLIST = dedupeToolNames([...currentAllowlist, ...chatIds]);
      } else {
        const removedChatIds = new Set(chatIds);
        settings.FEISHU_GROUP_CHAT_ALLOWLIST = currentAllowlist.filter((chatId) => !removedChatIds.has(chatId));
      }
      await writeEffectiveGroupRoutingConfig(currentChatId, settings);

      const summary = changedChatIds.length > 0
        ? `✅ 已${parsed.action === "add" ? "加入" : "移出"}群白名单：${changedChatIds.join(", ")}`
        : parsed.action === "add"
          ? `这些群本来就在白名单里：${chatIds.join(", ")}`
          : `这些群本来就不在白名单里：${chatIds.join(", ")}`;
      await sendCommandReply(
        identity,
        conversationTarget,
        formatGroupAllowlistReply(settings.FEISHU_GROUP_CHAT_ALLOWLIST, currentChatId, summary, groupScopedSettings),
      );
      return;
    }

    if (parsed.kind === "show-keywords") {
      await sendCommandReply(
        identity,
        conversationTarget,
        formatGroupKeywordsReply(settings.FEISHU_GROUP_MESSAGE_KEYWORDS),
      );
      return;
    }

    if (parsed.kind === "set-keywords") {
      settings.FEISHU_GROUP_MESSAGE_KEYWORDS = dedupeToolNames(parsed.keywords);
      await writeEffectiveGroupRoutingConfig(currentChatId, settings);
      await sendCommandReply(
        identity,
        conversationTarget,
        formatGroupKeywordsReply(
          settings.FEISHU_GROUP_MESSAGE_KEYWORDS,
          `✅ 已更新群关键词：${settings.FEISHU_GROUP_MESSAGE_KEYWORDS.map(formatGroupKeywordForDisplay).join(" ")}`,
        ),
      );
      return;
    }

    settings.FEISHU_GROUP_MESSAGE_KEYWORDS = [];
    await writeEffectiveGroupRoutingConfig(currentChatId, settings);
    await sendCommandReply(
      identity,
      conversationTarget,
      formatGroupKeywordsReply([], "✅ 已清空群关键词。"),
    );
  }

  async function handleToolsCommand(
    identity: UserIdentity,
    command: BridgeCommand,
    conversationTarget?: ConversationTarget,
  ): Promise<void> {
    const openId = identity.openId;
    const sessionState = await getActiveSession(identity, conversationTarget);
    const toolSession = getToolConfigSession(sessionState.piSession);
    if (!toolSession) {
      await sendTextReply(identity, conversationTarget, "当前 session 不支持 tool 配置。");
      return;
    }

    const parsed = parseToolsArgs(command.args);
    if (parsed.error) {
      await sendTextReply(identity, conversationTarget, parsed.error);
      return;
    }

    const allToolNames = toolSession.getAllTools().map((tool) => tool.name);
    const allToolNameSet = new Set(allToolNames);
    const currentActiveTools = dedupeToolNames(toolSession.getActiveToolNames().filter((name) => allToolNameSet.has(name)));

    if (parsed.action === "show") {
      await sendCommandReply(
        identity,
        conversationTarget,
        handleBridgeCommand(command, {
          openId,
          tools: buildToolStatusList(allToolNames, currentActiveTools),
        }),
      );
      return;
    }

    if (parsed.action === "reset") {
      const defaultTools = dedupeToolNames(
        getSessionDefaultToolNames(sessionState.piSession).filter((name) => allToolNameSet.has(name)),
      );
      toolSession.setActiveToolsByName(defaultTools);
      await persistTargetToolSelection(identity, conversationTarget, sessionState, defaultTools);
      await sendCommandReply(identity, conversationTarget, formatToolsActionReply("reset", [], defaultTools, allToolNames));
      return;
    }

    const action = parsed.action;
    if (action !== "on" && action !== "off" && action !== "set") {
      await sendTextReply(identity, conversationTarget, "tools 参数解析失败。");
      return;
    }

    const requestedTools = dedupeToolNames(parsed.toolNames);
    const missingTools = requestedTools.filter((tool) => !allToolNameSet.has(tool));
    if (missingTools.length > 0) {
      await sendTextReply(
        identity,
        conversationTarget,
        `这些 tools 不存在：${missingTools.join(", ")}。\n\n先用 /tools 看当前 session 里的可用 tools。`,
      );
      return;
    }

    let nextActiveTools = currentActiveTools;
    if (action === "on") {
      nextActiveTools = dedupeToolNames([...currentActiveTools, ...requestedTools]);
    } else if (action === "off") {
      const disabledTools = new Set(requestedTools);
      nextActiveTools = currentActiveTools.filter((tool) => !disabledTools.has(tool));
    } else if (action === "set") {
      nextActiveTools = requestedTools;
    }

    toolSession.setActiveToolsByName(nextActiveTools);
    await persistTargetToolSelection(identity, conversationTarget, sessionState, nextActiveTools);
    await sendCommandReply(identity, conversationTarget, formatToolsActionReply(action, requestedTools, nextActiveTools, allToolNames));
  }

  async function persistTargetToolSelection(
    identity: UserIdentity,
    conversationTarget: ConversationTarget | undefined,
    sessionState: { activeSessionId: string; piSession: { sessionFile?: string } },
    enabledTools: string[],
  ): Promise<void> {
    const userState = await ensureTargetState(identity, conversationTarget, sessionState);
    userState.enabledTools = [...enabledTools];
    userState.updatedAt = new Date().toISOString();
    await writeTargetState(identity, conversationTarget, userState);
  }

  async function handleToolCallsCommand(
    identity: UserIdentity,
    command: BridgeCommand,
    conversationTarget?: ConversationTarget,
  ): Promise<void> {
    const openId = identity.openId;
    const parsed = parseToolCallsArgs(command.args);
    if (parsed.error) {
      await sendTextReply(identity, conversationTarget, parsed.error);
      return;
    }

    const sessionState = await getActiveSession(identity, conversationTarget);
    const existingState = await readTargetState(identity, conversationTarget);
    const now = new Date().toISOString();
    const userState: UserState = existingState ?? {
      activeSessionId: sessionState.activeSessionId,
      piSessionFile: sessionState.piSession.sessionFile ?? undefined,
      createdAt: now,
      updatedAt: now,
      lastActiveAt: now,
    };

    if (parsed.kind === "show") {
      const reply = handleBridgeCommand(command, {
        openId,
        toolCallsDisplayMode: userState.toolCallsDisplayMode ?? "off",
      });
      await sendCommandReply(identity, conversationTarget, reply);
      return;
    }

    userState.toolCallsDisplayMode = parsed.mode;
    userState.updatedAt = new Date().toISOString();
    await writeTargetState(identity, conversationTarget, userState);
    const reply = handleBridgeCommand(command, {
      openId,
      toolCallsDisplayMode: parsed.mode,
    });
    await sendCommandReply(identity, conversationTarget, reply);
  }

  async function handleSkillFolderCommand(
    identity: UserIdentity,
    command: BridgeCommand,
    conversationTarget?: ConversationTarget,
  ): Promise<void> {
    const openId = identity.openId;
    const parsed = parseSkillFolderArgs(command.args);
    if (parsed.error) {
      await sendTextReply(identity, conversationTarget, parsed.error);
      return;
    }

    if (parsed.kind === "show") {
      const userState = await readTargetState(identity, conversationTarget);
      const reply = handleBridgeCommand(command, {
        openId,
        globalAgentsSkillsEnabled: userState?.globalAgentsSkillsEnabled === true,
      });
      await sendCommandReply(identity, conversationTarget, reply);
      return;
    }

    const sessionState = await getActiveSession(identity, conversationTarget);
    const userState = await ensureTargetState(identity, conversationTarget, sessionState);
    userState.globalAgentsSkillsEnabled = parsed.enabled;
    userState.updatedAt = new Date().toISOString();
    await writeTargetState(identity, conversationTarget, userState);

    const reply = handleBridgeCommand(command, {
      openId,
      globalAgentsSkillsEnabled: parsed.enabled,
    });
    await sendCommandReply(identity, conversationTarget, reply);
  }

  async function handleUnsupportedSlashCommand(
    identity: UserIdentity,
    rawText: string,
    conversationTarget?: ConversationTarget,
  ): Promise<void> {
    await sendCommandReply(identity, conversationTarget, formatUnsupportedSlashCommand(rawText));
  }

  async function handleUnauthorizedBridgeCommand(
    identity: UserIdentity,
    _command: BridgeCommand,
    conversationTarget?: ConversationTarget,
  ): Promise<void> {
    await sendTextReply(identity, conversationTarget, "这个命令只有 owner 可以在群里使用。");
  }

  return {
    handleBridgeCommand: handleBridgeCommandFlow,
    handleUnsupportedSlashCommand,
    handleUnauthorizedBridgeCommand,
  };
}

function parsePageArg(
  args: string,
  options: { commandName: string; extraUsage: string },
): { page: number; error?: undefined } | { page?: undefined; error: string } {
  const trimmed = args.trim();
  if (!trimmed) {
    return { page: 1 };
  }

  const matched = trimmed.match(/^-n\s+(\d+)$/);
  if (!matched) {
    return { error: `用法：/${options.commandName} 或 /${options.commandName} -n <页码>${options.extraUsage}。` };
  }

  const page = Number(matched[1]);
  if (!Number.isSafeInteger(page) || page < 1) {
    return { error: "页码必须是大于等于 1 的整数。" };
  }

  return { page };
}

interface ToolConfigSession {
  getAllTools(): Array<{ name: string }>;
  getActiveToolNames(): string[];
  setActiveToolsByName(toolNames: string[]): void;
}

function getToolConfigSession(session: unknown): ToolConfigSession | null {
  if (
    !session
    || typeof session !== "object"
    || typeof (session as ToolConfigSession).getAllTools !== "function"
    || typeof (session as ToolConfigSession).getActiveToolNames !== "function"
    || typeof (session as ToolConfigSession).setActiveToolsByName !== "function"
  ) {
    return null;
  }

  return session as ToolConfigSession;
}

function parseToolsArgs(
  args: string,
):
  | { action: "show"; error?: undefined }
  | { action: "reset"; error?: undefined }
  | { action: "on" | "off" | "set"; toolNames: string[]; error?: undefined }
  | { action?: undefined; toolNames?: undefined; error: string } {
  const trimmed = args.trim();
  if (!trimmed) {
    return { action: "show" };
  }

  if (trimmed === "reset") {
    return { action: "reset" };
  }

  const [action, ...toolNames] = trimmed.split(/\s+/).filter(Boolean);
  if (action === "on" || action === "off" || action === "set") {
    if (toolNames.length === 0) {
      return { error: "用法：/tools\n/tools on <tool...>\n/tools off <tool...>\n/tools set <tool...>\n/tools reset" };
    }
    return { action, toolNames };
  }

  return { error: "用法：/tools\n/tools on <tool...>\n/tools off <tool...>\n/tools set <tool...>\n/tools reset" };
}

function buildToolStatusList(allToolNames: string[], activeToolNames: string[]): Array<{ name: string; enabled: boolean }> {
  const activeToolNameSet = new Set(activeToolNames);
  return allToolNames.map((name) => ({
    name,
    enabled: activeToolNameSet.has(name),
  }));
}

function dedupeToolNames(toolNames: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const toolName of toolNames) {
    if (seen.has(toolName)) {
      continue;
    }
    seen.add(toolName);
    result.push(toolName);
  }
  return result;
}

function formatToolsActionReply(
  action: "on" | "off" | "set" | "reset",
  changedTools: string[],
  activeTools: string[],
  allToolNames: string[],
): string {
  const actionLabel = action === "on"
    ? "已启用 tools。"
    : action === "off"
      ? "已禁用 tools。"
      : action === "set"
        ? "已更新 tools。"
        : "已恢复默认 tools。";
  const lines = [`✅ ${actionLabel}`];
  if (changedTools.length > 0) {
    lines.push(`变更：${changedTools.join(", ")}`);
  }
  lines.push(`当前启用（${activeTools.length}/${allToolNames.length}）：${activeTools.join(", ") || "（无）"}`, "", "查看详情：/tools");
  return lines.join("\n");
}

type GroupChatPolicy = Config["FEISHU_GROUP_CHAT_POLICY"];
type GroupMessageMode = Config["FEISHU_GROUP_MESSAGE_MODE"];

type ParsedGroupCommand =
  | { kind: "show"; error?: undefined }
  | { kind: "set-policy"; policy: GroupChatPolicy; error?: undefined }
  | { kind: "set-mode"; mode: GroupMessageMode; error?: undefined }
  | { kind: "show-allowlist"; error?: undefined }
  | { kind: "edit-allowlist"; action: "add" | "remove"; targets: string[]; error?: undefined }
  | { kind: "show-keywords"; error?: undefined }
  | { kind: "set-keywords"; keywords: string[]; error?: undefined }
  | { kind: "clear-keywords"; error?: undefined }
  | { kind?: undefined; error: string };

function parseGroupArgs(args: string, groupScoped = false): ParsedGroupCommand {
  const trimmed = args.trim();
  if (!trimmed) {
    return { kind: "show" };
  }

  const policyMatched = trimmed.match(/^policy\s+(disabled|allowlist|open)$/i);
  if (policyMatched) {
    return {
      kind: "set-policy",
      policy: policyMatched[1]!.toLowerCase() as GroupChatPolicy,
    };
  }

  const modeMatched = trimmed.match(/^mode\s+(mention|all|keyword)$/i);
  if (modeMatched) {
    return {
      kind: "set-mode",
      mode: modeMatched[1]!.toLowerCase() as GroupMessageMode,
    };
  }

  if (/^allowlist\s+show$/i.test(trimmed)) {
    return { kind: "show-allowlist" };
  }

  const allowlistMatched = trimmed.match(/^allowlist\s+(add|remove)\s+(.+)$/i);
  if (allowlistMatched) {
    const targets = allowlistMatched[2]!.trim().split(/\s+/).filter(Boolean);
    if (targets.length === 0) {
      return { error: formatGroupUsage(groupScoped) };
    }
    return {
      kind: "edit-allowlist",
      action: allowlistMatched[1]!.toLowerCase() as "add" | "remove",
      targets,
    };
  }

  if (/^keywords\s+show$/i.test(trimmed)) {
    return { kind: "show-keywords" };
  }

  if (/^keywords\s+clear$/i.test(trimmed)) {
    return { kind: "clear-keywords" };
  }

  const keywordsMatched = trimmed.match(/^keywords\s+set\s+(.+)$/i);
  if (keywordsMatched) {
    const keywords = parseGroupKeywordArgs(keywordsMatched[1]!);
    if (keywords.length === 0) {
      return { error: "请至少给一个关键词。\n\n用法：/group keywords set <关键词...>" };
    }
    return {
      kind: "set-keywords",
      keywords,
    };
  }

  return { error: formatGroupUsage(groupScoped) };
}

function parseGroupKeywordArgs(raw: string): string[] {
  const matches = raw.matchAll(/"([^"]*)"|'([^']*)'|“([^”]*)”|‘([^’]*)’|(\S+)/g);
  const keywords: string[] = [];
  for (const match of matches) {
    const candidate = match[1] ?? match[2] ?? match[3] ?? match[4] ?? match[5] ?? "";
    const normalized = normalizeGroupKeyword(candidate);
    if (normalized) {
      keywords.push(normalized);
    }
  }
  return keywords;
}

function normalizeGroupKeyword(raw: string): string {
  return raw.trim().replace(/^(["'“”‘’])+|(["'“”‘’])+$/g, "").trim();
}

function formatGroupUsage(groupScoped = false): string {
  return [
    "用法：/group",
    "/group policy disabled|allowlist|open",
    "/group mode mention|all|keyword",
    "/group allowlist show",
    groupScoped ? "/group allowlist add here" : "/group allowlist add here|<chat_id...>",
    groupScoped ? "/group allowlist remove here" : "/group allowlist remove here|<chat_id...>",
    "/group keywords show",
    "/group keywords set <关键词...>",
    "/group keywords clear",
  ].join("\n");
}

function getCurrentGroupChatId(conversationTarget?: ConversationTarget): string | undefined {
  if (!conversationTarget) {
    return undefined;
  }
  return conversationTarget.kind === "group" || conversationTarget.kind === "thread"
    ? conversationTarget.chatId
    : undefined;
}

function resolveGroupAllowlistTargets(
  rawTargets: string[],
  currentChatId?: string,
  groupScoped = false,
): { ok: true; chatIds: string[] } | { ok: false; error: string } {
  const normalizedTargets = rawTargets.map((target) => target.trim()).filter(Boolean);
  if (normalizedTargets.length === 0) {
    return { ok: false, error: formatGroupUsage(groupScoped) };
  }

  if (groupScoped && normalizedTargets.some((target) => target.toLowerCase() !== "here")) {
    return {
      ok: false,
      error: "这个设置是按群单独保存的，请到目标群里用 /group allowlist add here 或 /group allowlist remove here。",
    };
  }

  const chatIds = normalizedTargets.map((target) => {
    if (target.toLowerCase() !== "here") {
      return target;
    }
    return currentChatId;
  });

  if (chatIds.some((chatId) => !chatId)) {
    return {
      ok: false,
      error: groupScoped
        ? "这个设置是按群单独保存的，请到目标群里用 /group allowlist add here 或 /group allowlist remove here。"
        : "这里只有在群里用才知道当前 chat_id；私聊里请改成 /group allowlist add <chat_id> 或 /group allowlist remove <chat_id>。",
    };
  }

  return {
    ok: true,
    chatIds: dedupeToolNames(chatIds as string[]),
  };
}

function formatGroupSettingsReply(
  settings: {
    policy: GroupChatPolicy;
    mode: GroupMessageMode;
    allowlist: string[];
    keywords: string[];
  },
  currentChatId?: string,
  summary?: string,
  groupScoped = false,
): string {
  const lines: string[] = [];
  if (summary) {
    lines.push(summary, "");
  }

  lines.push(
    "👥 群聊设置",
    `群聊开关：${settings.policy}`,
    `触发方式：${settings.mode}`,
    `白名单：${settings.allowlist.length} 个`,
    `关键词：${settings.keywords.length > 0 ? settings.keywords.map(formatGroupKeywordForDisplay).join(" ") : "（无）"}`,
  );
  if (currentChatId) {
    lines.push(
      `当前群：${currentChatId}${settings.allowlist.includes(currentChatId) ? "（已在白名单）" : "（未在白名单）"}`,
    );
  }

  const warning = formatGroupSettingsWarning(settings);
  if (warning) {
    lines.push("", warning);
  }

  lines.push(
    "",
    "查看白名单：/group allowlist show",
    "查看关键词：/group keywords show",
  );
  return lines.join("\n");
}

function formatGroupAllowlistReply(
  allowlist: string[],
  currentChatId?: string,
  summary?: string,
  groupScoped = false,
): string {
  const lines: string[] = [];
  if (summary) {
    lines.push(summary, "");
  }

  lines.push(`📋 群白名单（${allowlist.length}）`);
  if (allowlist.length === 0) {
    lines.push("（空）");
  } else {
    lines.push(...allowlist.map((chatId, index) => `${index + 1}. ${chatId}`));
  }

  if (currentChatId) {
    lines.push("", `当前群：${currentChatId}${allowlist.includes(currentChatId) ? "（已在白名单）" : "（未在白名单）"}`);
  }

  lines.push(
    "",
    groupScoped ? "添加：/group allowlist add here" : "添加：/group allowlist add here|<chat_id...>",
    groupScoped ? "移除：/group allowlist remove here" : "移除：/group allowlist remove here|<chat_id...>",
  );
  return lines.join("\n");
}

function formatGroupKeywordsReply(keywords: string[], summary?: string): string {
  const lines: string[] = [];
  if (summary) {
    lines.push(summary, "");
  }

  lines.push(`🏷️ 群关键词（${keywords.length}）`);
  if (keywords.length === 0) {
    lines.push("（空）");
  } else {
    lines.push(keywords.map(formatGroupKeywordForDisplay).join(" "));
  }
  lines.push("", "设置：/group keywords set <关键词...>", "清空：/group keywords clear");
  return lines.join("\n");
}

function formatGroupKeywordForDisplay(keyword: string): string {
  return /\s/.test(keyword) ? `"${keyword}"` : keyword;
}

function formatGroupSettingsWarning(settings: {
  policy: GroupChatPolicy;
  mode: GroupMessageMode;
  allowlist: string[];
  keywords: string[];
}): string | undefined {
  if (settings.policy === "allowlist" && settings.allowlist.length === 0) {
    return "提醒：当前是 allowlist，但白名单还是空的，群消息会继续被忽略。";
  }

  if (settings.mode === "keyword" && settings.keywords.length === 0) {
    return "提醒：还没设置关键词，普通消息不会触发；@ 机器人仍可使用。";
  }

  return undefined;
}

function parseSettingsArgs(
  args: string,
):
  | { kind: "show"; error?: undefined }
  | { kind: "think"; level: ThinkingLevel; error?: undefined }
  | { kind: "stream"; enabled: boolean; error?: undefined }
  | { kind?: undefined; error: string } {
  const trimmed = args.trim();
  if (!trimmed) {
    return { kind: "show" };
  }

  const thinkMatched = trimmed.match(/^think\s+(off|minimal|low|medium|high|xhigh)$/i);
  if (thinkMatched) {
    return { kind: "think", level: thinkMatched[1]!.toLowerCase() as ThinkingLevel };
  }

  const streamMatched = trimmed.match(/^stream\s+(on|off)$/i);
  if (streamMatched) {
    return { kind: "stream", enabled: streamMatched[1]!.toLowerCase() === "on" };
  }

  return {
    error:
      "用法：/settings\n/settings think off|minimal|low|medium|high|xhigh\n/settings stream on|off",
  };
}

function parseToolCallsArgs(
  args: string,
):
  | { kind: "show"; error?: undefined }
  | { kind: "set"; mode: ToolCallsDisplayMode; error?: undefined }
  | { kind?: undefined; mode?: undefined; error: string } {
  const normalized = args.trim().toLowerCase();
  if (!normalized) {
    return { kind: "show" };
  }

  if (normalized === "off" || normalized === "name" || normalized === "full") {
    return { kind: "set", mode: normalized };
  }

  return { error: "用法：/toolcalls、/toolcalls off、/toolcalls name 或 /toolcalls full。" };
}

function parseSkillFolderArgs(
  args: string,
):
  | { kind: "show"; error?: undefined }
  | { kind: "set"; enabled: boolean; error?: undefined }
  | { kind?: undefined; enabled?: undefined; error: string } {
  const normalized = args.trim().toLowerCase();
  if (!normalized) {
    return { kind: "show" };
  }

  if (normalized === "on" || normalized === "off") {
    return { kind: "set", enabled: normalized === "on" };
  }

  return { error: "用法：/skill-folder、/skill-folder on 或 /skill-folder off。" };
}

function parseSttProviderArgs(
  args: string,
): { provider: "sensevoice" | "whisper" | "doubao"; error?: undefined } | { provider?: undefined; error: string } {
  const matched = args.trim().match(/^provider\s+(sensevoice|whisper|doubao)$/i);
  if (!matched) {
    return { error: "用法：/stt provider sensevoice|whisper|doubao。" };
  }

  return {
    provider: matched[1]!.toLowerCase() as "sensevoice" | "whisper" | "doubao",
  };
}

function parseOnOffArgs(
  args: string,
  commandName: "stream" | "reaction" | "route",
): { enabled: boolean; error?: undefined } | { enabled?: undefined; error: string } {
  const normalized = args.trim().toLowerCase();
  if (normalized === "on") {
    return { enabled: true };
  }

  if (normalized === "off") {
    return { enabled: false };
  }

  return { error: `用法：/${commandName} on 或 /${commandName} off。` };
}

function parseModelCommandArgs(
  args: string,
): { slot: ModelRouteSlot; modelRef: string; error?: undefined } | { slot?: undefined; modelRef?: undefined; error: string } {
  const parts = args.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return { error: "用法：/model router|light|heavy <序号或provider/model>。" };
  }

  const slot = parseModelRouteSlot(parts[0] ?? "");
  if (slot) {
    const modelRef = parts.slice(1).join(" ").trim();
    if (!modelRef) {
      return { error: `用法：/model ${slot} <序号或provider/model>。` };
    }
    return { slot, modelRef };
  }

  return { slot: "heavy", modelRef: args.trim() };
}

function getCurrentThinkingLevel(session: { thinkingLevel?: ThinkingLevel | undefined }): ThinkingLevel | undefined {
  return session.thinkingLevel;
}

function normalizeModelPreference(model: { provider?: string; id?: string } | undefined): ModelPreference | undefined {
  const provider = model?.provider?.trim();
  const id = model?.id?.trim();
  if (!provider || !id) {
    return undefined;
  }
  return { provider, id };
}

function getCurrentModelLabel(session: { model?: { provider: string; id: string } | undefined }): string | undefined {
  const modelPreference = normalizeModelPreference(session.model);
  if (!modelPreference) {
    return undefined;
  }
  return formatModelLabel(modelPreference.provider, modelPreference.id);
}

function appendRecentHistory(
  baseReply: string,
  session: {
    messages?: Array<{
      role?: string;
      content?: unknown;
      stopReason?: string;
      errorMessage?: string;
    }>;
    state?: {
      messages?: Array<{
        role?: string;
        content?: unknown;
        stopReason?: string;
        errorMessage?: string;
      }>;
    };
  },
): string {
  const historyText = formatRecentHistory(session);
  if (!historyText) {
    return baseReply;
  }
  return `${baseReply}\n\n历史消息：\n${historyText}`;
}

function formatRecentHistory(session: {
  messages?: Array<{
    role?: string;
    content?: unknown;
    stopReason?: string;
    errorMessage?: string;
  }>;
  state?: {
    messages?: Array<{
      role?: string;
      content?: unknown;
      stopReason?: string;
      errorMessage?: string;
    }>;
  };
}): string {
  const messages = session.messages ?? session.state?.messages ?? [];
  if (messages.length === 0) {
    return "";
  }

  const turns: Array<{ user: string; assistant?: string }> = [];
  for (const message of messages) {
    if (message.role === "user") {
      const userText = summarizeUserMessage(message.content);
      if (userText) {
        turns.push({ user: userText });
      }
      continue;
    }

    if (message.role !== "assistant" || turns.length === 0) {
      continue;
    }

    const assistantText = summarizeAssistantMessage(message.content, message.stopReason, message.errorMessage);
    if (!assistantText) {
      continue;
    }

    turns[turns.length - 1]!.assistant = assistantText;
  }

  const recentTurns = turns.slice(-2);
  if (recentTurns.length === 0) {
    return "";
  }

  return recentTurns
    .map((turn) => `user input: ${turn.user}\nmodel output: ${turn.assistant ?? "（无模型输出）"}`)
    .join("\n\n");
}

function summarizeUserMessage(content: unknown): string {
  if (typeof content === "string") {
    return truncateHistoryText(extractUserHistoryText(content) || "（空输入）");
  }

  if (!Array.isArray(content)) {
    return "（空输入）";
  }

  const pieces: string[] = [];
  for (const item of content) {
    if (!item || typeof item !== "object") {
      continue;
    }

    if ("type" in item && item.type === "text" && typeof item.text === "string") {
      const normalized = extractUserHistoryText(item.text);
      if (normalized) {
        pieces.push(normalized);
      }
      continue;
    }

    if ("type" in item && item.type === "image" && pieces[pieces.length - 1] !== "[图片]") {
      pieces.push("[图片]");
    }
  }

  return truncateHistoryText(pieces.join(" ").trim() || "（空输入）");
}

function summarizeAssistantMessage(content: unknown, stopReason?: string, errorMessage?: string): string {
  const text = collectMessageContentText(content, { includeImages: false });
  const statusText = summarizeAssistantStopReason(stopReason, errorMessage);
  if (text && statusText) {
    return appendHistoryStatus(text, statusText);
  }

  return text ? truncateHistoryText(text) : statusText;
}

function summarizeMessageContent(content: unknown, options: { includeImages: boolean }): string {
  const text = collectMessageContentText(content, options);
  return text ? truncateHistoryText(text) : "";
}

function collectMessageContentText(content: unknown, options: { includeImages: boolean }): string {
  if (typeof content === "string") {
    return normalizeHistoryText(content);
  }

  if (!Array.isArray(content)) {
    return "";
  }

  const pieces: string[] = [];
  for (const item of content) {
    if (!item || typeof item !== "object") {
      continue;
    }

    if ("type" in item && item.type === "text" && typeof item.text === "string") {
      const normalized = normalizeHistoryText(item.text);
      if (normalized) {
        pieces.push(normalized);
      }
      continue;
    }

    if (options.includeImages && "type" in item && item.type === "image") {
      pieces.push("[图片]");
    }
  }

  return pieces.join(" ").trim();
}

function normalizeHistoryText(text: string): string {
  return text.replace(/[\x00-\x1f\x7f]/g, " ").replace(/\s+/g, " ").trim();
}

function extractUserHistoryText(text: string): string {
  const normalized = text.replace(/\r\n/g, "\n").trim();
  if (!normalized) {
    return "";
  }

  const quotedMessage = extractQuotedCurrentMessage(normalized);
  if (quotedMessage !== null) {
    return extractUserHistoryText(quotedMessage) || "（回复了一条消息）";
  }

  const audioTranscript = extractAudioTranscript(normalized);
  if (audioTranscript !== null) {
    return audioTranscript || "[语音]";
  }

  if (isImagePrompt(normalized)) {
    return "[图片]";
  }

  return normalizeHistoryText(normalized);
}

function extractQuotedCurrentMessage(text: string): string | null {
  const prefix = "用户这次是在回复一条之前的消息。\n被引用消息：\n";
  const marker = "\n\n用户这次的新消息：\n";
  if (!text.startsWith(prefix)) {
    return null;
  }

  const markerIndex = text.indexOf(marker);
  if (markerIndex === -1) {
    return null;
  }

  return text.slice(markerIndex + marker.length).trim();
}

function extractAudioTranscript(text: string): string | null {
  const prefix = "用户发来了一段语音，音频已保存到本地：";
  if (!text.startsWith(prefix)) {
    return null;
  }

  for (const marker of ["\n以下是语音转写结果：\n", "\n以下是本地转写结果：\n"]) {
    const markerIndex = text.indexOf(marker);
    if (markerIndex !== -1) {
      return normalizeHistoryText(text.slice(markerIndex + marker.length));
    }
  }

  return "";
}

function isImagePrompt(text: string): boolean {
  return (
    text.startsWith("用户发来了一张图片，图片已保存到本地：") &&
    (text.includes("\n请直接查看图片内容并继续对话；如果用户没写额外说明，就先简短描述图片里有什么。") ||
      text.includes("\n当前模型不支持直接看图，以下是本地 OCR/视觉结果：\n"))
  );
}

function summarizeAssistantStopReason(stopReason?: string, errorMessage?: string): string {
  if (stopReason === "error") {
    const normalizedError = normalizeHistoryText(errorMessage ?? "");
    return normalizedError ? `（回复中断：${normalizedError}）` : "（回复中断）";
  }

  if (stopReason === "aborted") {
    const normalizedError = normalizeHistoryText(errorMessage ?? "");
    return normalizedError ? `（已停止：${normalizedError}）` : "（已停止）";
  }

  return "";
}

function appendHistoryStatus(text: string, statusText: string, maxLength = 160): string {
  if (!statusText) {
    return truncateHistoryText(text, maxLength);
  }

  const remainingLength = maxLength - statusText.length - 1;
  if (remainingLength <= 0) {
    return truncateHistoryText(statusText, maxLength);
  }

  return `${truncateHistoryText(text, remainingLength)} ${statusText}`;
}

function truncateHistoryText(text: string, maxLength = 160): string {
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.slice(0, maxLength - 1).trimEnd()}…`;
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
