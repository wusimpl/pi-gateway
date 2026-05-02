import { describe, expect, it, vi } from "vitest";
import { createAdminCommandExecutor } from "../src/admin/command-executor.js";
import type { ResolvedAdminTarget } from "../src/admin/types.js";

describe("admin command executor", () => {
  it("执行命令时收集页面结果，默认不同步到飞书", async () => {
    const sendRenderedMessage = vi.fn().mockResolvedValue(undefined);
    const executor = createAdminCommandExecutor({
      config: { TEXT_CHUNK_LIMIT: 2000 },
      messenger: {
        sendRenderedMessage,
        sendTextMessage: vi.fn().mockResolvedValue("om_1"),
        sendRenderedMessageToTarget: vi.fn().mockResolvedValue(undefined),
        sendTextMessageToTarget: vi.fn().mockResolvedValue("om_2"),
      },
      createCommandService: (messenger) => ({
        handleBridgeCommand: async (identity, command) => {
          await messenger.sendRenderedMessage(identity.openId, `ok ${command.name}`, 2000);
        },
        handleUnsupportedSlashCommand: vi.fn(),
        handleUnauthorizedBridgeCommand: vi.fn(),
      }),
    });

    const result = await executor.executeRawCommand({
      resolvedTarget: p2pTarget(),
      rawCommand: "/status",
      syncToFeishu: false,
    });

    expect(result.output).toBe("ok status");
    expect(sendRenderedMessage).not.toHaveBeenCalled();
  });

  it("私聊目标里执行群聊命令时给出限制提示", async () => {
    const executor = createAdminCommandExecutor({
      config: { TEXT_CHUNK_LIMIT: 2000 },
      messenger: {
        sendRenderedMessage: vi.fn(),
        sendTextMessage: vi.fn(),
        sendRenderedMessageToTarget: vi.fn(),
        sendTextMessageToTarget: vi.fn(),
      },
      createCommandService: () => ({
        handleBridgeCommand: vi.fn(),
        handleUnsupportedSlashCommand: vi.fn(),
        handleUnauthorizedBridgeCommand: vi.fn(),
      }),
    });

    const result = await executor.executeRawCommand({
      resolvedTarget: p2pTarget(),
      rawCommand: "/group",
      syncToFeishu: false,
    });

    expect(result.output).toBe("请先选择一个群聊。");
  });
});

function p2pTarget(): ResolvedAdminTarget {
  return {
    target: {
      key: "ou_1",
      kind: "p2p",
      label: "私聊 · ou_1",
      detail: "ou_1",
      sources: ["历史私聊"],
    },
    identity: { openId: "ou_1" },
    conversationTarget: {
      kind: "p2p",
      key: "ou_1",
      receiveIdType: "open_id",
      receiveId: "ou_1",
    },
  };
}
