import type { ConversationTarget } from "../conversation.js";
import type { UserIdentity } from "../types.js";
import { isSuperAdminOpenId } from "./access-control.js";

const HOST_MACHINE_TOOL_NAMES = new Set([
  "read",
  "bash",
  "edit",
  "write",
  "grep",
  "find",
  "ls",
]);

export function isHostMachineToolName(toolName: string): boolean {
  return HOST_MACHINE_TOOL_NAMES.has(toolName);
}

export function canEnableHostMachineTools(
  identity: UserIdentity,
  conversationTarget?: ConversationTarget,
): boolean {
  const isP2P = !conversationTarget || conversationTarget.kind === "p2p";
  return isP2P && isSuperAdminOpenId(identity.openId);
}

export function enforceHostMachineToolAccess(
  session: object & {
    getActiveToolNames?: () => string[];
    setActiveToolsByName?: (toolNames: string[]) => void;
  },
  identity: UserIdentity,
  conversationTarget?: ConversationTarget,
): string[] {
  const currentTools = session.getActiveToolNames?.() ?? [];
  if (canEnableHostMachineTools(identity, conversationTarget)) {
    return currentTools;
  }

  const allowedTools = currentTools.filter((toolName) => !isHostMachineToolName(toolName));
  if (allowedTools.length !== currentTools.length) {
    session.setActiveToolsByName?.(allowedTools);
  }
  return allowedTools;
}
