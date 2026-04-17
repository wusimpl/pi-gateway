import { normalizeFeishuInboundMessage } from "../feishu/inbound/normalize.js";
import type { FeishuInboundMessage } from "../feishu/inbound/types.js";
import { parseMessageEvent, isSupportedP2PMessage } from "../feishu/events.js";
import { sendRenderedMessage, sendTextMessage } from "../feishu/send.js";
import { promptSession } from "../pi/stream.js";
import {
  createNewSession,
  getOrCreateActiveSession,
  listSessions,
  resumeSession,
  touchSession,
} from "../pi/sessions.js";
import { getUserWorkspaceDir } from "../pi/workspace.js";
import { prepareFeishuPromptInput } from "../feishu/inbound/transform.js";
import { readUserState } from "../storage/users.js";
import {
  findAvailableModel,
  listAvailableModels,
} from "../pi/models.js";
import type { Config } from "../config.js";
import type { UserIdentity } from "../types.js";
import { parseBridgeCommand } from "./commands.js";
import { createCommandService, type CommandService } from "./command-service.js";
import { logger } from "./logger.js";
import { createPromptService, type PromptService } from "./prompt-service.js";
import { createRestartService } from "./restart.js";
import { createRuntimeConfigStore } from "./runtime-config.js";
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
  commandService: Pick<CommandService, "handleBridgeCommand">;
  promptService: Pick<PromptService, "handleUserPrompt">;
  parseMessageEvent?: typeof parseMessageEvent;
  isSupportedP2PMessage?: typeof isSupportedP2PMessage;
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
  const isSupportedMessage = deps.isSupportedP2PMessage ?? isSupportedP2PMessage;
  const normalizeMessage = deps.normalizeFeishuInboundMessage ?? normalizeFeishuInboundMessage;
  const promptQueues = new Map<string, QueuedPrompt[]>();
  const drainingUsers = new Set<string>();

  async function handleFeishuMessage(data: Record<string, unknown>): Promise<void> {
    const event = parseEvent(data);
    if (!event) return;

    if (!isSupportedMessage(event)) return;

    const message = normalizeMessage(event);
    if (!message) return;

    const identity = message.identity;
    const openId = identity.openId;
    const messageId = message.messageId;

    if (deps.stateStore.isDuplicate(messageId)) {
      logger.debug("重复消息已忽略", { openId, messageId });
      return;
    }

    logger.info("收到私聊消息", {
      openId,
      messageId,
      messageType: message.messageType,
      ...buildMessageLogPayload(message),
    });
    logger.debug("消息内容", {
      openId,
      messageType: message.messageType,
      ...buildMessageLogPayload(message),
    });

    const bridgeCommand = message.kind === "text" ? parseBridgeCommand(message.text) : null;
    if (bridgeCommand) {
      await deps.commandService.handleBridgeCommand(identity, bridgeCommand);
      return;
    }

    await enqueuePrompt(identity, message);
  }

  function enqueuePrompt(identity: UserIdentity, message: FeishuInboundMessage): Promise<void> {
    return new Promise((resolve, reject) => {
      const openId = identity.openId;
      const queue = promptQueues.get(openId) ?? [];
      queue.push({
        identity,
        message,
        resolve,
        reject,
      });
      promptQueues.set(openId, queue);
      void drainPromptQueue(openId);
    });
  }

  async function drainPromptQueue(openId: string): Promise<void> {
    if (drainingUsers.has(openId)) {
      return;
    }

    drainingUsers.add(openId);

    try {
      while (true) {
        const queue = promptQueues.get(openId);
        const next = queue?.shift();

        if (!next) {
          promptQueues.delete(openId);
          break;
        }

        try {
          await deps.promptService.handleUserPrompt(next.identity, next.message);
          next.resolve();
        } catch (error) {
          next.reject(error);
        }

        if (queue && queue.length === 0) {
          promptQueues.delete(openId);
        }
      }
    } finally {
      drainingUsers.delete(openId);
      if ((promptQueues.get(openId)?.length ?? 0) > 0) {
        void drainPromptQueue(openId);
      }
    }
  }

  return {
    handleFeishuMessage,
  };
}

let defaultRouter: MessageRouter | null = null;

export function initRouter(cfg: Config): void {
  const runtimeConfig = createRuntimeConfigStore(cfg);
  const commandService = createCommandService({
    config: cfg,
    runtimeConfig,
    messenger: {
      sendRenderedMessage: (...args) => sendRenderedMessage(...args),
      sendTextMessage: (...args) => sendTextMessage(...args),
    },
    sessionService: {
      getOrCreateActiveSession: (...args) => getOrCreateActiveSession(...args),
      createNewSession: (...args) => createNewSession(...args),
      listSessions: (...args) => listSessions(...args),
      resumeSession: (...args) => resumeSession(...args),
    },
    userStateStore: {
      readUserState: (...args) => readUserState(...args),
    },
    workspaceService: {
      getUserWorkspaceDir: (...args) => getUserWorkspaceDir(...args),
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
      touchSession: (...args) => touchSession(...args),
    },
    workspaceService: {
      getUserWorkspaceDir: (...args) => getUserWorkspaceDir(...args),
    },
    promptRunner: {
      promptSession: (...args) => promptSession(...args),
    },
    messenger: {
      sendTextMessage: (...args) => sendTextMessage(...args),
    },
    preparePromptInput: prepareFeishuPromptInput,
  });

  defaultRouter = createMessageRouter({
    stateStore: {
      isDuplicate: (...args) => isDuplicate(...args),
    },
    commandService,
    promptService,
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
