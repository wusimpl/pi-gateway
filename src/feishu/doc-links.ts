export type FeishuWebDomain = "feishu" | "larksuite";

export function buildFeishuDocUrl(
  documentId: string,
  feishuDomain: FeishuWebDomain = "feishu",
): string {
  const normalizedId = documentId.trim();
  if (!normalizedId) {
    throw new Error("document_id 不能为空");
  }

  return `${getFeishuWebBaseUrl(feishuDomain)}/docx/${encodeURIComponent(normalizedId)}`;
}

export function getFeishuWebBaseUrl(
  feishuDomain: FeishuWebDomain = "feishu",
): string {
  return feishuDomain === "larksuite"
    ? "https://larksuite.com"
    : "https://feishu.cn";
}
