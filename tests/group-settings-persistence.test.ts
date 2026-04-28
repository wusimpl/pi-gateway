import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createCommandService } from "../src/app/command-service.js";
import { createMessageRouter } from "../src/app/router.js";
import { createRuntimeConfigStore } from "../src/app/runtime-config.js";
import { createGroupSettingsStore } from "../src/storage/group-settings.js";

const groupTargetA = {
  kind: "group",
  key: "oc_1",
  receiveIdType: "chat_id",
  receiveId: "oc_1",
  chatId: "oc_1",
} as const;

const groupTargetB = {
  kind: "group",
  key: "oc_2",
  receiveIdType: "chat_id",
  receiveId: "oc_2",
  chatId: "oc_2",
} as const;

const baseRoutingDefaults = {
  FEISHU_GROUP_CHAT_POLICY: "disabled" as const,
  FEISHU_GROUP_CHAT_ALLOWLIST: [],
  FEISHU_GROUP_MESSAGE_MODE: "mention" as const,
  FEISHU_GROUP_MESSAGE_KEYWORDS: [],
};

const tempDirs: string[] = [];

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

async function createTempDataDir(): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), "pi-gateway-group-settings-"));
  tempDirs.push(dir);
  return dir;
}

function createCommandDeps(dataDir: string) {
  const messenger = {
    sendRenderedMessage: vi.fn().mockResolvedValue(undefined),
    sendTextMessage: vi.fn().mockResolvedValue(undefined),
    sendRenderedMessageToTarget: vi.fn().mockResolvedValue(undefined),
    sendTextMessageToTarget: vi.fn().mockResolvedValue(undefined),
  };
  const runtimeConfig = createRuntimeConfigStore(baseRoutingDefaults);
  const groupSettingsStore = createGroupSettingsStore(dataDir);
  const service = createCommandService({
    config: {
      TEXT_CHUNK_LIMIT: 2000,
      CRON_DEFAULT_TZ: "Asia/Shanghai",
      FEISHU_AUDIO_TRANSCRIBE_DOUBAO_API_KEY: "",
      DATA_DIR: dataDir,
    },
    groupSettingsStore,
    runtimeConfig,
    messenger,
    sessionService: {
      getOrCreateActiveSession: vi.fn(),
      createNewSession: vi.fn(),
      listSessions: vi.fn(),
      resumeSession: vi.fn(),
    },
    userStateStore: {
      readUserState: vi.fn(),
      writeUserState: vi.fn(),
    },
    workspaceService: {
      getUserWorkspaceDir: vi.fn(),
    },
    runtimeState: {
      isLocked: vi.fn().mockReturnValue(false),
      hasActiveLocks: vi.fn(),
      beginRestartDrain: vi.fn(),
      cancelRestartDrain: vi.fn(),
      requestStop: vi.fn(),
    },
    restartService: {
      restartGateway: vi.fn(),
    },
    listAvailableModels: vi.fn(),
    findAvailableModel: vi.fn(),
  });

  return {
    service,
    messenger,
    groupSettingsStore,
  };
}

describe("group settings persistence", () => {
  it("按群保存时，白名单提示应只展示当前群的用法", async () => {
    const dataDir = await createTempDataDir();
    const { service, messenger } = createCommandDeps(dataDir);

    await service.handleBridgeCommand(
      { openId: "ou_1", userId: "u_1" },
      { name: "group", args: "allowlist add here" },
      groupTargetA,
    );

    expect(messenger.sendRenderedMessageToTarget).toHaveBeenCalledWith(
      groupTargetA,
      "✅ 已加入群白名单：oc_1\n" +
        "\n" +
        "📋 群白名单（1）\n" +
        "1. oc_1\n" +
        "\n" +
        "当前群：oc_1（已在白名单）\n" +
        "\n" +
        "添加：/group allowlist add here\n" +
        "移除：/group allowlist remove here",
      2000,
    );
  });

  it("按群保存时，不应允许跨群改白名单", async () => {
    const dataDir = await createTempDataDir();
    const { service, messenger } = createCommandDeps(dataDir);

    await service.handleBridgeCommand(
      { openId: "ou_1", userId: "u_1" },
      { name: "group", args: "allowlist add oc_2" },
      groupTargetA,
    );

    expect(messenger.sendTextMessageToTarget).toHaveBeenCalledWith(
      groupTargetA,
      "这个设置是按群单独保存的，请到目标群里用 /group allowlist add here 或 /group allowlist remove here。",
    );
  });

  it("每个群应保存并隔离自己的 /group 设置", async () => {
    const dataDir = await createTempDataDir();
    const first = createCommandDeps(dataDir);

    await first.service.handleBridgeCommand(
      { openId: "ou_1", userId: "u_1" },
      { name: "group", args: "policy allowlist" },
      groupTargetA,
    );
    await first.service.handleBridgeCommand(
      { openId: "ou_1", userId: "u_1" },
      { name: "group", args: "allowlist add here" },
      groupTargetA,
    );
    await first.service.handleBridgeCommand(
      { openId: "ou_1", userId: "u_1" },
      { name: "group", args: "mode keyword" },
      groupTargetA,
    );
    await first.service.handleBridgeCommand(
      { openId: "ou_1", userId: "u_1" },
      { name: "group", args: "keywords set pi" },
      groupTargetA,
    );

    const second = createCommandDeps(dataDir);
    await second.service.handleBridgeCommand(
      { openId: "ou_2", userId: "u_2" },
      { name: "group", args: "" },
      groupTargetA,
    );
    await second.service.handleBridgeCommand(
      { openId: "ou_2", userId: "u_2" },
      { name: "group", args: "" },
      groupTargetB,
    );

    expect(second.messenger.sendRenderedMessageToTarget).toHaveBeenNthCalledWith(
      1,
      groupTargetA,
      "👥 群聊设置\n" +
        "群聊开关：allowlist\n" +
        "触发方式：keyword\n" +
        "白名单：1 个\n" +
        "关键词：pi\n" +
        "当前群：oc_1（已在白名单）\n" +
        "\n" +
        "查看白名单：/group allowlist show\n" +
        "查看关键词：/group keywords show",
      2000,
    );
    expect(second.messenger.sendRenderedMessageToTarget).toHaveBeenNthCalledWith(
      2,
      groupTargetB,
      "👥 群聊设置\n" +
        "群聊开关：disabled\n" +
        "触发方式：mention\n" +
        "白名单：0 个\n" +
        "关键词：（无）\n" +
        "当前群：oc_2（未在白名单）\n" +
        "\n" +
        "查看白名单：/group allowlist show\n" +
        "查看关键词：/group keywords show",
      2000,
    );
  });

  it("router 应按当前群自己的持久化设置决定是否触发", async () => {
    const dataDir = await createTempDataDir();
    const groupSettingsStore = createGroupSettingsStore(dataDir);
    await groupSettingsStore.writeGroupRoutingConfig("oc_1", {
      FEISHU_GROUP_CHAT_POLICY: "open",
      FEISHU_GROUP_CHAT_ALLOWLIST: [],
      FEISHU_GROUP_MESSAGE_MODE: "keyword",
      FEISHU_GROUP_MESSAGE_KEYWORDS: ["pi"],
    });

    const promptService = {
      handleUserPrompt: vi.fn().mockResolvedValue(undefined),
      queueRunningPrompt: vi.fn().mockResolvedValue("not_running"),
    };
    const router = createMessageRouter({
      stateStore: { isDuplicate: vi.fn(() => false) },
      commandService: {
        handleBridgeCommand: vi.fn().mockResolvedValue(undefined),
        handleUnsupportedSlashCommand: vi.fn().mockResolvedValue(undefined),
        handleUnauthorizedBridgeCommand: vi.fn().mockResolvedValue(undefined),
      },
      promptService,
      config: {
        ...baseRoutingDefaults,
        FEISHU_OWNER_OPEN_IDS: [],
      },
      groupSettingsStore,
      parseMessageEvent: vi
        .fn()
        .mockReturnValueOnce({
          sender: { senderId: { openId: "ou_1", userId: "u_1", unionId: "on_1" }, senderType: "user", tenantKey: "tk" },
          message: {
            messageId: "om_group_1",
            chatId: "oc_1",
            chatType: "group",
            messageType: "text",
            content: '{"text":"pi hi"}',
            createTime: "123",
          },
        })
        .mockReturnValueOnce({
          sender: { senderId: { openId: "ou_2", userId: "u_2", unionId: "on_2" }, senderType: "user", tenantKey: "tk" },
          message: {
            messageId: "om_group_2",
            chatId: "oc_2",
            chatType: "group",
            messageType: "text",
            content: '{"text":"pi hi"}',
            createTime: "123",
          },
        }),
      normalizeFeishuInboundMessage: vi
        .fn()
        .mockReturnValueOnce({
          kind: "text",
          identity: { openId: "ou_1", userId: "u_1" },
          conversationTarget: groupTargetA,
          messageId: "om_group_1",
          messageType: "text",
          createTime: "123",
          rawContent: '{"text":"pi hi"}',
          text: "pi hi",
        })
        .mockReturnValueOnce({
          kind: "text",
          identity: { openId: "ou_2", userId: "u_2" },
          conversationTarget: groupTargetB,
          messageId: "om_group_2",
          messageType: "text",
          createTime: "123",
          rawContent: '{"text":"pi hi"}',
          text: "pi hi",
        }),
    } as any);

    await router.handleFeishuMessage({});
    await router.handleFeishuMessage({});

    expect(promptService.handleUserPrompt).toHaveBeenCalledTimes(1);
    expect(promptService.handleUserPrompt).toHaveBeenCalledWith(
      { openId: "ou_1", userId: "u_1" },
      expect.objectContaining({ conversationTarget: groupTargetA }),
    );
  });
});
