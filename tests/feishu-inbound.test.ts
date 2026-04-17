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
  audioTranscribeDoubaoApiKey: "",
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
        rootId: "om_root_1",
        parentId: "om_parent_1",
        threadId: "omt_1",
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
      rootMessageId: "om_root_1",
      parentMessageId: "om_parent_1",
      threadId: "omt_1",
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
        rootId: "om_root_2",
        parentId: "om_parent_2",
        threadId: "omt_2",
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
      rootMessageId: "om_root_2",
      parentMessageId: "om_parent_2",
      threadId: "omt_2",
      messageType: "audio",
      createTime: "456",
      rawContent: '{"file_key":"file_123","duration":3200}',
      fileKey: "file_123",
      durationMs: 3200,
    });
  });

  it("应把文件消息标准化", () => {
    const result = normalizeFeishuInboundMessage({
      sender: {
        senderId: { openId: "ou_1", userId: "u_1", unionId: "on_1" },
        senderType: "user",
        tenantKey: "tk",
      },
      message: {
        messageId: "om_file_1",
        rootId: "om_root_file_1",
        parentId: "om_parent_file_1",
        threadId: "omt_file_1",
        chatId: "oc_1",
        chatType: "p2p",
        messageType: "file",
        content: '{"file_key":"file_v2_123","file_name":"report.pdf"}',
        createTime: "567",
      },
    });

    expect(result).toEqual({
      kind: "file",
      identity: { openId: "ou_1", userId: "u_1" },
      messageId: "om_file_1",
      rootMessageId: "om_root_file_1",
      parentMessageId: "om_parent_file_1",
      threadId: "omt_file_1",
      messageType: "file",
      createTime: "567",
      rawContent: '{"file_key":"file_v2_123","file_name":"report.pdf"}',
      fileKey: "file_v2_123",
      fileName: "report.pdf",
    });
  });

  it("应把富文本消息压平成可继续对话的文本", () => {
    const result = normalizeFeishuInboundMessage({
      sender: {
        senderId: { openId: "ou_1", userId: "u_1", unionId: "on_1" },
        senderType: "user",
        tenantKey: "tk",
      },
      message: {
        messageId: "om_3",
        rootId: "om_root_3",
        parentId: "om_parent_3",
        threadId: "omt_3",
        chatId: "oc_1",
        chatType: "p2p",
        messageType: "post",
        content: JSON.stringify({
          zh_cn: {
            title: "你为什么会说这些话：",
            content: [
              [{ tag: "text", text: "🔧 调试代码" }],
              [{ tag: "text", text: "📁 查看或修改文件" }],
              [{ tag: "text", text: "🎨 设计 UI 界面" }],
            ],
          },
        }),
        createTime: "789",
      },
    });

    expect(result).toEqual({
      kind: "text",
      identity: { openId: "ou_1", userId: "u_1" },
      messageId: "om_3",
      rootMessageId: "om_root_3",
      parentMessageId: "om_parent_3",
      threadId: "omt_3",
      messageType: "post",
      createTime: "789",
      rawContent: JSON.stringify({
        zh_cn: {
          title: "你为什么会说这些话：",
          content: [
            [{ tag: "text", text: "🔧 调试代码" }],
            [{ tag: "text", text: "📁 查看或修改文件" }],
            [{ tag: "text", text: "🎨 设计 UI 界面" }],
          ],
        },
      }),
      text: "你为什么会说这些话：\n🔧 调试代码\n📁 查看或修改文件\n🎨 设计 UI 界面",
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

  it("引用回复时应把被引用消息一起拼进文本 prompt", async () => {
    const result = await prepareFeishuPromptInput(
      {
        kind: "text",
        identity: { openId: "ou_1" },
        messageId: "om_quoted_1",
        parentMessageId: "om_parent_1",
        quotedMessage: {
          messageId: "om_parent_1",
          messageType: "text",
          text: "上一条消息内容",
        },
        messageType: "text",
        createTime: "123",
        rawContent: '{"text":"go on"}',
        text: "go on",
      },
      { model: { input: ["text"] } } as any,
      baseOptions,
    );

    expect(result.images).toBeUndefined();
    expect(result.localFiles).toEqual([]);
    expect(result.text).toContain("用户这次是在回复一条之前的消息");
    expect(result.text).toContain("上一条消息内容");
    expect(result.text).toContain("go on");
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
    expect(result.preludeText).toBe(" ---\n**OCR 识别结果**\n图片里写着：你好世界");
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
    expect(result.text).toContain("以下是语音转写结果");
    expect(result.text).toContain("帮我看下这段代码哪里有问题");
    expect(result.text).toContain("3200ms");
    expect(result.preludeText).toBe(" ---\n**语音转录结果**\n帮我看下这段代码哪里有问题");
  });

  it("文件消息应下载到 workspace 并把路径放进 prompt", async () => {
    const result = await prepareFeishuPromptInput(
      {
        kind: "file",
        identity: { openId: "ou_1" },
        messageId: "om_file_1",
        messageType: "file",
        createTime: "567",
        rawContent: '{"file_key":"file_v2_123","file_name":"report.pdf"}',
        fileKey: "file_v2_123",
        fileName: "report.pdf",
      },
      { model: { input: ["text"] } } as any,
      baseOptions,
      {
        downloadResource: async (options) => {
          expect(options).toMatchObject({
            workspaceDir: "/tmp/pi-workspace/user",
            messageId: "om_file_1",
            fileKey: "file_v2_123",
            resourceType: "file",
            fileNameHint: "report.pdf",
          });
          return {
            resourceType: "file",
            downloadType: "file",
            fileKey: "file_v2_123",
            filePath: "/tmp/pi-workspace/user/.feishu-inbox/om_file_1/report.pdf",
            fileName: "report.pdf",
            mimeType: "application/pdf",
          };
        },
      },
    );

    expect(result.images).toBeUndefined();
    expect(result.preludeText).toBeUndefined();
    expect(result.localFiles).toEqual(["/tmp/pi-workspace/user/.feishu-inbox/om_file_1/report.pdf"]);
    expect(result.text).toContain("report.pdf");
    expect(result.text.endsWith("/tmp/pi-workspace/user/.feishu-inbox/om_file_1/report.pdf")).toBe(true);
  });
});

describe("supportsImageInput", () => {
  it("应根据模型 input 能力判断", () => {
    expect(supportsImageInput({ model: { input: ["text", "image"] } } as any)).toBe(true);
    expect(supportsImageInput({ model: { input: ["text"] } } as any)).toBe(false);
    expect(supportsImageInput({ model: undefined } as any)).toBe(false);
  });
});
