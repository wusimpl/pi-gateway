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
  getSessionDefaultToolNames,
  persistSessionToolSelection,
  type SessionService,
} from "../pi/sessions.js";
import type { SkillStatsStore } from "../pi/skill-stats.js";
import type { WorkspaceService } from "../pi/workspace.js";
import type { UserStateStore } from "../storage/users.js";
import type { ThinkingLevel, ToolCallsDisplayMode, UserIdentity, UserState } from "../types.js";
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
  cronService?: Pick<CronService, "isEnabled" | "getDefaultTimezone" | "listJobs" | "addJob" | "removeJob" | "runJobNow">;
  deferredCronRunService?: Pick<DeferredCronRunService, "queueRun">;
  skillStatsStore?: Pick<SkillStatsStore, "listSkillUsage" | "reset">;
  runtimeConfig?: Pick<
    RuntimeConfigStore,
    | "getAudioTranscribeProvider"
    | "setAudioTranscribeProvider"
    | "getStreamingEnabled"
    | "setStreamingEnabled"
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
      } else if (command.name === "settings") {
        await handleSettingsCommand(identity, command, conversationTarget);
      } else if (command.name === "tools") {
        await handleToolsCommand(identity, command, conversationTarget);
      } else if (command.name === "toolcalls") {
        await handleToolCallsCommand(identity, command, conversationTarget);
      } else if (command.name === "cron") {
        await handleCronCommand(identity, command, conversationTarget);
      } else if (command.name === "stt") {
        await handleSttCommand(identity, command, conversationTarget);
      } else if (command.name === "stream") {
        await handleStreamCommand(identity, command, conversationTarget);
      } else if (command.name === "reaction") {
        await handleReactionCommand(identity, command, conversationTarget);
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
      await recordRestartReadyNotification(deps.config.DATA_DIR, openId);
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
      const availableModels = await deps.listAvailableModels();
      const reply = handleBridgeCommand(command, {
        openId,
        currentModel: getCurrentModelLabel(sessionState.piSession),
        availableModelCount: availableModels.length,
      });
      await sendCommandReply(identity, conversationTarget, reply);
      return;
    }

    if (isConversationLocked(identity, conversationTarget)) {
      await sendTextReply(identity, conversationTarget, "当前还有任务在跑，等这条回复结束后再切模型。");
      return;
    }

    const targetModel = await deps.findAvailableModel(argText);
    if (!targetModel) {
      await sendTextReply(
        identity,
        conversationTarget,
        "没找到这个模型，或者它现在还不能用。\n\n先用 /models 看编号，再用 /model <序号> 或 /model <provider/model> 切。",
      );
      return;
    }

    const sessionState = await getActiveSession(identity, conversationTarget);
    const previousModel = getCurrentModelLabel(sessionState.piSession);
    await sessionState.piSession.setModel(targetModel.model);
    const userState = await readTargetState(identity, conversationTarget);
    if (userState?.thinkingLevel) {
      sessionState.piSession.setThinkingLevel(userState.thinkingLevel);
    }

    const reply = handleBridgeCommand(command, {
      openId,
      currentModel: getCurrentModelLabel(sessionState.piSession) ?? formatModelLabel(targetModel.provider, targetModel.id),
      currentThinkingLevel: getCurrentThinkingLevel(sessionState.piSession),
      previousModel,
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
      persistSessionToolSelection(sessionState.piSession);
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
    persistSessionToolSelection(sessionState.piSession);
    await sendCommandReply(identity, conversationTarget, formatToolsActionReply(action, requestedTools, nextActiveTools, allToolNames));
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
  commandName: "stream" | "reaction",
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

function getCurrentThinkingLevel(session: { thinkingLevel?: ThinkingLevel | undefined }): ThinkingLevel | undefined {
  return session.thinkingLevel;
}

function getCurrentModelLabel(session: { model?: { provider: string; id: string } | undefined }): string | undefined {
  if (!session.model) {
    return undefined;
  }
  return formatModelLabel(session.model.provider, session.model.id);
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
