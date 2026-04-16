import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const mockFileCreate = vi.fn();
const mockCreate = vi.fn();
const mockReactionCreate = vi.fn();
const mockReactionDelete = vi.fn();
const mockCardCreate = vi.fn();
const mockCardUpdate = vi.fn();
const mockCardSettings = vi.fn();
const mockCardContent = vi.fn();

vi.mock("../src/feishu/client.js", () => ({
  getLarkClient: () => ({
    im: {
      file: {
        create: mockFileCreate,
      },
      message: {
        create: mockCreate,
      },
      messageReaction: {
        create: mockReactionCreate,
        delete: mockReactionDelete,
      },
    },
    cardkit: {
      v1: {
        card: {
          create: mockCardCreate,
          update: mockCardUpdate,
          settings: mockCardSettings,
        },
        cardElement: {
          content: mockCardContent,
        },
      },
    },
  }),
}));

describe("send helpers", () => {
  const tempDirs: string[] = [];

  beforeEach(() => {
    vi.resetModules();
    mockFileCreate.mockReset();
    mockCreate.mockReset();
    mockReactionCreate.mockReset();
    mockReactionDelete.mockReset();
    mockCardCreate.mockReset();
    mockCardUpdate.mockReset();
    mockCardSettings.mockReset();
    mockCardContent.mockReset();
  });

  afterEach(async () => {
    await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
  });

  it("chunkText: 短文本不分块", async () => {
    const { chunkText } = await import("../src/feishu/send.js");
    expect(chunkText("hello", 10)).toEqual(["hello"]);
  });

  it("chunkText: 恰好等于限制不分块", async () => {
    const { chunkText } = await import("../src/feishu/send.js");
    const text = "a".repeat(10);
    expect(chunkText(text, 10)).toEqual([text]);
  });

  it("chunkText: 超长文本应分块", async () => {
    const { chunkText } = await import("../src/feishu/send.js");
    const text = "a".repeat(25);
    const chunks = chunkText(text, 10);
    expect(chunks.length).toBeGreaterThanOrEqual(3);
    expect(chunks.join("")).toBe(text);
  });

  it("chunkText: 优先在换行符处分割", async () => {
    const { chunkText } = await import("../src/feishu/send.js");
    const text = "line1\nline2\nline3\nline4\nline5";
    const chunks = chunkText(text, 12);
    for (const chunk of chunks) {
      expect(chunk.length).toBeLessThanOrEqual(12);
    }
    expect(chunks.join("").replace(/\n/g, "")).toBe(text.replace(/\n/g, ""));
  });

  it("chunkText: 没有换行符时直接在限制处分割", async () => {
    const { chunkText } = await import("../src/feishu/send.js");
    const text = "abcdefghij";
    expect(chunkText(text, 4)).toEqual(["abcd", "efgh", "ij"]);
  });

  it("chunkText: 空文本返回空数组", async () => {
    const { chunkText } = await import("../src/feishu/send.js");
    expect(chunkText("", 10)).toEqual([""]);
  });

  it("sendTextMessage: 应发送文本消息并返回 message_id", async () => {
    mockCreate.mockResolvedValue({ data: { message_id: "om_msg_1" } });
    const { sendTextMessage } = await import("../src/feishu/send.js");

    await expect(sendTextMessage("ou_1", "hello")).resolves.toBe("om_msg_1");
    expect(mockCreate).toHaveBeenCalledWith({
      params: { receive_id_type: "open_id" },
      data: {
        receive_id: "ou_1",
        msg_type: "text",
        content: JSON.stringify({ text: "hello" }),
      },
    });
  });

  it("sendFeishuMessage: 应发送 interactive 卡片消息", async () => {
    mockCreate.mockResolvedValue({ data: { message_id: "om_msg_2" } });
    const { sendFeishuMessage } = await import("../src/feishu/send.js");
    const content = {
      schema: "2.0",
      body: {
        elements: [{ tag: "markdown", content: "hello" }],
      },
    };

    await expect(sendFeishuMessage("ou_1", "interactive", content)).resolves.toBe("om_msg_2");
    expect(mockCreate).toHaveBeenCalledWith({
      params: { receive_id_type: "open_id" },
      data: {
        receive_id: "ou_1",
        msg_type: "interactive",
        content: JSON.stringify(content),
      },
    });
  });

  it("sendLocalFileMessage: 应先上传文件，再发送 file 消息", async () => {
    const dir = await mkdtemp(join(tmpdir(), "pi-gateway-send-file-"));
    tempDirs.push(dir);
    const filePath = join(dir, "report.txt");
    await writeFile(filePath, "hello file", "utf-8");

    mockFileCreate.mockResolvedValue({ file_key: "file_v2_1" });
    mockCreate.mockResolvedValue({ data: { message_id: "om_file_1" } });
    const { sendLocalFileMessage } = await import("../src/feishu/send.js");

    await expect(sendLocalFileMessage("ou_1", { path: filePath })).resolves.toEqual({
      fileKey: "file_v2_1",
      fileName: "report.txt",
      fileType: "stream",
      messageId: "om_file_1",
    });
    expect(mockFileCreate).toHaveBeenCalledWith({
      data: {
        file_type: "stream",
        file_name: "report.txt",
        file: expect.anything(),
      },
    });
    expect(mockCreate).toHaveBeenCalledWith({
      params: { receive_id_type: "open_id" },
      data: {
        receive_id: "ou_1",
        msg_type: "file",
        content: JSON.stringify({ file_key: "file_v2_1" }),
      },
    });
  });

  it("sendDocPreviewCard: 应发送带打开按钮的飞书文档卡片", async () => {
    mockCreate.mockResolvedValue({ data: { message_id: "om_doc_1" } });
    const { sendDocPreviewCard } = await import("../src/feishu/send.js");

    await expect(
      sendDocPreviewCard("ou_1", {
        documentId: "doxcn_card_1",
        title: "项目周报",
        operation: "created",
      }),
    ).resolves.toBe("om_doc_1");

    expect(mockCreate).toHaveBeenCalledTimes(1);
    const payload = mockCreate.mock.calls[0][0];
    expect(payload.data.msg_type).toBe("interactive");
    const cardJson = JSON.parse(payload.data.content);
    expect(cardJson.header).toMatchObject({
      title: {
        tag: "plain_text",
        content: "项目周报",
      },
      subtitle: {
        tag: "plain_text",
        content: "文档已创建",
      },
      template: "green",
    });
    expect(cardJson.card_link).toBeUndefined();
    expect(cardJson.body.elements[0]).toMatchObject({
      tag: "markdown",
      content: "新文档已经准备好了，点下面按钮直接打开。",
    });
    expect(cardJson.body.elements[1]).toMatchObject({
      tag: "button",
      text: {
        tag: "plain_text",
        content: "打开文档",
      },
    });
    expect(cardJson.body.elements[1].behaviors).toEqual([
      expect.objectContaining({
        type: "open_url",
        default_url: "https://feishu.cn/docx/doxcn_card_1",
      }),
    ]);
  });

  it("addProcessingReaction: 应添加指定 reaction 并返回 reaction_id", async () => {
    mockReactionCreate.mockResolvedValue({ data: { reaction_id: "reaction_1" } });
    const { addProcessingReaction } = await import("../src/feishu/send.js");

    await expect(addProcessingReaction("om_source_1", "SMILE")).resolves.toBe("reaction_1");
    expect(mockReactionCreate).toHaveBeenCalledWith({
      path: { message_id: "om_source_1" },
      data: {
        reaction_type: {
          emoji_type: "SMILE",
        },
      },
    });
  });

  it("addProcessingReaction: 未配置 reactionType 时直接跳过", async () => {
    const { addProcessingReaction } = await import("../src/feishu/send.js");

    await expect(addProcessingReaction("om_source_1")).resolves.toBeNull();
    expect(mockReactionCreate).not.toHaveBeenCalled();
  });

  it("removeReaction: 应删除 reaction", async () => {
    mockReactionDelete.mockResolvedValue({});
    const { removeReaction } = await import("../src/feishu/send.js");

    await expect(removeReaction("om_source_1", "reaction_1")).resolves.toBe(true);
    expect(mockReactionDelete).toHaveBeenCalledWith({
      path: {
        message_id: "om_source_1",
        reaction_id: "reaction_1",
      },
    });
  });

  it("startStreamingMessage: 应创建正文区和工具区的流式卡片并发送消息", async () => {
    mockCardCreate.mockResolvedValue({ data: { card_id: "card_1" } });
    mockCreate.mockResolvedValue({ data: { message_id: "om_stream_1" } });
    const { startStreamingMessage } = await import("../src/feishu/send.js");

    const stream = await startStreamingMessage("ou_1", "hello");

    expect(stream).not.toBeNull();
    expect(mockCardCreate).toHaveBeenCalledTimes(1);
    const cardPayload = mockCardCreate.mock.calls[0][0];
    expect(cardPayload.data.type).toBe("card_json");
    const cardJson = JSON.parse(cardPayload.data.data);
    expect(cardJson.header).toBeUndefined();
    expect(cardJson.config.streaming_mode).toBe(true);
    expect(cardJson.body.elements).toEqual([
      expect.objectContaining({
        element_id: "stream_body",
        content: "hello",
      }),
      expect.objectContaining({
        element_id: "stream_tools",
        content: "",
      }),
    ]);
    expect(mockCreate).toHaveBeenCalledWith({
      params: { receive_id_type: "open_id" },
      data: {
        receive_id: "ou_1",
        msg_type: "interactive",
        content: JSON.stringify({
          type: "card",
          data: {
            card_id: "card_1",
          },
        }),
      },
    });
  });

  it("startStreamingMessage: 只更新正文并在结束时关闭流式模式", async () => {
    mockCardCreate.mockResolvedValue({ data: { card_id: "card_1" } });
    mockCreate.mockResolvedValue({ data: { message_id: "om_stream_1" } });
    mockCardUpdate.mockResolvedValue({});
    mockCardContent.mockResolvedValue({});
    mockCardSettings.mockResolvedValue({});
    const { startStreamingMessage } = await import("../src/feishu/send.js");

    const stream = await startStreamingMessage("ou_1", "hello");

    expect(stream).not.toBeNull();
    await stream!.updateBody("hello world");
    await stream!.updateTools("read 运行中: package.json");
    await stream!.finish("hello world", 2000);

    expect(mockCardContent).toHaveBeenNthCalledWith(1, {
      path: {
        card_id: "card_1",
        element_id: "stream_body",
      },
      data: expect.objectContaining({
        content: "hello world",
        sequence: 1,
        uuid: expect.any(String),
      }),
    });
    expect(mockCardContent).toHaveBeenNthCalledWith(2, {
      path: {
        card_id: "card_1",
        element_id: "stream_tools",
      },
      data: expect.objectContaining({
        content: "read 运行中: package.json",
        sequence: 2,
        uuid: expect.any(String),
      }),
    });
    expect(mockCardContent).toHaveBeenNthCalledWith(3, {
      path: {
        card_id: "card_1",
        element_id: "stream_body",
      },
      data: expect.objectContaining({
        content: "hello world",
        sequence: 3,
        uuid: expect.any(String),
      }),
    });
    expect(mockCardSettings).toHaveBeenCalledWith({
      path: {
        card_id: "card_1",
      },
      data: expect.objectContaining({
        sequence: 4,
        uuid: expect.any(String),
      }),
    });
    const settingsJson = JSON.parse(mockCardSettings.mock.calls[0][0].data.settings);
    expect(settingsJson.config.streaming_mode).toBe(false);
    expect(settingsJson.config.summary.content).toBe("hello world");
  });

  it("startStreamingMessage: 收口把工具状态拼进正文时，应清空原工具区避免重复展示", async () => {
    mockCardCreate.mockResolvedValue({ data: { card_id: "card_1" } });
    mockCreate.mockResolvedValue({ data: { message_id: "om_stream_1" } });
    mockCardUpdate.mockResolvedValue({});
    mockCardContent.mockResolvedValue({});
    mockCardSettings.mockResolvedValue({});
    const { startStreamingMessage } = await import("../src/feishu/send.js");
    const longBody = "a".repeat(12010);

    const stream = await startStreamingMessage("ou_1", "hello");

    expect(stream).not.toBeNull();
    await stream!.updateTools("read 运行中: package.json");
    await stream!.finish(longBody, 2000, "**工具**\nread 完成: package.json");

    expect(mockCardContent).toHaveBeenNthCalledWith(1, {
      path: {
        card_id: "card_1",
        element_id: "stream_tools",
      },
      data: expect.objectContaining({
        content: "read 运行中: package.json",
        sequence: 1,
        uuid: expect.any(String),
      }),
    });
    expect(mockCardContent).toHaveBeenNthCalledWith(2, {
      path: {
        card_id: "card_1",
        element_id: "stream_body",
      },
      data: expect.objectContaining({
        content: `${longBody}\n\n**工具**\nread 完成: package.json`,
        sequence: 2,
        uuid: expect.any(String),
      }),
    });
    expect(mockCardContent).toHaveBeenNthCalledWith(3, {
      path: {
        card_id: "card_1",
        element_id: "stream_tools",
      },
      data: expect.objectContaining({
        content: "",
        sequence: 3,
        uuid: expect.any(String),
      }),
    });
    expect(mockCardSettings).toHaveBeenCalledWith({
      path: {
        card_id: "card_1",
      },
      data: expect.objectContaining({
        sequence: 4,
        uuid: expect.any(String),
      }),
    });
  });

  it("startStreamingMessage: 最终是表格卡片时应整卡更新，保留原有表格渲染", async () => {
    mockCardCreate.mockResolvedValue({ data: { card_id: "card_1" } });
    mockCreate.mockResolvedValue({ data: { message_id: "om_stream_1" } });
    mockCardUpdate.mockResolvedValue({});
    mockCardContent.mockResolvedValue({});
    mockCardSettings.mockResolvedValue({});
    const { startStreamingMessage } = await import("../src/feishu/send.js");

    const stream = await startStreamingMessage("ou_1", "hello");

    expect(stream).not.toBeNull();
    await stream!.finish(
      "模型列表\n\n| Provider | 模型 |\n| --- | --- |\n| rightcode | GPT-5.4 |\n",
      2000,
    );

    expect(mockCardUpdate).toHaveBeenCalledTimes(1);
    const updatePayload = mockCardUpdate.mock.calls[0][0];
    expect(updatePayload.path).toEqual({ card_id: "card_1" });
    expect(updatePayload.data.sequence).toBe(1);

    const cardJson = JSON.parse(updatePayload.data.card.data);
    expect(cardJson.header).toBeUndefined();
    expect(cardJson.config.streaming_mode).toBe(false);
    expect(cardJson.body.elements[0]).toMatchObject({
      tag: "markdown",
      content: "模型列表",
    });
    expect(cardJson.body.elements[1]).toMatchObject({
      tag: "table",
      rows: [{ col_0: "rightcode", col_1: "GPT-5.4" }],
    });
    expect(mockCardSettings).not.toHaveBeenCalled();
  });

  it("startStreamingMessage: 第二个参数应直接作为正文，而不是被错当成状态文本丢掉", async () => {
    mockCardCreate.mockResolvedValue({ data: { card_id: "card_2" } });
    mockCreate.mockResolvedValue({ data: { message_id: "om_stream_2" } });
    const { startStreamingMessage } = await import("../src/feishu/send.js");

    await startStreamingMessage("ou_2", "stream body");

    const cardPayload = mockCardCreate.mock.calls[0][0];
    const cardJson = JSON.parse(cardPayload.data.data);
    expect(cardJson.body.elements).toEqual([
      expect.objectContaining({
        element_id: "stream_body",
        content: "stream body",
      }),
      expect.objectContaining({
        element_id: "stream_tools",
        content: "",
      }),
    ]);
  });

  it("sendRenderedMessage: 应把每条发送成功的正文写入引用缓存", async () => {
    mockCreate
      .mockResolvedValueOnce({ data: { message_id: "om_quote_1" } })
      .mockResolvedValueOnce({ data: { message_id: "om_quote_2" } });
    const quotedMessageStore = {
      writeQuotedMessage: vi.fn().mockResolvedValue(undefined),
      readQuotedMessage: vi.fn(),
    };
    const { createFeishuMessenger } = await import("../src/feishu/send.js");

    const messenger = createFeishuMessenger(
      {
        im: {
          file: {
            create: mockFileCreate,
          },
          message: {
            create: mockCreate,
          },
          messageReaction: {
            create: mockReactionCreate,
            delete: mockReactionDelete,
          },
        },
        cardkit: {
          v1: {
            card: {
              create: mockCardCreate,
              update: mockCardUpdate,
              settings: mockCardSettings,
            },
            cardElement: {
              content: mockCardContent,
            },
          },
        },
      } as any,
      {
        quotedMessageStore,
      },
    );

    await messenger.sendRenderedMessage("ou_1", "aaaa\n\nbbbb", 4);

    expect(quotedMessageStore.writeQuotedMessage).toHaveBeenCalledTimes(2);
    expect(quotedMessageStore.writeQuotedMessage).toHaveBeenNthCalledWith(1, {
      messageId: "om_quote_1",
      messageType: "text",
      text: "aaaa",
    });
    expect(quotedMessageStore.writeQuotedMessage).toHaveBeenNthCalledWith(2, {
      messageId: "om_quote_2",
      messageType: "text",
      text: "bbb",
    });
  });

  it("startStreamingMessage.finish: 应把最终收口正文写入引用缓存", async () => {
    mockCardCreate.mockResolvedValue({ data: { card_id: "card_cache_1" } });
    mockCreate.mockResolvedValue({ data: { message_id: "om_stream_cache_1" } });
    mockCardUpdate.mockResolvedValue({});
    mockCardContent.mockResolvedValue({});
    mockCardSettings.mockResolvedValue({});
    const quotedMessageStore = {
      writeQuotedMessage: vi.fn().mockResolvedValue(undefined),
      readQuotedMessage: vi.fn(),
    };
    const { createFeishuMessenger } = await import("../src/feishu/send.js");

    const messenger = createFeishuMessenger(
      {
        im: {
          file: {
            create: mockFileCreate,
          },
          message: {
            create: mockCreate,
          },
          messageReaction: {
            create: mockReactionCreate,
            delete: mockReactionDelete,
          },
        },
        cardkit: {
          v1: {
            card: {
              create: mockCardCreate,
              update: mockCardUpdate,
              settings: mockCardSettings,
            },
            cardElement: {
              content: mockCardContent,
            },
          },
        },
      } as any,
      {
        quotedMessageStore,
      },
    );

    const stream = await messenger.startStreamingMessage("ou_1", "init");
    await stream!.finish("最终完整正文", 2000, "**工具**\nread 完成: src/index.ts");

    expect(quotedMessageStore.writeQuotedMessage).toHaveBeenCalledWith({
      messageId: "om_stream_cache_1",
      messageType: "interactive",
      text: "最终完整正文\n\n**工具**\nread 完成: src/index.ts",
    });
  });
});
