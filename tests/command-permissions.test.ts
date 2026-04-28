import { describe, expect, it } from "vitest";
import { canRunBridgeCommand } from "../src/app/command-permissions.js";

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
  it("私聊命令不受群聊 owner 限制", () => {
    expect(canRunBridgeCommand(identity, { name: "new", args: "" }, p2pTarget, [])).toBe(true);
  });

  it("群聊普通成员只能执行公开命令", () => {
    expect(canRunBridgeCommand(identity, { name: "tools", args: "" }, groupTarget, [])).toBe(true);
    expect(canRunBridgeCommand(identity, { name: "tools", args: "on read" }, groupTarget, [])).toBe(false);
    expect(canRunBridgeCommand(identity, { name: "tools", args: "off read" }, groupTarget, [])).toBe(false);
    expect(canRunBridgeCommand(identity, { name: "tools", args: "set read" }, groupTarget, [])).toBe(false);
    expect(canRunBridgeCommand(identity, { name: "tools", args: "reset" }, groupTarget, [])).toBe(false);
    expect(canRunBridgeCommand(identity, { name: "skills", args: "" }, groupTarget, [])).toBe(true);
    expect(canRunBridgeCommand(identity, { name: "status", args: "" }, groupTarget, [])).toBe(true);
    expect(canRunBridgeCommand(identity, { name: "new", args: "" }, groupTarget, [])).toBe(false);
  });

  it("群聊 owner 可以执行 owner-only 命令", () => {
    expect(canRunBridgeCommand(identity, { name: "restart", args: "" }, groupTarget, ["ou_1"])).toBe(true);
    expect(canRunBridgeCommand(identity, { name: "tools", args: "on read" }, groupTarget, ["ou_1"])).toBe(true);
  });
});
