import type { Config } from "../config.js";
import type { ConversationTarget } from "../conversation.js";
import type { FeishuMessenger } from "../feishu/send.js";
import type { UserIdentity } from "../types.js";
import { parseBridgeCommand } from "../app/commands.js";
import type { CommandService } from "../app/command-service.js";
import type { AdminCommandResult, ResolvedAdminTarget } from "./types.js";

export interface AdminCommandExecutor {
  executeRawCommand(input: {
    resolvedTarget: ResolvedAdminTarget;
    rawCommand: string;
    syncToFeishu: boolean;
  }): Promise<AdminCommandResult>;
}

export function createAdminCommandExecutor(options: {
  config: Pick<Config, "TEXT_CHUNK_LIMIT">;
  createCommandService(messenger: AdminCaptureMessenger): CommandService;
  messenger: Pick<
    FeishuMessenger,
    "sendRenderedMessage" | "sendTextMessage" | "sendRenderedMessageToTarget" | "sendTextMessageToTarget"
  >;
}): AdminCommandExecutor {
  async function executeRawCommand(input: {
    resolvedTarget: ResolvedAdminTarget;
    rawCommand: string;
    syncToFeishu: boolean;
  }): Promise<AdminCommandResult> {
    const commands = splitCommands(input.rawCommand);
    if (commands.length === 0) {
      return {
        command: "",
        output: "请输入命令。",
      };
    }

    const messages: string[] = [];
    const captureMessenger = createCaptureMessenger({
      messages,
      syncToFeishu: input.syncToFeishu,
      messenger: options.messenger,
      textChunkLimit: options.config.TEXT_CHUNK_LIMIT,
    });
    const commandService = options.createCommandService(captureMessenger);

    for (const raw of commands) {
      const parsed = parseBridgeCommand(raw);
      if (!parsed) {
        messages.push(`暂不支持命令：${raw}`);
        continue;
      }
      if (parsed.name === "group" && input.resolvedTarget.target.kind !== "group") {
        messages.push("请先选择一个群聊。");
        continue;
      }
      await commandService.handleBridgeCommand(
        input.resolvedTarget.identity,
        parsed,
        input.resolvedTarget.conversationTarget,
      );
    }

    return {
      command: commands.join("\n"),
      output: messages.join("\n\n") || "已执行。",
    };
  }

  return {
    executeRawCommand,
  };
}

export interface AdminCaptureMessenger {
  sendRenderedMessage(openId: string, text: string, limit: number): Promise<void>;
  sendTextMessage(openId: string, text: string): Promise<string | null>;
  sendRenderedMessageToTarget(target: ConversationTarget, text: string, limit: number): Promise<void>;
  sendTextMessageToTarget(target: ConversationTarget, text: string): Promise<string | null>;
}

function createCaptureMessenger(options: {
  messages: string[];
  syncToFeishu: boolean;
  messenger: Pick<
    FeishuMessenger,
    "sendRenderedMessage" | "sendTextMessage" | "sendRenderedMessageToTarget" | "sendTextMessageToTarget"
  >;
  textChunkLimit: number;
}): AdminCaptureMessenger {
  async function captureText(text: string): Promise<void> {
    const normalized = text.trim();
    if (normalized) {
      options.messages.push(normalized);
    }
  }

  return {
    async sendRenderedMessage(openId, text, limit) {
      await captureText(text);
      if (options.syncToFeishu) {
        await options.messenger.sendRenderedMessage(openId, text, limit);
      }
    },
    async sendTextMessage(openId, text) {
      await captureText(text);
      if (options.syncToFeishu) {
        return options.messenger.sendTextMessage(openId, text);
      }
      return "admin_local";
    },
    async sendRenderedMessageToTarget(target, text, limit) {
      await captureText(text);
      if (options.syncToFeishu) {
        await options.messenger.sendRenderedMessageToTarget(target, text, limit);
      }
    },
    async sendTextMessageToTarget(target, text) {
      await captureText(text);
      if (options.syncToFeishu) {
        return options.messenger.sendTextMessageToTarget(target, text);
      }
      return "admin_local";
    },
  };
}

function splitCommands(rawCommand: string): string[] {
  return rawCommand
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}
