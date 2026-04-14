import { beforeEach, describe, expect, it, vi } from "vitest";

const mockSendRenderedMessage = vi.fn();
const mockStartStreamingMessage = vi.fn();
const mockAddProcessingReaction = vi.fn();
const mockRemoveReaction = vi.fn();

vi.mock("../src/feishu/send.js", () => ({
  sendRenderedMessage: mockSendRenderedMessage,
  startStreamingMessage: mockStartStreamingMessage,
  addProcessingReaction: mockAddProcessingReaction,
  removeReaction: mockRemoveReaction,
  sendTextMessage: vi.fn(),
}));

type StreamEvent =
  | { type: "message_update"; assistantMessageEvent: { type: "text_delta"; delta: string } }
  | { type: "message_end" }
  | { type: "agent_end" };

function createSession(
  events: StreamEvent[],
  promptImpl?: () => Promise<void>,
  contextUsage?: { percent: number | null; contextWindow: number },
) {
  let subscriber: ((event: StreamEvent) => void) | undefined;

  return {
    prompt: vi.fn(async (..._args: unknown[]) => {
      if (promptImpl) {
        await promptImpl();
        return;
      }
      for (const event of events) {
        subscriber?.(event);
      }
    }),
    subscribe(callback: (event: StreamEvent) => void) {
      subscriber = callback;
      return () => {
        subscriber = undefined;
      };
    },
    getContextUsage: vi.fn().mockReturnValue(contextUsage),
    abort: vi.fn().mockResolvedValue(undefined),
  };
}

describe("promptSession", () => {
  beforeEach(() => {
    mockSendRenderedMessage.mockReset();
    mockStartStreamingMessage.mockReset();
    mockAddProcessingReaction.mockReset();
    mockRemoveReaction.mockReset();
    mockSendRenderedMessage.mockResolvedValue(undefined);
    mockStartStreamingMessage.mockResolvedValue(null);
    mockAddProcessingReaction.mockResolvedValue("reaction_1");
    mockRemoveReaction.mockResolvedValue(true);
  });

  it("开始时添加 reaction，结束后删除并发送最终文本", async () => {
    const { promptSession } = await import("../src/pi/stream.js");
    const session = createSession([
      { type: "message_update", assistantMessageEvent: { type: "text_delta", delta: "hello" } },
      { type: "message_update", assistantMessageEvent: { type: "text_delta", delta: " world" } },
      { type: "message_end" },
    ], undefined, { percent: 4.1, contextWindow: 200000 });

    const result = await promptSession(session as any, "hi", "ou_1", "om_source_1", "SMILE", true);

    expect(result).toEqual({ text: "hello world", error: undefined });
    expect(mockAddProcessingReaction).toHaveBeenCalledWith("om_source_1", "SMILE");
    expect(mockStartStreamingMessage).toHaveBeenCalledWith("ou_1", "✍️ 正在生成回复...", "hello world");
    expect(mockRemoveReaction).toHaveBeenCalledWith("om_source_1", "reaction_1");
    expect(mockSendRenderedMessage).toHaveBeenCalledTimes(1);
    expect(mockSendRenderedMessage).toHaveBeenCalledWith("ou_1", "hello world\n\n4.1%/200k", 2000);
  });

  it("启用流式卡片时，应持续更新并最终收口到同一条消息", async () => {
    const mockStreamingMessage = {
      updateStatus: vi.fn().mockResolvedValue(undefined),
      updateBody: vi.fn().mockResolvedValue(undefined),
      finish: vi.fn().mockResolvedValue(undefined),
    };
    mockStartStreamingMessage.mockResolvedValue(mockStreamingMessage);
    const { promptSession } = await import("../src/pi/stream.js");
    const session = createSession([
      { type: "tool_execution_start", toolName: "read" } as any,
      { type: "tool_execution_end", toolName: "read", isError: false } as any,
      { type: "message_update", assistantMessageEvent: { type: "text_delta", delta: "hello" } },
      { type: "message_update", assistantMessageEvent: { type: "text_delta", delta: " world" } },
      { type: "message_end" },
    ], undefined, { percent: 4.1, contextWindow: 200000 });

    const result = await promptSession(session as any, "hi", "ou_1", "om_source_1", "SMILE", true);

    expect(result).toEqual({ text: "hello world", error: undefined });
    expect(mockSendRenderedMessage).not.toHaveBeenCalled();
    expect(mockStartStreamingMessage).toHaveBeenCalledWith("ou_1", "✍️ 正在生成回复...", "hello world");
    expect(mockStreamingMessage.updateStatus).not.toHaveBeenCalledWith("🔧 正在调用工具：`read`");
    expect(mockStreamingMessage.updateBody).not.toHaveBeenCalledWith("hello world");
    expect(mockStreamingMessage.finish).toHaveBeenCalledWith("✅ 已完成", "hello world\n\n4.1%/200k", 2000);
  });

  it("reaction 添加失败时，仍应继续处理并发送回复", async () => {
    mockAddProcessingReaction.mockResolvedValue(null);
    const { promptSession } = await import("../src/pi/stream.js");
    const session = createSession([
      { type: "message_update", assistantMessageEvent: { type: "text_delta", delta: "done" } },
      { type: "message_end" },
    ]);

    const result = await promptSession(session as any, "hi", "ou_1", "om_source_1", undefined);

    expect(result.text).toBe("done");
    expect(mockRemoveReaction).not.toHaveBeenCalled();
    expect(mockSendRenderedMessage).toHaveBeenCalledWith("ou_1", "done", 2000);
  });

  it("长文本应交给渲染发送层处理", async () => {
    const { promptSession } = await import("../src/pi/stream.js");
    const longText = "a".repeat(4005);
    const session = createSession([
      { type: "message_update", assistantMessageEvent: { type: "text_delta", delta: longText } },
      { type: "message_end" },
    ]);

    await promptSession(session as any, "hi", "ou_1", "om_source_1", undefined, true, 2000);

    expect(mockSendRenderedMessage).toHaveBeenCalledWith("ou_1", longText, 2000);
  });

  it("拿不到上下文占用率时不应追加尾巴", async () => {
    const { promptSession } = await import("../src/pi/stream.js");
    const session = createSession([
      { type: "message_update", assistantMessageEvent: { type: "text_delta", delta: "done" } },
      { type: "message_end" },
    ], undefined, { percent: null, contextWindow: 200000 });

    await promptSession(session as any, "hi", "ou_1", "om_source_1", undefined);

    expect(mockSendRenderedMessage).toHaveBeenCalledWith("ou_1", "done", 2000);
  });

  it("没有正文时不应单独发送尾巴", async () => {
    const { promptSession } = await import("../src/pi/stream.js");
    const session = createSession([
      { type: "message_end" },
    ], undefined, { percent: 4.1, contextWindow: 200000 });

    const result = await promptSession(session as any, "hi", "ou_1", "om_source_1", undefined);

    expect(result).toEqual({ text: "", error: undefined });
    expect(mockSendRenderedMessage).not.toHaveBeenCalled();
  });

  it("prompt 失败但已有部分输出时，应追加中断提示", async () => {
    const { promptSession } = await import("../src/pi/stream.js");
    const session = createSession([], async () => {
      session.subscribeHandler?.({
        type: "message_update",
        assistantMessageEvent: { type: "text_delta", delta: "partial" },
      });
      throw new Error("boom");
    }) as any;

    const subscriberHolder = { current: undefined as ((event: StreamEvent) => void) | undefined };
    session.subscribe = (callback: (event: StreamEvent) => void) => {
      subscriberHolder.current = callback;
      (session as any).subscribeHandler = callback;
      return () => {
        subscriberHolder.current = undefined;
      };
    };

    const result = await promptSession(session, "hi", "ou_1", "om_source_1", undefined);

    expect(result).toEqual({ text: "partial", error: "boom" });
    expect(mockSendRenderedMessage).toHaveBeenCalledWith("ou_1", "partial\n\n⚠️ 回复中断: boom", 2000);
  });

  it("prompt 在产出正文前失败时，不应先发一条流式卡片错误消息", async () => {
    const { promptSession } = await import("../src/pi/stream.js");
    const session = createSession([], async () => {
      throw new Error("boom");
    });

    const result = await promptSession(session as any, "hi", "ou_1", "om_source_1", undefined, true);

    expect(result).toEqual({ text: "", error: "boom" });
    expect(mockStartStreamingMessage).not.toHaveBeenCalled();
    expect(mockSendRenderedMessage).not.toHaveBeenCalled();
  });

  it("最终发送前应去掉开头的空白行", async () => {
    const { promptSession } = await import("../src/pi/stream.js");
    const session = createSession([
      { type: "message_update", assistantMessageEvent: { type: "text_delta", delta: "\n\nhello" } },
      { type: "message_end" },
    ]);

    const result = await promptSession(session as any, "hi", "ou_1", "om_source_1", undefined);

    expect(result).toEqual({ text: "\n\nhello", error: undefined });
    expect(mockSendRenderedMessage).toHaveBeenCalledWith("ou_1", "hello", 2000);
  });

  it("带图片输入时应把 images 透传给 session.prompt", async () => {
    const { promptSession } = await import("../src/pi/stream.js");
    const session = createSession([
      { type: "message_update", assistantMessageEvent: { type: "text_delta", delta: "ok" } },
      { type: "message_end" },
    ]);

    await promptSession(
      session as any,
      {
        text: "看看这张图",
        images: [{ type: "image", data: "ZmFrZS1pbWFnZQ==", mimeType: "image/png" }],
      },
      "ou_1",
      "om_source_1",
      undefined,
    );

    expect(session.prompt).toHaveBeenCalledWith("看看这张图", {
      images: [{ type: "image", data: "ZmFrZS1pbWFnZQ==", mimeType: "image/png" }],
    });
  });

  it("关闭流式开关时，不应初始化流式卡片", async () => {
    const mockStreamingMessage = {
      updateStatus: vi.fn().mockResolvedValue(undefined),
      updateBody: vi.fn().mockResolvedValue(undefined),
      finish: vi.fn().mockResolvedValue(undefined),
    };
    mockStartStreamingMessage.mockResolvedValue(mockStreamingMessage);
    const { promptSession } = await import("../src/pi/stream.js");
    const session = createSession([
      { type: "message_update", assistantMessageEvent: { type: "text_delta", delta: "done" } },
      { type: "message_end" },
    ]);

    await promptSession(session as any, "hi", "ou_1", "om_source_1", undefined, false);

    expect(mockStartStreamingMessage).not.toHaveBeenCalled();
    expect(mockStreamingMessage.finish).not.toHaveBeenCalled();
    expect(mockSendRenderedMessage).toHaveBeenCalledWith("ou_1", "done", 2000);
  });
});
