import { loadConfig } from "./config.js";
import { setLogLevel, logger } from "./app/logger.js";
import { createCommandService } from "./app/command-service.js";
import { createPromptService } from "./app/prompt-service.js";
import { createRestartService, signalRestartReadyIfNeeded } from "./app/restart.js";
import { createMessageRouter } from "./app/router.js";
import { createRuntimeStateStore, type RuntimeStateStore } from "./app/state.js";
import { ensureDir } from "./storage/files.js";
import { createFeishuConnection } from "./feishu/client.js";
import {
  createFeishuDocsService,
  type FeishuDocsClient,
} from "./feishu/doc-service.js";
import { createFeishuMessageReader, type FeishuMessageClient } from "./feishu/inbound/message.js";
import { createFeishuResourceDownloader, type FeishuResourceClient } from "./feishu/inbound/resource.js";
import { createFeishuMessenger, type FeishuApiClient } from "./feishu/send.js";
import { createFeishuDocsExtension } from "./pi/extensions/feishu-docs.js";
import { createFeishuFilesExtension } from "./pi/extensions/feishu-files.js";
import { findAvailableModel, listAvailableModels } from "./pi/models.js";
import { createPiRuntime, type PiRuntime } from "./pi/runtime.js";
import { createSessionService, type SessionService } from "./pi/sessions.js";
import { createPromptRunner } from "./pi/stream.js";
import { createUserStateStore } from "./storage/users.js";
import { createWorkspaceService } from "./pi/workspace.js";

async function main() {
  const config = loadConfig();
  setLogLevel(config.LOG_LEVEL);

  logger.info("配置加载成功", {
    feishuDomain: config.FEISHU_DOMAIN,
    dataDir: config.DATA_DIR,
    workspaceRoot: config.PI_WORKSPACE_ROOT,
    disableGlobalAgents: config.PI_DISABLE_GLOBAL_AGENTS,
    logLevel: config.LOG_LEVEL,
    processingReactionEnabled: Boolean(config.FEISHU_PROCESSING_REACTION_TYPE),
  });

  await ensureDir(config.DATA_DIR);
  logger.info("数据目录就绪", { dataDir: config.DATA_DIR });

  await ensureDir(config.PI_WORKSPACE_ROOT);
  logger.info("Workspace 根目录就绪", { workspaceRoot: config.PI_WORKSPACE_ROOT });

  const runtimeState = createRuntimeStateStore();
  const userStateStore = createUserStateStore(config.DATA_DIR);
  const workspaceService = createWorkspaceService(config.PI_WORKSPACE_ROOT);

  let feishuConnection: ReturnType<typeof createFeishuConnection>;
  try {
    feishuConnection = createFeishuConnection(config);
    logger.info("飞书客户端就绪");
  } catch (err) {
    logger.error("飞书客户端初始化失败，请检查凭证配置", { error: String(err) });
    process.exit(1);
  }

  const feishuDocsService = createFeishuDocsService(
    feishuConnection.client as unknown as FeishuDocsClient,
    { feishuDomain: config.FEISHU_DOMAIN },
  );
  const feishuMessenger = createFeishuMessenger(
    feishuConnection.client as unknown as FeishuApiClient,
    { feishuDomain: config.FEISHU_DOMAIN },
  );

  let piRuntime: PiRuntime;
  try {
    piRuntime = createPiRuntime({
      disableGlobalAgents: config.PI_DISABLE_GLOBAL_AGENTS,
      extensionFactories: [
        createFeishuDocsExtension(feishuDocsService),
        createFeishuFilesExtension(feishuMessenger),
      ],
    });
    logger.info("Pi 运行时就绪");
  } catch (err) {
    logger.error("Pi 运行时初始化失败，服务无法启动", { error: String(err) });
    process.exit(1);
  }

  try {
    const models = await checkPiModels(piRuntime);
    if (models.length === 0) {
      logger.error("Pi 无可用模型，请检查 API Key 配置");
      process.exit(1);
    }
    logger.info(`Pi 自检通过: ${models.length} 个可用模型`);
  } catch (err) {
    logger.error("Pi 自检失败", { error: String(err) });
    process.exit(1);
  }

  const feishuMessageReader = createFeishuMessageReader(
    feishuConnection.client as unknown as FeishuMessageClient,
  );
  const feishuResourceDownloader = createFeishuResourceDownloader(
    feishuConnection.client as unknown as FeishuResourceClient,
  );
  const promptRunner = createPromptRunner(feishuMessenger);
  const sessionService = createSessionService({
    runtime: piRuntime,
    userStateStore,
    workspaceService,
  });
  const commandService = createCommandService({
    config,
    messenger: feishuMessenger,
    sessionService,
    userStateStore,
    workspaceService,
    runtimeState,
    restartService: createRestartService(),
    listAvailableModels: () => listAvailableModels(piRuntime.getModelRegistry()),
    findAvailableModel: (rawRef: string) => findAvailableModel(rawRef, piRuntime.getModelRegistry()),
  });
  const promptService = createPromptService({
    config,
    runtimeState,
    sessionService,
    workspaceService,
    promptRunner,
    messenger: feishuMessenger,
    downloadResource: feishuResourceDownloader,
    readQuotedMessage: feishuMessageReader,
  });
  const router = createMessageRouter({
    stateStore: runtimeState,
    commandService,
    promptService,
  });
  logger.info("消息路由就绪");

  registerShutdown(sessionService, runtimeState);

  try {
    await feishuConnection.startMessageConnection(router.handleFeishuMessage);
    await signalRestartReadyIfNeeded();
    logger.info("🚀 pi-gateway 服务已启动，等待飞书消息...");
  } catch (err) {
    logger.error("飞书 WebSocket 连接失败", { error: String(err) });
    process.exit(1);
  }
}

/** 自检：获取可用模型数量 */
async function checkPiModels(runtime: PiRuntime): Promise<Array<{ provider: string; id: string }>> {
  return runtime.getModelRegistry().getAvailable();
}

function registerShutdown(sessionService: Pick<SessionService, "disposeAllSessions">, runtimeState: Pick<RuntimeStateStore, "clearAllState">) {
  let shuttingDown = false;

  const shutdown = async (signal: string) => {
    if (shuttingDown) return;
    shuttingDown = true;
    logger.info(`收到 ${signal}，开始优雅关停...`);

    try {
      sessionService.disposeAllSessions();
      runtimeState.clearAllState();
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
