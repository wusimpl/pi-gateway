import { describe, expect, it, vi } from "vitest";
import { createAskUserChoiceExtension } from "../src/pi/extensions/ask-user-choice.js";

function collectTools(
  resolveIdentityByWorkspace: (cwd: string) => any = () => ({
    openId: "ou_1",
    userId: "u_1",
  }),
) {
  const messenger = {
    sendFeishuMessage: vi.fn().mockResolvedValue("om_choice_1"),
    sendFeishuMessageToTarget: vi.fn().mockResolvedValue("om_choice_group_1"),
  };
  const choiceStore = {
    waitForChoice: vi.fn().mockResolvedValue({
      status: "answered",
      request_id: "req_1",
      selected: "a",
      label: "A",
    }),
  };

  const tools: any[] = [];
  createAskUserChoiceExtension(messenger as any, choiceStore, resolveIdentityByWorkspace)({
    registerTool(tool) {
      tools.push(tool);
    },
  } as any);

  return { messenger, choiceStore, tools };
}

function createToolContext(cwd: string) {
  return {
    cwd,
    sessionManager: {
      getBranch: () => [],
    },
  };
}

describe("ask user choice extension", () => {
  it("群聊 workspace 会把选择卡片发回当前群聊，但仍等待发起人点击", async () => {
    const target = {
      kind: "group",
      key: "oc_1",
      receiveIdType: "chat_id",
      receiveId: "oc_1",
      chatId: "oc_1",
    } as const;
    const { messenger, choiceStore, tools } = collectTools(() => ({
      identity: {
        openId: "ou_1",
        userId: "u_1",
      },
      conversationTarget: target,
    }));
    const choiceTool = tools[0];

    await choiceTool.execute(
      "call-1",
      {
        question: "选哪个？",
        options: [
          { label: "A", value: "a" },
          { label: "B", value: "b" },
        ],
      },
      undefined,
      undefined,
      createToolContext("/tmp/workspace/conversations/oc_1"),
    );

    expect(messenger.sendFeishuMessageToTarget).toHaveBeenCalledWith(
      target,
      "interactive",
      expect.any(Object),
    );
    expect(messenger.sendFeishuMessage).not.toHaveBeenCalled();
    expect(choiceStore.waitForChoice).toHaveBeenCalledWith(expect.objectContaining({
      openId: "ou_1",
      options: [
        { label: "A", value: "a", description: undefined },
        { label: "B", value: "b", description: undefined },
      ],
    }));
  });
});
