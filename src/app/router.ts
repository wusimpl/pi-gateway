import { normalizeFeishuInboundMessage } from "../feishu/inbound/normalize.js";
import type { FeishuInboundMessage } from "../feishu/inbound/types.js";
import { parseMessageEvent, isSupportedP2PMessage } from "../feishu/events.js";
import { sendRenderedMessage, sendTextMessage } from "../feishu/send.js";
import { promptSession } from "../pi/stream.js";
import {
  createNewSession,
  getOrCreateActiveSession,
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
import {
  acquireLock,
  hasActiveLocks,
  isDuplicate,
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

export function createMessageRouter(deps: MessageRouterDeps): MessageRouter {
  const parseEvent = deps.parseMessageEvent ?? parseMessageEvent;
  const isSupportedMessage = deps.isSupportedP2PMessage ?? isSupportedP2PMessage;
  const normalizeMessage = deps.normalizeFeishuInboundMessage ?? normalizeFeishuInboundMessage;

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

    await deps.promptService.handleUserPrompt(identity, message);
  }

  return {
    handleFeishuMessage,
  };
}

let defaultRouter: MessageRouter | null = null;

export function initRouter(cfg: Config): void {
  const commandService = createCommandService({
    config: cfg,
    messenger: {
      sendRenderedMessage: (...args) => sendRenderedMessage(...args),
      sendTextMessage: (...args) => sendTextMessage(...args),
    },
    sessionService: {
      getOrCreateActiveSession: (...args) => getOrCreateActiveSession(...args),
      createNewSession: (...args) => createNewSession(...args),
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
      requestStop: (...args) => requestStop(...args),
    },
    restartService: createRestartService(),
    listAvailableModels: () => listAvailableModels(),
    findAvailableModel: (rawRef: string) => findAvailableModel(rawRef),
  });

  const promptService = createPromptService({
    config: cfg,
    runtimeState: {
      acquireLock: (...args) => acquireLock(...args),
      releaseLock: (...args) => releaseLock(...args),
      setAbortHandler: (...args) => setAbortHandler(...args),
      isStopRequested: (...args) => isStopRequested(...args),
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
  }
}
