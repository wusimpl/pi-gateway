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
import type { RuntimeStateStore } from "./state.js";

export interface CommandService {
  handleBridgeCommand(identity: UserIdentity, command: BridgeCommand): Promise<void>;
}

interface CommandServiceDeps {
  config: Pick<Config, "TEXT_CHUNK_LIMIT">;
  messenger: Pick<FeishuMessenger, "sendRenderedMessage" | "sendTextMessage">;
  sessionService: Pick<SessionService, "getOrCreateActiveSession" | "createNewSession">;
  userStateStore: Pick<UserStateStore, "readUserState">;
  workspaceService: Pick<WorkspaceService, "getUserWorkspaceDir">;
  runtimeState: Pick<RuntimeStateStore, "isLocked">;
  listAvailableModels(): Promise<AvailableModelInfo[]>;
  findAvailableModel(rawRef: string): Promise<AvailableModelInfo | null>;
}

export function createCommandService(deps: CommandServiceDeps): CommandService {
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
      } else if (command.name === "model") {
        await handleModelCommand(identity, command);
      }
    } catch (err) {
      logger.error("桥接层命令处理失败", { openId, command: command.name, args: command.args, error: String(err) });
      await deps.messenger.sendTextMessage(openId, formatError("命令处理失败，请稍后重试"));
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

  async function sendCommandReply(openId: string, text: string): Promise<void> {
    await deps.messenger.sendRenderedMessage(openId, text, deps.config.TEXT_CHUNK_LIMIT);
  }

  return {
    handleBridgeCommand: handleBridgeCommandFlow,
  };
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
