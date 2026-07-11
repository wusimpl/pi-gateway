import { normalizeFeishuInboundMessage } from "../feishu/inbound/normalize.js";
import type { FeishuInboundMessage } from "../feishu/inbound/types.js";
import { parseMessageEvent, isSupportedP2PMessage } from "../feishu/events.js";
import {
  getFeishuMessageRoutingDecision,
  getFeishuP2PMessageRoutingDecision,
  type FeishuGroupRoutingConfig,
  type FeishuMessageRoutingDecision,
  type FeishuP2PRoutingConfig,
} from "../feishu/group-routing.js";
import {
  addProcessingReaction,
  sendRenderedMessage,
  sendRenderedMessageToTarget,
  sendTextMessage,
  sendTextMessageToTarget,
} from "../feishu/send.js";
import { promptSession } from "../pi/stream.js";
import {
  createNewSession,
  createNewSessionForTarget,
  getOrCreateActiveSession,
  getOrCreateActiveSessionForTarget,
  listSessions,
  listSessionsForTarget,
  readSessionState,
  resumeSession,
  resumeSessionForTarget,
  touchSession,
  touchSessionForTarget,
  writeSessionState,
} from "../pi/sessions.js";
import { getConversationWorkspaceDir, getUserWorkspaceDir } from "../pi/workspace.js";
import { prepareFeishuPromptInput } from "../feishu/inbound/transform.js";
import { createGroupSettingsStore, type GroupSettingsStore } from "../storage/group-settings.js";
import {
  createGroupUnmatchedMessageStore,
  type GroupUnmatchedMessageStore,
} from "../storage/group-unmatched-messages.js";
import { createP2PSettingsStore, type P2PSettingsStore } from "../storage/p2p-settings.js";
import { readUserState, writeUserState } from "../storage/users.js";
import { createP2PConversationTarget, getConversationTargetKey } from "../conversation.js";
import {
  findAvailableModel,
  listAvailableModels,
} from "../pi/models.js";
import type { Config } from "../config.js";
import type { UserIdentity } from "../types.js";
import { parseBridgeCommand } from "./commands.js";
import { canRunBridgeCommand, type GroupOwnerResolver } from "./command-permissions.js";
import { createCommandService, type CommandService } from "./command-service.js";
import { logger } from "./logger.js";
import {
  createPromptService,
  type PromptService,
  type RunningPromptBehavior,
} from "./prompt-service.js";
import { createRestartService } from "./restart.js";
import { createRuntimeConfigStore, type RuntimeConfigStore } from "./runtime-config.js";
import {
  acquireLock,
  beginRestartDrain,
  cancelRestartDrain,
  hasActiveLocks,
  isDuplicate,
  isDraining,
  isLocked,
  isStopRequested,
  releaseLock,
  requestStop,
  setAbortHandler,
  waitForUnlock,
  type RuntimeStateStore,
} from "./state.js";

const MESSAGE_LOG_PREVIEW_LIMIT = 30;

export interface MessageRouter {
  handleFeishuMessage(data: Record<string, unknown>): Promise<void>;
}

interface MessageRouterDeps {
  stateStore: Pick<RuntimeStateStore, "isDuplicate">;
  commandService: Pick<
    CommandService,
    "handleBridgeCommand" | "handleUnsupportedSlashCommand" | "handleUnauthorizedBridgeCommand"
  >;
  promptService: Pick<PromptService, "handleUserPrompt" | "queueRunningPrompt">;
  config?: Partial<Config>;
  groupSettingsStore?: Pick<GroupSettingsStore, "readGroupRoutingConfig"> &
    Partial<Pick<GroupSettingsStore, "readGlobalGroupRoutingConfig">>;
  groupUnmatchedMessageStore?: Pick<GroupUnmatchedMessageStore, "append" | "drain">;
  p2pSettingsStore?: Pick<P2PSettingsStore, "readP2PRoutingConfig">;
  runtimeConfig?: Pick<RuntimeConfigStore, "getP2PRoutingConfig" | "getGroupRoutingConfig">;
  parseMessageEvent?: typeof parseMessageEvent;
  isSupportedP2PMessage?: typeof isSupportedP2PMessage;
  isSupportedMessage?: (
    event: ReturnType<typeof parseMessageEvent> extends infer T ? NonNullable<T> : never,
  ) => boolean | Promise<boolean>;
  getMessageRoutingDecision?: (
    event: ReturnType<typeof parseMessageEvent> extends infer T ? NonNullable<T> : never,
  ) => FeishuMessageRoutingDecision | Promise<FeishuMessageRoutingDecision>;
  normalizeFeishuInboundMessage?: typeof normalizeFeishuInboundMessage;
  groupOwnerResolver?: GroupOwnerResolver;
}

interface QueuedPrompt {
  identity: UserIdentity;
  message: FeishuInboundMessage;
  resolve(): void;
  reject(error: unknown): void;
}

export function createMessageRouter(deps: MessageRouterDeps): MessageRouter {
  const parseEvent = deps.parseMessageEvent ?? parseMessageEvent;
  const resolveMessageRoutingDecision = deps.getMessageRoutingDecision
    ?? createMessageRoutingDecisionResolver(
      deps.config,
      deps.p2pSettingsStore,
      deps.groupSettingsStore,
      deps.runtimeConfig,
      deps.isSupportedP2PMessage ?? isSupportedP2PMessage,
    );
  const resolveGroupRoutingConfig = createGroupRoutingConfigResolver(
    deps.config,
    deps.groupSettingsStore,
    deps.runtimeConfig,
  );
  const normalizeMessage = deps.normalizeFeishuInboundMessage ?? normalizeFeishuInboundMessage;
  const promptQueues = new Map<string, QueuedPrompt[]>();
  const drainingUsers = new Set<string>();
  const activePromptOpenIds = new Map<string, string>();

  async function handleFeishuMessage(data: Record<string, unknown>): Promise<void> {
    const event = parseEvent(data);
    if (!event) return;

    const routingDecision = deps.isSupportedMessage
      ? (await deps.isSupportedMessage(event) ? "route" : "ignore")
      : await resolveMessageRoutingDecision(event);
    if (routingDecision === "ignore") return;

    const message = normalizeMessage(event);
    if (!message) return;

    if (routingDecision === "capture_unmatched") {
      if (deps.stateStore.isDuplicate(message.messageId)) {
        logger.debug("重复未触发消息已忽略", { messageId: message.messageId });
        return;
      }
      await captureUnmatchedGroupMessage(message);
      return;
    }

    const routedInputMessage = message;
    const identity = routedInputMessage.identity;
    const openId = identity.openId;
    const conversationTarget = routedInputMessage.conversationTarget ?? createP2PConversationTarget(openId);
    if (!conversationTarget) return;
    const routedMessage = routedInputMessage.conversationTarget ? routedInputMessage : { ...routedInputMessage, conversationTarget };
    const messageId = routedInputMessage.messageId;

    if (deps.stateStore.isDuplicate(messageId)) {
      logger.debug("重复消息已忽略", { openId, messageId });
      return;
    }

    logger.info(conversationTarget.kind === "p2p" ? "收到私聊消息" : "收到群聊消息", {
      openId,
      conversationKey: conversationTarget.key,
      chatId: conversationTarget.chatId,
      messageId,
      messageType: routedInputMessage.messageType,
      ...buildMessageLogPayload(routedInputMessage),
    });
    logger.debug("消息内容", {
      openId,
      messageType: routedInputMessage.messageType,
      ...buildMessageLogPayload(routedInputMessage),
    });

    const commandText = routedInputMessage.kind === "text"
      ? await normalizeKeywordPrefixedBridgeCommandText(routedInputMessage.text, event, resolveGroupRoutingConfig)
      : undefined;
    const hasSlashPrefix = commandText?.trim().startsWith("/") ?? false;
    const bridgeCommand = commandText ? parseBridgeCommand(commandText) : null;
    if (bridgeCommand?.name === "next") {
      if (!await canRunBridgeCommand(identity, bridgeCommand, conversationTarget, deps.groupOwnerResolver)) {
        await deps.commandService.handleUnauthorizedBridgeCommand(identity, bridgeCommand, conversationTarget);
        return;
      }

      if (!bridgeCommand.args) {
        await deps.commandService.handleBridgeCommand(identity, bridgeCommand, conversationTarget);
        return;
      }

      await enqueuePrompt(identity, await attachUnmatchedContext(createTextPromptMessage(routedMessage, bridgeCommand.args)), "followUp");
      return;
    }

    if (bridgeCommand) {
      if (!await canRunBridgeCommand(identity, bridgeCommand, conversationTarget, deps.groupOwnerResolver)) {
        await deps.commandService.handleUnauthorizedBridgeCommand(identity, bridgeCommand, conversationTarget);
        return;
      }

      await deps.commandService.handleBridgeCommand(identity, bridgeCommand, conversationTarget);
      return;
    }

    if (hasSlashPrefix && commandText) {
      await deps.commandService.handleUnsupportedSlashCommand(identity, commandText, conversationTarget);
      return;
    }

    await enqueuePrompt(identity, await attachUnmatchedContext(routedMessage), "steer");
  }

  async function captureUnmatchedGroupMessage(message: FeishuInboundMessage): Promise<void> {
    const chatId = message.conversationTarget.chatId;
    if (!chatId || !deps.groupUnmatchedMessageStore) {
      return;
    }

    const count = await deps.groupUnmatchedMessageStore.append(chatId, message);
    logger.debug("未触发群消息已进入暂存队列", {
      chatId,
      messageId: message.messageId,
      messageType: message.messageType,
      count,
    });
  }

  async function attachUnmatchedContext(message: FeishuInboundMessage): Promise<FeishuInboundMessage> {
    const chatId = message.conversationTarget.chatId;
    if (!chatId || !deps.groupUnmatchedMessageStore) {
      return message;
    }

    const unmatchedContext = await deps.groupUnmatchedMessageStore.drain(chatId);
    if (unmatchedContext.length === 0) {
      return message;
    }

    logger.info("群消息已附加未触发上下文", {
      chatId,
      messageId: message.messageId,
      count: unmatchedContext.length,
    });
    return { ...message, unmatchedContext };
  }

  function enqueuePrompt(
    identity: UserIdentity,
    message: FeishuInboundMessage,
    runningBehavior: RunningPromptBehavior,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const openId = identity.openId;
      const conversationKey = getConversationTargetKey(message.conversationTarget, openId);
      const hasLocalBacklog = (promptQueues.get(conversationKey)?.length ?? 0) > 0;
      const activeOpenId = activePromptOpenIds.get(conversationKey);
      const hasDifferentActiveGroupMember = message.conversationTarget.kind !== "p2p"
        && Boolean(activeOpenId)
        && activeOpenId !== identity.openId;
      if (
        drainingUsers.has(conversationKey)
        && message.kind === "text"
        && (runningBehavior === "steer" || !hasLocalBacklog)
        && !hasDifferentActiveGroupMember
      ) {
        void deps.promptService.queueRunningPrompt(identity, message, runningBehavior)
          .then((result) => {
            if (result === "queued") {
              resolve();
              return;
            }
            pushPromptQueue(conversationKey, { identity, message, resolve, reject });
          })
          .catch((error) => {
            logger.warn("运行中消息入队失败，退回普通队列", {
              openId,
              conversationKey,
              messageId: message.messageId,
              behavior: runningBehavior,
              error: String(error),
            });
            pushPromptQueue(conversationKey, { identity, message, resolve, reject });
          });
        return;
      }

      pushPromptQueue(conversationKey, { identity, message, resolve, reject });
    });
  }

  function pushPromptQueue(conversationKey: string, prompt: QueuedPrompt): void {
    const queue = promptQueues.get(conversationKey) ?? [];
    queue.push(prompt);
    promptQueues.set(conversationKey, queue);
    void drainPromptQueue(conversationKey);
  }

  async function drainPromptQueue(conversationKey: string): Promise<void> {
    if (drainingUsers.has(conversationKey)) {
      return;
    }

    drainingUsers.add(conversationKey);

    try {
      while (true) {
        const queue = promptQueues.get(conversationKey);
        const next = queue?.shift();

        if (!next) {
          promptQueues.delete(conversationKey);
          break;
        }

        try {
          activePromptOpenIds.set(conversationKey, next.identity.openId);
          await deps.promptService.handleUserPrompt(next.identity, next.message);
          next.resolve();
        } catch (error) {
          next.reject(error);
        } finally {
          if (activePromptOpenIds.get(conversationKey) === next.identity.openId) {
            activePromptOpenIds.delete(conversationKey);
          }
        }

        if (queue && queue.length === 0) {
          promptQueues.delete(conversationKey);
        }
      }
    } finally {
      drainingUsers.delete(conversationKey);
      if ((promptQueues.get(conversationKey)?.length ?? 0) > 0) {
        void drainPromptQueue(conversationKey);
      }
    }
  }

  return {
    handleFeishuMessage,
  };
}

function createTextPromptMessage(message: FeishuInboundMessage, text: string): FeishuInboundMessage {
  if (message.kind !== "text") {
    return message;
  }
  return {
    ...message,
    rawContent: JSON.stringify({ text }),
    text,
  };
}

type ParsedFeishuMessageEvent = NonNullable<ReturnType<typeof parseMessageEvent>>;
type P2PRoutingConfigResolver = () => Promise<FeishuP2PRoutingConfig>;
type GroupRoutingConfigResolver = (event: ParsedFeishuMessageEvent) => Promise<FeishuGroupRoutingConfig | null>;

function createP2PRoutingConfigResolver(
  config: Partial<Config> | undefined,
  p2pSettingsStore: Pick<P2PSettingsStore, "readP2PRoutingConfig"> | undefined,
  runtimeConfig: Pick<RuntimeConfigStore, "getP2PRoutingConfig"> | undefined,
): P2PRoutingConfigResolver {
  return async () => {
    const persisted = await p2pSettingsStore?.readP2PRoutingConfig();
    if (persisted) {
      return persisted;
    }

    if (runtimeConfig) {
      return runtimeConfig.getP2PRoutingConfig();
    }

    return {
      FEISHU_P2P_CHAT_POLICY: config?.FEISHU_P2P_CHAT_POLICY ?? "whitelist",
      FEISHU_P2P_CHAT_ALLOWLIST: [...(config?.FEISHU_P2P_CHAT_ALLOWLIST ?? [])],
    };
  };
}

function createGroupRoutingConfigResolver(
  config: Partial<Config> | undefined,
  groupSettingsStore: (Pick<GroupSettingsStore, "readGroupRoutingConfig"> &
    Partial<Pick<GroupSettingsStore, "readGlobalGroupRoutingConfig">>) | undefined,
  runtimeConfig: Pick<RuntimeConfigStore, "getGroupRoutingConfig"> | undefined,
): GroupRoutingConfigResolver {
  if (!groupSettingsStore && !runtimeConfig && !config?.FEISHU_GROUP_CHAT_POLICY) {
    return async () => null;
  }

  const readDefaultConfig = async (): Promise<FeishuGroupRoutingConfig | null> => {
    const persistedGlobal = await groupSettingsStore?.readGlobalGroupRoutingConfig?.();
    if (persistedGlobal) {
      const runtimeDefault = runtimeConfig?.getGroupRoutingConfig?.() ?? config;
      return {
        ...persistedGlobal,
        FEISHU_BOT_OPEN_ID: runtimeDefault?.FEISHU_BOT_OPEN_ID,
      } as FeishuGroupRoutingConfig;
    }

    if (runtimeConfig) {
      return runtimeConfig.getGroupRoutingConfig();
    }

    return config?.FEISHU_GROUP_CHAT_POLICY
      ? config as FeishuGroupRoutingConfig
      : null;
  };

  return async (event) => {
    if (event.message.chatType !== "group") {
      return null;
    }

    if (groupSettingsStore) {
      const persisted = await groupSettingsStore.readGroupRoutingConfig(event.message.chatId);
      const defaultConfig = await readDefaultConfig();
      if (persisted) {
        return {
          ...persisted,
          FEISHU_GROUP_CHAT_ALLOWLIST: [...(defaultConfig?.FEISHU_GROUP_CHAT_ALLOWLIST ?? [])],
          FEISHU_BOT_OPEN_ID: defaultConfig?.FEISHU_BOT_OPEN_ID,
        } as FeishuGroupRoutingConfig;
      }
      return defaultConfig?.FEISHU_GROUP_CHAT_POLICY
        ? defaultConfig as FeishuGroupRoutingConfig
        : null;
    }

    if (runtimeConfig) {
      return runtimeConfig.getGroupRoutingConfig();
    }

    return config?.FEISHU_GROUP_CHAT_POLICY
      ? config as FeishuGroupRoutingConfig
      : null;
  };
}

async function normalizeKeywordPrefixedBridgeCommandText(
  text: string,
  event: ParsedFeishuMessageEvent,
  resolveGroupRoutingConfig: GroupRoutingConfigResolver,
): Promise<string> {
  const trimmed = text.trimStart();
  if (trimmed.startsWith("/") || event.message.chatType !== "group") {
    return text;
  }

  const config = await resolveGroupRoutingConfig(event);
  if (config?.FEISHU_GROUP_MESSAGE_MODE !== "keyword") {
    return text;
  }

  return stripLeadingKeywordBeforeCommand(trimmed, config.FEISHU_GROUP_MESSAGE_KEYWORDS) ?? text;
}

function stripLeadingKeywordBeforeCommand(text: string, keywords: readonly string[]): string | null {
  const normalizedKeywords = keywords
    .map((keyword) => keyword.trim())
    .filter(Boolean)
    .sort((left, right) => right.length - left.length);

  for (const keyword of normalizedKeywords) {
    const remaining = stripKeywordPrefix(text, keyword);
    if (remaining?.trimStart().startsWith("/")) {
      return remaining.trimStart();
    }
  }

  return null;
}

function stripKeywordPrefix(text: string, keyword: string): string | null {
  if (!text.toLowerCase().startsWith(keyword.toLowerCase())) {
    return null;
  }

  const remaining = text.slice(keyword.length);
  if (isAsciiKeyword(keyword) && /^[a-z0-9_-]/i.test(remaining)) {
    return null;
  }

  return remaining;
}

function isAsciiKeyword(keyword: string): boolean {
  return /^[a-z0-9][a-z0-9_-]*$/i.test(keyword);
}

function createMessageRoutingDecisionResolver(
  config: Partial<Config> | undefined,
  p2pSettingsStore: Pick<P2PSettingsStore, "readP2PRoutingConfig"> | undefined,
  groupSettingsStore: (Pick<GroupSettingsStore, "readGroupRoutingConfig"> &
    Partial<Pick<GroupSettingsStore, "readGlobalGroupRoutingConfig">>) | undefined,
  runtimeConfig: Pick<RuntimeConfigStore, "getP2PRoutingConfig" | "getGroupRoutingConfig"> | undefined,
  fallback: typeof isSupportedP2PMessage,
): (event: NonNullable<ReturnType<typeof parseMessageEvent>>) => Promise<FeishuMessageRoutingDecision> {
  const resolveP2PRoutingConfig = createP2PRoutingConfigResolver(config, p2pSettingsStore, runtimeConfig);
  const resolveGroupRoutingConfig = createGroupRoutingConfigResolver(config, groupSettingsStore, runtimeConfig);
  if (!groupSettingsStore && !runtimeConfig && !config?.FEISHU_GROUP_CHAT_POLICY) {
    return async (event) => {
      if (event.message.chatType !== "group") {
        return fallback(event)
          ? getFeishuP2PMessageRoutingDecision(event, await resolveP2PRoutingConfig())
          : "ignore";
      }
      return "ignore";
    };
  }

  return async (event) => {
    if (event.message.chatType !== "group") {
      return fallback(event)
        ? getFeishuP2PMessageRoutingDecision(event, await resolveP2PRoutingConfig())
        : "ignore";
    }

    const groupRoutingConfig = await resolveGroupRoutingConfig(event);
    return groupRoutingConfig
      ? getFeishuMessageRoutingDecision(event, groupRoutingConfig)
      : "ignore";
  };
}

let defaultRouter: MessageRouter | null = null;

export function initRouter(cfg: Config): void {
  const runtimeConfig = createRuntimeConfigStore(cfg);
  const p2pSettingsStore = createP2PSettingsStore(cfg.DATA_DIR ?? "./data");
  const groupSettingsStore = createGroupSettingsStore(cfg.DATA_DIR ?? "./data");
  const groupUnmatchedMessageStore = createGroupUnmatchedMessageStore(cfg.DATA_DIR ?? "./data");
  const commandService = createCommandService({
    config: cfg,
    groupSettingsStore,
    groupUnmatchedMessageStore,
    p2pSettingsStore,
    runtimeConfig,
    messenger: {
      sendRenderedMessage: (...args) => sendRenderedMessage(...args),
      sendRenderedMessageToTarget: (...args) => sendRenderedMessageToTarget(...args),
      sendTextMessage: (...args) => sendTextMessage(...args),
      sendTextMessageToTarget: (...args) => sendTextMessageToTarget(...args),
    },
    sessionService: {
      getOrCreateActiveSession: (...args) => getOrCreateActiveSession(...args),
      getOrCreateActiveSessionForTarget: (...args) => getOrCreateActiveSessionForTarget(...args),
      createNewSession: (...args) => createNewSession(...args),
      createNewSessionForTarget: (...args) => createNewSessionForTarget(...args),
      listSessions: (...args) => listSessions(...args),
      listSessionsForTarget: (...args) => listSessionsForTarget(...args),
      resumeSession: (...args) => resumeSession(...args),
      resumeSessionForTarget: (...args) => resumeSessionForTarget(...args),
      readSessionState: (...args) => readSessionState(...args),
      writeSessionState: (...args) => writeSessionState(...args),
    },
    userStateStore: {
      readUserState: (...args) => readUserState(...args),
      writeUserState: (...args) => writeUserState(...args),
    },
    workspaceService: {
      getUserWorkspaceDir: (...args) => getUserWorkspaceDir(...args),
      getConversationWorkspaceDir: (...args) => getConversationWorkspaceDir(...args),
    },
    runtimeState: {
      isLocked: (...args) => isLocked(...args),
      hasActiveLocks: () => hasActiveLocks(),
      beginRestartDrain: () => beginRestartDrain(),
      cancelRestartDrain: () => cancelRestartDrain(),
      requestStop: (...args) => requestStop(...args),
      waitForUnlock: (...args) => waitForUnlock(...args),
    },
    restartService: createRestartService(),
    listAvailableModels: () => listAvailableModels(),
    findAvailableModel: (rawRef: string) => findAvailableModel(rawRef),
  });

  const promptService = createPromptService({
    config: cfg,
    runtimeConfig,
    runtimeState: {
      acquireLock: (...args) => acquireLock(...args),
      releaseLock: (...args) => releaseLock(...args),
      setAbortHandler: (...args) => setAbortHandler(...args),
      isStopRequested: (...args) => isStopRequested(...args),
      isDraining: () => isDraining(),
    },
    sessionService: {
      getOrCreateActiveSession: (...args) => getOrCreateActiveSession(...args),
      getOrCreateActiveSessionForTarget: (...args) => getOrCreateActiveSessionForTarget(...args),
      touchSession: (...args) => touchSession(...args),
      touchSessionForTarget: (...args) => touchSessionForTarget(...args),
      readSessionState: (...args) => readSessionState(...args),
    },
    userStateStore: {
      readUserState: (...args) => readUserState(...args),
    },
    workspaceService: {
      getUserWorkspaceDir: (...args) => getUserWorkspaceDir(...args),
      getConversationWorkspaceDir: (...args) => getConversationWorkspaceDir(...args),
    },
    promptRunner: {
      promptSession: (...args) => promptSession(...args),
    },
    messenger: {
      sendTextMessage: (...args) => sendTextMessage(...args),
      sendTextMessageToTarget: (...args) => sendTextMessageToTarget(...args),
      addProcessingReaction: (...args) => addProcessingReaction(...args),
    },
    preparePromptInput: prepareFeishuPromptInput,
  });

  defaultRouter = createMessageRouter({
    stateStore: {
      isDuplicate: (...args) => isDuplicate(...args),
    },
    commandService,
    promptService,
    config: cfg,
    groupSettingsStore,
    groupUnmatchedMessageStore,
    p2pSettingsStore,
    runtimeConfig,
  });
}

function ensureDefaultRouter(): MessageRouter {
  if (!defaultRouter) {
    throw new Error("消息路由尚未初始化");
  }
  return defaultRouter;
}

export async function handleFeishuMessage(data: Record<string, unknown>): Promise<void> {
  return ensureDefaultRouter().handleFeishuMessage(data);
}

function truncateForLog(text: string, limit: number): string {
  return Array.from(text).slice(0, limit).join("");
}

function buildMessageLogPayload(message: FeishuInboundMessage): Record<string, number | string> {
  switch (message.kind) {
    case "text":
      return {
        textLen: message.text.length,
        text: truncateForLog(message.text, MESSAGE_LOG_PREVIEW_LIMIT),
      };
    case "image":
      return {
        imageKey: message.imageKey,
      };
    case "audio":
      return {
        fileKey: message.fileKey,
        durationMs: message.durationMs ?? 0,
      };
    case "file":
      return {
        fileKey: message.fileKey,
        fileName: message.fileName ?? "",
      };
  }
}
