import type { ConversationTarget } from "../../conversation.js";
import type { UserIdentity } from "../../types.js";
import { isSuperAdminOpenId } from "../access-control.js";
import type { BridgeCommand } from "../commands.js";

type CommandReplySender = (
  identity: UserIdentity,
  conversationTarget: ConversationTarget | undefined,
  text: string,
) => Promise<void>;

interface AdminCommandHandlerDeps {
  readAdminOpenIds(): Promise<string[]>;
  writeAdminOpenIds(openIds: string[]): Promise<void>;
  sendTextReply: CommandReplySender;
  sendCommandReply: CommandReplySender;
}

function parseAdminArgs(args: string): {
  kind: "list" | "add" | "remove" | "error";
  error?: string;
  openIds?: string[];
} {
  const trimmed = args.trim();
  if (!trimmed) {
    return { kind: "list" };
  }

  const parts = trimmed.split(/\s+/);
  const action = parts[0]?.toLowerCase();
  if (action === "list") {
    return { kind: "list" };
  }

  if (action === "add" || action === "remove") {
    const openIds = parts.slice(1).filter(Boolean);
    if (openIds.length === 0) {
      return { kind: "error", error: `用法：/admin ${action} <open_id...>` };
    }
    return { kind: action, openIds };
  }

  return { kind: "error", error: "用法：/admin [add|remove|list]" };
}

export function createAdminCommandHandler(deps: AdminCommandHandlerDeps) {
  return async function handleAdminCommand(
    identity: UserIdentity,
    command: BridgeCommand,
    conversationTarget?: ConversationTarget,
  ): Promise<void> {
    if (conversationTarget && conversationTarget.kind !== "p2p") {
      await deps.sendTextReply(identity, conversationTarget, "请在私聊里使用 /admin。");
      return;
    }

    if (!isSuperAdminOpenId(identity.openId)) {
      await deps.sendTextReply(identity, conversationTarget, "这个命令只有 super admin 可以使用。");
      return;
    }

    const parsed = parseAdminArgs(command.args);
    if (parsed.kind === "error") {
      await deps.sendTextReply(identity, conversationTarget, parsed.error ?? "参数解析失败。");
      return;
    }

    if (parsed.kind === "list") {
      const openIds = await deps.readAdminOpenIds();
      if (openIds.length === 0) {
        await deps.sendCommandReply(identity, conversationTarget, "当前没有 admin。\n\n添加：/admin add <open_id...>");
        return;
      }
      await deps.sendCommandReply(
        identity,
        conversationTarget,
        `👥 当前 admin（${openIds.length} 个）：\n${openIds.map((id) => `  - ${id}`).join("\n")}`,
      );
      return;
    }

    const currentIds = await deps.readAdminOpenIds();
    const currentSet = new Set(currentIds);

    if (parsed.kind === "add") {
      const newIds = parsed.openIds!.filter((id) => !currentSet.has(id));
      if (newIds.length === 0) {
        await deps.sendTextReply(
          identity,
          conversationTarget,
          "这些用户已经是 admin 了。",
        );
        return;
      }
      const updated = [...currentIds, ...newIds];
      await deps.writeAdminOpenIds(updated);
      await deps.sendCommandReply(
        identity,
        conversationTarget,
        `✅ 已添加 admin：${newIds.join(", ")}\n当前共 ${updated.length} 个 admin。`,
      );
      return;
    }

    if (parsed.kind === "remove") {
      const removeSet = new Set(parsed.openIds!);
      const removed = currentIds.filter((id) => removeSet.has(id));
      if (removed.length === 0) {
        await deps.sendTextReply(
          identity,
          conversationTarget,
          "这些用户本来就不是 admin。",
        );
        return;
      }
      const updated = currentIds.filter((id) => !removeSet.has(id));
      await deps.writeAdminOpenIds(updated);
      await deps.sendCommandReply(
        identity,
        conversationTarget,
        `✅ 已移除 admin：${removed.join(", ")}\n当前共 ${updated.length} 个 admin。`,
      );
      return;
    }
  };
}
