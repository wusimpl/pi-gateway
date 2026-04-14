const DEFAULT_FEISHU_TEXT_LIMIT = 4000;

/**
 * 将长文本按飞书限制分块
 */
export function chunkText(text: string, limit: number = DEFAULT_FEISHU_TEXT_LIMIT): string[] {
  if (text.length <= limit) return [text];

  const chunks: string[] = [];
  let remaining = text;
  while (remaining.length > 0) {
    if (remaining.length <= limit) {
      chunks.push(remaining);
      break;
    }

    let splitAt = remaining.lastIndexOf("\n", limit);
    if (splitAt <= 0 || splitAt > limit) {
      splitAt = limit;
    }

    chunks.push(remaining.slice(0, splitAt));
    remaining = remaining.slice(splitAt);
    if (remaining.startsWith("\n")) {
      remaining = remaining.slice(1);
    }
  }

  return chunks;
}
