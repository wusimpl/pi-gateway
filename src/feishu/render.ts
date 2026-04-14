import { marked } from "marked";
import type { Token, Tokens } from "marked";
import { chunkText } from "./text.js";

export interface RenderedFeishuMessage {
  msgType: "text" | "interactive";
  content: Record<string, unknown>;
}

type CardElement = MarkdownCardElement | TableCardElement;

interface MarkdownCardElement {
  tag: "markdown";
  content: string;
  text_align: "left";
}

interface TableCardElement {
  tag: "table";
  page_size: number;
  row_height: "middle";
  header_style: {
    bold: true;
    text_align: "left";
    background_style: "grey";
  };
  columns: TableColumn[];
  rows: Array<Record<string, string | number>>;
}

interface TableColumn {
  name: string;
  display_name: string;
  data_type: "text" | "number";
  text_align: "left" | "center" | "right";
}

const MAX_CARD_ELEMENTS = 30;
const MAX_CARD_CONTENT_CHARS = 12000;

export function renderAssistantMessage(
  text: string,
  textChunkLimit: number
): RenderedFeishuMessage[] {
  const normalized = text.replace(/\r\n/g, "\n").trimEnd();
  if (!normalized) return [];

  const tokens = marked.lexer(normalized, { gfm: true });
  if (!shouldRenderAsCard(tokens)) {
    return chunkText(normalized, textChunkLimit).map((chunk) => ({
      msgType: "text",
      content: { text: chunk },
    }));
  }

  const elements = buildCardElements(tokens);
  if (elements.length === 0 || elements.some((element) => estimateElementSize(element) > MAX_CARD_CONTENT_CHARS)) {
    return chunkText(normalized, textChunkLimit).map((chunk) => ({
      msgType: "text",
      content: { text: chunk },
    }));
  }

  return chunkCardElements(elements).map((chunk) => ({
    msgType: "interactive",
    content: {
      schema: "2.0",
      body: {
        direction: "vertical",
        padding: "12px 12px 12px 12px",
        elements: chunk,
      },
    },
  }));
}

function shouldRenderAsCard(tokens: TokensList): boolean {
  return tokens.some((token) => {
    switch (token.type) {
      case "table":
      case "list":
      case "heading":
      case "code":
      case "blockquote":
      case "hr":
        return true;
      case "paragraph":
      case "text":
        return hasRichInlineSyntax(token.tokens);
      case "html":
        return true;
      default:
        return false;
    }
  });
}

function buildCardElements(tokens: TokensList): CardElement[] {
  const elements: CardElement[] = [];
  const markdownParts: string[] = [];

  const flushMarkdown = () => {
    const content = normalizeMarkdownForCard(markdownParts.join(""));
    if (!content) {
      markdownParts.length = 0;
      return;
    }
    elements.push({
      tag: "markdown",
      content,
      text_align: "left",
    });
    markdownParts.length = 0;
  };

  for (const token of tokens) {
    if (token.type === "space") {
      markdownParts.push(token.raw);
      continue;
    }

    if (token.type === "table") {
      flushMarkdown();
      elements.push(buildTableElement(token));
      continue;
    }

    markdownParts.push(blockTokenToMarkdown(token));
  }

  flushMarkdown();
  return elements;
}

function blockTokenToMarkdown(token: Token): string {
  if (token.type === "heading") {
    return `**${extractInlineText(token.tokens) || token.text}**`;
  }
  if ("raw" in token && typeof token.raw === "string") {
    return token.raw;
  }
  return "";
}

function buildTableElement(token: Tokens.Table): TableCardElement {
  const columns = token.header.map((cell, index) => {
    const name = `col_${index}`;
    const values = token.rows.map((row) => inlineCellText(row[index]));
    const isNumberColumn = values.length > 0 && values.every(isNumericCell);

    return {
      name,
      display_name: inlineCellText(cell) || `Column ${index + 1}`,
      data_type: isNumberColumn ? "number" : "text",
      text_align: mapAlign(token.align[index], isNumberColumn),
    };
  });

  const rows = token.rows.map((row) => {
    const result: Record<string, string | number> = {};
    for (let index = 0; index < columns.length; index++) {
      const value = inlineCellText(row[index]);
      result[columns[index].name] =
        columns[index].data_type === "number" ? Number(value.replace(/,/g, "")) : value;
    }
    return result;
  });

  return {
    tag: "table",
    page_size: Math.min(Math.max(rows.length, 1), 10),
    row_height: "middle",
    header_style: {
      bold: true,
      text_align: "left",
      background_style: "grey",
    },
    columns,
    rows,
  };
}

function normalizeMarkdownForCard(content: string): string {
  return content
    .trim()
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_match, alt: string, url: string) => {
      const label = alt.trim() ? `图片: ${alt.trim()}` : "图片链接";
      return `[${label}](${url.trim()})`;
    });
}

function hasRichInlineSyntax(tokens: Token[] | undefined): boolean {
  if (!tokens || tokens.length === 0) return false;
  return tokens.some((token) => {
    switch (token.type) {
      case "strong":
      case "em":
      case "del":
      case "link":
      case "image":
      case "codespan":
      case "br":
        return true;
      case "text":
        return hasRichInlineSyntax(token.tokens);
      default:
        return "tokens" in token ? hasRichInlineSyntax(token.tokens as Token[]) : false;
    }
  });
}

function extractInlineText(tokens: Token[] | undefined): string {
  if (!tokens || tokens.length === 0) return "";

  return tokens
    .map((token) => {
      switch (token.type) {
        case "text":
          return token.text;
        case "strong":
        case "em":
        case "del":
          return extractInlineText(token.tokens);
        case "codespan":
          return token.text;
        case "link": {
          const text = extractInlineText(token.tokens) || token.text || "";
          return token.href ? `${text} (${token.href})` : text;
        }
        case "image":
          return token.text || token.href || "";
        case "br":
          return " ";
        default:
          if ("tokens" in token) {
            return extractInlineText(token.tokens as Token[]);
          }
          return "text" in token && typeof token.text === "string" ? token.text : "";
      }
    })
    .join("")
    .replace(/\s+/g, " ")
    .trim();
}

function inlineCellText(cell: Tokens.TableCell | undefined): string {
  if (!cell) return "";
  return extractInlineText(cell.tokens) || cell.text || "";
}

function isNumericCell(value: string): boolean {
  return /^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/.test(value.trim());
}

function mapAlign(
  align: Tokens.TableCell["align"] | null | undefined,
  isNumberColumn: boolean
): "left" | "center" | "right" {
  if (align === "center" || align === "right" || align === "left") {
    return align;
  }
  return isNumberColumn ? "right" : "left";
}

function chunkCardElements(elements: CardElement[]): CardElement[][] {
  const chunks: CardElement[][] = [];
  let current: CardElement[] = [];
  let currentSize = 0;

  for (const element of elements) {
    const nextSize = estimateElementSize(element);
    const wouldOverflow =
      current.length >= MAX_CARD_ELEMENTS || currentSize + nextSize > MAX_CARD_CONTENT_CHARS;

    if (wouldOverflow && current.length > 0) {
      chunks.push(current);
      current = [];
      currentSize = 0;
    }

    current.push(element);
    currentSize += nextSize;
  }

  if (current.length > 0) {
    chunks.push(current);
  }

  return chunks;
}

function estimateElementSize(element: CardElement): number {
  return JSON.stringify(element).length;
}

type TokensList = ReturnType<typeof marked.lexer>;
