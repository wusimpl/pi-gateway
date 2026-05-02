import type { ConversationTarget } from "../conversation.js";
import type { UserIdentity } from "../types.js";

export type AdminTargetKind = "p2p" | "group";

export interface AdminTarget {
  key: string;
  kind: AdminTargetKind;
  label: string;
  detail: string;
  sources: string[];
  ownerOpenId?: string;
}

export interface ResolvedAdminTarget {
  target: AdminTarget;
  identity: UserIdentity;
  conversationTarget: ConversationTarget;
}

export interface AdminCommandResult {
  command: string;
  output: string;
}
