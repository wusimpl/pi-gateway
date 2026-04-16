import type { Config } from "../config.js";
import { formatError } from "../feishu/format.js";
import type { FeishuMessenger } from "../feishu/send.js";
import {
  type AvailableModelInfo,
  filterAvailableModels,
  formatModelLabel,
} from "../pi/models.js";
import type { SessionService } from "../pi/sessions.js";
import type { WorkspaceService } from "../pi/workspace.js";
import type { UserStateStore } from "../storage/users.js";
import type { UserIdentity } from "../types.js";
import { handleBridgeCommand, type BridgeCommand } from "./commands.js";
import { logger } from "./logger.js";
import type { RestartService } from "./restart.js";
import type { RuntimeStateStore } from "./state.js";

export interface CommandService {
  handleBridgeCommand(identity: UserIdentity, command: BridgeCommand): Promise<void>;
}

interface CommandServiceDeps {
  config: Pick<Config, "TEXT_CHUNK_LIMIT">;
  messenger: Pick<FeishuMessenger, "sendRenderedMessage" | "sendTextMessage">;
  sessionService: Pick<SessionService, "getOrCreateActiveSession" | "createNewSession" | "listSessions" | "resumeSession">;
  userStateStore: Pick<UserStateStore, "readUserState">;
  workspaceService: Pick<WorkspaceService, "getUserWorkspaceDir">;
  runtimeState: Pick<
    RuntimeStateStore,
    "isLocked" | "hasActiveLocks" | "beginRestartDrain" | "cancelRestartDrain" | "requestStop"
  >;
  restartService: Pick<RestartService, "restartGateway">;
  listAvailableModels(): Promise<AvailableModelInfo[]>;
  findAvailableModel(rawRef: string): Promise<AvailableModelInfo | null>;
}

export function createCommandService(deps: CommandServiceDeps): CommandService {
  const SESSION_PAGE_SIZE = 20;

  async function handleBridgeCommandFlow(
    identity: UserIdentity,
    command: BridgeCommand,
  ): Promise<void> {
    const openId = identity.openId;
    try {
      if (command.name === "new" || command.name === "reset") {
        const sessionState = await deps.sessionService.createNewSession(identity);
        const reply = handleBridgeCommand(command, {
          openId,
          sessionId: sessionState.activeSessionId,
          workspaceDir: deps.workspaceService.getUserWorkspaceDir(identity),
          currentModel: getCurrentModelLabel(sessionState.piSession),
        });
        await sendCommandReply(openId, reply);
      } else if (command.name === "status") {
        const sessionState = await deps.sessionService.getOrCreateActiveSession(identity);
        const userState = await deps.userStateStore.readUserState(openId);
        const reply = handleBridgeCommand(command, {
          openId,
          sessionId: sessionState.activeSessionId,
          createdAt: userState?.createdAt,
          piSessionFile: userState?.piSessionFile,
          workspaceDir: deps.workspaceService.getUserWorkspaceDir(identity),
          currentModel: getCurrentModelLabel(sessionState.piSession),
        });
        await sendCommandReply(openId, reply);
      } else if (command.name === "context" || command.name === "skills") {
        const sessionState = await deps.sessionService.getOrCreateActiveSession(identity);
        const reply = handleBridgeCommand(command, {
          openId,
          contextFiles: getLoadedContextFiles(sessionState.piSession),
          skills: getLoadedSkills(sessionState.piSession),
        });
        await sendCommandReply(openId, reply);
      } else if (command.name === "models") {
        const availableModels = await deps.listAvailableModels();
        const filteredModels = filterAvailableModels(availableModels, command.args);
        const reply = handleBridgeCommand(command, {
          openId,
          requestedProvider: command.args,
          availableModels: filteredModels,
        });
        await sendCommandReply(openId, reply);
      } else if (command.name === "sessions") {
        const pageResult = parseSessionsPage(command.args);
        if (pageResult.error) {
          await deps.messenger.sendTextMessage(openId, pageResult.error);
          return;
        }

        const sessions = await deps.sessionService.listSessions(identity);
        const totalCount = sessions.length;
        const totalPages = Math.max(1, Math.ceil(totalCount / SESSION_PAGE_SIZE));
        if (totalCount > 0 && pageResult.page > totalPages) {
          await deps.messenger.sendTextMessage(
            openId,
            `页码超出范围，目前只有 ${totalPages} 页。\n\n用 /sessions 看第一页，或用 /sessions -n <页码> 翻页。`,
          );
          return;
        }

        const startIndex = (pageResult.page - 1) * SESSION_PAGE_SIZE;
        const reply = handleBridgeCommand(command, {
          openId,
          sessions: sessions.slice(startIndex, startIndex + SESSION_PAGE_SIZE),
          sessionsPage: pageResult.page,
          sessionsTotalPages: totalPages,
          sessionsTotalCount: totalCount,
        });
        await sendCommandReply(openId, reply);
      } else if (command.name === "resume") {
        await handleResumeCommand(identity, command);
      } else if (command.name === "model") {
        await handleModelCommand(identity, command);
      } else if (command.name === "stop") {
        await handleStopCommand(identity, command);
      } else if (command.name === "restart") {
        await handleRestartCommand(identity, command);
      }
    } catch (err) {
      logger.error("桥接层命令处理失败", { openId, command: command.name, args: command.args, error: String(err) });
      await deps.messenger.sendTextMessage(openId, formatError("命令处理失败，请稍后重试"));
    }
  }

  async function handleStopCommand(identity: UserIdentity, command: BridgeCommand): Promise<void> {
    const openId = identity.openId;
    await deps.runtimeState.requestStop(openId);
    const reply = handleBridgeCommand(command, { openId });
    await sendCommandReply(openId, reply);
  }

  async function handleRestartCommand(identity: UserIdentity, command: BridgeCommand): Promise<void> {
    const openId = identity.openId;
    const drainState = deps.runtimeState.beginRestartDrain();
    if (drainState === "busy") {
      await deps.messenger.sendTextMessage(openId, "当前还有任务在跑，等这条回复结束后再重启网关。");
      return;
    }
    if (drainState === "already_draining") {
      await deps.messenger.sendTextMessage(openId, "网关正在重启，暂时不接新任务，请稍后再试。");
      return;
    }

    try {
      const reply = handleBridgeCommand(command, { openId });
      await sendCommandReply(openId, reply);
      await deps.restartService.restartGateway();
    } catch (error) {
      deps.runtimeState.cancelRestartDrain();
      throw error;
    }
  }

  async function handleModelCommand(identity: UserIdentity, command: BridgeCommand): Promise<void> {
    const openId = identity.openId;
    const argText = command.args.trim();

    if (!argText || argText.toLowerCase() === "status") {
      const sessionState = await deps.sessionService.getOrCreateActiveSession(identity);
      const availableModels = await deps.listAvailableModels();
      const reply = handleBridgeCommand(command, {
        openId,
        currentModel: getCurrentModelLabel(sessionState.piSession),
        availableModelCount: availableModels.length,
      });
      await sendCommandReply(openId, reply);
      return;
    }

    if (deps.runtimeState.isLocked(openId)) {
      await deps.messenger.sendTextMessage(openId, "当前还有任务在跑，等这条回复结束后再切模型。");
      return;
    }

    const targetModel = await deps.findAvailableModel(argText);
    if (!targetModel) {
      await deps.messenger.sendTextMessage(
        openId,
        "没找到这个模型，或者它现在还不能用。\n\n先用 /models 看编号，再用 /model <序号> 或 /model <provider/model> 切。",
      );
      return;
    }

    const sessionState = await deps.sessionService.getOrCreateActiveSession(identity);
    const previousModel = getCurrentModelLabel(sessionState.piSession);
    await sessionState.piSession.setModel(targetModel.model);

    const reply = handleBridgeCommand(command, {
      openId,
      currentModel: getCurrentModelLabel(sessionState.piSession) ?? formatModelLabel(targetModel.provider, targetModel.id),
      previousModel,
    });
    await sendCommandReply(openId, reply);
  }

  async function handleResumeCommand(identity: UserIdentity, command: BridgeCommand): Promise<void> {
    const openId = identity.openId;
    const argText = command.args.trim();

    if (!argText) {
      await deps.messenger.sendTextMessage(
        openId,
        "请先给出要恢复的会话。\n\n先用 /sessions 看列表，再用 /resume <序号> 或 /resume <sessionId前缀>。",
      );
      return;
    }

    if (deps.runtimeState.isLocked(openId)) {
      await deps.messenger.sendTextMessage(openId, "当前还有任务在跑，等这条回复结束后再切会话。");
      return;
    }

    try {
      const sessionState = await deps.sessionService.resumeSession(identity, argText);
      const reply = handleBridgeCommand(command, {
        openId,
        sessionId: sessionState.activeSessionId,
        currentModel: getCurrentModelLabel(sessionState.piSession),
      });
      await sendCommandReply(openId, reply);
    } catch (error) {
      const code = error instanceof Error ? error.message : String(error);
      if (code === "RESUME_SESSION_NOT_FOUND") {
        await deps.messenger.sendTextMessage(
          openId,
          "没找到这个会话。\n\n先用 /sessions 看列表，再用 /resume <序号> 或 /resume <sessionId前缀>。",
        );
        return;
      }
      throw error;
    }
  }

  async function sendCommandReply(openId: string, text: string): Promise<void> {
    await deps.messenger.sendRenderedMessage(openId, text, deps.config.TEXT_CHUNK_LIMIT);
  }

  return {
    handleBridgeCommand: handleBridgeCommandFlow,
  };
}

function parseSessionsPage(args: string): { page: number; error?: undefined } | { page?: undefined; error: string } {
  const trimmed = args.trim();
  if (!trimmed) {
    return { page: 1 };
  }

  const matched = trimmed.match(/^-n\s+(\d+)$/);
  if (!matched) {
    return { error: "用法：/sessions 或 /sessions -n <页码>。" };
  }

  const page = Number(matched[1]);
  if (!Number.isSafeInteger(page) || page < 1) {
    return { error: "页码必须是大于等于 1 的整数。" };
  }

  return { page };
}

function getCurrentModelLabel(session: { model?: { provider: string; id: string } | undefined }): string | undefined {
  if (!session.model) {
    return undefined;
  }
  return formatModelLabel(session.model.provider, session.model.id);
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
