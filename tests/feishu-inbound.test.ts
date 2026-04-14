import { describe, expect, it } from "vitest";
import { normalizeFeishuInboundMessage } from "../src/feishu/inbound/normalize.js";
import { prepareFeishuPromptInput, supportsImageInput } from "../src/feishu/inbound/transform.js";

const baseOptions = {
  workspaceDir: "/tmp/pi-workspace/user",
  ollamaBaseUrl: "http://127.0.0.1:11434",
  ocrModel: "glm-ocr:latest",
  audioTranscribeProvider: "whisper" as const,
  audioTranscribeScript: "/tmp/transcribe.sh",
  audioLanguage: "zh",
  audioTranscribeSenseVoicePython: "/tmp/.venv-sensevoice/bin/python",
  audioTranscribeSenseVoiceModel: "iic/SenseVoiceSmall",
  audioTranscribeSenseVoiceDevice: "cpu",
};

describe("normalizeFeishuInboundMessage", () => {
  it("应把图片消息标准化", () => {
    const result = normalizeFeishuInboundMessage({
      sender: {
        senderId: { openId: "ou_1", userId: "u_1", unionId: "on_1" },
        senderType: "user",
        tenantKey: "tk",
      },
      message: {
        messageId: "om_1",
        chatId: "oc_1",
        chatType: "p2p",
        messageType: "image",
        content: '{"image_key":"img_123"}',
        createTime: "123",
      },
    });

    expect(result).toEqual({
      kind: "image",
      identity: { openId: "ou_1", userId: "u_1" },
      messageId: "om_1",
      messageType: "image",
      createTime: "123",
      rawContent: '{"image_key":"img_123"}',
      imageKey: "img_123",
    });
  });

  it("应把语音消息标准化", () => {
    const result = normalizeFeishuInboundMessage({
      sender: {
        senderId: { openId: "ou_1", userId: "u_1", unionId: "on_1" },
        senderType: "user",
        tenantKey: "tk",
      },
      message: {
        messageId: "om_2",
        chatId: "oc_1",
        chatType: "p2p",
        messageType: "audio",
        content: '{"file_key":"file_123","duration":3200}',
        createTime: "456",
      },
    });

    expect(result).toEqual({
      kind: "audio",
      identity: { openId: "ou_1", userId: "u_1" },
      messageId: "om_2",
      messageType: "audio",
      createTime: "456",
      rawContent: '{"file_key":"file_123","duration":3200}',
      fileKey: "file_123",
      durationMs: 3200,
    });
  });
});

describe("prepareFeishuPromptInput", () => {
  it("模型支持图片时应直接透传图片输入", async () => {
    const result = await prepareFeishuPromptInput(
      {
        kind: "image",
        identity: { openId: "ou_1" },
        messageId: "om_1",
        messageType: "image",
        createTime: "123",
        rawContent: '{"image_key":"img_123"}',
        imageKey: "img_123",
      },
      { model: { input: ["text", "image"] } } as any,
      baseOptions,
      {
        downloadResource: async () => ({
          resourceType: "image",
          downloadType: "image",
          fileKey: "img_123",
          filePath: "/tmp/pi-workspace/user/.feishu-inbox/om_1/image.png",
          fileName: "image.png",
          mimeType: "image/png",
        }),
        readBinaryFile: async () => Buffer.from("fake-image"),
      },
    );

    expect(result).toEqual({
      text: expect.stringContaining("请直接查看图片内容并继续对话"),
      images: [
        {
          type: "image",
          data: Buffer.from("fake-image").toString("base64"),
          mimeType: "image/png",
        },
      ],
      localFiles: ["/tmp/pi-workspace/user/.feishu-inbox/om_1/image.png"],
    });
  });

  it("模型不支持图片时应走 OCR 文本兜底", async () => {
    const result = await prepareFeishuPromptInput(
      {
        kind: "image",
        identity: { openId: "ou_1" },
        messageId: "om_1",
        messageType: "image",
        createTime: "123",
        rawContent: '{"image_key":"img_123"}',
        imageKey: "img_123",
      },
      { model: { input: ["text"] } } as any,
      baseOptions,
      {
        downloadResource: async () => ({
          resourceType: "image",
          downloadType: "image",
          fileKey: "img_123",
          filePath: "/tmp/pi-workspace/user/.feishu-inbox/om_1/image.png",
          fileName: "image.png",
          mimeType: "image/png",
        }),
        runImageOcr: async () => "图片里写着：你好世界",
      },
    );

    expect(result.images).toBeUndefined();
    expect(result.text).toContain("当前模型不支持直接看图");
    expect(result.text).toContain("图片里写着：你好世界");
  });

  it("语音消息应先转成文字", async () => {
    const result = await prepareFeishuPromptInput(
      {
        kind: "audio",
        identity: { openId: "ou_1" },
        messageId: "om_2",
        messageType: "audio",
        createTime: "456",
        rawContent: '{"file_key":"file_123","duration":3200}',
        fileKey: "file_123",
        durationMs: 3200,
      },
      { model: { input: ["text"] } } as any,
      baseOptions,
      {
        downloadResource: async () => ({
          resourceType: "audio",
          downloadType: "file",
          fileKey: "file_123",
          filePath: "/tmp/pi-workspace/user/.feishu-inbox/om_2/audio.ogg",
          fileName: "audio.ogg",
          mimeType: "audio/ogg",
        }),
        transcribeAudio: async () => "帮我看下这段代码哪里有问题",
      },
    );

    expect(result.images).toBeUndefined();
    expect(result.text).toContain("以下是本地转写结果");
    expect(result.text).toContain("帮我看下这段代码哪里有问题");
    expect(result.text).toContain("3200ms");
  });
});

describe("supportsImageInput", () => {
  it("应根据模型 input 能力判断", () => {
    expect(supportsImageInput({ model: { input: ["text", "image"] } } as any)).toBe(true);
    expect(supportsImageInput({ model: { input: ["text"] } } as any)).toBe(false);
    expect(supportsImageInput({ model: undefined } as any)).toBe(false);
  });
});
