import { describe, it, expect, beforeEach } from "vitest";
import { join } from "node:path";
import {
  setWorkspaceRoot,
  getWorkspaceRoot,
  getUserWorkspaceDir,
  getConversationWorkspaceDir,
} from "../src/pi/workspace.js";

describe("workspace 路径", () => {
  beforeEach(() => {
    setWorkspaceRoot(join(import.meta.dirname, "__workspace_root__"));
  });

  it("优先使用 userId 作为目录名", () => {
    const dir = getUserWorkspaceDir({ openId: "ou_test", userId: "cli_user_123" });
    expect(dir).toContain("cli_user_123");
  });

  it("userId 缺失时回退到 openId", () => {
    const dir = getUserWorkspaceDir({ openId: "ou_test_only" });
    expect(dir).toContain("ou_test_only");
  });

  it("应返回当前配置的 workspace 根目录", () => {
    expect(getWorkspaceRoot()).toContain("__workspace_root__");
  });

  it("应清洗非法目录字符", () => {
    const dir = getUserWorkspaceDir({ openId: "ou:test/user" });
    expect(dir).toContain("ou_test_user");
  });

  it("群聊 workspace 应按群会话目标隔离", () => {
    const dir = getConversationWorkspaceDir(
      { openId: "ou_1", userId: "u_1" },
      {
        kind: "group",
        key: "oc:test/group",
        receiveIdType: "chat_id",
        receiveId: "oc:test/group",
        chatId: "oc:test/group",
      },
    );

    expect(dir).toContain(join("conversations", "oc_test_group"));
  });
});
