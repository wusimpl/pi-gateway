import type { ConversationTarget } from "../conversation.js";
import type { UserIdentity } from "../types.js";
import { isSuperAdminOpenId } from "./access-control.js";
import type { BridgeCommand } from "./commands.js";

export interface GroupOwnerResolver {
  isGroupOwner(chatId: string, identity: UserIdentity): Promise<boolean>;
}

export interface AdminResolver {
  isAdmin(openId: string): Promise<boolean>;
}

const P2P_USER_COMMANDS = new Set([
  "commands",
  "new",
  "reset",
  "status",
  "context",
  "skills",
  "model",
  "route",
  "sessions",
  "resume",
  "settings",
  "tools",
  "toolcalls",
  "skill-folder",
  "stop",
  "next",
  "cron",
]);

const PRIVATE_SUPER_ADMIN_COMMANDS = new Set([
  "p2p",
  "restart",
  "stt",
  "stream",
  "reaction",
  "skillstat",
  "admin",
]);

/** admin 可用的群主级命令（渐进开放，目前只有 /new） */
const ADMIN_GROUP_COMMANDS = new Set([
  "new",
]);

export async function canRunBridgeCommand(
  identity: UserIdentity,
  command: BridgeCommand,
  conversationTarget: ConversationTarget,
  groupOwnerResolver?: GroupOwnerResolver,
  adminResolver?: AdminResolver,
): Promise<boolean> {
  if (isPrivateSuperAdminCommand(command)) {
    return conversationTarget.kind === "p2p" && isSuperAdminOpenId(identity.openId);
  }

  if (isSuperAdminOpenId(identity.openId)) {
    return true;
  }

  if (adminResolver && await adminResolver.isAdmin(identity.openId)) {
    // 群聊里 admin 可以使用开放的命令集
    if (conversationTarget.kind !== "p2p" && ADMIN_GROUP_COMMANDS.has(command.name)) {
      return true;
    }
  }

  if (conversationTarget.kind === "p2p") {
    return P2P_USER_COMMANDS.has(command.name);
  }

  if (isGroupPublicCommand(command)) {
    return true;
  }

  if (!isGroupOwnerCommand(command)) {
    return false;
  }

  const chatId = conversationTarget.chatId?.trim();
  if (!chatId || !groupOwnerResolver) {
    return false;
  }

  return groupOwnerResolver.isGroupOwner(chatId, identity);
}

export function isPrivateSuperAdminCommand(command: BridgeCommand): boolean {
  return PRIVATE_SUPER_ADMIN_COMMANDS.has(command.name)
    || (command.name === "group" && isGroupAllowlistCommand(command.args));
}

function isGroupPublicCommand(command: BridgeCommand): boolean {
  switch (command.name) {
    case "commands":
    case "status":
    case "context":
    case "skills":
    case "stop":
    case "next":
      return true;
    case "model":
      return !isModelWriteCommand(command.args);
    case "route":
      return !isRouteWriteCommand(command.args);
    case "settings":
    case "tools":
    case "toolcalls":
    case "skill-folder":
      return command.args.trim().length === 0;
    default:
      return false;
  }
}

function isGroupOwnerCommand(command: BridgeCommand): boolean {
  switch (command.name) {
    case "new":
    case "reset":
    case "sessions":
    case "resume":
    case "cron":
      return true;
    case "group":
      return !isGroupAllowlistCommand(command.args);
    case "model":
      return isModelWriteCommand(command.args);
    case "route":
      return isRouteWriteCommand(command.args);
    case "settings":
    case "tools":
    case "toolcalls":
    case "skill-folder":
      return command.args.trim().length > 0;
    default:
      return false;
  }
}

function isGroupAllowlistCommand(args: string): boolean {
  return args.trim().toLowerCase().startsWith("allowlist");
}

function isRouteWriteCommand(args: string): boolean {
  const normalized = args.trim().toLowerCase();
  return normalized === "on" || normalized === "off";
}

function isModelWriteCommand(args: string): boolean {
  const trimmed = args.trim();
  const normalized = trimmed.toLowerCase();
  if (!trimmed || normalized === "status") {
    return false;
  }

  if (
    !/\s/.test(trimmed)
    && !trimmed.includes("/")
    && !/^\d+$/.test(trimmed)
    && !isModelRouteSlot(normalized)
  ) {
    return false;
  }

  return true;
}

function isModelRouteSlot(value: string): boolean {
  return value === "router" || value === "light" || value === "heavy";
}
