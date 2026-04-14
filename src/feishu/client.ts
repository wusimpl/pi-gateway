import * as lark from "@larksuiteoapi/node-sdk";
import type { Config } from "../config.js";
import { logger } from "../app/logger.js";

let client: lark.Client | null = null;
let wsClient: lark.WSClient | null = null;

export function getLarkClient(): lark.Client {
  if (!client) throw new Error("飞书 Client 未初始化");
  return client;
}

export function getWSClient(): lark.WSClient {
  if (!wsClient) throw new Error("飞书 WSClient 未初始化");
  return wsClient;
}

/** 初始化飞书 Client 与 WSClient */
export function initFeishuClient(config: Config): void {
  const domain =
    config.FEISHU_DOMAIN === "larksuite"
      ? lark.Domain.Lark
      : lark.Domain.Feishu;

  client = new lark.Client({
    appId: config.FEISHU_APP_ID,
    appSecret: config.FEISHU_APP_SECRET,
    domain,
    appType: lark.AppType.SelfBuild,
  });

  wsClient = new lark.WSClient({
    appId: config.FEISHU_APP_ID,
    appSecret: config.FEISHU_APP_SECRET,
    domain,
    loggerLevel: lark.LoggerLevel.warn,
  });

  logger.info("飞书客户端初始化完成", { domain: config.FEISHU_DOMAIN });
}
