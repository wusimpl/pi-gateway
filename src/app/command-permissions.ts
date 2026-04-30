import type { ConversationTarget } from "../conversation.js";
import type { UserIdentity } from "../types.js";
import type { BridgeCommand } from "./commands.js";

const GROUP_PUBLIC_COMMANDS = new Set(["skills", "status", "model", "route"]);

export function canRunBridgeCommand(
  identity: UserIdentity,
  command: BridgeCommand,
  conversationTarget: ConversationTarget,
  ownerOpenIds: readonly string[],
): boolean {
  if (conversationTarget.kind === "p2p") {
    return true;
  }

  if (command.name === "tools" && command.args.trim().length === 0) {
    return true;
  }

  if (GROUP_PUBLIC_COMMANDS.has(command.name)) {
    return true;
  }

  return ownerOpenIds.includes(identity.openId);
}
