import type { RenderedFeishuMessage } from "./render.js";

const STREAMING_TITLE = "Pi";
const STREAMING_STATUS_ELEMENT_ID = "stream_status";
const STREAMING_BODY_ELEMENT_ID = "stream_body";
const STREAMING_SUMMARY_LIMIT = 120;

interface BuildStreamingCardOptions {
  statusText: string;
  bodyText?: string;
  summaryText?: string;
}

interface BuildStreamingSettingsOptions {
  streamingMode: boolean;
  summaryText?: string;
}

interface BuildFinalStreamingCardOptions {
  statusText: string;
  finalMessage: RenderedFeishuMessage;
  summaryText?: string;
}

export function buildStreamingCardData({
  statusText,
  bodyText = "",
  summaryText = "",
}: BuildStreamingCardOptions): string {
  return JSON.stringify({
    schema: "2.0",
    header: buildStreamingCardHeader(),
    config: buildStreamingCardConfig(true, summaryText),
    body: {
      direction: "vertical",
      padding: "12px 12px 12px 12px",
      elements: [
        buildMarkdownElement(statusText, STREAMING_STATUS_ELEMENT_ID),
        buildMarkdownElement(bodyText, STREAMING_BODY_ELEMENT_ID),
      ],
    },
  });
}

export function buildFinalStreamingCardData({
  statusText,
  finalMessage,
  summaryText = "",
}: BuildFinalStreamingCardOptions): string {
  return JSON.stringify({
    schema: "2.0",
    header: buildStreamingCardHeader(),
    config: buildStreamingCardConfig(false, summaryText),
    body: {
      direction: "vertical",
      padding: "12px 12px 12px 12px",
      elements: [
        buildMarkdownElement(statusText),
        ...extractMessageElements(finalMessage),
      ],
    },
  });
}

export function buildStreamingCardSettings({
  streamingMode,
  summaryText,
}: BuildStreamingSettingsOptions): string {
  return JSON.stringify({
    config: buildStreamingCardConfig(streamingMode, summaryText),
  });
}

export function buildStreamingSummary(text: string): string {
  const normalized = text
    .replace(/\r\n/g, "\n")
    .replace(/[`#>*_\-\[\]\(\)]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!normalized) return "Pi 回复已完成";
  if (normalized.length <= STREAMING_SUMMARY_LIMIT) return normalized;
  return `${normalized.slice(0, STREAMING_SUMMARY_LIMIT - 3)}...`;
}

export function getStreamingStatusElementId(): string {
  return STREAMING_STATUS_ELEMENT_ID;
}

export function getStreamingBodyElementId(): string {
  return STREAMING_BODY_ELEMENT_ID;
}

function buildStreamingCardHeader(): Record<string, unknown> {
  return {
    title: {
      content: STREAMING_TITLE,
      tag: "plain_text",
    },
  };
}

function buildStreamingCardConfig(
  streamingMode: boolean,
  summaryText?: string,
): Record<string, unknown> {
  return {
    streaming_mode: streamingMode,
    ...(summaryText !== undefined
      ? {
        summary: {
          content: summaryText,
        },
      }
      : {}),
    ...(streamingMode
      ? {
        streaming_config: {
          print_frequency_ms: {
            default: 120,
            android: 120,
            ios: 120,
            pc: 120,
          },
          print_step: {
            default: 1,
            android: 1,
            ios: 1,
            pc: 1,
          },
          print_strategy: "fast",
        },
      }
      : {}),
  };
}

function buildMarkdownElement(
  content: string,
  elementId?: string,
): Record<string, unknown> {
  return {
    tag: "markdown",
    content,
    text_align: "left",
    ...(elementId ? { element_id: elementId } : {}),
  };
}

function extractMessageElements(finalMessage: RenderedFeishuMessage): Array<Record<string, unknown>> {
  if (finalMessage.msgType !== "interactive") {
    const text = typeof finalMessage.content.text === "string" ? finalMessage.content.text : "";
    return text ? [buildMarkdownElement(text)] : [];
  }

  const body = finalMessage.content.body as { elements?: Array<Record<string, unknown>> } | undefined;
  return Array.isArray(body?.elements) ? body.elements : [];
}
