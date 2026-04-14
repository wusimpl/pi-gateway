import { loadConfig } from "./config.js";
import { setLogLevel, logger } from "./app/logger.js";
import { setDataDir } from "./storage/users.js";
import { ensureDir } from "./storage/files.js";

async function main() {
  // 加载配置
  const config = loadConfig();
  setLogLevel(config.LOG_LEVEL);
  setDataDir(config.DATA_DIR);

  logger.info("配置加载成功", {
    feishuDomain: config.FEISHU_DOMAIN,
    dataDir: config.DATA_DIR,
    logLevel: config.LOG_LEVEL,
    streamingEnabled: config.STREAMING_ENABLED,
    textChunkLimit: config.TEXT_CHUNK_LIMIT,
  });

  // 确保数据目录存在
  await ensureDir(config.DATA_DIR);
  logger.info("数据目录就绪", { dataDir: config.DATA_DIR });

  logger.info("pi-gateway 启动完成（骨架模式，尚未连接飞书与 Pi）");
}

main().catch((err) => {
  console.error("启动失败:", err);
  process.exit(1);
});
