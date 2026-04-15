import {
  buildFeishuDocUrl,
  type FeishuWebDomain,
} from "./doc-links.js";

export type FeishuDocPreviewOperation = "created" | "updated";

export interface FeishuDocPreviewCardInput {
  documentId?: string;
  documentUrl?: string;
  title?: string;
  operation?: FeishuDocPreviewOperation;
}

export interface ResolvedFeishuDocPreviewCard {
  documentId?: string;
  documentUrl: string;
  title?: string;
  operation: FeishuDocPreviewOperation;
}

export function resolveFeishuDocPreviewCardInput(
  input: FeishuDocPreviewCardInput,
  feishuDomain: FeishuWebDomain = "feishu",
): ResolvedFeishuDocPreviewCard | null {
  const documentId = normalizeOptionalString(input.documentId);
  const documentUrl =
    normalizeOptionalString(input.documentUrl)
    ?? (documentId ? buildFeishuDocUrl(documentId, feishuDomain) : undefined);

  if (!documentUrl) {
    return null;
  }

  return {
    documentId,
    documentUrl,
    title: normalizeOptionalString(input.title),
    operation: input.operation ?? "updated",
  };
}

export function buildFeishuDocPreviewCardContent(
  input: ResolvedFeishuDocPreviewCard,
): Record<string, unknown> {
  const title = input.title ?? "飞书文档";
  const statusText = input.operation === "created" ? "文档已创建" : "文档已更新";
  const summaryText =
    input.operation === "created"
      ? "新文档已经准备好了，点下面按钮直接打开。"
      : "文档已经处理完了，点下面按钮直接查看最新内容。";

  return {
    schema: "2.0",
    config: {
      update_multi: true,
      width_mode: "fill",
    },
    card_link: buildCardLinkConfig(input.documentUrl),
    header: {
      title: {
        tag: "plain_text",
        content: title,
      },
      subtitle: {
        tag: "plain_text",
        content: statusText,
      },
      template: input.operation === "created" ? "green" : "blue",
      padding: "12px 12px 12px 12px",
    },
    body: {
      direction: "vertical",
      padding: "12px 12px 12px 12px",
      elements: [
        {
          tag: "markdown",
          content: `${summaryText}\n\n[打开文档](${input.documentUrl})`,
          text_align: "left",
        },
        {
          tag: "button",
          text: {
            tag: "plain_text",
            content: "打开文档",
          },
          type: "primary",
          width: "default",
          size: "medium",
          behaviors: [
            {
              type: "open_url",
              ...buildBehaviorOpenUrlConfig(input.documentUrl),
            },
          ],
        },
      ],
    },
  };
}

function buildCardLinkConfig(url: string): Record<string, string> {
  return {
    url,
    pc_url: url,
    ios_url: url,
    android_url: url,
  };
}

function buildBehaviorOpenUrlConfig(url: string): Record<string, string> {
  return {
    default_url: url,
    pc_url: url,
    ios_url: url,
    android_url: url,
  };
}

function normalizeOptionalString(value: string | undefined): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed || undefined;
}
