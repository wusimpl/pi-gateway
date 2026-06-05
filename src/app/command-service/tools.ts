import type { ConversationTarget } from "../../conversation.js";
import { getSessionDefaultToolNames } from "../../pi/sessions.js";
import type { UserIdentity, UserState } from "../../types.js";
import { handleBridgeCommand, type BridgeCommand } from "../commands.js";
import {
  dedupeToolNames,
  getToolConfigSession,
} from "./helpers.js";
import {
  parseSkillFolderArgs,
  parseToolCallsArgs,
  parseToolsArgs,
} from "./parsers.js";
import {
  buildToolStatusList,
  formatToolsActionReply,
} from "./replies.js";
import type { CommandReplySender, CommandSessionState, TargetStateAccess } from "./types.js";

interface ToolsCommandHandlersDeps extends TargetStateAccess {
  sendTextReply: CommandReplySender;
  sendCommandReply: CommandReplySender;
}

export function createToolsCommandHandlers(deps: ToolsCommandHandlersDeps) {
  async function handleToolsCommand(
    identity: UserIdentity,
    command: BridgeCommand,
    conversationTarget?: ConversationTarget,
  ): Promise<void> {
    const openId = identity.openId;
    const sessionState = await deps.getActiveSession(identity, conversationTarget);
    const toolSession = getToolConfigSession(sessionState.piSession);
    if (!toolSession) {
      await deps.sendTextReply(identity, conversationTarget, "当前 session 不支持 tool 配置。");
      return;
    }

    const parsed = parseToolsArgs(command.args);
    if (parsed.error) {
      await deps.sendTextReply(identity, conversationTarget, parsed.error);
      return;
    }

    const allToolNames = toolSession.getAllTools().map((tool) => tool.name);
    const allToolNameSet = new Set(allToolNames);
    const currentActiveTools = dedupeToolNames(toolSession.getActiveToolNames().filter((name) => allToolNameSet.has(name)));

    if (parsed.action === "show") {
      await deps.sendCommandReply(
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
        getSessionDefaultToolNames(toolSession).filter((name) => allToolNameSet.has(name)),
      );
      toolSession.setActiveToolsByName(defaultTools);
      await persistTargetToolSelection(identity, conversationTarget, sessionState, defaultTools);
      await deps.sendCommandReply(identity, conversationTarget, formatToolsActionReply("reset", [], defaultTools, allToolNames));
      return;
    }

    const action = parsed.action;
    if (action !== "on" && action !== "off" && action !== "set") {
      await deps.sendTextReply(identity, conversationTarget, "tools 参数解析失败。");
      return;
    }

    const requestedTools = dedupeToolNames(parsed.toolNames);
    const missingTools = requestedTools.filter((tool) => !allToolNameSet.has(tool));
    if (missingTools.length > 0) {
      await deps.sendTextReply(
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
    await deps.sendCommandReply(identity, conversationTarget, formatToolsActionReply(action, requestedTools, nextActiveTools, allToolNames));
  }

  async function persistTargetToolSelection(
    identity: UserIdentity,
    conversationTarget: ConversationTarget | undefined,
    sessionState: CommandSessionState,
    enabledTools: string[],
  ): Promise<void> {
    const userState = await deps.ensureTargetState(identity, conversationTarget, sessionState);
    userState.enabledTools = [...enabledTools];
    userState.updatedAt = new Date().toISOString();
    await deps.writeTargetState(identity, conversationTarget, userState);
  }

  async function handleToolCallsCommand(
    identity: UserIdentity,
    command: BridgeCommand,
    conversationTarget?: ConversationTarget,
  ): Promise<void> {
    const openId = identity.openId;
    const parsed = parseToolCallsArgs(command.args);
    if (parsed.error) {
      await deps.sendTextReply(identity, conversationTarget, parsed.error);
      return;
    }

    const sessionState = await deps.getActiveSession(identity, conversationTarget);
    const existingState = await deps.readTargetState(identity, conversationTarget);
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
      await deps.sendCommandReply(identity, conversationTarget, reply);
      return;
    }

    userState.toolCallsDisplayMode = parsed.mode;
    userState.updatedAt = new Date().toISOString();
    await deps.writeTargetState(identity, conversationTarget, userState);
    const reply = handleBridgeCommand(command, {
      openId,
      toolCallsDisplayMode: parsed.mode,
    });
    await deps.sendCommandReply(identity, conversationTarget, reply);
  }

  async function handleSkillFolderCommand(
    identity: UserIdentity,
    command: BridgeCommand,
    conversationTarget?: ConversationTarget,
  ): Promise<void> {
    const openId = identity.openId;
    const parsed = parseSkillFolderArgs(command.args);
    if (parsed.error) {
      await deps.sendTextReply(identity, conversationTarget, parsed.error);
      return;
    }

    if (parsed.kind === "show") {
      const userState = await deps.readTargetState(identity, conversationTarget);
      const reply = handleBridgeCommand(command, {
        openId,
        globalAgentsSkillsEnabled: userState?.globalAgentsSkillsEnabled === true,
      });
      await deps.sendCommandReply(identity, conversationTarget, reply);
      return;
    }

    const sessionState = await deps.getActiveSession(identity, conversationTarget);
    const userState = await deps.ensureTargetState(identity, conversationTarget, sessionState);
    userState.globalAgentsSkillsEnabled = parsed.enabled;
    userState.updatedAt = new Date().toISOString();
    await deps.writeTargetState(identity, conversationTarget, userState);

    const reply = handleBridgeCommand(command, {
      openId,
      globalAgentsSkillsEnabled: parsed.enabled,
    });
    await deps.sendCommandReply(identity, conversationTarget, reply);
  }

  return {
    handleToolsCommand,
    handleToolCallsCommand,
    handleSkillFolderCommand,
  };
}
