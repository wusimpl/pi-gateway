import { loadConfig } from "./config.js";
import { setLogLevel, logger } from "./app/logger.js";
import { setDataDir } from "./storage/users.js";
import { ensureDir } from "./storage/files.js";
import { initFeishuClient, startFeishuConnection } from "./feishu/client.js";
import { initPiRuntime } from "./pi/runtime.js";
import { initRouter } from "./app/router.js";
import { disposeAllSessions } from "./pi/sessions.js";
import { clearAllState } from "./app/state.js";
import { setWorkspaceRoot } from "./pi/workspace.js";

async function main() {
  // 1. 加载配置
  const config = loadConfig();
  setLogLevel(config.LOG_LEVEL);
  setDataDir(config.DATA_DIR);
  setWorkspaceRoot(config.PI_WORKSPACE_ROOT);

  logger.info("配置加载成功", {
    feishuDomain: config.FEISHU_DOMAIN,
    dataDir: config.DATA_DIR,
    workspaceRoot: config.PI_WORKSPACE_ROOT,
    logLevel: config.LOG_LEVEL,
    processingReactionEnabled: Boolean(config.FEISHU_PROCESSING_REACTION_TYPE),
  });

  // 2. 确保数据目录
  await ensureDir(config.DATA_DIR);
  logger.info("数据目录就绪", { dataDir: config.DATA_DIR });

  // 3. 确保 workspace 根目录
  await ensureDir(config.PI_WORKSPACE_ROOT);
  logger.info("Workspace 根目录就绪", { workspaceRoot: config.PI_WORKSPACE_ROOT });

  // 4. 初始化 Pi 运行时（含自检）

  try {
    initPiRuntime();
    logger.info("Pi 运行时就绪");
  } catch (err) {
    logger.error("Pi 运行时初始化失败，服务无法启动", { error: String(err) });
    process.exit(1);
  }

  // 5. 自检：验证 Pi 可用模型
  try {
    const models = await checkPiModels();
    if (models.length === 0) {
      logger.error("Pi 无可用模型，请检查 API Key 配置");
      process.exit(1);
    }
    logger.info(`Pi 自检通过: ${models.length} 个可用模型`);
  } catch (err) {
    logger.error("Pi 自检失败", { error: String(err) });
    process.exit(1);
  }

  // 6. 初始化飞书客户端（含自检）
  try {
    initFeishuClient(config);
    logger.info("飞书客户端就绪");
  } catch (err) {
    logger.error("飞书客户端初始化失败，请检查凭证配置", { error: String(err) });
    process.exit(1);
  }

  // 7. 初始化消息路由
  initRouter(config);
  logger.info("消息路由就绪");

  // 8. 注册优雅关停
  registerShutdown();

  // 9. 启动飞书 WebSocket 连接
  try {
    await startFeishuConnection();
    logger.info("🚀 pi-gateway 服务已启动，等待飞书消息...");
  } catch (err) {
    logger.error("飞书 WebSocket 连接失败", { error: String(err) });
    process.exit(1);
  }
}

/** 自检：获取可用模型数量 */
async function checkPiModels(): Promise<Array<{ provider: string; id: string }>> {
  const { getAuthStorage, getModelRegistry } = await import("./pi/runtime.js");
  const registry = getModelRegistry();
  return registry.getAvailable();
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
