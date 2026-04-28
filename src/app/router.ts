import { normalizeFeishuInboundMessage } from "../feishu/inbound/normalize.js";
import type { FeishuInboundMessage } from "../feishu/inbound/types.js";
import { parseMessageEvent, isSupportedP2PMessage } from "../feishu/events.js";
import { isSupportedFeishuMessage, type FeishuGroupRoutingConfig } from "../feishu/group-routing.js";
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
import { readUserState } from "../storage/users.js";
import { createP2PConversationTarget, getConversationTargetKey } from "../conversation.js";
import {
  findAvailableModel,
  listAvailableModels,
} from "../pi/models.js";
import type { Config } from "../config.js";
import type { UserIdentity } from "../types.js";
import { parseBridgeCommand } from "./commands.js";
import { canRunBridgeCommand } from "./command-permissions.js";
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
  groupSettingsStore?: Pick<GroupSettingsStore, "readGroupRoutingConfig">;
  runtimeConfig?: Pick<RuntimeConfigStore, "getGroupRoutingConfig">;
  parseMessageEvent?: typeof parseMessageEvent;
  isSupportedP2PMessage?: typeof isSupportedP2PMessage;
  isSupportedMessage?: (
    event: ReturnType<typeof parseMessageEvent> extends infer T ? NonNullable<T> : never,
  ) => boolean | Promise<boolean>;
  normalizeFeishuInboundMessage?: typeof normalizeFeishuInboundMessage;
}

interface QueuedPrompt {
  identity: UserIdentity;
  message: FeishuInboundMessage;
  resolve(): void;
  reject(error: unknown): void;
}

export function createMessageRouter(deps: MessageRouterDeps): MessageRouter {
  const parseEvent = deps.parseMessageEvent ?? parseMessageEvent;
  const isSupportedMessage = deps.isSupportedMessage
    ?? createSupportedMessagePredicate(
      deps.config,
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

  async function handleFeishuMessage(data: Record<string, unknown>): Promise<void> {
    const event = parseEvent(data);
    if (!event) return;

    if (!await isSupportedMessage(event)) return;

    const message = normalizeMessage(event);
    if (!message) return;

    const identity = message.identity;
    const openId = identity.openId;
    const conversationTarget = message.conversationTarget ?? createP2PConversationTarget(openId);
    if (!conversationTarget) return;
    const routedMessage = message.conversationTarget ? message : { ...message, conversationTarget };
    const messageId = message.messageId;

    if (deps.stateStore.isDuplicate(messageId)) {
      logger.debug("重复消息已忽略", { openId, messageId });
      return;
    }

    logger.info(conversationTarget.kind === "p2p" ? "收到私聊消息" : "收到群聊消息", {
      openId,
      conversationKey: conversationTarget.key,
      chatId: conversationTarget.chatId,
      messageId,
      messageType: message.messageType,
      ...buildMessageLogPayload(message),
    });
    logger.debug("消息内容", {
      openId,
      messageType: message.messageType,
      ...buildMessageLogPayload(message),
    });

    const commandText = message.kind === "text"
      ? await normalizeKeywordPrefixedBridgeCommandText(message.text, event, resolveGroupRoutingConfig)
      : undefined;
    const hasSlashPrefix = commandText?.trim().startsWith("/") ?? false;
    const bridgeCommand = commandText ? parseBridgeCommand(commandText) : null;
    if (bridgeCommand?.name === "next") {
      if (!canRunBridgeCommand(identity, bridgeCommand, conversationTarget, deps.config?.FEISHU_OWNER_OPEN_IDS ?? [])) {
        await deps.commandService.handleUnauthorizedBridgeCommand(identity, bridgeCommand, conversationTarget);
        return;
      }

      if (!bridgeCommand.args) {
        await deps.commandService.handleBridgeCommand(identity, bridgeCommand, conversationTarget);
        return;
      }

      await enqueuePrompt(identity, createTextPromptMessage(routedMessage, bridgeCommand.args), "followUp");
      return;
    }

    if (bridgeCommand) {
      if (!canRunBridgeCommand(identity, bridgeCommand, conversationTarget, deps.config?.FEISHU_OWNER_OPEN_IDS ?? [])) {
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

    await enqueuePrompt(identity, routedMessage, "steer");
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
      if (
        drainingUsers.has(conversationKey)
        && message.kind === "text"
        && (runningBehavior === "steer" || !hasLocalBacklog)
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
          await deps.promptService.handleUserPrompt(next.identity, next.message);
          next.resolve();
        } catch (error) {
          next.reject(error);
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
type GroupRoutingConfigResolver = (event: ParsedFeishuMessageEvent) => Promise<FeishuGroupRoutingConfig | null>;

function createGroupRoutingConfigResolver(
  config: Partial<Config> | undefined,
  groupSettingsStore: Pick<GroupSettingsStore, "readGroupRoutingConfig"> | undefined,
  runtimeConfig: Pick<RuntimeConfigStore, "getGroupRoutingConfig"> | undefined,
): GroupRoutingConfigResolver {
  if (!groupSettingsStore && !runtimeConfig && !config?.FEISHU_GROUP_CHAT_POLICY) {
    return async () => null;
  }

  return async (event) => {
    if (event.message.chatType !== "group") {
      return null;
    }

    if (groupSettingsStore) {
      const persisted = await groupSettingsStore.readGroupRoutingConfig(event.message.chatId);
      const defaultConfig = runtimeConfig?.getGroupRoutingConfig?.() ?? config;
      if (persisted) {
        return {
          ...persisted,
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

function createSupportedMessagePredicate(
  config: Partial<Config> | undefined,
  groupSettingsStore: Pick<GroupSettingsStore, "readGroupRoutingConfig"> | undefined,
  runtimeConfig: Pick<RuntimeConfigStore, "getGroupRoutingConfig"> | undefined,
  fallback: typeof isSupportedP2PMessage,
): (event: NonNullable<ReturnType<typeof parseMessageEvent>>) => Promise<boolean> {
  const resolveGroupRoutingConfig = createGroupRoutingConfigResolver(config, groupSettingsStore, runtimeConfig);
  if (!groupSettingsStore && !runtimeConfig && !config?.FEISHU_GROUP_CHAT_POLICY) {
    return async (event) => fallback(event);
  }

  return async (event) => {
    if (event.message.chatType !== "group") {
      return fallback(event);
    }

    const groupRoutingConfig = await resolveGroupRoutingConfig(event);
    return groupRoutingConfig
      ? isSupportedFeishuMessage(event, groupRoutingConfig)
      : false;
  };
}

let defaultRouter: MessageRouter | null = null;

export function initRouter(cfg: Config): void {
  const runtimeConfig = createRuntimeConfigStore(cfg);
  const groupSettingsStore = createGroupSettingsStore(cfg.DATA_DIR ?? "./data");
  const commandService = createCommandService({
    config: cfg,
    groupSettingsStore,
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
      writeUserState: async () => {
        throw new Error("writeUserState is not available in initRouter mode");
      },
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
