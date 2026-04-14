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

export function buildStreamingCardData({
  statusText,
  bodyText = "",
  summaryText = "",
}: BuildStreamingCardOptions): string {
  return JSON.stringify({
    schema: "2.0",
    header: {
      title: {
        content: STREAMING_TITLE,
        tag: "plain_text",
      },
    },
    config: {
      streaming_mode: true,
      summary: {
        content: summaryText,
      },
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
    },
    body: {
      direction: "vertical",
      padding: "12px 12px 12px 12px",
      elements: [
        {
          tag: "markdown",
          content: statusText,
          text_align: "left",
          element_id: STREAMING_STATUS_ELEMENT_ID,
        },
        {
          tag: "markdown",
          content: bodyText,
          text_align: "left",
          element_id: STREAMING_BODY_ELEMENT_ID,
        },
      ],
    },
  });
}

export function buildStreamingCardSettings({
  streamingMode,
  summaryText,
}: BuildStreamingSettingsOptions): string {
  return JSON.stringify({
    config: {
      streaming_mode: streamingMode,
      ...(summaryText !== undefined
        ? {
          summary: {
            content: summaryText,
          },
        }
        : {}),
    },
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
