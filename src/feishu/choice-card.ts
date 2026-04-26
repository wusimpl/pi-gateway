import { randomUUID } from "node:crypto";

export const FEISHU_CHOICE_INTERACTION_TYPE = "pi.ask_user_choice";
export const FEISHU_CHOICE_CANCEL_VALUE = "__cancel__";

export interface FeishuChoiceOption {
  label: string;
  value: string;
  description?: string;
}

export interface FeishuChoiceCardInput {
  requestId: string;
  title: string;
  question: string;
  options: FeishuChoiceOption[];
}

export interface FeishuChoiceCardAction {
  requestId: string;
  openId: string;
  optionValue: string;
  optionLabel?: string;
}

export interface FeishuChoiceCardActionResponse {
  toast: {
    type: "success" | "warning" | "error";
    content: string;
  };
}

export function createFeishuChoiceRequestId(): string {
  return randomUUID();
}

export function buildFeishuChoiceCardContent(input: FeishuChoiceCardInput): Record<string, unknown> {
  const options = input.options.map((option, index) => ({
    tag: "button",
    text: {
      tag: "plain_text",
      content: option.label,
    },
    type: index === 0 ? "primary" : "default",
    value: buildButtonValue(input.requestId, option),
  }));

  return {
    config: {
      wide_screen_mode: true,
      enable_forward: false,
    },
    header: {
      title: {
        tag: "plain_text",
        content: input.title,
      },
      template: "blue",
    },
    elements: [
      {
        tag: "markdown",
        content: buildQuestionMarkdown(input.question, input.options),
      },
      {
        tag: "action",
        layout: "flow",
        actions: [
          ...options,
          {
            tag: "button",
            text: {
              tag: "plain_text",
              content: "取消",
            },
            type: "default",
            value: buildButtonValue(input.requestId, {
              label: "取消",
              value: FEISHU_CHOICE_CANCEL_VALUE,
            }),
          },
        ],
      },
    ],
  };
}

export function parseFeishuChoiceCardAction(data: Record<string, unknown>): FeishuChoiceCardAction | null {
  const payload = asRecord(data.event) ?? data;
  const action = asRecord(payload.action);
  const value = asRecord(action?.value);
  if (!action || !value) return null;

  const interactionType = asString(value.interaction_type ?? value.interactionType);
  if (interactionType !== FEISHU_CHOICE_INTERACTION_TYPE) return null;

  const requestId = asString(value.request_id ?? value.requestId);
  const optionValue = asString(value.option_value ?? value.optionValue ?? action.option);
  const openId = extractOpenId(payload);
  if (!requestId || !optionValue || !openId) return null;

  return {
    requestId,
    openId,
    optionValue,
    optionLabel: asOptionalString(value.option_label ?? value.optionLabel),
  };
}

export function buildFeishuChoiceActionToast(
  type: FeishuChoiceCardActionResponse["toast"]["type"],
  content: string,
): FeishuChoiceCardActionResponse {
  return {
    toast: {
      type,
      content,
    },
  };
}

function buildButtonValue(requestId: string, option: FeishuChoiceOption): Record<string, string> {
  return {
    interaction_type: FEISHU_CHOICE_INTERACTION_TYPE,
    request_id: requestId,
    option_value: option.value,
    option_label: option.label,
  };
}

function buildQuestionMarkdown(question: string, options: FeishuChoiceOption[]): string {
  const lines = [`**${escapeMarkdown(question)}**`];
  const descriptions = options
    .filter((option) => option.description?.trim())
    .map((option) => `- **${escapeMarkdown(option.label)}**：${escapeMarkdown(option.description!.trim())}`);
  if (descriptions.length > 0) {
    lines.push("", ...descriptions);
  }
  return lines.join("\n");
}

function escapeMarkdown(text: string): string {
  return text.replace(/[\\`*_{}\[\]()#+\-.!|>]/g, "\\$&");
}

function extractOpenId(payload: Record<string, unknown>): string {
  const operator = asRecord(payload.operator);
  const user = asRecord(payload.user);
  return asString(
    payload.open_id
      ?? payload.openId
      ?? operator?.open_id
      ?? operator?.openId
      ?? user?.open_id
      ?? user?.openId,
  );
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function asOptionalString(value: unknown): string | undefined {
  const text = asString(value).trim();
  return text || undefined;
}
