import { loadConfig } from "./config.js";
import { setLogLevel, logger } from "./app/logger.js";
import { setDataDir } from "./storage/users.js";
import { ensureDir } from "./storage/files.js";
import { initFeishuClient, startFeishuConnection } from "./feishu/client.js";
import { initPiRuntime } from "./pi/runtime.js";
import { initRouter } from "./app/router.js";
import { disposeAllSessions } from "./pi/sessions.js";
import { clearAllState } from "./app/state.js";

async function main() {
  // 1. 加载配置
  const config = loadConfig();
  setLogLevel(config.LOG_LEVEL);
  setDataDir(config.DATA_DIR);

  logger.info("配置加载成功", {
    feishuDomain: config.FEISHU_DOMAIN,
    dataDir: config.DATA_DIR,
    logLevel: config.LOG_LEVEL,
  });

  // 2. 确保数据目录
  await ensureDir(config.DATA_DIR);
  logger.info("数据目录就绪", { dataDir: config.DATA_DIR });

  // 3. 初始化 Pi 运行时
  initPiRuntime();
  logger.info("Pi 运行时就绪");

  // 4. 初始化飞书客户端
  initFeishuClient(config);
  logger.info("飞书客户端就绪");

  // 5. 初始化消息路由
  initRouter(config);
  logger.info("消息路由就绪");

  // 6. 注册优雅关停
  registerShutdown();

  // 7. 启动飞书 WebSocket 连接
  await startFeishuConnection();
  logger.info("🚀 pi-gateway 服务已启动，等待飞书消息...");
}

function registerShutdown() {
  let shuttingDown = false;

  const shutdown = async (signal: string) => {
    if (shuttingDown) return;
    shuttingDown = true;
    logger.info(`收到 ${signal}，开始优雅关停...`);

    try {
      disposeAllSessions();
      clearAllState();
      logger.info("优雅关停完成");
    } catch (err) {
      logger.error("关停过程中出错", { error: String(err) });
    }

    process.exit(0);
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

main().catch((err) => {
  console.error("启动失败:", err);
  process.exit(1);
});
