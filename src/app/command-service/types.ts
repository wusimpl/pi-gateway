import type { ConversationTarget } from "../../conversation.js";
import type { AvailableModelInfo } from "../../pi/models.js";
import type { UserIdentity, UserState, ThinkingLevel } from "../../types.js";

export type CommandReplySender = (
  identity: UserIdentity,
  conversationTarget: ConversationTarget | undefined,
  text: string,
) => Promise<void>;

export interface CommandPiSession {
  sessionFile?: string;
  model?: { provider: string; id: string };
  thinkingLevel?: ThinkingLevel;
  setModel?(model: AvailableModelInfo["model"]): Promise<void> | void;
  setThinkingLevel?(level: ThinkingLevel): void;
  resourceLoader?: {
    getAgentsFiles?: () => {
      agentsFiles?: Array<{ path: string }>;
    };
    getSkills?: () => {
      skills?: Array<{ filePath: string; sourceInfo?: { scope?: string } }>;
    };
  };
  messages?: Array<{
    role?: string;
    content?: unknown;
    stopReason?: string;
    errorMessage?: string;
  }>;
  state?: {
    messages?: Array<{
      role?: string;
      content?: unknown;
      stopReason?: string;
      errorMessage?: string;
    }>;
  };
}

export interface CommandSessionState {
  activeSessionId: string;
  piSession: CommandPiSession;
}

export interface TargetStateAccess {
  getActiveSession(identity: UserIdentity, conversationTarget?: ConversationTarget): Promise<CommandSessionState>;
  readTargetState(identity: UserIdentity, conversationTarget?: ConversationTarget): Promise<UserState | null>;
  writeTargetState(
    identity: UserIdentity,
    conversationTarget: ConversationTarget | undefined,
    state: UserState,
  ): Promise<void>;
  ensureTargetState(
    identity: UserIdentity,
    conversationTarget: ConversationTarget | undefined,
    sessionState: CommandSessionState,
  ): Promise<UserState>;
}
