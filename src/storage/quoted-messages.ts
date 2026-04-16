import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { FeishuQuotedMessage } from "../feishu/inbound/types.js";
import { logger } from "../app/logger.js";

export interface QuotedMessageStore {
  getDataDir(): string;
  readQuotedMessage(messageId: string): Promise<FeishuQuotedMessage | null>;
  writeQuotedMessage(message: FeishuQuotedMessage): Promise<void>;
}

export function createQuotedMessageStore(dataDir: string): QuotedMessageStore {
  function quotedMessagesDir(): string {
    return join(dataDir, "quoted-messages");
  }

  function quotedMessagePath(messageId: string): string {
    return join(quotedMessagesDir(), `${encodeURIComponent(messageId)}.json`);
  }

  async function ensureDir(): Promise<void> {
    await mkdir(quotedMessagesDir(), { recursive: true });
  }

  async function readQuotedMessage(messageId: string): Promise<FeishuQuotedMessage | null> {
    try {
      const raw = await readFile(quotedMessagePath(messageId), "utf-8");
      return JSON.parse(raw) as FeishuQuotedMessage;
    } catch {
      return null;
    }
  }

  async function writeQuotedMessage(message: FeishuQuotedMessage): Promise<void> {
    await ensureDir();
    await writeFile(
      quotedMessagePath(message.messageId),
      JSON.stringify(message, null, 2),
      "utf-8",
    );
    logger.debug("Quoted message cached", {
      messageId: message.messageId,
      messageType: message.messageType,
    });
  }

  return {
    getDataDir: () => dataDir,
    readQuotedMessage,
    writeQuotedMessage,
  };
}

let defaultQuotedMessageStore = createQuotedMessageStore("./data");

export function setQuotedMessageDataDir(dir: string): void {
  defaultQuotedMessageStore = createQuotedMessageStore(dir);
}

export function readQuotedMessage(messageId: string): Promise<FeishuQuotedMessage | null> {
  return defaultQuotedMessageStore.readQuotedMessage(messageId);
}

export function writeQuotedMessage(message: FeishuQuotedMessage): Promise<void> {
  return defaultQuotedMessageStore.writeQuotedMessage(message);
}
