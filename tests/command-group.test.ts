import { describe, expect, it, vi } from "vitest";
import { createCommandService } from "../src/app/command-service.js";
import { createRuntimeConfigStore } from "../src/app/runtime-config.js";

const groupTarget = {
  kind: "group",
  key: "oc_1",
  receiveIdType: "chat_id",
  receiveId: "oc_1",
  chatId: "oc_1",
} as const;

function createDeps() {
  const messenger = {
    sendRenderedMessage: vi.fn().mockResolvedValue(undefined),
    sendTextMessage: vi.fn().mockResolvedValue(undefined),
    sendRenderedMessageToTarget: vi.fn().mockResolvedValue(undefined),
    sendTextMessageToTarget: vi.fn().mockResolvedValue(undefined),
  };
  const runtimeConfig = createRuntimeConfigStore({
    FEISHU_GROUP_CHAT_POLICY: "allowlist",
    FEISHU_GROUP_CHAT_ALLOWLIST: ["oc_1"],
    FEISHU_GROUP_MESSAGE_MODE: "keyword",
    FEISHU_GROUP_MESSAGE_KEYWORDS: ["日报", "Pi"],
  });
  const service = createCommandService({
    config: {
      TEXT_CHUNK_LIMIT: 2000,
      CRON_DEFAULT_TZ: "Asia/Shanghai",
      FEISHU_AUDIO_TRANSCRIBE_DOUBAO_API_KEY: "",
      DATA_DIR: "/tmp/pi-gateway-data",
    },
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
    runtimeConfig,
  };
}

describe("command service group", () => {
  it("`/group` 会返回当前群聊设置", async () => {
    const { service, messenger } = createDeps();

    await service.handleBridgeCommand(
      { openId: "ou_1", userId: "u_1" },
      { name: "group", args: "" },
      groupTarget,
    );

    expect(messenger.sendRenderedMessageToTarget).toHaveBeenCalledWith(
      groupTarget,
      "👥 群聊设置\n" +
        "群聊开关：allowlist\n" +
        "触发方式：keyword\n" +
        "白名单：1 个\n" +
        "关键词：日报 Pi\n" +
        "当前群：oc_1（已在白名单）\n" +
        "\n" +
        "查看白名单：/group allowlist show\n" +
        "查看关键词：/group keywords show",
      2000,
    );
  });

  it("`/group allowlist add here` 会把当前群加入白名单", async () => {
    const { service, messenger, runtimeConfig } = createDeps();
    runtimeConfig.setGroupChatAllowlist([]);

    await service.handleBridgeCommand(
      { openId: "ou_1", userId: "u_1" },
      { name: "group", args: "allowlist add here" },
      groupTarget,
    );

    expect(runtimeConfig.getGroupChatAllowlist()).toEqual(["oc_1"]);
    expect(messenger.sendRenderedMessageToTarget).toHaveBeenCalledWith(
      groupTarget,
      "✅ 已加入群白名单：oc_1\n" +
        "\n" +
        "📋 群白名单（1）\n" +
        "1. oc_1\n" +
        "\n" +
        "当前群：oc_1（已在白名单）\n" +
        "\n" +
        "添加：/group allowlist add here|<chat_id...>\n" +
        "移除：/group allowlist remove here|<chat_id...>",
      2000,
    );
  });

  it("私聊里用 `here` 改白名单时会明确报错", async () => {
    const { service, messenger } = createDeps();

    await service.handleBridgeCommand(
      { openId: "ou_1", userId: "u_1" },
      { name: "group", args: "allowlist add here" },
    );

    expect(messenger.sendTextMessage).toHaveBeenCalledWith(
      "ou_1",
      "这里只有在群里用才知道当前 chat_id；私聊里请改成 /group allowlist add <chat_id> 或 /group allowlist remove <chat_id>。",
    );
  });

  it("`/group mode keyword` 在没配关键词时会给出明确提醒", async () => {
    const { service, messenger, runtimeConfig } = createDeps();
    runtimeConfig.setGroupMessageKeywords([]);

    await service.handleBridgeCommand(
      { openId: "ou_1", userId: "u_1" },
      { name: "group", args: "mode keyword" },
      groupTarget,
    );

    expect(runtimeConfig.getGroupMessageMode()).toBe("keyword");
    expect(messenger.sendRenderedMessageToTarget).toHaveBeenCalledWith(
      groupTarget,
      "✅ 已切换群消息触发方式：keyword\n" +
        "\n" +
        "👥 群聊设置\n" +
        "群聊开关：allowlist\n" +
        "触发方式：keyword\n" +
        "白名单：1 个\n" +
        "关键词：（无）\n" +
        "当前群：oc_1（已在白名单）\n" +
        "\n" +
        "提醒：当前是 keyword，但还没设关键词，群消息会继续被忽略。\n" +
        "\n" +
        "查看白名单：/group allowlist show\n" +
        "查看关键词：/group keywords show",
      2000,
    );
  });

  it("`/group keywords clear` 会清空关键词", async () => {
    const { service, messenger, runtimeConfig } = createDeps();

    await service.handleBridgeCommand(
      { openId: "ou_1", userId: "u_1" },
      { name: "group", args: "keywords clear" },
      groupTarget,
    );

    expect(runtimeConfig.getGroupMessageKeywords()).toEqual([]);
    expect(messenger.sendRenderedMessageToTarget).toHaveBeenCalledWith(
      groupTarget,
      "✅ 已清空群关键词。\n" +
        "\n" +
        "🏷️ 群关键词（0）\n" +
        "（空）\n" +
        "\n" +
        "设置：/group keywords set <关键词...>\n" +
        "清空：/group keywords clear",
      2000,
    );
  });

  it("`/group keywords set \"pi\"` 不应把引号存进关键词", async () => {
    const { service, messenger, runtimeConfig } = createDeps();

    await service.handleBridgeCommand(
      { openId: "ou_1", userId: "u_1" },
      { name: "group", args: 'keywords set "pi"' },
      groupTarget,
    );

    expect(runtimeConfig.getGroupMessageKeywords()).toEqual(["pi"]);
    expect(messenger.sendRenderedMessageToTarget).toHaveBeenCalledWith(
      groupTarget,
      "✅ 已更新群关键词：pi\n" +
        "\n" +
        "🏷️ 群关键词（1）\n" +
        "pi\n" +
        "\n" +
        "设置：/group keywords set <关键词...>\n" +
        "清空：/group keywords clear",
      2000,
    );
  });

  it("`/group keywords set 日报 \"pi hi\"` 应把整段引号内容当一条关键词", async () => {
    const { service, messenger, runtimeConfig } = createDeps();

    await service.handleBridgeCommand(
      { openId: "ou_1", userId: "u_1" },
      { name: "group", args: 'keywords set 日报 "pi hi"' },
      groupTarget,
    );

    expect(runtimeConfig.getGroupMessageKeywords()).toEqual(["日报", "pi hi"]);
    expect(messenger.sendRenderedMessageToTarget).toHaveBeenCalledWith(
      groupTarget,
      "✅ 已更新群关键词：日报 \"pi hi\"\n" +
        "\n" +
        "🏷️ 群关键词（2）\n" +
        "日报 \"pi hi\"\n" +
        "\n" +
        "设置：/group keywords set <关键词...>\n" +
        "清空：/group keywords clear",
      2000,
    );
  });
});
