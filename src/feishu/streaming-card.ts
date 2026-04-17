import type { RenderedFeishuMessage } from "./render.js";

const STREAMING_BODY_ELEMENT_ID = "stream_body";
const STREAMING_PRELUDE_ELEMENT_ID = "stream_prelude";
const STREAMING_TOOLS_ELEMENT_ID = "stream_tools";
const STREAMING_SUMMARY_LIMIT = 120;

interface BuildStreamingCardOptions {
  preludeText?: string;
  bodyText?: string;
  toolsText?: string;
  summaryText?: string;
}

interface BuildStreamingSettingsOptions {
  streamingMode: boolean;
  summaryText?: string;
}

interface BuildFinalStreamingCardOptions {
  finalMessage: RenderedFeishuMessage;
  summaryText?: string;
}

export function buildStreamingCardData({
  preludeText = "",
  bodyText = "",
  toolsText = "",
  summaryText = "",
}: BuildStreamingCardOptions): string {
  const elements = [buildMarkdownElement(bodyText, STREAMING_BODY_ELEMENT_ID)];
  if (preludeText) {
    elements.push(buildMarkdownElement(preludeText, STREAMING_PRELUDE_ELEMENT_ID));
  }
  elements.push(buildMarkdownElement(toolsText, STREAMING_TOOLS_ELEMENT_ID));
  return JSON.stringify({
    schema: "2.0",
    config: buildStreamingCardConfig(true, summaryText),
    body: {
      direction: "vertical",
      padding: "12px 12px 12px 12px",
      elements,
    },
  });
}

export function buildFinalStreamingCardData({
  finalMessage,
  summaryText = "",
}: BuildFinalStreamingCardOptions): string {
  return JSON.stringify({
    schema: "2.0",
    config: buildStreamingCardConfig(false, summaryText),
    body: {
      direction: "vertical",
      padding: "12px 12px 12px 12px",
      elements: [
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

export function getStreamingBodyElementId(): string {
  return STREAMING_BODY_ELEMENT_ID;
}

export function getStreamingToolsElementId(): string {
  return STREAMING_TOOLS_ELEMENT_ID;
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
