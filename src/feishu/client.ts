import * as lark from "@larksuiteoapi/node-sdk";
import type { Config } from "../config.js";
import { logger } from "../app/logger.js";

let client: lark.Client;
let wsClient: lark.WSClient;
let eventDispatcher: lark.EventDispatcher;

export function getLarkClient(): lark.Client {
  return client;
}

export function getWSClient(): lark.WSClient {
  return wsClient;
}

export function getEventDispatcher(): lark.EventDispatcher {
  return eventDispatcher;
}

/** 初始化飞书 Client、EventDispatcher 与 WSClient */
export function initFeishuClient(config: Config): void {
  const domain =
    config.FEISHU_DOMAIN === "larksuite"
      ? lark.Domain.Lark
      : lark.Domain.Feishu;

  // 1. API Client
  client = new lark.Client({
    appId: config.FEISHU_APP_ID,
    appSecret: config.FEISHU_APP_SECRET,
    domain,
    appType: lark.AppType.SelfBuild,
  });

  // 2. 事件分发器
  eventDispatcher = new lark.EventDispatcher({});

  // 3. WebSocket 长连接客户端
  wsClient = new lark.WSClient({
    appId: config.FEISHU_APP_ID,
    appSecret: config.FEISHU_APP_SECRET,
    domain,
    loggerLevel: lark.LoggerLevel.warn,
  });

  logger.info("飞书客户端初始化完成", { domain: config.FEISHU_DOMAIN });
}

/** 启动飞书 WebSocket 连接并注册事件处理器 */
export async function startFeishuConnection(): Promise<void> {
  // 注册消息事件
  eventDispatcher.register({
    "im.message.receive_v1": async (data: Record<string, unknown>) => {
      try {
        // 动态导入避免循环依赖
        const { handleFeishuMessage } = await import("../app/router.js");
        await handleFeishuMessage(data);
      } catch (err) {
        logger.error("处理飞书消息时出错", { error: String(err) });
      }
    },
  });

  // 启动 WebSocket 连接
  await wsClient.start({
    eventDispatcher,
  });

  logger.info("飞书 WebSocket 连接已建立");
}
