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
    chatId: string;
    chatType: "p2p" | "group";
    messageType: string;
    content: string;
    createTime: string;
  };
}

export interface UserIdentity {
  openId: string;
  userId?: string;
}

/** 用户持久状态 */
export interface UserState {
  activeSessionId: string;
  piSessionFile?: string;
  createdAt: string;
  updatedAt: string;
  lastActiveAt: string;
  lastMessageId?: string;
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
