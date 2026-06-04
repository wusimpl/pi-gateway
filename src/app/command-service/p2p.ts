import type { ConversationTarget } from "../../conversation.js";
import type { PersistedP2PRoutingConfig } from "../../storage/p2p-settings.js";
import type { UserIdentity } from "../../types.js";
import { isSuperAdminOpenId } from "../access-control.js";
import type { BridgeCommand } from "../commands.js";
import { dedupeToolNames } from "./helpers.js";
import { parseP2PArgs } from "./parsers.js";
import {
  formatP2PAllowlistReply,
  formatP2PSettingsReply,
} from "./replies.js";

type CommandReplySender = (
  identity: UserIdentity,
  conversationTarget: ConversationTarget | undefined,
  text: string,
) => Promise<void>;

interface P2PCommandHandlerDeps {
  readEffectiveP2PRoutingConfig(): Promise<PersistedP2PRoutingConfig>;
  writeEffectiveP2PRoutingConfig(config: PersistedP2PRoutingConfig): Promise<void>;
  sendTextReply: CommandReplySender;
  sendCommandReply: CommandReplySender;
}

export function createP2PCommandHandler(deps: P2PCommandHandlerDeps) {
  return async function handleP2PCommand(
    identity: UserIdentity,
    command: BridgeCommand,
    conversationTarget?: ConversationTarget,
  ): Promise<void> {
    if (conversationTarget && conversationTarget.kind !== "p2p") {
      await deps.sendTextReply(identity, conversationTarget, "请在私聊里使用 /p2p。");
      return;
    }

    if (!isSuperAdminOpenId(identity.openId)) {
      await deps.sendTextReply(identity, conversationTarget, "这个命令只有 super admin 可以使用。");
      return;
    }

    const parsed = parseP2PArgs(command.args);
    if (parsed.error) {
      await deps.sendTextReply(identity, conversationTarget, parsed.error);
      return;
    }

    const settings = await deps.readEffectiveP2PRoutingConfig();
    if (parsed.kind === "show") {
      await deps.sendCommandReply(identity, conversationTarget, formatP2PSettingsReply(settings));
      return;
    }

    if (parsed.kind === "set-policy") {
      settings.FEISHU_P2P_CHAT_POLICY = parsed.policy;
      await deps.writeEffectiveP2PRoutingConfig(settings);
      await deps.sendCommandReply(
        identity,
        conversationTarget,
        formatP2PSettingsReply(settings, `✅ 已切换私聊策略：${parsed.policy}`),
      );
      return;
    }

    if (parsed.kind === "show-allowlist") {
      await deps.sendCommandReply(identity, conversationTarget, formatP2PAllowlistReply(settings.FEISHU_P2P_CHAT_ALLOWLIST));
      return;
    }

    if (parsed.kind !== "edit-allowlist") {
      await deps.sendTextReply(identity, conversationTarget, "p2p 参数解析失败。");
      return;
    }

    const openIds = dedupeToolNames(parsed.openIds);
    const currentAllowlist = [...settings.FEISHU_P2P_CHAT_ALLOWLIST];
    const currentAllowlistSet = new Set(currentAllowlist);
    const changedOpenIds = parsed.action === "add"
      ? openIds.filter((openId) => !currentAllowlistSet.has(openId))
      : openIds.filter((openId) => currentAllowlistSet.has(openId));

    if (parsed.action === "add") {
      settings.FEISHU_P2P_CHAT_ALLOWLIST = dedupeToolNames([...currentAllowlist, ...openIds]);
    } else {
      const removedOpenIds = new Set(openIds);
      settings.FEISHU_P2P_CHAT_ALLOWLIST = currentAllowlist.filter((openId) => !removedOpenIds.has(openId));
    }
    await deps.writeEffectiveP2PRoutingConfig(settings);

    const summary = changedOpenIds.length > 0
      ? `✅ 已${parsed.action === "add" ? "加入" : "移出"}私聊白名单：${changedOpenIds.join(", ")}`
      : parsed.action === "add"
        ? `这些用户本来就在私聊白名单里：${openIds.join(", ")}`
        : `这些用户本来就不在私聊白名单里：${openIds.join(", ")}`;
    await deps.sendCommandReply(
      identity,
      conversationTarget,
      formatP2PAllowlistReply(settings.FEISHU_P2P_CHAT_ALLOWLIST, summary),
    );
  };
}
