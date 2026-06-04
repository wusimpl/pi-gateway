import { describe, expect, it } from "vitest";
import { canRunBridgeCommand } from "../src/app/command-permissions.js";
import { SUPER_ADMIN_OPEN_ID } from "../src/app/access-control.js";

const identity = { openId: "ou_1", userId: "u_1" };
const groupTarget = {
  kind: "group",
  key: "oc_1",
  receiveIdType: "chat_id",
  receiveId: "oc_1",
  chatId: "oc_1",
} as const;
const p2pTarget = {
  kind: "p2p",
  key: "ou_1",
  receiveIdType: "open_id",
  receiveId: "ou_1",
} as const;

describe("canRunBridgeCommand", () => {
  it("私聊普通用户只能执行公开命令", () => {
    expect(canRunBridgeCommand(identity, { name: "commands", args: "" }, p2pTarget, [])).toBe(true);
    expect(canRunBridgeCommand(identity, { name: "new", args: "" }, p2pTarget, [])).toBe(true);
    expect(canRunBridgeCommand(identity, { name: "tools", args: "" }, p2pTarget, [])).toBe(true);
    expect(canRunBridgeCommand(identity, { name: "restart", args: "" }, p2pTarget, [])).toBe(false);
    expect(canRunBridgeCommand(identity, { name: "tools", args: "on read" }, p2pTarget, [])).toBe(false);
    expect(canRunBridgeCommand(identity, { name: "p2p", args: "policy whitelist" }, p2pTarget, [])).toBe(false);
  });

  it("super admin 在私聊和群聊都可以执行受限命令", () => {
    const superAdmin = { openId: SUPER_ADMIN_OPEN_ID };
    expect(canRunBridgeCommand(superAdmin, { name: "restart", args: "" }, p2pTarget, [])).toBe(true);
    expect(canRunBridgeCommand(superAdmin, { name: "tools", args: "on read" }, groupTarget, [])).toBe(true);
    expect(canRunBridgeCommand(superAdmin, { name: "p2p", args: "policy whitelist" }, p2pTarget, [])).toBe(true);
  });

  it("群聊普通成员只能执行公开命令", () => {
    expect(canRunBridgeCommand(identity, { name: "tools", args: "" }, groupTarget, [])).toBe(true);
    expect(canRunBridgeCommand(identity, { name: "tools", args: "on read" }, groupTarget, [])).toBe(false);
    expect(canRunBridgeCommand(identity, { name: "tools", args: "off read" }, groupTarget, [])).toBe(false);
    expect(canRunBridgeCommand(identity, { name: "tools", args: "set read" }, groupTarget, [])).toBe(false);
    expect(canRunBridgeCommand(identity, { name: "tools", args: "reset" }, groupTarget, [])).toBe(false);
    expect(canRunBridgeCommand(identity, { name: "skill-folder", args: "" }, groupTarget, [])).toBe(true);
    expect(canRunBridgeCommand(identity, { name: "skill-folder", args: "on" }, groupTarget, [])).toBe(false);
    expect(canRunBridgeCommand(identity, { name: "new", args: "" }, groupTarget, [])).toBe(true);
    expect(canRunBridgeCommand(identity, { name: "stop", args: "" }, groupTarget, [])).toBe(true);
    expect(canRunBridgeCommand(identity, { name: "skills", args: "" }, groupTarget, [])).toBe(true);
    expect(canRunBridgeCommand(identity, { name: "status", args: "" }, groupTarget, [])).toBe(true);
    expect(canRunBridgeCommand(identity, { name: "restart", args: "" }, groupTarget, [])).toBe(false);
  });

  it("群聊 owner 可以执行 owner-only 命令", () => {
    expect(canRunBridgeCommand(identity, { name: "restart", args: "" }, groupTarget, ["ou_1"])).toBe(true);
    expect(canRunBridgeCommand(identity, { name: "tools", args: "on read" }, groupTarget, ["ou_1"])).toBe(true);
    expect(canRunBridgeCommand(identity, { name: "skill-folder", args: "off" }, groupTarget, ["ou_1"])).toBe(true);
  });
});
