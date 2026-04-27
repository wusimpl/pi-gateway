import type { ImageContent } from "@mariozechner/pi-ai";
import type { ConversationTarget } from "../../conversation.js";
import type { UserIdentity } from "../../types.js";

export interface FeishuQuotedMessage {
  messageId: string;
  messageType: string;
  text: string;
}

interface FeishuInboundMessageBase {
  identity: UserIdentity;
  conversationTarget: ConversationTarget;
  messageId: string;
  rootMessageId?: string;
  parentMessageId?: string;
  threadId?: string;
  quotedMessage?: FeishuQuotedMessage;
  createTime: string;
  rawContent: string;
}

export type FeishuInboundMessage =
  | {
      kind: "text";
      } & FeishuInboundMessageBase & {
      messageType: "text" | "post";
      text: string;
    }
  | {
      kind: "image";
      } & FeishuInboundMessageBase & {
      messageType: "image";
      imageKey: string;
    }
  | {
      kind: "audio";
      } & FeishuInboundMessageBase & {
      messageType: "audio";
      fileKey: string;
      durationMs?: number;
    }
  | {
      kind: "file";
      } & FeishuInboundMessageBase & {
      messageType: "file";
      fileKey: string;
      fileName?: string;
    };

export interface DownloadedFeishuResource {
  resourceType: "image" | "audio" | "file";
  downloadType: "image" | "file";
  fileKey: string;
  filePath: string;
  fileName: string;
  mimeType: string;
}

export interface FeishuMediaProcessingOptions {
  workspaceDir: string;
  ollamaBaseUrl: string;
  ocrModel: string;
  audioTranscribeProvider: "whisper" | "sensevoice" | "doubao";
  audioTranscribeScript: string;
  audioLanguage: string;
  audioTranscribeSenseVoicePython: string;
  audioTranscribeSenseVoiceModel: string;
  audioTranscribeSenseVoiceDevice: string;
  audioTranscribeDoubaoApiKey: string;
}

export interface PreparedPromptInput {
  text: string;
  preludeText?: string;
  images?: ImageContent[];
  localFiles: string[];
}
