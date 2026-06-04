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
  setModelRouteSlot,
} from "../pi/model-routing.js";
import {
  getSessionDefaultToolNames,
  type SessionService,
} from "../pi/sessions.js";
import type { SkillStatsStore } from "../pi/skill-stats.js";
import type { WorkspaceService } from "../pi/workspace.js";
import type { GroupSettingsStore, PersistedGroupRoutingConfig } from "../storage/group-settings.js";
import type { GroupUnmatchedMessageStore } from "../storage/group-unmatched-messages.js";
import type { P2PSettingsStore, PersistedP2PRoutingConfig } from "../storage/p2p-settings.js";
import type { UserStateStore } from "../storage/users.js";
import type { ModelPreference, ThinkingLevel, UserIdentity, UserState } from "../types.js";
import { handleBridgeCommand, formatUnsupportedSlashCommand, type BridgeCommand } from "./commands.js";
import { canRunBridgeCommand, isPrivateSuperAdminCommand, type GroupOwnerResolver } from "./command-permissions.js";
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
  getCronRuntimeLockKey,
} from "../cron/scope.js";
import type { RuntimeConfigStore } from "./runtime-config.js";
import { isSuperAdminOpenId } from "./access-control.js";
import { COMMAND_CATALOG, isCommandVisibleInTarget, type CommandCatalogItem } from "./command-service/catalog.js";
import { createGroupCommandHandler } from "./command-service/group.js";
import { dedupeToolNames } from "./command-service/helpers.js";
import { createP2PCommandHandler } from "./command-service/p2p.js";
import {
  parseModelCommandArgs,
  parseModelProviderFilterArg,
  parseOnOffArgs,
  parsePageArg,
  parseSettingsArgs,
  parseSkillFolderArgs,
  parseSttProviderArgs,
  parseToolCallsArgs,
  parseToolsArgs,
} from "./command-service/parsers.js";
import {
  appendRecentHistory,
  buildToolStatusList,
  formatToolsActionReply,
} from "./command-service/replies.js";
import {
  formatCronHelp,
  formatCronJobAdded,
  formatCronJobEnabled,
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
  > & Partial<Pick<RuntimeStateStore, "waitForUnlock">>;
  restartService: Pick<RestartService, "restartGateway">;
  listAvailableModels(): Promise<AvailableModelInfo[]>;
  findAvailableModel(rawRef: string): Promise<AvailableModelInfo | null>;
  cronService?: Pick<CronService, "isEnabled" | "getDefaultTimezone" | "listJobs" | "addJob" | "setJobEnabled" | "removeJob" | "stopJob" | "runJobNow">;
  deferredCronRunService?: Pick<DeferredCronRunService, "queueRun">;
  groupOwnerResolver?: GroupOwnerResolver;
  skillStatsStore?: Pick<SkillStatsStore, "listSkillUsage" | "reset">;
  groupSettingsStore?: Pick<
    GroupSettingsStore,
    | "readGlobalGroupRoutingConfig"
    | "writeGlobalGroupRoutingConfig"
    | "readGroupRoutingConfig"
    | "writeGroupRoutingConfig"
  >;
  groupUnmatchedMessageStore?: Pick<GroupUnmatchedMessageStore, "clear" | "count">;
  p2pSettingsStore?: Pick<P2PSettingsStore, "readP2PRoutingConfig" | "writeP2PRoutingConfig">;
  runtimeConfig?: Pick<
    RuntimeConfigStore,
    | "getAudioTranscribeProvider"
    | "setAudioTranscribeProvider"
    | "getStreamingEnabled"
    | "setStreamingEnabled"
    | "getP2PRoutingConfig"
    | "getP2PChatPolicy"
    | "setP2PChatPolicy"
    | "getP2PChatAllowlist"
    | "setP2PChatAllowlist"
    | "getGroupRoutingConfig"
    | "getGroupChatPolicy"
    | "setGroupChatPolicy"
    | "getGroupChatAllowlist"
    | "setGroupChatAllowlist"
    | "getGroupMessageMode"
    | "setGroupMessageMode"
    | "getGroupMessageKeywords"
    | "setGroupMessageKeywords"
    | "getGroupUnmatchedMessagePolicy"
    | "setGroupUnmatchedMessagePolicy"
    | "enableProcessingReaction"
    | "disableProcessingReaction"
  >;
}

export function createCommandService(deps: CommandServiceDeps): CommandService {
  const SESSION_PAGE_SIZE = 20;
  const SKILL_STATS_PAGE_SIZE = 10;
  const STOP_WAIT_TIMEOUT_MS = 30 * 1000;

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

  function getDefaultP2PRoutingConfig(): PersistedP2PRoutingConfig {
    const runtimeConfig = deps.runtimeConfig;
    if (runtimeConfig?.getP2PRoutingConfig) {
      const config = runtimeConfig.getP2PRoutingConfig();
      return {
        FEISHU_P2P_CHAT_POLICY: config.FEISHU_P2P_CHAT_POLICY,
        FEISHU_P2P_CHAT_ALLOWLIST: [...config.FEISHU_P2P_CHAT_ALLOWLIST],
      };
    }

    return {
      FEISHU_P2P_CHAT_POLICY: "all",
      FEISHU_P2P_CHAT_ALLOWLIST: [],
    };
  }

  async function readEffectiveP2PRoutingConfig(): Promise<PersistedP2PRoutingConfig> {
    return (await deps.p2pSettingsStore?.readP2PRoutingConfig()) ?? getDefaultP2PRoutingConfig();
  }

  async function writeEffectiveP2PRoutingConfig(config: PersistedP2PRoutingConfig): Promise<void> {
    deps.runtimeConfig?.setP2PChatPolicy(config.FEISHU_P2P_CHAT_POLICY);
    deps.runtimeConfig?.setP2PChatAllowlist(config.FEISHU_P2P_CHAT_ALLOWLIST);
    await deps.p2pSettingsStore?.writeP2PRoutingConfig(config);
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
        FEISHU_GROUP_UNMATCHED_MESSAGE_POLICY: config.FEISHU_GROUP_UNMATCHED_MESSAGE_POLICY,
      };
    }

    return {
      FEISHU_GROUP_CHAT_POLICY: "disabled",
      FEISHU_GROUP_CHAT_ALLOWLIST: [],
      FEISHU_GROUP_MESSAGE_MODE: "mention",
      FEISHU_GROUP_MESSAGE_KEYWORDS: [],
      FEISHU_GROUP_UNMATCHED_MESSAGE_POLICY: "ignore",
    };
  }

  async function readEffectiveGlobalGroupRoutingConfig(): Promise<PersistedGroupRoutingConfig> {
    return (await deps.groupSettingsStore?.readGlobalGroupRoutingConfig()) ?? getDefaultGroupRoutingConfig();
  }

  async function writeEffectiveGlobalGroupRoutingConfig(config: PersistedGroupRoutingConfig): Promise<void> {
    deps.runtimeConfig?.setGroupChatPolicy(config.FEISHU_GROUP_CHAT_POLICY);
    deps.runtimeConfig?.setGroupChatAllowlist(config.FEISHU_GROUP_CHAT_ALLOWLIST);
    deps.runtimeConfig?.setGroupMessageMode(config.FEISHU_GROUP_MESSAGE_MODE);
    deps.runtimeConfig?.setGroupMessageKeywords(config.FEISHU_GROUP_MESSAGE_KEYWORDS);
    deps.runtimeConfig?.setGroupUnmatchedMessagePolicy(config.FEISHU_GROUP_UNMATCHED_MESSAGE_POLICY);
    await deps.groupSettingsStore?.writeGlobalGroupRoutingConfig(config);
  }

  async function readEffectiveGroupRoutingConfig(chatId?: string): Promise<PersistedGroupRoutingConfig> {
    if (deps.groupSettingsStore && chatId) {
      const defaultConfig = await readEffectiveGlobalGroupRoutingConfig();
      const persisted = await deps.groupSettingsStore.readGroupRoutingConfig(chatId);
      return persisted
        ? {
            ...persisted,
            FEISHU_GROUP_CHAT_ALLOWLIST: [...defaultConfig.FEISHU_GROUP_CHAT_ALLOWLIST],
          }
        : defaultConfig;
    }

    return readEffectiveGlobalGroupRoutingConfig();
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
    deps.runtimeConfig.setGroupUnmatchedMessagePolicy(config.FEISHU_GROUP_UNMATCHED_MESSAGE_POLICY);
  }

  const handleP2PCommand = createP2PCommandHandler({
    readEffectiveP2PRoutingConfig,
    writeEffectiveP2PRoutingConfig,
    sendTextReply,
    sendCommandReply,
  });

  const handleGroupCommand = createGroupCommandHandler({
    isRuntimeConfigAvailable: () => Boolean(deps.runtimeConfig),
    readEffectiveGlobalGroupRoutingConfig,
    writeEffectiveGlobalGroupRoutingConfig,
    readEffectiveGroupRoutingConfig,
    writeEffectiveGroupRoutingConfig,
    groupUnmatchedMessageStore: deps.groupUnmatchedMessageStore,
    sendTextReply,
    sendCommandReply,
  });

  async function handleBridgeCommandFlow(
    identity: UserIdentity,
    command: BridgeCommand,
    conversationTarget?: ConversationTarget,
  ): Promise<void> {
    const openId = identity.openId;
    const conversationKey = getConversationTargetKey(conversationTarget, openId);
    try {
      if (command.name === "commands") {
        await sendCommandReply(identity, conversationTarget, await formatAvailableCommandsReply(identity, conversationTarget));
      } else if (command.name === "new" || command.name === "reset") {
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
      } else if (command.name === "p2p") {
        await handleP2PCommand(identity, command, conversationTarget);
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
    const result = await deps.runtimeState.requestStop(conversationKey);
    if (result === "not_running") {
      await sendTextReply(identity, conversationTarget, "当前没有正在执行的任务。");
      return;
    }

    const stopped = deps.runtimeState.waitForUnlock
      ? await deps.runtimeState.waitForUnlock(conversationKey, undefined, STOP_WAIT_TIMEOUT_MS)
      : !deps.runtimeState.isLocked(conversationKey);
    if (!stopped) {
      await sendTextReply(identity, conversationTarget, "停止请求已发出，但任务还没完全结束，请稍后再试。");
      return;
    }

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
        availableModels,
        modelRouting: getModelRoutingConfig(userState),
      });
      await sendCommandReply(identity, conversationTarget, reply);
      return;
    }

    const providerFilter = parseModelProviderFilterArg(argText);
    if (providerFilter) {
      const sessionState = await getActiveSession(identity, conversationTarget);
      const userState = await readTargetState(identity, conversationTarget);
      const availableModels = await deps.listAvailableModels();
      const reply = handleBridgeCommand(command, {
        openId,
        currentModel: getCurrentModelLabel(sessionState.piSession),
        requestedProvider: providerFilter,
        availableModels: filterAvailableModels(availableModels, providerFilter),
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
        "没找到这个模型，或者它现在还不能用。\n\n先用 /model 看编号，再用 /model router|light|heavy <序号或provider/model> 设置。",
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
    const argText = command.args.trim();
    if (!argText || argText.toLowerCase() === "status") {
      const sessionState = await getActiveSession(identity, conversationTarget);
      const userState = await readTargetState(identity, conversationTarget);
      const reply = handleBridgeCommand(command, {
        openId,
        currentModel: getCurrentModelLabel(sessionState.piSession),
        modelRouting: getModelRoutingConfig(userState),
      });
      await sendCommandReply(identity, conversationTarget, reply);
      return;
    }

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
    const cronLockKey = getCronRuntimeLockKey(cronScope.scopeKey);
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
            await sendTextReply(identity, conversationTarget, "这个定时任务正在执行，先用 /cron stop <jobId> 停掉再删。");
            return;
          }
          throw error;
        }
        return;
      }
      case "resume":
      case "pause": {
        try {
          const job = await cronService.setJobEnabled(cronScope, parsed.command.jobId, parsed.command.action === "resume");
          await sendCommandReply(identity, conversationTarget, formatCronJobEnabled(job));
        } catch (error) {
          const code = error instanceof Error ? error.message : String(error);
          if (code === "CRON_JOB_NOT_FOUND") {
            await sendTextReply(identity, conversationTarget, "没找到这个定时任务。");
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
            deps.runtimeState.isLocked(cronLockKey) && deps.deferredCronRunService
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
    command: BridgeCommand,
    conversationTarget?: ConversationTarget,
  ): Promise<void> {
    await sendTextReply(identity, conversationTarget, formatUnauthorizedCommandReply(identity, conversationTarget, command));
  }

  async function formatAvailableCommandsReply(
    identity: UserIdentity,
    conversationTarget?: ConversationTarget,
  ): Promise<string> {
    const resolvedTarget = conversationTarget ?? createFallbackP2PTarget(identity.openId);
    const scopeLabel = resolvedTarget.kind === "p2p" ? "私聊" : "群聊";
    const availableCommands: CommandCatalogItem[] = [];
    for (const item of COMMAND_CATALOG) {
      if (!isCommandVisibleInTarget(item, resolvedTarget)) {
        continue;
      }
      if (await canRunBridgeCommand(
        identity,
        { name: item.name, args: item.permissionArgs ?? "" },
        resolvedTarget,
        deps.groupOwnerResolver,
      )) {
        availableCommands.push(item);
      }
    }

    const lines = [`📖 当前可用命令（${scopeLabel}）`];
    if (availableCommands.length === 0) {
      lines.push("（无）");
    } else {
      lines.push(...availableCommands.map((item) => `${item.usage} — ${item.description}`));
    }

    if (!isSuperAdminOpenId(identity.openId)) {
      lines.push("", "受限命令不会显示；需要更高权限时请联系 super admin。");
    }

    return lines.join("\n");
  }

  function formatUnauthorizedCommandReply(
    identity: UserIdentity,
    conversationTarget?: ConversationTarget,
    command?: BridgeCommand,
  ): string {
    if (conversationTarget && conversationTarget.kind !== "p2p" && command && isPrivateSuperAdminCommand(command)) {
      return "这个命令请在私聊里使用。用 /commands 查看当前可用命令。";
    }

    if (conversationTarget?.kind === "p2p" || !conversationTarget) {
      return "这个命令只有 super admin 可以在私聊里使用。用 /commands 查看当前可用命令。";
    }

    return "这个命令只有 owner 或 super admin 可以在群里使用。用 /commands 查看当前可用命令。";
  }

  return {
    handleBridgeCommand: handleBridgeCommandFlow,
    handleUnsupportedSlashCommand,
    handleUnauthorizedBridgeCommand,
  };
}

function createFallbackP2PTarget(openId: string): ConversationTarget {
  return {
    kind: "p2p",
    key: openId,
    receiveIdType: "open_id",
    receiveId: openId,
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
    || typeof session !== "object"
    || typeof (session as ToolConfigSession).getAllTools !== "function"
    || typeof (session as ToolConfigSession).getActiveToolNames !== "function"
    || typeof (session as ToolConfigSession).setActiveToolsByName !== "function"
  ) {
    return null;
  }

  return session as ToolConfigSession;
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
