import { describe, expect, it, vi } from "vitest";
import { createFeishuMessageExtension } from "../src/pi/extensions/feishu-message.js";

function collectTools(
  messengerOverrides?: Record<string, unknown>,
  resolveIdentityByWorkspace: (cwd: string) => any = () => ({
    openId: "ou_sender",
    userId: "u_sender",
  }),
) {
  const messenger = {
    sendTextMessage: vi.fn().mockResolvedValue("om_text_1"),
    sendTextMessageToTarget: vi.fn().mockResolvedValue("om_group_1"),
    ...messengerOverrides,
  };

  const tools: any[] = [];
  createFeishuMessageExtension(messenger as any, resolveIdentityByWorkspace)({
    registerTool(tool) {
      tools.push(tool);
    },
  } as any);

  return { messenger, tools };
}

function createToolContext(cwd: string) {
  return {
    cwd,
    sessionManager: {
      getBranch: () => [],
    },
  };
}

describe("feishu message extension", () => {
  it("会注册发送飞书消息工具", () => {
    const { tools } = collectTools();

    expect(tools.map((tool) => tool.name)).toEqual(["feishu_message_send"]);
  });

  it("群聊里会把 mention 和 text 拼成同一条飞书消息并发回当前群聊", async () => {
    const target = {
      kind: "group",
      key: "oc_1",
      receiveIdType: "chat_id",
      receiveId: "oc_1",
      chatId: "oc_1",
    } as const;
    const { tools, messenger } = collectTools(undefined, () => ({
      identity: {
        openId: "ou_sender",
        userId: "u_sender",
      },
      conversationTarget: target,
    }));
    const sendTool = tools.find((tool) => tool.name === "feishu_message_send");

    const result = await sendTool.execute(
      "call-1",
      {
        parts: [
          { type: "mention", open_id: "ou_zhangsan", name: "张三" },
          { type: "text", text: "，您要的 xxx 已经准备好" },
        ],
      },
      undefined,
      undefined,
      createToolContext("/tmp/workspace/conversations/oc_1"),
    );

    expect(messenger.sendTextMessageToTarget).toHaveBeenCalledWith(
      target,
      '<at user_id="ou_zhangsan">张三</at>，您要的 xxx 已经准备好',
    );
    expect(messenger.sendTextMessage).not.toHaveBeenCalled();
    expect(result.details).toMatchObject({
      receive_id_type: "chat_id",
      receive_id: "oc_1",
      message_id: "om_group_1",
      mention_count: 1,
    });
  });

  it("私聊 workspace 会发给当前飞书用户", async () => {
    const { tools, messenger } = collectTools();
    const sendTool = tools.find((tool) => tool.name === "feishu_message_send");

    const result = await sendTool.execute(
      "call-1",
      {
        parts: [
          { type: "text", text: "已准备好" },
        ],
      },
      undefined,
      undefined,
      createToolContext("/tmp/workspace/ou_sender"),
    );

    expect(messenger.sendTextMessage).toHaveBeenCalledWith("ou_sender", "已准备好");
    expect(result.details).toMatchObject({
      receive_id_type: "open_id",
      receive_id: "ou_sender",
      message_id: "om_text_1",
      mention_count: 0,
    });
  });

  it("会把 camelCase openId 兼容成 snake_case", async () => {
    const { tools, messenger } = collectTools();
    const sendTool = tools.find((tool) => tool.name === "feishu_message_send");

    const prepared = sendTool.prepareArguments({
      parts: [
        { type: "mention", openId: "ou_lisi", name: "李四" },
        { type: "text", text: " 请看一下" },
      ],
    });
    await sendTool.execute(
      "call-1",
      prepared,
      undefined,
      undefined,
      createToolContext("/tmp/workspace/ou_sender"),
    );

    expect(messenger.sendTextMessage).toHaveBeenCalledWith(
      "ou_sender",
      '<at user_id="ou_lisi">李四</at> 请看一下',
    );
  });

  it("文本片段里的伪造 at 标签会被转义，不会变成真正 @", async () => {
    const { tools, messenger } = collectTools();
    const sendTool = tools.find((tool) => tool.name === "feishu_message_send");

    await sendTool.execute(
      "call-1",
      {
        parts: [
          { type: "text", text: '<at user_id="ou_bad">坏人</at> & hello' },
        ],
      },
      undefined,
      undefined,
      createToolContext("/tmp/workspace/ou_sender"),
    );

    expect(messenger.sendTextMessage).toHaveBeenCalledWith(
      "ou_sender",
      '&lt;at user_id="ou_bad"&gt;坏人&lt;/at&gt; &amp; hello',
    );
  });

  it("空消息会被直接拦住", async () => {
    const { tools, messenger } = collectTools();
    const sendTool = tools.find((tool) => tool.name === "feishu_message_send");

    await expect(
      sendTool.execute(
        "call-1",
        { parts: [{ type: "text", text: "   " }] },
        undefined,
        undefined,
        createToolContext("/tmp/workspace/ou_sender"),
      ),
    ).rejects.toThrow("要发送的飞书消息不能为空");
    expect(messenger.sendTextMessage).not.toHaveBeenCalled();
    expect(messenger.sendTextMessageToTarget).not.toHaveBeenCalled();
  });

  it("当前 workspace 没有关联飞书会话时会报错", async () => {
    const { tools, messenger } = collectTools(undefined, () => null);
    const sendTool = tools.find((tool) => tool.name === "feishu_message_send");

    await expect(
      sendTool.execute(
        "call-1",
        { parts: [{ type: "text", text: "hello" }] },
        undefined,
        undefined,
        createToolContext("/tmp/workspace/unknown"),
      ),
    ).rejects.toThrow("当前 workspace 没有关联到飞书会话");
    expect(messenger.sendTextMessage).not.toHaveBeenCalled();
    expect(messenger.sendTextMessageToTarget).not.toHaveBeenCalled();
  });

  it("mention 必须使用 open_id", async () => {
    const { tools, messenger } = collectTools();
    const sendTool = tools.find((tool) => tool.name === "feishu_message_send");

    await expect(
      sendTool.execute(
        "call-1",
        { parts: [{ type: "mention", open_id: "u_123", name: "张三" }] },
        undefined,
        undefined,
        createToolContext("/tmp/workspace/ou_sender"),
      ),
    ).rejects.toThrow("open_id 无效");
    expect(messenger.sendTextMessage).not.toHaveBeenCalled();
    expect(messenger.sendTextMessageToTarget).not.toHaveBeenCalled();
  });
});
