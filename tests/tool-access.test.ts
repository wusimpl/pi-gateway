import { describe, expect, it, vi } from "vitest";
import { SUPER_ADMIN_OPEN_ID } from "../src/app/access-control.js";
import {
  canEnableHostMachineTools,
  canEnableToolName,
  enforceHostMachineToolAccess,
  isGroupWorkspaceFileToolName,
  isHostMachineToolName,
} from "../src/app/tool-access.js";

const p2pTarget = {
  kind: "p2p" as const,
  key: SUPER_ADMIN_OPEN_ID,
  receiveIdType: "open_id" as const,
  receiveId: SUPER_ADMIN_OPEN_ID,
};

const groupTarget = {
  kind: "group" as const,
  key: "oc_1",
  receiveIdType: "chat_id" as const,
  receiveId: "oc_1",
  chatId: "oc_1",
};

describe("host machine tool access", () => {
  it.each(["bash", "grep", "find"])(
    "会把 %s 识别为宿主机工具",
    (toolName) => {
      expect(isHostMachineToolName(toolName)).toBe(true);
    },
  );

  it.each(["read", "edit", "write", "ls"])(
    "会把 %s 识别为群聊工作空间文件工具",
    (toolName) => {
      expect(isGroupWorkspaceFileToolName(toolName)).toBe(true);
      expect(isHostMachineToolName(toolName)).toBe(true);
    },
  );

  it("只有私聊超级管理员可以启用宿主机工具", () => {
    expect(canEnableHostMachineTools({ openId: SUPER_ADMIN_OPEN_ID }, p2pTarget)).toBe(true);
    expect(canEnableHostMachineTools({ openId: "ou_user" }, p2pTarget)).toBe(false);
    expect(canEnableHostMachineTools({ openId: SUPER_ADMIN_OPEN_ID }, groupTarget)).toBe(false);
  });

  it("私聊和群聊都允许启用文件工具，但仍禁止其他宿主机工具", () => {
    expect(canEnableToolName("read", { openId: "ou_user" }, p2pTarget)).toBe(true);
    expect(canEnableToolName("read", { openId: "ou_user" }, groupTarget)).toBe(true);
    expect(canEnableToolName("bash", { openId: "ou_user" }, p2pTarget)).toBe(true);
    expect(canEnableToolName("bash", { openId: "ou_user" }, groupTarget)).toBe(true);
  });

  it("普通用户开始任务前仍会移除未受限开放的宿主机工具", () => {
    const setActiveToolsByName = vi.fn();
    const activeTools = enforceHostMachineToolAccess(
      {
        getActiveToolNames: () => ["read", "bash", "grep", "firecrawl_search"],
        setActiveToolsByName,
      },
      { openId: "ou_user" },
      p2pTarget,
    );

    expect(activeTools).toEqual(["read", "bash", "firecrawl_search"]);
    expect(setActiveToolsByName).toHaveBeenCalledWith(["read", "bash", "firecrawl_search"]);
  });
});
