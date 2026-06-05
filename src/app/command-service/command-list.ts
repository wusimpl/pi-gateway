import type { ConversationTarget } from "../../conversation.js";
import type { UserIdentity } from "../../types.js";
import { isSuperAdminOpenId } from "../access-control.js";
import { type BridgeCommand, formatUnsupportedSlashCommand } from "../commands.js";
import { canRunBridgeCommand, isPrivateSuperAdminCommand, type GroupOwnerResolver } from "../command-permissions.js";
import { COMMAND_CATALOG, isCommandVisibleInTarget, type CommandCatalogItem } from "./catalog.js";
import { createFallbackP2PTarget } from "./helpers.js";
import type { CommandReplySender } from "./types.js";

interface CommandListHandlersDeps {
  groupOwnerResolver?: GroupOwnerResolver;
  sendTextReply: CommandReplySender;
  sendCommandReply: CommandReplySender;
}

export function createCommandListHandlers(deps: CommandListHandlersDeps) {
  async function handleCommandsCommand(
    identity: UserIdentity,
    conversationTarget?: ConversationTarget,
  ): Promise<void> {
    await deps.sendCommandReply(identity, conversationTarget, await formatAvailableCommandsReply(identity, conversationTarget));
  }

  async function handleUnsupportedSlashCommand(
    identity: UserIdentity,
    rawText: string,
    conversationTarget?: ConversationTarget,
  ): Promise<void> {
    await deps.sendCommandReply(identity, conversationTarget, formatUnsupportedSlashCommand(rawText));
  }

  async function handleUnauthorizedBridgeCommand(
    identity: UserIdentity,
    command: BridgeCommand,
    conversationTarget?: ConversationTarget,
  ): Promise<void> {
    await deps.sendTextReply(identity, conversationTarget, formatUnauthorizedCommandReply(conversationTarget, command));
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
    handleCommandsCommand,
    handleUnsupportedSlashCommand,
    handleUnauthorizedBridgeCommand,
  };
}
