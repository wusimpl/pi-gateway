import { describe, expect, it, vi } from "vitest";
import { createCommandService } from "../src/app/command-service.js";
import { createRuntimeConfigStore } from "../src/app/runtime-config.js";
import { SUPER_ADMIN_OPEN_ID } from "../src/app/access-control.js";

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
        "未触发消息：ignore\n" +
        "关键词：日报 Pi\n" +
        "当前群：oc_1\n" +
        "\n" +
        "切换群聊开关：/group policy disabled|allowlist|open\n" +
        "查看关键词：/group keywords show\n" +
        "设置未触发消息：/group unmatched capture|ignore",
      2000,
    );
  });

  it("群聊里不处理 `/group allowlist`", async () => {
    const { service, messenger, runtimeConfig } = createDeps();
    runtimeConfig.setGroupChatAllowlist([]);

    await service.handleBridgeCommand(
      { openId: "ou_1", userId: "u_1" },
      { name: "group", args: "allowlist add here" },
      groupTarget,
    );

    expect(runtimeConfig.getGroupChatAllowlist()).toEqual([]);
    expect(messenger.sendTextMessageToTarget).toHaveBeenCalledWith(
      groupTarget,
      "用法：/group\n" +
        "/group policy disabled|allowlist|open\n" +
        "/group mode mention|all|keyword\n" +
        "/group unmatched capture|ignore\n" +
        "/group unmatched show\n" +
        "/group unmatched clear\n" +
        "/group keywords show\n" +
        "/group keywords set <关键词...>\n" +
        "/group keywords clear",
    );
  });

  it("super admin 可以在私聊里用 `/group allowlist` 管理群白名单", async () => {
    const { service, messenger, runtimeConfig } = createDeps();
    runtimeConfig.setGroupChatAllowlist([]);

    await service.handleBridgeCommand(
      { openId: SUPER_ADMIN_OPEN_ID },
      { name: "group", args: "allowlist add oc_1 oc_2 oc_2" },
    );

    expect(runtimeConfig.getGroupChatAllowlist()).toEqual(["oc_1", "oc_2"]);
    expect(messenger.sendRenderedMessage).toHaveBeenCalledWith(
      SUPER_ADMIN_OPEN_ID,
      "✅ 已加入群白名单：oc_1, oc_2\n" +
        "\n" +
        "📋 群白名单（2）\n" +
        "1. oc_1\n" +
        "2. oc_2\n" +
        "\n" +
        "添加：/group allowlist add <chat_id...>\n" +
        "移除：/group allowlist remove <chat_id...>",
      2000,
    );
  });

  it("私聊里用 `here` 改群白名单时会明确报错", async () => {
    const { service, messenger } = createDeps();

    await service.handleBridgeCommand(
      { openId: SUPER_ADMIN_OPEN_ID },
      { name: "group", args: "allowlist add here" },
    );

    expect(messenger.sendTextMessage).toHaveBeenCalledWith(
      SUPER_ADMIN_OPEN_ID,
      "请填写群 chat_id，例如 /group allowlist add oc_xxx。",
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
        "未触发消息：ignore\n" +
        "关键词：（无）\n" +
        "当前群：oc_1\n" +
        "\n" +
        "提醒：还没设置关键词，普通消息不会触发；@ 机器人仍可使用。\n" +
        "\n" +
        "切换群聊开关：/group policy disabled|allowlist|open\n" +
        "查看关键词：/group keywords show\n" +
        "设置未触发消息：/group unmatched capture|ignore",
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
