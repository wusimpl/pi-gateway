import * as lark from "@larksuiteoapi/node-sdk";
import type { Config } from "../config.js";
import { logger } from "../app/logger.js";

export type FeishuMessageEventHandler = (data: Record<string, unknown>) => Promise<void>;
export type FeishuCardActionHandler = (data: Record<string, unknown>) => Promise<unknown> | unknown;

export interface FeishuConnection {
  client: lark.Client;
  wsClient: lark.WSClient;
  eventDispatcher: lark.EventDispatcher;
  startMessageConnection(
    handler: FeishuMessageEventHandler,
    cardActionHandler?: FeishuCardActionHandler,
  ): Promise<void>;
}

async function handleCardActionEvent(
  data: Record<string, unknown>,
  handler?: FeishuCardActionHandler,
): Promise<unknown> {
  logger.debug("收到飞书卡片交互事件", {
    topLevelKeys: Object.keys(data),
    hasEvent: typeof data.event === "object" && data.event !== null,
  });

  if (!handler) return undefined;

  try {
    return await handler(data);
  } catch (err) {
    logger.error("处理飞书卡片交互时出错", { error: String(err) });
    return undefined;
  }
}

export function createFeishuConnection(config: Config): FeishuConnection {
  const domain =
    config.FEISHU_DOMAIN === "larksuite"
      ? lark.Domain.Lark
      : lark.Domain.Feishu;

  const client = new lark.Client({
    appId: config.FEISHU_APP_ID,
    appSecret: config.FEISHU_APP_SECRET,
    domain,
    appType: lark.AppType.SelfBuild,
  });

  const eventDispatcher = new lark.EventDispatcher({});

  const wsClient = new lark.WSClient({
    appId: config.FEISHU_APP_ID,
    appSecret: config.FEISHU_APP_SECRET,
    domain,
    loggerLevel: lark.LoggerLevel.warn,
  });

  async function startMessageConnection(
    handler: FeishuMessageEventHandler,
    cardActionHandler?: FeishuCardActionHandler,
  ): Promise<void> {
    eventDispatcher.register({
      // 反应事件：当前无需业务处理，注册空 handler 消除 SDK warn 日志
      "im.message.reaction.created_v1": () => {},
      "im.message.reaction.deleted_v1": () => {},
      "im.message.receive_v1": (data: Record<string, unknown>) => {
        logger.debug("收到飞书消息事件", {
          topLevelKeys: Object.keys(data),
          hasEvent: typeof data.event === "object" && data.event !== null,
          hasSender: typeof data.sender === "object" && data.sender !== null,
          hasMessage: typeof data.message === "object" && data.message !== null,
        });

        // 飞书长连接要求尽快完成回调，实际消息处理放到后台异步执行。
        void Promise.resolve()
          .then(() => handler(data))
          .catch((err) => {
            logger.error("处理飞书消息时出错", { error: String(err) });
          });
      },
      "card.action.trigger": (data: Record<string, unknown>) => handleCardActionEvent(data, cardActionHandler),
      "card.action.trigger_v1": (data: Record<string, unknown>) => handleCardActionEvent(data, cardActionHandler),
    });

    await wsClient.start({
      eventDispatcher,
    });

    logger.info("飞书 WebSocket 连接已建立");
  }

  return {
    client,
    wsClient,
    eventDispatcher,
    startMessageConnection,
  };
}

let defaultFeishuConnection: FeishuConnection | null = null;

export function initFeishuClient(config: Config): FeishuConnection {
  defaultFeishuConnection = createFeishuConnection(config);
  logger.info("飞书客户端初始化完成", { domain: config.FEISHU_DOMAIN });
  return defaultFeishuConnection;
}

function getDefaultFeishuConnection(): FeishuConnection {
  if (!defaultFeishuConnection) {
    throw new Error("飞书客户端尚未初始化");
  }
  return defaultFeishuConnection;
}

export function getLarkClient(): lark.Client {
  return getDefaultFeishuConnection().client;
}

export function getWSClient(): lark.WSClient {
  return getDefaultFeishuConnection().wsClient;
}

export function getEventDispatcher(): lark.EventDispatcher {
  return getDefaultFeishuConnection().eventDispatcher;
}

/** 启动飞书 WebSocket 连接并注册事件处理器 */
export async function startFeishuConnection(
  handler?: (data: Record<string, unknown>) => Promise<void>,
): Promise<void> {
  const connection = getDefaultFeishuConnection();
  const defaultHandler =
    handler ??
    (async (data: Record<string, unknown>) => {
      const { handleFeishuMessage } = await import("../app/router.js");
      await handleFeishuMessage(data);
    });

  await connection.startMessageConnection(defaultHandler);
}
