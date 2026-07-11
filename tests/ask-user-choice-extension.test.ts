import { beforeEach, describe, expect, it, vi } from "vitest";
import { createAskUserChoiceExtension } from "../src/pi/extensions/ask-user-choice.js";
import {
  bindSessionIdentity,
  bindWorkspaceIdentity,
  clearWorkspaceIdentities,
  getWorkspaceContext,
} from "../src/pi/workspace-identity.js";

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

function createToolContext(
  cwd: string,
  sessionManager: object = {
    getBranch: () => [],
  },
) {
  return {
    cwd,
    sessionManager,
  };
}

describe("ask user choice extension", () => {
  beforeEach(() => {
    clearWorkspaceIdentities();
  });

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

  it("同一 workspace 的不同 session 会分别等待各自绑定的群成员", async () => {
    const workspaceDir = "/tmp/workspace/conversations/oc_1";
    const target = {
      kind: "group",
      key: "oc_1",
      receiveIdType: "chat_id",
      receiveId: "oc_1",
      chatId: "oc_1",
    } as const;
    const memberA = { openId: "ou_a", userId: "u_a" };
    const memberB = { openId: "ou_b", userId: "u_b" };
    const sessionManagerA = { getBranch: () => [] };
    const sessionManagerB = { getBranch: () => [] };
    bindWorkspaceIdentity(workspaceDir, memberB, target);
    bindSessionIdentity(sessionManagerA, memberA, target);
    bindSessionIdentity(sessionManagerB, memberB, target);

    const { choiceStore, tools } = collectTools(getWorkspaceContext);
    const choiceTool = tools[0];
    const params = {
      question: "选哪个？",
      options: [
        { label: "A", value: "a" },
        { label: "B", value: "b" },
      ],
    };

    await choiceTool.execute(
      "call-a",
      params,
      undefined,
      undefined,
      createToolContext(workspaceDir, sessionManagerA),
    );
    await choiceTool.execute(
      "call-b",
      params,
      undefined,
      undefined,
      createToolContext(workspaceDir, sessionManagerB),
    );

    expect(choiceStore.waitForChoice.mock.calls.map(([input]) => input.openId)).toEqual([
      "ou_a",
      "ou_b",
    ]);
  });
});
