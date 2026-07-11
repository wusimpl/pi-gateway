import { describe, expect, it, vi } from "vitest";
import { SUPER_ADMIN_OPEN_ID } from "../src/app/access-control.js";
import {
  canEnableHostMachineTools,
  enforceHostMachineToolAccess,
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
  it.each(["read", "bash", "edit", "write", "grep", "find", "ls"])(
    "会把 %s 识别为宿主机工具",
    (toolName) => {
      expect(isHostMachineToolName(toolName)).toBe(true);
    },
  );

  it("只有私聊超级管理员可以启用宿主机工具", () => {
    expect(canEnableHostMachineTools({ openId: SUPER_ADMIN_OPEN_ID }, p2pTarget)).toBe(true);
    expect(canEnableHostMachineTools({ openId: "ou_user" }, p2pTarget)).toBe(false);
    expect(canEnableHostMachineTools({ openId: SUPER_ADMIN_OPEN_ID }, groupTarget)).toBe(false);
  });

  it("普通用户开始任务前会移除已经启用的宿主机工具", () => {
    const setActiveToolsByName = vi.fn();
    const activeTools = enforceHostMachineToolAccess(
      {
        getActiveToolNames: () => ["read", "bash", "firecrawl_search"],
        setActiveToolsByName,
      },
      { openId: "ou_user" },
      p2pTarget,
    );

    expect(activeTools).toEqual(["firecrawl_search"]);
    expect(setActiveToolsByName).toHaveBeenCalledWith(["firecrawl_search"]);
  });
});
