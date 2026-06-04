import type { ConversationTarget } from "../../conversation.js";
import type { PersistedGroupRoutingConfig } from "../../storage/group-settings.js";
import type { GroupUnmatchedMessageStore } from "../../storage/group-unmatched-messages.js";
import type { UserIdentity } from "../../types.js";
import { isSuperAdminOpenId } from "../access-control.js";
import type { BridgeCommand } from "../commands.js";
import { dedupeToolNames, getCurrentGroupChatId } from "./helpers.js";
import { parseGroupArgs } from "./parsers.js";
import {
  formatGroupAllowlistReply,
  formatGroupKeywordForDisplay,
  formatGroupKeywordsReply,
  formatGroupSettingsForReply,
  formatGroupSettingsReply,
} from "./replies.js";

type CommandReplySender = (
  identity: UserIdentity,
  conversationTarget: ConversationTarget | undefined,
  text: string,
) => Promise<void>;

interface GroupCommandHandlerDeps {
  isRuntimeConfigAvailable(): boolean;
  readEffectiveGlobalGroupRoutingConfig(): Promise<PersistedGroupRoutingConfig>;
  writeEffectiveGlobalGroupRoutingConfig(config: PersistedGroupRoutingConfig): Promise<void>;
  readEffectiveGroupRoutingConfig(chatId?: string): Promise<PersistedGroupRoutingConfig>;
  writeEffectiveGroupRoutingConfig(chatId: string | undefined, config: PersistedGroupRoutingConfig): Promise<void>;
  groupUnmatchedMessageStore?: Pick<GroupUnmatchedMessageStore, "clear" | "count">;
  sendTextReply: CommandReplySender;
  sendCommandReply: CommandReplySender;
}

export function createGroupCommandHandler(deps: GroupCommandHandlerDeps) {
  return async function handleGroupCommand(
    identity: UserIdentity,
    command: BridgeCommand,
    conversationTarget?: ConversationTarget,
  ): Promise<void> {
    if (!deps.isRuntimeConfigAvailable()) {
      await deps.sendTextReply(identity, conversationTarget, "当前环境不支持这个命令。");
      return;
    }

    const currentChatId = getCurrentGroupChatId(conversationTarget);
    const parsed = parseGroupArgs(command.args, { allowAllowlist: !currentChatId });
    if (parsed.error) {
      await deps.sendTextReply(identity, conversationTarget, parsed.error);
      return;
    }

    if (parsed.kind === "show-allowlist") {
      if (!isSuperAdminOpenId(identity.openId)) {
        await deps.sendTextReply(identity, conversationTarget, "这个命令只有 super admin 可以使用。");
        return;
      }

      const settings = await deps.readEffectiveGlobalGroupRoutingConfig();
      await deps.sendCommandReply(
        identity,
        conversationTarget,
        formatGroupAllowlistReply(settings.FEISHU_GROUP_CHAT_ALLOWLIST),
      );
      return;
    }

    if (parsed.kind === "edit-allowlist") {
      if (!isSuperAdminOpenId(identity.openId)) {
        await deps.sendTextReply(identity, conversationTarget, "这个命令只有 super admin 可以使用。");
        return;
      }
      if (parsed.targets.some((target) => target.toLowerCase() === "here")) {
        await deps.sendTextReply(identity, conversationTarget, "请填写群 chat_id，例如 /group allowlist add oc_xxx。");
        return;
      }

      const settings = await deps.readEffectiveGlobalGroupRoutingConfig();
      const chatIds = dedupeToolNames(parsed.targets);
      const currentAllowlist = [...settings.FEISHU_GROUP_CHAT_ALLOWLIST];
      const currentAllowlistSet = new Set(currentAllowlist);
      const changedChatIds = parsed.action === "add"
        ? chatIds.filter((chatId) => !currentAllowlistSet.has(chatId))
        : chatIds.filter((chatId) => currentAllowlistSet.has(chatId));

      if (parsed.action === "add") {
        settings.FEISHU_GROUP_CHAT_ALLOWLIST = dedupeToolNames([...currentAllowlist, ...chatIds]);
      } else {
        const removedChatIds = new Set(chatIds);
        settings.FEISHU_GROUP_CHAT_ALLOWLIST = currentAllowlist.filter((chatId) => !removedChatIds.has(chatId));
      }
      await deps.writeEffectiveGlobalGroupRoutingConfig(settings);

      const summary = changedChatIds.length > 0
        ? `✅ 已${parsed.action === "add" ? "加入" : "移出"}群白名单：${changedChatIds.join(", ")}`
        : parsed.action === "add"
          ? `这些群本来就在白名单里：${chatIds.join(", ")}`
          : `这些群本来就不在白名单里：${chatIds.join(", ")}`;
      await deps.sendCommandReply(
        identity,
        conversationTarget,
        formatGroupAllowlistReply(settings.FEISHU_GROUP_CHAT_ALLOWLIST, summary),
      );
      return;
    }

    if (!currentChatId) {
      await deps.sendTextReply(identity, conversationTarget, "群聊设置请到目标群里使用；群白名单请用 /group allowlist show|add|remove。");
      return;
    }

    const settings = await deps.readEffectiveGroupRoutingConfig(currentChatId);
    if (parsed.kind === "show") {
      await deps.sendCommandReply(
        identity,
        conversationTarget,
        formatGroupSettingsReply(
          formatGroupSettingsForReply(settings),
          currentChatId,
          undefined,
        ),
      );
      return;
    }

    if (parsed.kind === "set-policy") {
      settings.FEISHU_GROUP_CHAT_POLICY = parsed.policy;
      await deps.writeEffectiveGroupRoutingConfig(currentChatId, settings);
      await deps.sendCommandReply(
        identity,
        conversationTarget,
        formatGroupSettingsReply(
          formatGroupSettingsForReply(settings),
          currentChatId,
          `✅ 已切换群聊开关：${parsed.policy}`,
        ),
      );
      return;
    }

    if (parsed.kind === "set-mode") {
      settings.FEISHU_GROUP_MESSAGE_MODE = parsed.mode;
      await deps.writeEffectiveGroupRoutingConfig(currentChatId, settings);
      await deps.sendCommandReply(
        identity,
        conversationTarget,
        formatGroupSettingsReply(
          formatGroupSettingsForReply(settings),
          currentChatId,
          `✅ 已切换群消息触发方式：${parsed.mode}`,
        ),
      );
      return;
    }

    if (parsed.kind === "set-unmatched") {
      settings.FEISHU_GROUP_UNMATCHED_MESSAGE_POLICY = parsed.policy;
      await deps.writeEffectiveGroupRoutingConfig(currentChatId, settings);
      if (parsed.policy === "ignore" && currentChatId) {
        await deps.groupUnmatchedMessageStore?.clear(currentChatId);
      }
      await deps.sendCommandReply(
        identity,
        conversationTarget,
        formatGroupSettingsReply(
          formatGroupSettingsForReply(settings),
          currentChatId,
          parsed.policy === "capture"
            ? "✅ 已开启未触发群消息暂存。"
            : "✅ 已关闭未触发群消息暂存，未 @/未命中关键词的消息会按现有逻辑忽略。",
        ),
      );
      return;
    }

    if (parsed.kind === "show-unmatched") {
      const count = currentChatId
        ? await deps.groupUnmatchedMessageStore?.count(currentChatId) ?? 0
        : 0;
      await deps.sendCommandReply(
        identity,
        conversationTarget,
        `未触发消息：${settings.FEISHU_GROUP_UNMATCHED_MESSAGE_POLICY}\n已暂存：${count} 条\n\n设置：/group unmatched capture|ignore`,
      );
      return;
    }

    if (parsed.kind === "clear-unmatched") {
      if (currentChatId) {
        await deps.groupUnmatchedMessageStore?.clear(currentChatId);
      }
      await deps.sendCommandReply(identity, conversationTarget, "✅ 已清空暂存的未触发群消息。");
      return;
    }

    if (parsed.kind === "show-keywords") {
      await deps.sendCommandReply(
        identity,
        conversationTarget,
        formatGroupKeywordsReply(settings.FEISHU_GROUP_MESSAGE_KEYWORDS),
      );
      return;
    }

    if (parsed.kind === "set-keywords") {
      settings.FEISHU_GROUP_MESSAGE_KEYWORDS = dedupeToolNames(parsed.keywords);
      await deps.writeEffectiveGroupRoutingConfig(currentChatId, settings);
      await deps.sendCommandReply(
        identity,
        conversationTarget,
        formatGroupKeywordsReply(
          settings.FEISHU_GROUP_MESSAGE_KEYWORDS,
          `✅ 已更新群关键词：${settings.FEISHU_GROUP_MESSAGE_KEYWORDS.map(formatGroupKeywordForDisplay).join(" ")}`,
        ),
      );
      return;
    }

    settings.FEISHU_GROUP_MESSAGE_KEYWORDS = [];
    await deps.writeEffectiveGroupRoutingConfig(currentChatId, settings);
    await deps.sendCommandReply(
      identity,
      conversationTarget,
      formatGroupKeywordsReply([], "✅ 已清空群关键词。"),
    );
  };
}
