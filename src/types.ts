/** 飞书入站消息事件 payload 的关键字段 */
export interface FeishuMessageEvent {
  sender: {
    senderId: {
      openId: string;
      userId: string;
      unionId: string;
    };
    senderType: string;
    tenantKey: string;
  };
  message: {
    messageId: string;
    rootId?: string;
    parentId?: string;
    threadId?: string;
    chatId: string;
    chatType: "p2p" | "group";
    messageType: string;
    content: string;
    mentions?: FeishuMessageMention[];
    createTime: string;
  };
}

export interface FeishuMessageMention {
  key: string;
  id: {
    openId?: string;
    userId?: string;
    unionId?: string;
  };
  name: string;
  tenantKey?: string;
}

export interface UserIdentity {
  openId: string;
  userId?: string;
  name?: string;
}

export interface ModelPreference {
  provider: string;
  id: string;
}

export type ModelRouteSlot = "router" | "light" | "heavy";
export type ModelRoutingDifficulty = "simple" | "medium" | "hard";

export interface ModelRoutingConfig {
  enabled?: boolean;
  routerModel?: ModelPreference;
  lightModel?: ModelPreference;
  heavyModel?: ModelPreference;
}

export type ThinkingLevel = "off" | "minimal" | "low" | "medium" | "high" | "xhigh";
export type ToolCallsDisplayMode = "off" | "name" | "full";

/** 用户持久状态 */
export interface UserState {
  activeSessionId: string;
  piSessionFile?: string;
  createdAt: string;
  updatedAt: string;
  lastActiveAt: string;
  lastMessageId?: string;
  thinkingLevel?: ThinkingLevel;
  streamingEnabled?: boolean;
  toolCallsDisplayMode?: ToolCallsDisplayMode;
  modelPreference?: ModelPreference;
  modelRouting?: ModelRoutingConfig;
}

/** 运行时锁信息 */
export interface UserLock {
  isLocked: boolean;
  lockedAt?: number;
  messageId?: string;
}

/** Pi session prompt 事件（由 stream.ts 聚合使用） */
export interface PiStreamChunk {
  type: "text" | "tool_call" | "tool_result" | "error" | "done";
  content: string;
}
