import type { Config } from "../config.js";
import type { ConversationTarget } from "../conversation.js";
import { getConversationTargetKey } from "../conversation.js";
import { formatError } from "../feishu/format.js";
import type { FeishuMessenger } from "../feishu/send.js";
import type { AvailableModelInfo } from "../pi/models.js";
import type { SessionService } from "../pi/sessions.js";
import type { SkillStatsStore } from "../pi/skill-stats.js";
import type { WorkspaceService } from "../pi/workspace.js";
import type { GroupSettingsStore, PersistedGroupRoutingConfig } from "../storage/group-settings.js";
import type { GroupUnmatchedMessageStore } from "../storage/group-unmatched-messages.js";
import type { P2PSettingsStore, PersistedP2PRoutingConfig } from "../storage/p2p-settings.js";
import type { UserStateStore } from "../storage/users.js";
import type { UserIdentity, UserState } from "../types.js";
import type { BridgeCommand } from "./commands.js";
import type { GroupOwnerResolver } from "./command-permissions.js";
import { logger } from "./logger.js";
import type { RestartService } from "./restart.js";
import type { RuntimeStateStore } from "./state.js";
import type { CronService } from "../cron/service.js";
import type { DeferredCronRunService } from "../cron/deferred-run.js";
import type { CronScopeSelector } from "../cron/types.js";
import { createCronScopeSelector } from "../cron/scope.js";
import type { RuntimeConfigStore } from "./runtime-config.js";
import { createCommandListHandlers } from "./command-service/command-list.js";
import { createCronCommandHandler } from "./command-service/cron.js";
import { createGroupCommandHandler } from "./command-service/group.js";
import { createModelCommandHandlers } from "./command-service/model.js";
import { createP2PCommandHandler } from "./command-service/p2p.js";
import { createSessionCommandHandlers } from "./command-service/session.js";
import { createSettingsCommandHandlers } from "./command-service/settings.js";
import { createSystemCommandHandlers } from "./command-service/system.js";
import { createToolsCommandHandlers } from "./command-service/tools.js";

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

  const sessionHandlers = createSessionCommandHandlers({
    getActiveSession,
    readTargetState,
    writeTargetState,
    ensureTargetState,
    sessionPageSize: SESSION_PAGE_SIZE,
    skillStatsPageSize: SKILL_STATS_PAGE_SIZE,
    getStreamingEnabled: () => deps.runtimeConfig?.getStreamingEnabled() ?? false,
    createSession,
    listTargetSessions,
    resumeTargetSession,
    getWorkspaceDir,
    isConversationLocked,
    skillStatsStore: deps.skillStatsStore,
    sendTextReply,
    sendCommandReply,
  });

  const modelHandlers = createModelCommandHandlers({
    getActiveSession,
    readTargetState,
    writeTargetState,
    ensureTargetState,
    listAvailableModels: deps.listAvailableModels,
    findAvailableModel: deps.findAvailableModel,
    isConversationLocked,
    sendTextReply,
    sendCommandReply,
  });

  const handleCronCommand = createCronCommandHandler({
    cronDefaultTimezone: deps.config.CRON_DEFAULT_TZ,
    cronService: deps.cronService,
    deferredCronRunService: deps.deferredCronRunService,
    isLocked: (lockKey) => deps.runtimeState.isLocked(lockKey),
    getCronScope,
    sendTextReply,
    sendCommandReply,
  });

  const settingsHandlers = createSettingsCommandHandlers({
    getActiveSession,
    readTargetState,
    writeTargetState,
    ensureTargetState,
    doubaoApiKey: deps.config.FEISHU_AUDIO_TRANSCRIBE_DOUBAO_API_KEY,
    runtimeConfig: deps.runtimeConfig,
    sendTextReply,
    sendCommandReply,
  });

  const toolsHandlers = createToolsCommandHandlers({
    getActiveSession,
    readTargetState,
    writeTargetState,
    ensureTargetState,
    sendTextReply,
    sendCommandReply,
  });

  const systemHandlers = createSystemCommandHandlers({
    dataDir: deps.config.DATA_DIR,
    stopWaitTimeoutMs: STOP_WAIT_TIMEOUT_MS,
    runtimeState: deps.runtimeState,
    restartService: deps.restartService,
    sendTextReply,
    sendCommandReply,
  });

  const commandListHandlers = createCommandListHandlers({
    groupOwnerResolver: deps.groupOwnerResolver,
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
        await commandListHandlers.handleCommandsCommand(identity, conversationTarget);
      } else if (command.name === "new" || command.name === "reset") {
        await sessionHandlers.handleNewOrResetCommand(identity, command, conversationTarget);
      } else if (command.name === "status") {
        await sessionHandlers.handleStatusCommand(identity, command, conversationTarget);
      } else if (command.name === "context" || command.name === "skills") {
        await sessionHandlers.handleContextOrSkillsCommand(identity, command, conversationTarget);
      } else if (command.name === "sessions") {
        await sessionHandlers.handleSessionsCommand(identity, command, conversationTarget);
      } else if (command.name === "skillstat") {
        await sessionHandlers.handleSkillStatCommand(identity, command, conversationTarget);
      } else if (command.name === "resume") {
        await sessionHandlers.handleResumeCommand(identity, command, conversationTarget);
      } else if (command.name === "model") {
        await modelHandlers.handleModelCommand(identity, command, conversationTarget);
      } else if (command.name === "route") {
        await modelHandlers.handleRouteCommand(identity, command, conversationTarget);
      } else if (command.name === "settings") {
        await settingsHandlers.handleSettingsCommand(identity, command, conversationTarget);
      } else if (command.name === "tools") {
        await toolsHandlers.handleToolsCommand(identity, command, conversationTarget);
      } else if (command.name === "toolcalls") {
        await toolsHandlers.handleToolCallsCommand(identity, command, conversationTarget);
      } else if (command.name === "skill-folder") {
        await toolsHandlers.handleSkillFolderCommand(identity, command, conversationTarget);
      } else if (command.name === "cron") {
        await handleCronCommand(identity, command, conversationTarget);
      } else if (command.name === "stt") {
        await settingsHandlers.handleSttCommand(identity, command, conversationTarget);
      } else if (command.name === "stream") {
        await settingsHandlers.handleStreamCommand(identity, command, conversationTarget);
      } else if (command.name === "reaction") {
        await settingsHandlers.handleReactionCommand(identity, command, conversationTarget);
      } else if (command.name === "group") {
        await handleGroupCommand(identity, command, conversationTarget);
      } else if (command.name === "p2p") {
        await handleP2PCommand(identity, command, conversationTarget);
      } else if (command.name === "stop") {
        await systemHandlers.handleStopCommand(identity, command, conversationKey, conversationTarget);
      } else if (command.name === "next") {
        await systemHandlers.handleNextCommand(identity, command, conversationTarget);
      } else if (command.name === "restart") {
        await systemHandlers.handleRestartCommand(identity, command, conversationTarget);
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

  return {
    handleBridgeCommand: handleBridgeCommandFlow,
    handleUnsupportedSlashCommand: commandListHandlers.handleUnsupportedSlashCommand,
    handleUnauthorizedBridgeCommand: commandListHandlers.handleUnauthorizedBridgeCommand,
  };
}
