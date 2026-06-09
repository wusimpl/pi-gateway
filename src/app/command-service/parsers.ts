import type { Config } from "../../config.js";
import { parseModelRouteSlot } from "../../pi/model-routing.js";
import type { ModelRouteSlot, ThinkingLevel, ToolCallsDisplayMode } from "../../types.js";
import { SUPER_ADMIN_OPEN_ID } from "../access-control.js";

export type P2PChatPolicy = Config["FEISHU_P2P_CHAT_POLICY"];
export type GroupChatPolicy = Config["FEISHU_GROUP_CHAT_POLICY"];
export type GroupMessageMode = Config["FEISHU_GROUP_MESSAGE_MODE"];
export type GroupUnmatchedMessagePolicy = Config["FEISHU_GROUP_UNMATCHED_MESSAGE_POLICY"];

export function parsePageArg(
  args: string,
  options: { commandName: string; extraUsage: string },
): { page: number; error?: undefined } | { page?: undefined; error: string } {
  const trimmed = args.trim();
  if (!trimmed) {
    return { page: 1 };
  }

  const matched = trimmed.match(/^-n\s+(\d+)$/);
  if (!matched) {
    return { error: `用法：/${options.commandName} 或 /${options.commandName} -n <页码>${options.extraUsage}。` };
  }

  const page = Number(matched[1]);
  if (!Number.isSafeInteger(page) || page < 1) {
    return { error: "页码必须是大于等于 1 的整数。" };
  }

  return { page };
}

export function parseToolsArgs(
  args: string,
):
  | { action: "show"; error?: undefined }
  | { action: "reset"; error?: undefined }
  | { action: "on" | "off" | "set"; toolNames: string[]; error?: undefined }
  | { action?: undefined; toolNames?: undefined; error: string } {
  const trimmed = args.trim();
  if (!trimmed) {
    return { action: "show" };
  }

  if (trimmed === "reset") {
    return { action: "reset" };
  }

  const [action, ...toolNames] = trimmed.split(/\s+/).filter(Boolean);
  if (action === "on" || action === "off" || action === "set") {
    if (toolNames.length === 0) {
      return { error: "用法：/tools\n/tools on <tool...>\n/tools off <tool...>\n/tools set <tool...>\n/tools reset" };
    }
    return { action, toolNames };
  }

  return { error: "用法：/tools\n/tools on <tool...>\n/tools off <tool...>\n/tools set <tool...>\n/tools reset" };
}

type ParsedP2PCommand =
  | { kind: "show"; error?: undefined }
  | { kind: "set-policy"; policy: P2PChatPolicy; error?: undefined }
  | { kind: "show-allowlist"; error?: undefined }
  | { kind: "edit-allowlist"; action: "add" | "remove"; openIds: string[]; error?: undefined }
  | { kind?: undefined; error: string };

export function parseP2PArgs(args: string): ParsedP2PCommand {
  const trimmed = args.trim();
  if (!trimmed) {
    return { kind: "show" };
  }

  const policyMatched = trimmed.match(/^policy\s+(all|whitelist)$/i);
  if (policyMatched) {
    return {
      kind: "set-policy",
      policy: policyMatched[1]!.toLowerCase() as P2PChatPolicy,
    };
  }

  if (/^allowlist\s+show$/i.test(trimmed)) {
    return { kind: "show-allowlist" };
  }

  const allowlistMatched = trimmed.match(/^allowlist\s+(add|remove)\s+(.+)$/i);
  if (allowlistMatched) {
    const openIds = allowlistMatched[2]!.trim().split(/\s+/).filter(Boolean);
    if (openIds.length === 0) {
      return { error: formatP2PUsage() };
    }
    return {
      kind: "edit-allowlist",
      action: allowlistMatched[1]!.toLowerCase() as "add" | "remove",
      openIds,
    };
  }

  return { error: formatP2PUsage() };
}

function formatP2PUsage(): string {
  return [
    "用法：/p2p",
    "/p2p policy all|whitelist",
    "/p2p allowlist show",
    "/p2p allowlist add <open_id...>",
    "/p2p allowlist remove <open_id...>",
    `super admin：${SUPER_ADMIN_OPEN_ID}（永远允许，不受白名单影响）`,
  ].join("\n");
}

type ParsedGroupCommand =
  | { kind: "show"; error?: undefined }
  | { kind: "set-policy"; policy: GroupChatPolicy; error?: undefined }
  | { kind: "set-mode"; mode: GroupMessageMode; error?: undefined }
  | { kind: "set-unmatched"; policy: GroupUnmatchedMessagePolicy; error?: undefined }
  | { kind: "show-unmatched"; error?: undefined }
  | { kind: "clear-unmatched"; error?: undefined }
  | { kind: "show-allowlist"; error?: undefined }
  | { kind: "edit-allowlist"; action: "add" | "remove"; targets: string[]; error?: undefined }
  | { kind: "show-keywords"; error?: undefined }
  | { kind: "set-keywords"; keywords: string[]; error?: undefined }
  | { kind: "clear-keywords"; error?: undefined }
  | { kind?: undefined; error: string };

export function parseGroupArgs(
  args: string,
  options: { allowAllowlist: boolean } = { allowAllowlist: false },
): ParsedGroupCommand {
  const trimmed = args.trim();
  if (!trimmed) {
    return { kind: "show" };
  }

  const policyMatched = trimmed.match(/^policy\s+(disabled|allowlist|open)$/i);
  if (policyMatched) {
    return {
      kind: "set-policy",
      policy: policyMatched[1]!.toLowerCase() as GroupChatPolicy,
    };
  }

  const modeMatched = trimmed.match(/^mode\s+(mention|all|keyword)$/i);
  if (modeMatched) {
    return {
      kind: "set-mode",
      mode: modeMatched[1]!.toLowerCase() as GroupMessageMode,
    };
  }

  const unmatchedMatched = trimmed.match(/^unmatched\s+(capture|ignore)$/i);
  if (unmatchedMatched) {
    return {
      kind: "set-unmatched",
      policy: unmatchedMatched[1]!.toLowerCase() as GroupUnmatchedMessagePolicy,
    };
  }

  if (/^unmatched\s+show$/i.test(trimmed)) {
    return { kind: "show-unmatched" };
  }

  if (/^unmatched\s+clear$/i.test(trimmed)) {
    return { kind: "clear-unmatched" };
  }

  if (options.allowAllowlist && /^allowlist\s+show$/i.test(trimmed)) {
    return { kind: "show-allowlist" };
  }

  const allowlistMatched = trimmed.match(/^allowlist\s+(add|remove)\s+(.+)$/i);
  if (options.allowAllowlist && allowlistMatched) {
    const targets = allowlistMatched[2]!.trim().split(/\s+/).filter(Boolean);
    if (targets.length === 0) {
      return { error: formatPrivateGroupAllowlistUsage() };
    }
    return {
      kind: "edit-allowlist",
      action: allowlistMatched[1]!.toLowerCase() as "add" | "remove",
      targets,
    };
  }

  if (/^keywords\s+show$/i.test(trimmed)) {
    return { kind: "show-keywords" };
  }

  if (/^keywords\s+clear$/i.test(trimmed)) {
    return { kind: "clear-keywords" };
  }

  const keywordsMatched = trimmed.match(/^keywords\s+set\s+(.+)$/i);
  if (keywordsMatched) {
    const keywords = parseGroupKeywordArgs(keywordsMatched[1]!);
    if (keywords.length === 0) {
      return { error: "请至少给一个关键词。\n\n用法：/group keywords set <关键词...>" };
    }
    return {
      kind: "set-keywords",
      keywords,
    };
  }

  return { error: options.allowAllowlist ? formatPrivateGroupAllowlistUsage() : formatGroupUsage() };
}

function parseGroupKeywordArgs(raw: string): string[] {
  const matches = raw.matchAll(/"([^"]*)"|'([^']*)'|“([^”]*)”|‘([^’]*)’|(\S+)/g);
  const keywords: string[] = [];
  for (const match of matches) {
    const candidate = match[1] ?? match[2] ?? match[3] ?? match[4] ?? match[5] ?? "";
    const normalized = normalizeGroupKeyword(candidate);
    if (normalized) {
      keywords.push(normalized);
    }
  }
  return keywords;
}

function normalizeGroupKeyword(raw: string): string {
  return raw.trim().replace(/^(["'“”‘’])+|(["'“”‘’])+$/g, "").trim();
}

function formatGroupUsage(): string {
  return [
    "用法：/group",
    "/group policy disabled|allowlist|open",
    "/group mode mention|all|keyword",
    "/group unmatched capture|ignore",
    "/group unmatched show",
    "/group unmatched clear",
    "/group keywords show",
    "/group keywords set <关键词...>",
    "/group keywords clear",
  ].join("\n");
}

function formatPrivateGroupAllowlistUsage(): string {
  return [
    "用法：/group allowlist show",
    "/group allowlist add <chat_id...>",
    "/group allowlist remove <chat_id...>",
  ].join("\n");
}

export function parseSettingsArgs(
  args: string,
):
  | { kind: "show"; error?: undefined }
  | { kind: "think"; level: ThinkingLevel; error?: undefined }
  | { kind: "stream"; enabled: boolean; error?: undefined }
  | { kind?: undefined; error: string } {
  const trimmed = args.trim();
  if (!trimmed) {
    return { kind: "show" };
  }

  const thinkMatched = trimmed.match(/^think\s+(off|minimal|low|medium|high|xhigh)$/i);
  if (thinkMatched) {
    return { kind: "think", level: thinkMatched[1]!.toLowerCase() as ThinkingLevel };
  }

  const streamMatched = trimmed.match(/^stream\s+(on|off)$/i);
  if (streamMatched) {
    return { kind: "stream", enabled: streamMatched[1]!.toLowerCase() === "on" };
  }

  return {
    error:
      "用法：/settings\n/settings think off|minimal|low|medium|high|xhigh\n/settings stream on|off",
  };
}

export function parseToolCallsArgs(
  args: string,
):
  | { kind: "show"; error?: undefined }
  | { kind: "set"; mode: ToolCallsDisplayMode; error?: undefined }
  | { kind?: undefined; mode?: undefined; error: string } {
  const normalized = args.trim().toLowerCase();
  if (!normalized) {
    return { kind: "show" };
  }

  if (normalized === "off" || normalized === "name" || normalized === "focus" || normalized === "full") {
    return { kind: "set", mode: normalized };
  }

  return { error: "用法：/toolcalls、/toolcalls off、/toolcalls name、/toolcalls focus 或 /toolcalls full。" };
}

export function parseSkillFolderArgs(
  args: string,
):
  | { kind: "show"; error?: undefined }
  | { kind: "set"; enabled: boolean; error?: undefined }
  | { kind?: undefined; enabled?: undefined; error: string } {
  const normalized = args.trim().toLowerCase();
  if (!normalized) {
    return { kind: "show" };
  }

  if (normalized === "on" || normalized === "off") {
    return { kind: "set", enabled: normalized === "on" };
  }

  return { error: "用法：/skill-folder、/skill-folder on 或 /skill-folder off。" };
}

export function parseSttProviderArgs(
  args: string,
): { provider: "sensevoice" | "whisper" | "doubao"; error?: undefined } | { provider?: undefined; error: string } {
  const matched = args.trim().match(/^provider\s+(sensevoice|whisper|doubao)$/i);
  if (!matched) {
    return { error: "用法：/stt provider sensevoice|whisper|doubao。" };
  }

  return {
    provider: matched[1]!.toLowerCase() as "sensevoice" | "whisper" | "doubao",
  };
}

export function parseOnOffArgs(
  args: string,
  commandName: "stream" | "reaction" | "route",
): { enabled: boolean; error?: undefined } | { enabled?: undefined; error: string } {
  const normalized = args.trim().toLowerCase();
  if (normalized === "on") {
    return { enabled: true };
  }

  if (normalized === "off") {
    return { enabled: false };
  }

  return { error: `用法：/${commandName} on 或 /${commandName} off。` };
}

export function parseModelCommandArgs(
  args: string,
): { slot: ModelRouteSlot; modelRef: string; error?: undefined } | { slot?: undefined; modelRef?: undefined; error: string } {
  const parts = args.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return { error: "用法：/model router|light|heavy <序号或provider/model>。" };
  }

  const slot = parseModelRouteSlot(parts[0] ?? "");
  if (slot) {
    const modelRef = parts.slice(1).join(" ").trim();
    if (!modelRef) {
      return { error: `用法：/model ${slot} <序号或provider/model>。` };
    }
    return { slot, modelRef };
  }

  return { slot: "heavy", modelRef: args.trim() };
}

export function parseModelProviderFilterArg(args: string): string | null {
  const trimmed = args.trim();
  if (!trimmed || trimmed.includes("/") || /^\d+$/.test(trimmed)) {
    return null;
  }

  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length !== 1 || parseModelRouteSlot(parts[0] ?? "")) {
    return null;
  }

  return parts[0] ?? null;
}
