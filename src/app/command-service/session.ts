import type { ConversationTarget } from "../../conversation.js";
import type { SkillStatsStore } from "../../pi/skill-stats.js";
import type { UserIdentity } from "../../types.js";
import { handleBridgeCommand, type BridgeCommand } from "../commands.js";
import {
  getCurrentModelLabel,
  getCurrentThinkingLevel,
  getLoadedContextFiles,
  getLoadedSkills,
} from "./helpers.js";
import { parsePageArg } from "./parsers.js";
import { appendRecentHistory } from "./replies.js";
import type { CommandReplySender, CommandSessionState, TargetStateAccess } from "./types.js";

interface SessionCommandHandlersDeps extends TargetStateAccess {
  sessionPageSize: number;
  skillStatsPageSize: number;
  getStreamingEnabled(): boolean;
  createSession(identity: UserIdentity, conversationTarget?: ConversationTarget): Promise<CommandSessionState>;
  listTargetSessions(identity: UserIdentity, conversationTarget?: ConversationTarget): Promise<Array<{
    order: number;
    sessionId: string;
    sessionFile: string;
    isActive: boolean;
    cwd?: string;
    name?: string;
    firstMessage?: string;
    messageCount: number;
    createdAt?: string;
    updatedAt?: string;
  }>>;
  resumeTargetSession(
    identity: UserIdentity,
    conversationTarget: ConversationTarget | undefined,
    ref: string,
  ): Promise<CommandSessionState>;
  getWorkspaceDir(identity: UserIdentity, conversationTarget?: ConversationTarget): string;
  isConversationLocked(identity: UserIdentity, conversationTarget?: ConversationTarget): boolean;
  skillStatsStore?: Pick<SkillStatsStore, "listSkillUsage" | "reset">;
  sendTextReply: CommandReplySender;
  sendCommandReply: CommandReplySender;
}

export function createSessionCommandHandlers(deps: SessionCommandHandlersDeps) {
  async function handleNewOrResetCommand(
    identity: UserIdentity,
    command: BridgeCommand,
    conversationTarget?: ConversationTarget,
  ): Promise<void> {
    const sessionState = await deps.createSession(identity, conversationTarget);
    const reply = handleBridgeCommand(command, {
      openId: identity.openId,
      sessionId: sessionState.activeSessionId,
      workspaceDir: deps.getWorkspaceDir(identity, conversationTarget),
      currentModel: getCurrentModelLabel(sessionState.piSession),
    });
    await deps.sendCommandReply(identity, conversationTarget, reply);
  }

  async function handleStatusCommand(
    identity: UserIdentity,
    command: BridgeCommand,
    conversationTarget?: ConversationTarget,
  ): Promise<void> {
    const sessionState = await deps.getActiveSession(identity, conversationTarget);
    const userState = await deps.readTargetState(identity, conversationTarget);
    const reply = handleBridgeCommand(command, {
      openId: identity.openId,
      sessionId: sessionState.activeSessionId,
      createdAt: userState?.createdAt,
      piSessionFile: userState?.piSessionFile,
      workspaceDir: deps.getWorkspaceDir(identity, conversationTarget),
      currentModel: getCurrentModelLabel(sessionState.piSession),
      currentThinkingLevel: getCurrentThinkingLevel(sessionState.piSession),
      streamingEnabled: userState?.streamingEnabled ?? deps.getStreamingEnabled(),
    });
    await deps.sendCommandReply(identity, conversationTarget, reply);
  }

  async function handleContextOrSkillsCommand(
    identity: UserIdentity,
    command: BridgeCommand,
    conversationTarget?: ConversationTarget,
  ): Promise<void> {
    const sessionState = await deps.getActiveSession(identity, conversationTarget);
    const reply = handleBridgeCommand(command, {
      openId: identity.openId,
      contextFiles: getLoadedContextFiles(sessionState.piSession),
      skills: getLoadedSkills(sessionState.piSession),
    });
    await deps.sendCommandReply(identity, conversationTarget, reply);
  }

  async function handleSessionsCommand(
    identity: UserIdentity,
    command: BridgeCommand,
    conversationTarget?: ConversationTarget,
  ): Promise<void> {
    const pageResult = parsePageArg(command.args, {
      commandName: "sessions",
      extraUsage: "",
    });
    if (pageResult.error) {
      await deps.sendTextReply(identity, conversationTarget, pageResult.error);
      return;
    }
    const page = pageResult.page;
    if (page === undefined) {
      await deps.sendTextReply(identity, conversationTarget, "页码解析失败。");
      return;
    }

    const sessions = await deps.listTargetSessions(identity, conversationTarget);
    const totalCount = sessions.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / deps.sessionPageSize));
    if (totalCount > 0 && page > totalPages) {
      await deps.sendTextReply(
        identity,
        conversationTarget,
        `页码超出范围，目前只有 ${totalPages} 页。\n\n用 /sessions 看第一页，或用 /sessions -n <页码> 翻页。`,
      );
      return;
    }

    const startIndex = (page - 1) * deps.sessionPageSize;
    const reply = handleBridgeCommand(command, {
      openId: identity.openId,
      sessions: sessions.slice(startIndex, startIndex + deps.sessionPageSize),
      sessionsPage: page,
      sessionsTotalPages: totalPages,
      sessionsTotalCount: totalCount,
    });
    await deps.sendCommandReply(identity, conversationTarget, reply);
  }

  async function handleResumeCommand(
    identity: UserIdentity,
    command: BridgeCommand,
    conversationTarget?: ConversationTarget,
  ): Promise<void> {
    const argText = command.args.trim();

    if (!argText) {
      await deps.sendTextReply(
        identity,
        conversationTarget,
        "请先给出要恢复的会话。\n\n先用 /sessions 看列表，再用 /resume <序号> 或 /resume <sessionId前缀>。",
      );
      return;
    }

    if (deps.isConversationLocked(identity, conversationTarget)) {
      await deps.sendTextReply(identity, conversationTarget, "当前还有任务在跑，等这条回复结束后再切会话。");
      return;
    }

    try {
      const sessionState = await deps.resumeTargetSession(identity, conversationTarget, argText);
      const baseReply = handleBridgeCommand(command, {
        openId: identity.openId,
        sessionId: sessionState.activeSessionId,
        currentModel: getCurrentModelLabel(sessionState.piSession),
      });
      const reply = appendRecentHistory(baseReply, sessionState.piSession);
      await deps.sendCommandReply(identity, conversationTarget, reply);
    } catch (error) {
      const code = error instanceof Error ? error.message : String(error);
      if (code === "RESUME_SESSION_NOT_FOUND") {
        await deps.sendTextReply(
          identity,
          conversationTarget,
          "没找到这个会话。\n\n先用 /sessions 看列表，再用 /resume <序号> 或 /resume <sessionId前缀>。",
        );
        return;
      }
      throw error;
    }
  }

  async function handleSkillStatCommand(
    identity: UserIdentity,
    command: BridgeCommand,
    conversationTarget?: ConversationTarget,
  ): Promise<void> {
    if (!deps.skillStatsStore) {
      await deps.sendTextReply(identity, conversationTarget, "当前没有启用 skill 使用统计。");
      return;
    }

    const argText = command.args.trim();
    if (argText.toLowerCase() === "reset") {
      await deps.skillStatsStore.reset();
      await deps.sendTextReply(identity, conversationTarget, "✅ 已清空 skill 使用统计。");
      return;
    }

    const pageResult = parsePageArg(argText, {
      commandName: "skillstat",
      extraUsage: " 或 /skillstat reset",
    });
    if (pageResult.error) {
      await deps.sendTextReply(identity, conversationTarget, pageResult.error);
      return;
    }

    const page = pageResult.page;
    if (page === undefined) {
      await deps.sendTextReply(identity, conversationTarget, "页码解析失败。");
      return;
    }

    const records = await deps.skillStatsStore.listSkillUsage();
    const totalCount = records.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / deps.skillStatsPageSize));
    if (totalCount > 0 && page > totalPages) {
      await deps.sendTextReply(
        identity,
        conversationTarget,
        `页码超出范围，目前只有 ${totalPages} 页。\n\n用 /skillstat 看第一页，或用 /skillstat -n <页码> 翻页。`,
      );
      return;
    }

    const startIndex = (page - 1) * deps.skillStatsPageSize;
    const reply = handleBridgeCommand(command, {
      openId: identity.openId,
      skillUsage: records.slice(startIndex, startIndex + deps.skillStatsPageSize),
      skillUsagePage: page,
      skillUsageTotalPages: totalPages,
      skillUsageTotalCount: totalCount,
    });
    await deps.sendCommandReply(identity, conversationTarget, reply);
  }

  return {
    handleNewOrResetCommand,
    handleStatusCommand,
    handleContextOrSkillsCommand,
    handleSessionsCommand,
    handleResumeCommand,
    handleSkillStatCommand,
  };
}
