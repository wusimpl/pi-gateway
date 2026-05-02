import { loadConfig } from "./config.js";
import { setLogLevel, logger } from "./app/logger.js";
import { createCommandService } from "./app/command-service.js";
import { createPromptService } from "./app/prompt-service.js";
import { createRestartService, notifyRestartReadyIfNeeded, signalRestartReadyIfNeeded } from "./app/restart.js";
import { createMessageRouter } from "./app/router.js";
import { createRuntimeStateStore, type RuntimeStateStore } from "./app/state.js";
import { createCronRunner } from "./cron/runner.js";
import { createDeferredCronRunService } from "./cron/deferred-run.js";
import { createCronService, type CronService } from "./cron/service.js";
import { createCronStore } from "./cron/store.js";
import { ensureDir } from "./storage/files.js";
import { createFeishuConnection } from "./feishu/client.js";
import {
  createFeishuSenderNameResolver,
  type FeishuUserClient,
} from "./feishu/user-context.js";
import {
  createFeishuDocsService,
  type FeishuDocsClient,
} from "./feishu/doc-service.js";
import { createFeishuMessageReader, type FeishuMessageClient } from "./feishu/inbound/message.js";
import { createFeishuResourceDownloader, type FeishuResourceClient } from "./feishu/inbound/resource.js";
import { createFeishuMessenger, type FeishuApiClient } from "./feishu/send.js";
import { createFeishuChoiceInteractionStore } from "./feishu/choice-interactions.js";
import { buildFeishuChoiceActionToast, parseFeishuChoiceCardAction } from "./feishu/choice-card.js";
import { createAskUserChoiceExtension } from "./pi/extensions/ask-user-choice.js";
import { createFeishuDocsExtension } from "./pi/extensions/feishu-docs.js";
import { createFeishuFilesExtension } from "./pi/extensions/feishu-files.js";
import { createFeishuMessageExtension } from "./pi/extensions/feishu-message.js";
import { createCronTaskExtension } from "./pi/extensions/cron-task.js";
import { createSkillStatsExtension } from "./pi/extensions/skill-stats.js";
import { createModelRouter } from "./pi/model-routing.js";
import { findAvailableModel, listAvailableModels } from "./pi/models.js";
import { createPiRuntime, type PiRuntime } from "./pi/runtime.js";
import { createSessionService, type SessionService } from "./pi/sessions.js";
import { createSkillStatsStore } from "./pi/skill-stats.js";
import { createPromptRunner } from "./pi/stream.js";
import { setQuotedMessageDataDir } from "./storage/quoted-messages.js";
import { createConversationStateStore } from "./storage/conversations.js";
import { createGroupSettingsStore } from "./storage/group-settings.js";
import { createUserStateStore } from "./storage/users.js";
import { createWorkspaceService } from "./pi/workspace.js";
import { createRuntimeConfigStore } from "./app/runtime-config.js";
import { createAdminServer, type AdminServer } from "./admin/server.js";
import { createAdminTargetService } from "./admin/targets.js";
import { createAdminCommandExecutor, type AdminCaptureMessenger } from "./admin/command-executor.js";
import { createAdminPageDataService } from "./admin/page-data.js";

async function main() {
  const config = loadConfig();
  setLogLevel(config.LOG_LEVEL);

  logger.info("配置加载成功", {
    feishuDomain: config.FEISHU_DOMAIN,
    dataDir: config.DATA_DIR,
    workspaceRoot: config.PI_WORKSPACE_ROOT,
    disableGlobalAgents: config.PI_DISABLE_GLOBAL_AGENTS,
    gatewayAgentsFile: config.PI_GATEWAY_AGENTS_FILE,
    logLevel: config.LOG_LEVEL,
    processingReactionEnabled: Boolean(config.FEISHU_PROCESSING_REACTION_TYPE),
    steeringReactionEnabled: Boolean(config.FEISHU_STEERING_REACTION_TYPE),
    cronEnabled: config.CRON_ENABLED,
    cronDefaultTz: config.CRON_DEFAULT_TZ,
  });

  await ensureDir(config.DATA_DIR);
  logger.info("数据目录就绪", { dataDir: config.DATA_DIR });
  setQuotedMessageDataDir(config.DATA_DIR);

  await ensureDir(config.PI_WORKSPACE_ROOT);
  logger.info("Workspace 根目录就绪", { workspaceRoot: config.PI_WORKSPACE_ROOT });

  const runtimeState = createRuntimeStateStore();
  const runtimeConfig = createRuntimeConfigStore(config);
  const userStateStore = createUserStateStore(config.DATA_DIR);
  const conversationStateStore = createConversationStateStore(config.DATA_DIR);
  const groupSettingsStore = createGroupSettingsStore(config.DATA_DIR);
  const workspaceService = createWorkspaceService(config.PI_WORKSPACE_ROOT);
  const skillStatsStore = createSkillStatsStore(config.DATA_DIR);

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
  const resolveFeishuSenderName = createFeishuSenderNameResolver(
    feishuConnection.client as unknown as FeishuUserClient,
  );
  const choiceInteractionStore = createFeishuChoiceInteractionStore();

  let cronService: CronService | null = null;
  const deferredCronRunService = createDeferredCronRunService({
    getCronService: () => cronService,
    runtimeState,
    messenger: feishuMessenger,
  });
  let piRuntime: PiRuntime;
  try {
    piRuntime = createPiRuntime({
      disableGlobalAgents: config.PI_DISABLE_GLOBAL_AGENTS,
      gatewayAgentsFile: config.PI_GATEWAY_AGENTS_FILE,
      extensionFactories: [
        createAskUserChoiceExtension(feishuMessenger, choiceInteractionStore),
        createFeishuDocsExtension(feishuDocsService),
        createFeishuFilesExtension(feishuMessenger),
        createFeishuMessageExtension(feishuMessenger),
        createSkillStatsExtension(skillStatsStore),
        ...(config.CRON_ENABLED
          ? [
              createCronTaskExtension(() => cronService, undefined, () => deferredCronRunService),
            ]
          : []),
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
  if (config.CRON_ENABLED) {
    const cronStore = createCronStore(config.DATA_DIR);
    const cronRunner = createCronRunner({
      config,
      runtime: piRuntime,
      runtimeState,
      workspaceService,
      promptRunner,
      messenger: feishuMessenger,
      deferredCronRunService,
    });
    cronService = createCronService({
      store: cronStore,
      runner: cronRunner,
      defaultTz: config.CRON_DEFAULT_TZ,
      enabled: config.CRON_ENABLED,
    });
    await cronService.start();
  }
  const sessionService = createSessionService({
    runtime: piRuntime,
    userStateStore,
    conversationStateStore,
    workspaceService,
  });
  const restartService = createRestartService();
  const createCommandServiceWithMessenger = (messenger: AdminCaptureMessenger | typeof feishuMessenger) => createCommandService({
    config,
    messenger,
    sessionService,
    userStateStore,
    workspaceService,
    runtimeState,
    restartService,
    listAvailableModels: () => listAvailableModels(piRuntime.getModelRegistry()),
    findAvailableModel: (rawRef: string) => findAvailableModel(rawRef, piRuntime.getModelRegistry()),
    cronService: cronService ?? undefined,
    deferredCronRunService,
    runtimeConfig,
    skillStatsStore,
    groupSettingsStore,
  });
  const commandService = createCommandServiceWithMessenger(feishuMessenger);
  const promptService = createPromptService({
    config,
    runtimeConfig,
    runtimeState,
    sessionService,
    userStateStore,
    workspaceService,
    promptRunner,
    messenger: {
      sendTextMessage: (...args) => feishuMessenger.sendTextMessage(...args),
      sendTextMessageToTarget: (...args) => feishuMessenger.sendTextMessageToTarget(...args),
      addProcessingReaction: (...args) => feishuMessenger.addProcessingReaction(...args),
    },
    downloadResource: feishuResourceDownloader,
    readQuotedMessage: feishuMessageReader,
    resolveSenderName: async (identity) => resolveFeishuSenderName(identity),
    modelRouter: createModelRouter({ registry: piRuntime.getModelRegistry() }),
    deferredCronRunService,
  });
  const router = createMessageRouter({
    stateStore: runtimeState,
    commandService,
    promptService,
    config,
    groupSettingsStore,
    runtimeConfig,
  });
  logger.info("消息路由就绪");

  const adminTargets = createAdminTargetService(config);
  const adminCommandExecutor = createAdminCommandExecutor({
    config,
    messenger: feishuMessenger,
    createCommandService: (messenger) => createCommandServiceWithMessenger(messenger),
  });
  const adminPages = createAdminPageDataService({
    targets: adminTargets,
    sessionService,
    runtimeState,
    listAvailableModels: () => listAvailableModels(piRuntime.getModelRegistry()),
  });
  const adminServer = createAdminServer(config, {
    targets: adminTargets,
    commands: adminCommandExecutor,
    pages: adminPages,
  });
  await adminServer.start();

  registerShutdown(sessionService, runtimeState, cronService, adminServer);

  try {
    await feishuConnection.startMessageConnection(router.handleFeishuMessage, async (data) => {
      const action = parseFeishuChoiceCardAction(data);
      if (!action) return undefined;
      try {
        return choiceInteractionStore.handleCardAction(action);
      } catch (err) {
        logger.error("飞书选择卡片回调处理失败", { error: String(err) });
        return buildFeishuChoiceActionToast("error", "选择处理失败，请稍后重试。");
      }
    });
    await signalRestartReadyIfNeeded();
    await notifyRestartReadyIfNeeded(config.DATA_DIR, feishuMessenger);
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

function registerShutdown(
  sessionService: Pick<SessionService, "disposeAllSessions">,
  runtimeState: Pick<RuntimeStateStore, "clearAllState">,
  cronService?: Pick<CronService, "stop"> | null,
  adminServer?: Pick<AdminServer, "stop"> | null,
) {
  let shuttingDown = false;

  const shutdown = async (signal: string) => {
    if (shuttingDown) return;
    shuttingDown = true;
    logger.info(`收到 ${signal}，开始优雅关停...`);

    try {
      await adminServer?.stop?.();
      await cronService?.stop?.();
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
