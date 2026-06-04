import type { ConversationTarget } from "../../conversation.js";
import type { BridgeCommandName } from "../commands.js";

export interface CommandCatalogItem {
  name: BridgeCommandName;
  usage: string;
  description: string;
  permissionArgs?: string;
  target?: "all" | "p2p" | "group";
}

export const COMMAND_CATALOG: CommandCatalogItem[] = [
  { name: "commands", usage: "/commands", description: "查看当前可用命令" },
  { name: "new", usage: "/new", description: "新建会话" },
  { name: "reset", usage: "/reset", description: "重置当前会话" },
  { name: "status", usage: "/status", description: "查看当前会话状态" },
  { name: "context", usage: "/context", description: "查看已加载上下文" },
  { name: "skills", usage: "/skills", description: "查看可用技能" },
  { name: "model", usage: "/model", description: "查看模型配置和可用模型" },
  { name: "model", usage: "/model <序号或模型>", description: "切换模型", permissionArgs: "2" },
  { name: "route", usage: "/route", description: "查看模型路由" },
  { name: "route", usage: "/route on|off", description: "开关模型路由", permissionArgs: "on" },
  { name: "sessions", usage: "/sessions", description: "查看历史会话" },
  { name: "resume", usage: "/resume <序号或会话ID>", description: "恢复历史会话" },
  { name: "settings", usage: "/settings", description: "查看当前设置" },
  { name: "settings", usage: "/settings think|stream", description: "调整当前设置", permissionArgs: "think high" },
  { name: "tools", usage: "/tools", description: "查看工具状态" },
  { name: "tools", usage: "/tools on|off|set|reset", description: "管理工具启用状态", permissionArgs: "on read" },
  { name: "toolcalls", usage: "/toolcalls", description: "查看工具调用展示" },
  { name: "toolcalls", usage: "/toolcalls off|name|full", description: "设置工具调用展示", permissionArgs: "name" },
  { name: "skill-folder", usage: "/skill-folder", description: "查看私有技能目录开关" },
  { name: "skill-folder", usage: "/skill-folder on|off", description: "管理私有技能目录开关", permissionArgs: "on" },
  { name: "stop", usage: "/stop", description: "停止当前任务" },
  { name: "next", usage: "/next <内容>", description: "把补充内容排到当前任务后处理" },
  { name: "restart", usage: "/restart", description: "重启网关", target: "p2p" },
  { name: "cron", usage: "/cron", description: "管理定时任务" },
  { name: "stt", usage: "/stt provider <名称>", description: "切换语音转写方式", target: "p2p" },
  { name: "stream", usage: "/stream on|off", description: "开关默认流式回复", target: "p2p" },
  { name: "reaction", usage: "/reaction on|off", description: "开关处理中 reaction", target: "p2p" },
  { name: "group", usage: "/group", description: "管理群聊策略", target: "group" },
  { name: "group", usage: "/group allowlist show|add|remove", description: "管理群白名单", target: "p2p" },
  { name: "p2p", usage: "/p2p", description: "管理私聊访问策略", target: "p2p" },
  { name: "skillstat", usage: "/skillstat", description: "查看技能使用统计", target: "p2p" },
];

export function isCommandVisibleInTarget(item: CommandCatalogItem, conversationTarget: ConversationTarget): boolean {
  if (!item.target || item.target === "all") {
    return true;
  }
  if (item.target === "group") {
    return conversationTarget.kind !== "p2p";
  }
  return conversationTarget.kind === "p2p";
}
