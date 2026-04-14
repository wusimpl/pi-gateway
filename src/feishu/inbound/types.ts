import type { ImageContent } from "@mariozechner/pi-ai";
import type { UserIdentity } from "../../types.js";

export type FeishuInboundMessage =
  | {
      kind: "text";
      identity: UserIdentity;
      messageId: string;
      messageType: "text";
      createTime: string;
      rawContent: string;
      text: string;
    }
  | {
      kind: "image";
      identity: UserIdentity;
      messageId: string;
      messageType: "image";
      createTime: string;
      rawContent: string;
      imageKey: string;
    }
  | {
      kind: "audio";
      identity: UserIdentity;
      messageId: string;
      messageType: "audio";
      createTime: string;
      rawContent: string;
      fileKey: string;
      durationMs?: number;
    };

export interface DownloadedFeishuResource {
  resourceType: "image" | "audio";
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
  audioTranscribeProvider: "whisper" | "sensevoice";
  audioTranscribeScript: string;
  audioLanguage: string;
  audioTranscribeSenseVoicePython: string;
  audioTranscribeSenseVoiceModel: string;
  audioTranscribeSenseVoiceDevice: string;
}

export interface PreparedPromptInput {
  text: string;
  images?: ImageContent[];
  localFiles: string[];
}
