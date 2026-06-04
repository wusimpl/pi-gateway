export const SUPER_ADMIN_OPEN_ID = "ou_f63b0f6d9b91dca7dc09eca00b02c8af";

export type P2PChatPolicy = "all" | "whitelist";

export interface P2PAccessConfig {
  FEISHU_P2P_CHAT_POLICY?: P2PChatPolicy;
  FEISHU_P2P_CHAT_ALLOWLIST?: readonly string[];
}

export function isSuperAdminOpenId(openId: string | undefined): boolean {
  return openId?.trim() === SUPER_ADMIN_OPEN_ID;
}

export function canAccessP2PChat(openId: string, config?: P2PAccessConfig): boolean {
  const normalizedOpenId = openId.trim();
  if (!normalizedOpenId) {
    return false;
  }

  if (isSuperAdminOpenId(normalizedOpenId)) {
    return true;
  }

  const policy = config?.FEISHU_P2P_CHAT_POLICY ?? "all";
  if (policy === "all") {
    return true;
  }

  return (config?.FEISHU_P2P_CHAT_ALLOWLIST ?? [])
    .map((allowedOpenId) => allowedOpenId.trim())
    .includes(normalizedOpenId);
}
