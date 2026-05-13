import { logger } from "../app/logger.js";

export interface FeishuBotInfoClient {
  request<T = unknown>(payload: { url: string; method: string }): Promise<T>;
}

interface FeishuBotInfoResponse {
  code?: number;
  msg?: string;
  bot?: {
    open_id?: string;
    openId?: string;
    app_name?: string;
    appName?: string;
  };
}

export async function resolveFeishuBotOpenId(client: FeishuBotInfoClient): Promise<string | undefined> {
  try {
    const response = await client.request<FeishuBotInfoResponse>({
      url: "/open-apis/bot/v3/info",
      method: "GET",
    });
    const openId = (response.bot?.open_id ?? response.bot?.openId)?.trim();
    if (response.code !== 0 || !openId) {
      logger.warn("获取飞书机器人 open_id 失败，群聊 @ 机器人触发将不可用", {
        code: response.code,
        msg: response.msg,
      });
      return undefined;
    }

    logger.info("飞书机器人 open_id 已自动解析", {
      botOpenId: openId,
      appName: response.bot?.app_name ?? response.bot?.appName,
    });
    return openId;
  } catch (err) {
    logger.warn("获取飞书机器人 open_id 失败，群聊 @ 机器人触发将不可用", {
      error: String(err),
    });
    return undefined;
  }
}
