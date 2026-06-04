import type { ConversationTarget } from "../conversation.js";
import type { UserIdentity } from "../types.js";
import { isSuperAdminOpenId } from "./access-control.js";
import type { BridgeCommand } from "./commands.js";

const PUBLIC_COMMANDS = new Set(["commands", "new", "stop", "skills", "status", "model", "route"]);

export function canRunBridgeCommand(
  identity: UserIdentity,
  command: BridgeCommand,
  conversationTarget: ConversationTarget,
  ownerOpenIds: readonly string[],
): boolean {
  if (isSuperAdminOpenId(identity.openId)) {
    return true;
  }

  if (command.name === "p2p") {
    return false;
  }

  if (command.name === "tools" && command.args.trim().length === 0) {
    return true;
  }

  if (command.name === "skill-folder" && command.args.trim().length === 0) {
    return true;
  }

  if (PUBLIC_COMMANDS.has(command.name)) {
    return true;
  }

  if (conversationTarget.kind === "p2p") {
    return false;
  }

  return ownerOpenIds.includes(identity.openId);
}
