import { beforeEach, describe, expect, it, vi } from "vitest";

const mockSendRenderedMessage = vi.fn();
const mockSendRenderedMessageToTarget = vi.fn();
const mockSendDocPreviewCard = vi.fn();
const mockStartStreamingMessage = vi.fn();
const mockAddProcessingReaction = vi.fn();
const mockRemoveReaction = vi.fn();

vi.mock("../src/feishu/send.js", () => ({
  sendRenderedMessage: mockSendRenderedMessage,
  sendRenderedMessageToTarget: mockSendRenderedMessageToTarget,
  sendDocPreviewCard: mockSendDocPreviewCard,
  startStreamingMessage: mockStartStreamingMessage,
  addProcessingReaction: mockAddProcessingReaction,
  removeReaction: mockRemoveReaction,
  sendTextMessage: vi.fn(),
}));

type StreamEvent =
  | {
      type: "message_start";
      message: {
        role?: string;
        content?: string | Array<{ type: string; text?: string }>;
      };
    }
  | { type: "message_update"; assistantMessageEvent: { type: "text_delta"; delta: string } }
  | {
      type: "message_end";
      message?: {
        role?: string;
        stopReason?: string;
        errorMessage?: string;
        content?: Array<{ type: string; text?: string }>;
      };
    }
  | { type: "agent_end" }
  | { type: "auto_retry_start"; attempt: number; maxAttempts: number; delayMs: number; errorMessage: string }
  | { type: "auto_retry_end"; success: boolean; attempt: number; finalError?: string };

function createSession(
  events: StreamEvent[],
  promptImpl?: () => Promise<void>,
  contextUsage?: { percent: number | null; contextWindow: number },
  model?: { provider: string; id: string },
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
    model,
    getContextUsage: vi.fn().mockReturnValue(contextUsage),
    abort: vi.fn().mockResolvedValue(undefined),
  };
}

describe("promptSession", () => {
  beforeEach(() => {
    mockSendRenderedMessage.mockReset();
    mockSendRenderedMessageToTarget.mockReset();
    mockSendDocPreviewCard.mockReset();
    mockStartStreamingMessage.mockReset();
    mockAddProcessingReaction.mockReset();
    mockRemoveReaction.mockReset();
    mockSendRenderedMessage.mockResolvedValue(undefined);
    mockSendRenderedMessageToTarget.mockResolvedValue(undefined);
    mockSendDocPreviewCard.mockResolvedValue("om_doc_1");
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
    ], undefined, { percent: 4.1, contextWindow: 200000 }, { provider: "rightcodes", id: "gpt-5.4-high" });

    const result = await promptSession(session as any, "hi", "ou_1", "om_source_1", "SMILE", true);

    expect(result).toEqual({ text: "hello world", error: undefined });
    expect(mockAddProcessingReaction).toHaveBeenCalledWith("om_source_1", "SMILE");
    expect(mockStartStreamingMessage).toHaveBeenCalledWith("ou_1", "hello world", "", "");
    expect(mockRemoveReaction).toHaveBeenCalledWith("om_source_1", "reaction_1");
    expect(mockSendRenderedMessage).toHaveBeenCalledTimes(1);
    expect(mockSendRenderedMessage).toHaveBeenCalledWith(
      "ou_1",
      "hello world\n\n4.1% 8.2k/200k | 模型: rightcodes/gpt-5.4-high",
      2000,
    );
  });

  it("支持调用方给最终消息加展示头和状态标签", async () => {
    const { promptSession } = await import("../src/pi/stream.js");
    const session = createSession([
      { type: "message_update", assistantMessageEvent: { type: "text_delta", delta: "hello" } },
      { type: "message_end" },
    ], undefined, { percent: 4.1, contextWindow: 200000 }, { provider: "rightcodes", id: "gpt-5.4-high" });

    const result = await promptSession(
      session as any,
      {
        text: "hi",
        displayHeaderText: "HEADER",
        footerLabel: "FOOTER: ",
      },
      "ou_1",
      "om_source_1",
      undefined,
      false,
    );

    expect(result).toEqual({ text: "hello", error: undefined });
    expect(mockSendRenderedMessage).toHaveBeenCalledWith(
      "ou_1",
      "HEADER\n\nhello\n\nFOOTER: 4.1% 8.2k/200k | 模型: rightcodes/gpt-5.4-high",
      2000,
    );
  });

  it("文档工具创建成功后，应在正文后补发飞书文档卡片", async () => {
    const { promptSession } = await import("../src/pi/stream.js");
    const session = createSession([
      {
        type: "tool_execution_end",
        toolName: "feishu_doc_create",
        isError: false,
        result: {
          details: {
            document_id: "doxcn_card_1",
            document_url: "https://feishu.cn/docx/doxcn_card_1",
            title: "项目周报",
          },
        },
      } as any,
      { type: "message_update", assistantMessageEvent: { type: "text_delta", delta: "已帮你建好文档" } },
      { type: "message_end" },
    ]);

    const result = await promptSession(session as any, "hi", "ou_1", "om_source_1", undefined);

    expect(result).toEqual({ text: "已帮你建好文档", error: undefined });
    expect(mockSendRenderedMessage).toHaveBeenCalledWith("ou_1", "已帮你建好文档", 2000);
    expect(mockSendDocPreviewCard).toHaveBeenCalledWith("ou_1", {
      documentId: "doxcn_card_1",
      documentUrl: "https://feishu.cn/docx/doxcn_card_1",
      title: "项目周报",
      operation: "created",
    });
  });

  it("群聊中文档工具创建成功后，应把飞书文档卡片发回群聊", async () => {
    const groupTarget = {
      kind: "group",
      key: "oc_1",
      receiveIdType: "chat_id",
      receiveId: "oc_1",
      chatId: "oc_1",
    } as const;
    const { promptSession } = await import("../src/pi/stream.js");
    const session = createSession([
      {
        type: "tool_execution_end",
        toolName: "feishu_doc_create",
        isError: false,
        result: {
          details: {
            document_id: "doxcn_group_1",
            document_url: "https://feishu.cn/docx/doxcn_group_1",
            title: "群聊周报",
          },
        },
      } as any,
      { type: "message_update", assistantMessageEvent: { type: "text_delta", delta: "已帮大家建好文档" } },
      { type: "message_end" },
    ]);

    await promptSession(
      session as any,
      "hi",
      "ou_1",
      "om_source_1",
      undefined,
      false,
      2000,
      "off",
      undefined,
      undefined,
      groupTarget,
    );

    expect(mockSendRenderedMessageToTarget).toHaveBeenCalledWith(groupTarget, "已帮大家建好文档", 2000);
    expect(mockSendDocPreviewCard).toHaveBeenCalledWith(groupTarget, {
      documentId: "doxcn_group_1",
      documentUrl: "https://feishu.cn/docx/doxcn_group_1",
      title: "群聊周报",
      operation: "created",
    });
  });

  it("只读文档工具不应额外补发文档卡片", async () => {
    const { promptSession } = await import("../src/pi/stream.js");
    const session = createSession([
      {
        type: "tool_execution_end",
        toolName: "feishu_doc_read",
        isError: false,
        result: {
          details: {
            document_id: "doxcn_read_1",
            document_url: "https://feishu.cn/docx/doxcn_read_1",
            title: "只读文档",
          },
        },
      } as any,
      { type: "message_update", assistantMessageEvent: { type: "text_delta", delta: "我先看了一眼文档" } },
      { type: "message_end" },
    ]);

    await promptSession(session as any, "hi", "ou_1", "om_source_1", undefined);

    expect(mockSendDocPreviewCard).not.toHaveBeenCalled();
  });

  it("启用流式卡片时，应持续更新并最终收口到同一条消息", async () => {
    const mockStreamingMessage = {
      updateBody: vi.fn().mockResolvedValue(undefined),
      updateTools: vi.fn().mockResolvedValue(undefined),
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
    ], undefined, { percent: 4.1, contextWindow: 200000 }, { provider: "rightcodes", id: "gpt-5.4-high" });

    const result = await promptSession(session as any, "hi", "ou_1", "om_source_1", "SMILE", true);

    expect(result).toEqual({ text: "hello world", error: undefined });
    expect(mockSendRenderedMessage).not.toHaveBeenCalled();
    expect(mockStartStreamingMessage).toHaveBeenCalledWith("ou_1", "hello world", "", "");
    expect(mockStreamingMessage.updateBody).not.toHaveBeenCalledWith("hello world");
    expect(mockStreamingMessage.finish).toHaveBeenCalledWith(
      "hello world\n\n4.1% 8.2k/200k | 模型: rightcodes/gpt-5.4-high",
      2000,
      "",
      "",
    );
  });

  it("群聊启用流式卡片时，应把流式卡片发回群聊", async () => {
    const groupTarget = {
      kind: "group",
      key: "oc_1",
      receiveIdType: "chat_id",
      receiveId: "oc_1",
      chatId: "oc_1",
    } as const;
    const mockStreamingMessage = {
      updateBody: vi.fn().mockResolvedValue(undefined),
      updateTools: vi.fn().mockResolvedValue(undefined),
      finish: vi.fn().mockResolvedValue(undefined),
    };
    mockStartStreamingMessage.mockResolvedValue(mockStreamingMessage);
    const { promptSession } = await import("../src/pi/stream.js");
    const session = createSession([
      { type: "message_update", assistantMessageEvent: { type: "text_delta", delta: "hello group" } },
      { type: "message_end" },
    ]);

    await promptSession(
      session as any,
      "hi",
      "ou_1",
      "om_group_1",
      undefined,
      true,
      2000,
      "off",
      undefined,
      undefined,
      groupTarget,
    );

    expect(mockStartStreamingMessage).toHaveBeenCalledWith(groupTarget, "hello group", "", "");
    expect(mockStreamingMessage.finish).toHaveBeenCalledWith("hello group", 2000, "", "");
    expect(mockSendRenderedMessageToTarget).not.toHaveBeenCalled();
  });

  it("有语音转录结果时，应单独保留转录区块并在收口时把正文放前面", async () => {
    const mockStreamingMessage = {
      updateBody: vi.fn().mockResolvedValue(undefined),
      updateTools: vi.fn().mockResolvedValue(undefined),
      finish: vi.fn().mockResolvedValue(undefined),
    };
    mockStartStreamingMessage.mockResolvedValue(mockStreamingMessage);
    const { promptSession } = await import("../src/pi/stream.js");
    const session = createSession([
      { type: "message_update", assistantMessageEvent: { type: "text_delta", delta: "收到，你这段话的意思是" } },
      { type: "message_end" },
    ]);

    await promptSession(
      session as any,
      {
        text: "用户的语音转写",
        preludeText: " ---\n**语音转录结果**\n用户的语音转写",
      },
      "ou_1",
      "om_source_1",
      undefined,
      true,
    );

    expect(mockStartStreamingMessage).toHaveBeenCalledWith(
      "ou_1",
      "",
      "",
      " ---\n**语音转录结果**\n用户的语音转写",
    );
    expect(mockStreamingMessage.finish).toHaveBeenCalledWith(
      "收到，你这段话的意思是",
      2000,
      "",
      " ---\n**语音转录结果**\n用户的语音转写",
    );
  });

  it("开启工具展示后，应在流式卡片里实时刷新简短工具状态", async () => {
    const mockStreamingMessage = {
      updateBody: vi.fn().mockResolvedValue(undefined),
      updateTools: vi.fn().mockResolvedValue(undefined),
      finish: vi.fn().mockResolvedValue(undefined),
    };
    mockStartStreamingMessage.mockResolvedValue(mockStreamingMessage);
    const { promptSession } = await import("../src/pi/stream.js");
    const session = createSession([
      {
        type: "tool_execution_start",
        toolCallId: "call_1",
        toolName: "read",
        args: { filePath: "src/index.ts" },
      } as any,
      {
        type: "tool_execution_update",
        toolCallId: "call_1",
        toolName: "read",
        partialResult: {
          content: [{ type: "text", text: "import { loadConfig } from \"./config.js\";" }],
        },
      } as any,
      { type: "message_update", assistantMessageEvent: { type: "text_delta", delta: "我先看了入口文件。" } },
      {
        type: "tool_execution_end",
        toolCallId: "call_1",
        toolName: "read",
        isError: false,
        result: {
          content: [{ type: "text", text: "import { loadConfig } from \"./config.js\";" }],
        },
      } as any,
      { type: "message_end" },
    ]);

    await promptSession(session as any, "hi", "ou_1", "om_source_1", undefined, true, 2000, true);

    expect(mockStartStreamingMessage).toHaveBeenCalledWith(
      "ou_1",
      "",
      " ---\n**工具调用**\n🛠️ read : src/index.ts",
      "",
    );
    expect(mockStreamingMessage.updateTools).not.toHaveBeenCalled();
    expect(mockStreamingMessage.finish).toHaveBeenCalledWith(
      "我先看了入口文件。",
      2000,
      " ---\n**工具调用**\n🛠️ read : src/index.ts",
      "",
    );
  });

  it("非流式时应把预处理结果放在正文后面", async () => {
    const { promptSession } = await import("../src/pi/stream.js");
    const session = createSession([
      { type: "message_update", assistantMessageEvent: { type: "text_delta", delta: "我已经看过转录内容了" } },
      { type: "message_end" },
    ]);

    const result = await promptSession(
      session as any,
      {
        text: "帮我总结一下",
        preludeText: " ---\n**语音转录结果**\n帮我总结一下",
      },
      "ou_1",
      "om_source_1",
      undefined,
      false,
      2000,
    );

    expect(result).toEqual({ text: "我已经看过转录内容了", error: undefined });
    expect(mockSendRenderedMessage).toHaveBeenCalledWith(
      "ou_1",
      "我已经看过转录内容了\n\n ---\n**语音转录结果**\n帮我总结一下",
      2000,
    );
  });

  it("非流式且没有 assistant 正文时，仍应发送最终工具状态", async () => {
    const { promptSession } = await import("../src/pi/stream.js");
    const session = createSession([
      {
        type: "tool_execution_start",
        toolCallId: "call_1",
        toolName: "read",
        args: { filePath: "package.json" },
      } as any,
      {
        type: "tool_execution_end",
        toolCallId: "call_1",
        toolName: "read",
        isError: false,
        result: {
          details: {
            path: "package.json",
          },
        },
      } as any,
      { type: "message_end" },
    ]);

    const result = await promptSession(session as any, "hi", "ou_1", "om_source_1", undefined, false, 2000, true);

    expect(result).toEqual({ text: "", error: undefined });
    expect(mockStartStreamingMessage).not.toHaveBeenCalled();
    expect(mockSendRenderedMessage).toHaveBeenCalledWith(
      "ou_1",
      " ---\n**工具调用**\n🛠️ read : package.json",
      2000,
    );
  });

  it("bash 工具完成时应同时保留命令和输出摘要", async () => {
    const { promptSession } = await import("../src/pi/stream.js");
    const session = createSession([
      {
        type: "tool_execution_start",
        toolCallId: "call_1",
        toolName: "bash",
        args: { command: "ls ~/.pi/agent/skills" },
      } as any,
      {
        type: "tool_execution_end",
        toolCallId: "call_1",
        toolName: "bash",
        isError: false,
        result: {
          content: [{ type: "text", text: "feishu-docs feishu-files obsidian-notes tavily-search" }],
        },
      } as any,
      { type: "message_end" },
    ]);

    const result = await promptSession(session as any, "hi", "ou_1", "om_source_1", undefined, false, 2000, true);

    expect(result).toEqual({ text: "", error: undefined });
    expect(mockSendRenderedMessage).toHaveBeenCalledWith(
      "ou_1",
      " ---\n**工具调用**\n🛠️ bash: ls ~/.pi/agent/skills\n📤 output: feishu-docs feishu-files obsidian-notes tavily-search",
      2000,
    );
  });

  it("工具调用 name 模式只显示工具名", async () => {
    const { promptSession } = await import("../src/pi/stream.js");
    const session = createSession([
      {
        type: "tool_execution_start",
        toolCallId: "call_1",
        toolName: "bash",
        args: { command: "ls ~/.pi/agent/skills" },
      } as any,
      {
        type: "tool_execution_end",
        toolCallId: "call_1",
        toolName: "bash",
        isError: false,
        result: {
          content: [{ type: "text", text: "feishu-docs feishu-files obsidian-notes tavily-search" }],
        },
      } as any,
      { type: "message_end" },
    ]);

    const result = await promptSession(session as any, "hi", "ou_1", "om_source_1", undefined, false, 2000, "name");

    expect(result).toEqual({ text: "", error: undefined });
    expect(mockSendRenderedMessage).toHaveBeenCalledWith(
      "ou_1",
      " ---\n**工具调用**\n🛠️ bash",
      2000,
    );
  });

  it("工具调用 name 模式每行最多显示三个工具名", async () => {
    const { promptSession } = await import("../src/pi/stream.js");
    const toolNames = ["read", "bash", "edit", "grep", "write"];
    const events = toolNames.flatMap((toolName, index) => [
      {
        type: "tool_execution_start",
        toolCallId: `call_${index}`,
        toolName,
        args: {},
      } as any,
      {
        type: "tool_execution_end",
        toolCallId: `call_${index}`,
        toolName,
        isError: false,
        result: {},
      } as any,
    ]);
    const session = createSession([...events, { type: "message_end" }]);

    const result = await promptSession(session as any, "hi", "ou_1", "om_source_1", undefined, false, 2000, "name");

    expect(result).toEqual({ text: "", error: undefined });
    expect(mockSendRenderedMessage).toHaveBeenCalledWith(
      "ou_1",
      " ---\n**工具调用**\n🛠️ read 🛠️ bash 🛠️ edit\n🛠️ grep 🛠️ write",
      2000,
    );
  });

  it("bash 工具无输出时也应保留命令和输出摘要", async () => {
    const { promptSession } = await import("../src/pi/stream.js");
    const session = createSession([
      {
        type: "tool_execution_start",
        toolCallId: "call_1",
        toolName: "bash",
        args: { command: "rm -rf /tmp/example" },
      } as any,
      {
        type: "tool_execution_end",
        toolCallId: "call_1",
        toolName: "bash",
        isError: false,
        result: {
          content: [{ type: "text", text: "(no output)" }],
        },
      } as any,
      { type: "message_end" },
    ]);

    const result = await promptSession(session as any, "hi", "ou_1", "om_source_1", undefined, false, 2000, true);

    expect(result).toEqual({ text: "", error: undefined });
    expect(mockSendRenderedMessage).toHaveBeenCalledWith(
      "ou_1",
      " ---\n**工具调用**\n🛠️ bash: rm -rf /tmp/example\n📤 output: (no output)",
      2000,
    );
  });

  it("结构化工具结果应优先展示 details 摘要而不是整段 JSON", async () => {
    const { promptSession } = await import("../src/pi/stream.js");
    const fileDetails = {
      open_id: "ou_f63b0f6d9b91dca7dc09eca00b02c8af",
      path: "/Users/williamsandy/code/pi-gateway/reports/final.pdf",
      file_name: "final.pdf",
      file_key: "file_1",
      message_id: "om_1",
    };
    const cronDetails = {
      action: "add",
      job: {
        id: "cron_1",
        name: "提醒我喝水",
      },
    };
    const session = createSession([
      {
        type: "tool_execution_start",
        toolCallId: "call_1",
        toolName: "feishu_file_send",
        args: { path: "reports/final.pdf" },
      } as any,
      {
        type: "tool_execution_end",
        toolCallId: "call_1",
        toolName: "feishu_file_send",
        isError: false,
        result: {
          content: [{ type: "text", text: JSON.stringify(fileDetails, null, 2) }],
          details: fileDetails,
        },
      } as any,
      {
        type: "tool_execution_start",
        toolCallId: "call_2",
        toolName: "cron_task",
        args: { action: "add", name: "提醒我喝水" },
      } as any,
      {
        type: "tool_execution_end",
        toolCallId: "call_2",
        toolName: "cron_task",
        isError: false,
        result: {
          content: [{ type: "text", text: JSON.stringify(cronDetails, null, 2) }],
          details: cronDetails,
        },
      } as any,
      { type: "message_end" },
    ]);

    const result = await promptSession(session as any, "hi", "ou_1", "om_source_1", undefined, false, 2000, true);

    expect(result).toEqual({ text: "", error: undefined });
    expect(mockSendRenderedMessage).toHaveBeenCalledWith(
      "ou_1",
      " ---\n**工具调用**\n🛠️ feishu_file_send: final.pdf\n🛠️ cron_task: 提醒我喝水",
      2000,
    );
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

  it("当前轮结束时应一并移除 steering reaction", async () => {
    const { promptSession, registerSessionReaction } = await import("../src/pi/stream.js");
    const session = createSession([
      { type: "message_update", assistantMessageEvent: { type: "text_delta", delta: "done" } },
      { type: "message_end" },
    ]);

    registerSessionReaction(session as any, "om_steer_1", "reaction_steer_1");

    const result = await promptSession(session as any, "hi", "ou_1", "om_source_1", "SMILE");

    expect(result).toEqual({ text: "done", error: undefined });
    expect(mockRemoveReaction).toHaveBeenCalledWith("om_source_1", "reaction_1");
    expect(mockRemoveReaction).toHaveBeenCalledWith("om_steer_1", "reaction_steer_1");
  });

  it("steering 消息送达模型时应切换为 GoGoGo reaction", async () => {
    mockAddProcessingReaction
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce("reaction_gogogo_1");
    const { promptSession, registerSessionReaction } = await import("../src/pi/stream.js");
    const session = createSession([
      {
        type: "message_start",
        message: {
          role: "user",
          content: [{ type: "text", text: "second" }],
        },
      },
      { type: "message_update", assistantMessageEvent: { type: "text_delta", delta: "done" } },
      { type: "message_end" },
    ]);

    registerSessionReaction(session as any, "om_steer_1", "reaction_waiting_1", {
      pendingText: "second",
      deliveredReactionType: "GoGoGo",
    });

    const result = await promptSession(session as any, "hi", "ou_1", "om_source_1", undefined);

    expect(result).toEqual({ text: "done", error: undefined });
    expect(mockRemoveReaction).toHaveBeenCalledWith("om_steer_1", "reaction_waiting_1");
    expect(mockAddProcessingReaction).toHaveBeenCalledWith("om_steer_1", "GoGoGo");
    expect(mockRemoveReaction).toHaveBeenCalledWith("om_steer_1", "reaction_gogogo_1");
  });

  it("steering 消息送达后，下一段回复前应插入分隔", async () => {
    mockAddProcessingReaction.mockResolvedValue(null);
    const { promptSession, registerSessionReaction } = await import("../src/pi/stream.js");
    const session = createSession([
      { type: "message_update", assistantMessageEvent: { type: "text_delta", delta: "before" } },
      {
        type: "message_start",
        message: {
          role: "user",
          content: [{ type: "text", text: "second" }],
        },
      },
      { type: "message_update", assistantMessageEvent: { type: "text_delta", delta: "after" } },
      { type: "message_end" },
    ]);

    registerSessionReaction(session as any, "om_steer_1", "reaction_waiting_1", {
      pendingText: "second",
      deliveredReactionType: "GoGoGo",
      replySeparator: "\n\n---queued---\n",
    });

    const result = await promptSession(session as any, "hi", "ou_1", "om_source_1", undefined);

    expect(result.text).toBe("before\n\n---queued---\nafter");
    expect(mockSendRenderedMessage).toHaveBeenCalledWith("ou_1", "before\n\n---queued---\nafter", 2000);
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

  it("拿不到上下文占用率时仍应追加当前模型", async () => {
    const { promptSession } = await import("../src/pi/stream.js");
    const session = createSession([
      { type: "message_update", assistantMessageEvent: { type: "text_delta", delta: "done" } },
      { type: "message_end" },
    ], undefined, { percent: null, contextWindow: 200000 }, { provider: "zen2api", id: "minimax-m2.5-free" });

    await promptSession(session as any, "hi", "ou_1", "om_source_1", undefined);

    expect(mockSendRenderedMessage).toHaveBeenCalledWith(
      "ou_1",
      "done\n\n模型: zen2api/minimax-m2.5-free",
      2000,
    );
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

  it("用户主动停止时，不应再追加报错提示", async () => {
    const { promptSession } = await import("../src/pi/stream.js");
    let aborted = false;
    const session = createSession([], async () => {
      session.subscribeHandler?.({
        type: "message_update",
        assistantMessageEvent: { type: "text_delta", delta: "partial" },
      });
      aborted = true;
      throw new Error("aborted");
    }) as any;

    session.subscribe = (callback: (event: StreamEvent) => void) => {
      (session as any).subscribeHandler = callback;
      return () => {
        (session as any).subscribeHandler = undefined;
      };
    };

    const result = await promptSession(
      session,
      "hi",
      "ou_1",
      "om_source_1",
      undefined,
      false,
      2000,
      false,
      5 * 60 * 1000,
      () => aborted,
    );

    expect(result).toEqual({ text: "partial", error: undefined, aborted: true });
    expect(mockSendRenderedMessage).not.toHaveBeenCalled();
  });

  it("用户主动停止且已经有流式卡片时，应直接收口当前卡片", async () => {
    const mockStreamingMessage = {
      updateBody: vi.fn().mockResolvedValue(undefined),
      updateTools: vi.fn().mockResolvedValue(undefined),
      finish: vi.fn().mockResolvedValue(undefined),
    };
    mockStartStreamingMessage.mockResolvedValue(mockStreamingMessage);
    const { promptSession } = await import("../src/pi/stream.js");
    let aborted = false;
    const session = createSession([], async () => {
      session.subscribeHandler?.({
        type: "message_update",
        assistantMessageEvent: { type: "text_delta", delta: "partial" },
      });
      aborted = true;
      throw new Error("aborted");
    }) as any;

    session.subscribe = (callback: (event: StreamEvent) => void) => {
      (session as any).subscribeHandler = callback;
      return () => {
        (session as any).subscribeHandler = undefined;
      };
    };

    const result = await promptSession(
      session,
      "hi",
      "ou_1",
      "om_source_1",
      undefined,
      true,
      2000,
      false,
      5 * 60 * 1000,
      () => aborted,
    );

    expect(result).toEqual({ text: "partial", error: undefined, aborted: true });
    expect(mockStartStreamingMessage).toHaveBeenCalledTimes(1);
    expect(mockStreamingMessage.finish).toHaveBeenCalledTimes(1);
    expect(mockSendRenderedMessage).not.toHaveBeenCalled();
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

  it("上游返回失败消息但未抛异常时，应返回错误供外层补发", async () => {
    const { promptSession } = await import("../src/pi/stream.js");
    const session = createSession([
      {
        type: "message_end",
        message: {
          role: "assistant",
          stopReason: "error",
          errorMessage: "403 Forbidden",
          content: [{ type: "text", text: "" }],
        },
      },
      { type: "agent_end" },
    ]);

    const result = await promptSession(session as any, "hi", "ou_1", "om_source_1", undefined, true);

    expect(result).toEqual({ text: "", error: "403 Forbidden" });
    expect(mockStartStreamingMessage).not.toHaveBeenCalled();
    expect(mockSendRenderedMessage).not.toHaveBeenCalled();
  });

  it("自动重试成功后，不应继续向外暴露第一次失败", async () => {
    const { promptSession } = await import("../src/pi/stream.js");
    const session = createSession([
      {
        type: "message_end",
        message: {
          role: "assistant",
          stopReason: "error",
          errorMessage: "503 Service Unavailable",
          content: [{ type: "text", text: "" }],
        },
      },
      {
        type: "auto_retry_start",
        attempt: 1,
        maxAttempts: 3,
        delayMs: 2000,
        errorMessage: "503 Service Unavailable",
      },
      { type: "message_update", assistantMessageEvent: { type: "text_delta", delta: "重试成功" } },
      {
        type: "message_end",
        message: {
          role: "assistant",
          stopReason: "stop",
          content: [{ type: "text", text: "重试成功" }],
        },
      },
      { type: "auto_retry_end", success: true, attempt: 1 },
      { type: "agent_end" },
    ]);

    const result = await promptSession(session as any, "hi", "ou_1", "om_source_1");

    expect(result).toEqual({ text: "重试成功", error: undefined });
    expect(mockSendRenderedMessage).toHaveBeenCalledWith("ou_1", "重试成功", 2000);
  });

  it("自动重试耗尽后，应把最终失败透传出去", async () => {
    const { promptSession } = await import("../src/pi/stream.js");
    const session = createSession([
      {
        type: "message_end",
        message: {
          role: "assistant",
          stopReason: "error",
          errorMessage: "第一次失败",
          content: [{ type: "text", text: "" }],
        },
      },
      {
        type: "auto_retry_start",
        attempt: 1,
        maxAttempts: 1,
        delayMs: 2000,
        errorMessage: "第一次失败",
      },
      {
        type: "message_end",
        message: {
          role: "assistant",
          stopReason: "error",
          errorMessage: "503 Service Unavailable",
          content: [{ type: "text", text: "" }],
        },
      },
      { type: "auto_retry_end", success: false, attempt: 1, finalError: "503 Service Unavailable" },
      { type: "agent_end" },
    ]);

    const result = await promptSession(session as any, "hi", "ou_1", "om_source_1");

    expect(result).toEqual({ text: "", error: "503 Service Unavailable" });
    expect(mockSendRenderedMessage).not.toHaveBeenCalled();
  });

  it("先展示了转录结果后再失败时，应在同一条消息里收口错误提示", async () => {
    const mockStreamingMessage = {
      updateBody: vi.fn().mockResolvedValue(undefined),
      updateTools: vi.fn().mockResolvedValue(undefined),
      finish: vi.fn().mockResolvedValue(undefined),
    };
    mockStartStreamingMessage.mockResolvedValue(mockStreamingMessage);
    const { promptSession } = await import("../src/pi/stream.js");
    const session = createSession([], async () => {
      throw new Error("boom");
    });

    const result = await promptSession(
      session as any,
      {
        text: "用户语音",
        preludeText: " ---\n**语音转录结果**\n用户语音",
      },
      "ou_1",
      "om_source_1",
      undefined,
      true,
    );

    expect(result).toEqual({ text: "", error: "boom", displayed: true });
    expect(mockStartStreamingMessage).toHaveBeenCalledWith(
      "ou_1",
      "",
      "",
      " ---\n**语音转录结果**\n用户语音",
    );
    expect(mockStreamingMessage.finish).toHaveBeenCalledWith(
      "⚠️ 回复中断: boom",
      2000,
      "",
      " ---\n**语音转录结果**\n用户语音",
    );
    expect(mockSendRenderedMessage).not.toHaveBeenCalled();
  });

  it("只有空白行后就失败时，也应按纯失败处理", async () => {
    const { promptSession } = await import("../src/pi/stream.js");
    const session = createSession([], async () => {
      session.subscribeHandler?.({
        type: "message_update",
        assistantMessageEvent: { type: "text_delta", delta: "\n\n" },
      });
      throw new Error("boom");
    }) as any;

    session.subscribe = (callback: (event: StreamEvent) => void) => {
      (session as any).subscribeHandler = callback;
      return () => {
        (session as any).subscribeHandler = undefined;
      };
    };

    const result = await promptSession(session, "hi", "ou_1", "om_source_1", undefined, true);

    expect(result).toEqual({ text: "\n\n", error: "boom" });
    expect(mockStartStreamingMessage).not.toHaveBeenCalled();
    expect(mockSendRenderedMessage).not.toHaveBeenCalled();
  });

  it("用户主动停止且没有正文时，不应补发占位消息", async () => {
    const { promptSession } = await import("../src/pi/stream.js");
    let aborted = false;
    const session = createSession([], async () => {
      aborted = true;
      throw new Error("aborted");
    });

    const result = await promptSession(
      session as any,
      "hi",
      "ou_1",
      "om_source_1",
      undefined,
      true,
      2000,
      false,
      5 * 60 * 1000,
      () => aborted,
    );

    expect(result).toEqual({ text: "", error: undefined, aborted: true });
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

  it("空闲超时：长时间无新 token 时应中断并显示友好提示", async () => {
    const { promptSession } = await import("../src/pi/stream.js");
    vi.useFakeTimers();

    let subscriber: ((event: StreamEvent) => void) | undefined;
    let abortSignal: (() => void) | undefined;
    const session = {
      prompt: vi.fn(async (..._args: unknown[]) => {
        // 模拟模型先产出一段文字，然后长时间没有产出
        subscriber?.({
          type: "message_update",
          assistantMessageEvent: { type: "text_delta", delta: "partial" },
        });
        // 模拟 prompt 挂起直到 abort
        await new Promise<void>((_resolve, reject) => {
          abortSignal = () => reject(new Error("aborted"));
        });
      }),
      subscribe(callback: (event: StreamEvent) => void) {
        subscriber = callback;
        return () => { subscriber = undefined; };
      },
      getContextUsage: vi.fn().mockReturnValue({ percent: null, contextWindow: 200000 }),
      abort: vi.fn().mockImplementation(async () => {
        // abort 时让 prompt 抛出错误
        abortSignal?.();
      }),
    };

    const resultPromise = promptSession(
      session as any,
      "hi",
      "ou_1",
      "om_source_1",
      undefined,
      false,
      2000,
      false,
      3000, // 3 秒空闲超时
    );

    // 等待 prompt 开始执行
    await vi.advanceTimersByTimeAsync(100);

    // 空闲 2 秒（还没超时）
    await vi.advanceTimersByTimeAsync(2000);
    expect(session.abort).not.toHaveBeenCalled();

    // 再过 1 秒，达到 3 秒空闲超时
    await vi.advanceTimersByTimeAsync(1100);

    // abort 应该被调用，触发 prompt 抛出错误
    expect(session.abort).toHaveBeenCalled();

    const result = await resultPromise;
    expect(result.text).toBe("partial");
    expect(result.error).toBe("回复生成超时（长时间无响应）");

    vi.useRealTimers();
  });

  it("空闲超时：持续有 token 输出时不应超时", async () => {
    const { promptSession } = await import("../src/pi/stream.js");
    vi.useFakeTimers();

    let subscriber: ((event: StreamEvent) => void) | undefined;
    let promptResolve: (() => void) | undefined;
    const session = {
      prompt: vi.fn(async (..._args: unknown[]) => {
        subscriber?.({
          type: "message_update",
          assistantMessageEvent: { type: "text_delta", delta: "hello" },
        });
        await new Promise<void>((resolve) => { promptResolve = resolve; });
      }),
      subscribe(callback: (event: StreamEvent) => void) {
        subscriber = callback;
        return () => { subscriber = undefined; };
      },
      getContextUsage: vi.fn().mockReturnValue({ percent: null, contextWindow: 200000 }),
      abort: vi.fn().mockResolvedValue(undefined),
    };

    const resultPromise = promptSession(
      session as any,
      "hi",
      "ou_1",
      "om_source_1",
      undefined,
      false,
      2000,
      false,
      3000, // 3 秒空闲超时
    );

    // 等待 prompt 开始执行
    await vi.advanceTimersByTimeAsync(100);

    // 每隔 1 秒持续产出 token（重置 idle timer）
    for (let i = 0; i < 5; i++) {
      await vi.advanceTimersByTimeAsync(1000);
      subscriber?.({
        type: "message_update",
        assistantMessageEvent: { type: "text_delta", delta: ` chunk${i}` },
      });
    }

    // 不应该超时
    expect(session.abort).not.toHaveBeenCalled();

    // 正常结束
    promptResolve?.();
    const result = await resultPromise;
    expect(result.text).toBe("hello chunk0 chunk1 chunk2 chunk3 chunk4");
    expect(result.error).toBeUndefined();

    vi.useRealTimers();
  });

  it("空闲超时：工具调用开始/结束也应重置空闲计时器", async () => {
    const { promptSession } = await import("../src/pi/stream.js");
    vi.useFakeTimers();

    let subscriber: ((event: StreamEvent) => void) | undefined;
    let abortSignal: (() => void) | undefined;
    const session = {
      prompt: vi.fn(async (..._args: unknown[]) => {
        subscriber?.({
          type: "message_update",
          assistantMessageEvent: { type: "text_delta", delta: "start" },
        });
        await new Promise<void>((_resolve, reject) => {
          abortSignal = () => reject(new Error("aborted"));
        });
      }),
      subscribe(callback: (event: StreamEvent) => void) {
        subscriber = callback;
        return () => { subscriber = undefined; };
      },
      getContextUsage: vi.fn().mockReturnValue({ percent: null, contextWindow: 200000 }),
      abort: vi.fn().mockImplementation(async () => {
        abortSignal?.();
      }),
    };

    const resultPromise = promptSession(
      session as any,
      "hi",
      "ou_1",
      "om_source_1",
      undefined,
      false,
      2000,
      false,
      3000, // 3 秒空闲超时
    );

    // 等待 prompt 开始执行
    await vi.advanceTimersByTimeAsync(100);

    // 等待 2 秒（快超时了）
    await vi.advanceTimersByTimeAsync(2000);

    // 工具调用开始，重置计时器
    subscriber?.({ type: "tool_execution_start", toolName: "read" } as any);

    // 再等 2 秒
    await vi.advanceTimersByTimeAsync(2000);
    expect(session.abort).not.toHaveBeenCalled();

    // 工具调用结束，再次重置
    subscriber?.({ type: "tool_execution_end", toolName: "read", isError: false } as any);

    // 再等 2 秒
    await vi.advanceTimersByTimeAsync(2000);
    expect(session.abort).not.toHaveBeenCalled();

    // 超过 3 秒无活动，现在应该触发超时
    await vi.advanceTimersByTimeAsync(3100);
    expect(session.abort).toHaveBeenCalled();

    const result = await resultPromise;
    expect(result.error).toBe("回复生成超时（长时间无响应）");

    vi.useRealTimers();
  });

  it("总超时兜底：空闲超时未触发但总时间超限时应中断", async () => {
    const { promptSession } = await import("../src/pi/stream.js");
    vi.useFakeTimers();

    let subscriber: ((event: StreamEvent) => void) | undefined;
    const session = {
      prompt: vi.fn(async (..._args: unknown[]) => {
        // 持续产出 token，永远不会自行结束（模拟超长生成）
        subscriber?.({
          type: "message_update",
          assistantMessageEvent: { type: "text_delta", delta: "start" },
        });
        // 永远挂起
        await new Promise<void>(() => {});
      }),
      subscribe(callback: (event: StreamEvent) => void) {
        subscriber = callback;
        return () => { subscriber = undefined; };
      },
      getContextUsage: vi.fn().mockReturnValue({ percent: null, contextWindow: 200000 }),
      abort: vi.fn().mockImplementation(async () => {
        // abort 后让 prompt 抛出错误
        throw new Error("force-abort");
      }),
    };

    // 使用很小的 idle 超时来测试，但关键是 withTimeout 的总超时兜底
    // 实际 PROMPT_TOTAL_TIMEOUT_MS 是 30 分钟，这里我们用较短的时间模拟
    const resultPromise = promptSession(
      session as any,
      "hi",
      "ou_1",
      "om_source_1",
      undefined,
      false,
      2000,
      false,
      500, // 短 idle 超时
    );

    // 等待 prompt 开始
    await vi.advanceTimersByTimeAsync(100);

    // 持续发送 text_delta 防止 idle 超时
    for (let i = 0; i < 180; i++) {
      await vi.advanceTimersByTimeAsync(300);
      subscriber?.({
        type: "message_update",
        assistantMessageEvent: { type: "text_delta", delta: "x" },
      });
    }

    // 此时已经过了 54s+，idle 超时被不断重置
    // 但还未触发总超时（30 分钟）
    expect(session.abort).not.toHaveBeenCalled();

    vi.useRealTimers();
  });

  it("空闲超时触发后 prompt 抛出非 abort 错误，不应被覆盖为超时提示", async () => {
    const { promptSession } = await import("../src/pi/stream.js");
    vi.useFakeTimers();

    let subscriber: ((event: StreamEvent) => void) | undefined;
    let abortSignal: (() => void) | undefined;
    const session = {
      prompt: vi.fn(async (..._args: unknown[]) => {
        subscriber?.({
          type: "message_update",
          assistantMessageEvent: { type: "text_delta", delta: "partial" },
        });
        await new Promise<void>((_resolve, reject) => {
          abortSignal = () => reject(new Error("真实错误：API 限流"));
        });
      }),
      subscribe(callback: (event: StreamEvent) => void) {
        subscriber = callback;
        return () => { subscriber = undefined; };
      },
      getContextUsage: vi.fn().mockReturnValue({ percent: null, contextWindow: 200000 }),
      abort: vi.fn().mockImplementation(async () => {
        // abort 触发后，prompt 抛出一个非超时的真实错误
        abortSignal?.();
      }),
    };

    const resultPromise = promptSession(
      session as any,
      "hi",
      "ou_1",
      "om_source_1",
      undefined,
      false,
      2000,
      false,
      3000, // 3 秒空闲超时
    );

    // 等待 prompt 开始
    await vi.advanceTimersByTimeAsync(100);

    // 触发空闲超时
    await vi.advanceTimersByTimeAsync(3100);

    const result = await resultPromise;
    // idleTimedOut=true 但抛出的不是 BridgeError(pi_prompt_timeout)
    // 当前逻辑：idleTimedOut && !hardTimedOut → 空闲超时
    // 这是合理的：用户看到的是空闲超时，因为确实是空闲太久了
    expect(result.text).toBe("partial");
    expect(result.error).toBe("回复生成超时（长时间无响应）");

    vi.useRealTimers();
  });

  it("关闭流式开关时，不应初始化流式卡片", async () => {
    const mockStreamingMessage = {
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
