import { describe, it, expect, vi, beforeEach } from "vitest";

const mockCreate = vi.fn();
const mockReactionCreate = vi.fn();
const mockReactionDelete = vi.fn();

vi.mock("../src/feishu/client.js", () => ({
  getLarkClient: () => ({
    im: {
      message: {
        create: mockCreate,
      },
      messageReaction: {
        create: mockReactionCreate,
        delete: mockReactionDelete,
      },
    },
  }),
}));

describe("send helpers", () => {
  beforeEach(() => {
    vi.resetModules();
    mockCreate.mockReset();
    mockReactionCreate.mockReset();
    mockReactionDelete.mockReset();
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
});
