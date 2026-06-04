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
  it("私聊普通用户可以执行个人命令，但不能执行全局管理命令", async () => {
    await expect(canRunBridgeCommand(identity, { name: "commands", args: "" }, p2pTarget)).resolves.toBe(true);
    await expect(canRunBridgeCommand(identity, { name: "new", args: "" }, p2pTarget)).resolves.toBe(true);
    await expect(canRunBridgeCommand(identity, { name: "tools", args: "on read" }, p2pTarget)).resolves.toBe(true);
    await expect(canRunBridgeCommand(identity, { name: "cron", args: "" }, p2pTarget)).resolves.toBe(true);
    await expect(canRunBridgeCommand(identity, { name: "restart", args: "" }, p2pTarget)).resolves.toBe(false);
    await expect(canRunBridgeCommand(identity, { name: "p2p", args: "policy whitelist" }, p2pTarget)).resolves.toBe(false);
    await expect(canRunBridgeCommand(identity, { name: "stt", args: "provider whisper" }, p2pTarget)).resolves.toBe(false);
  });

  it("super admin 只能在私聊里执行全局管理命令", async () => {
    const superAdmin = { openId: SUPER_ADMIN_OPEN_ID };
    await expect(canRunBridgeCommand(superAdmin, { name: "restart", args: "" }, p2pTarget)).resolves.toBe(true);
    await expect(canRunBridgeCommand(superAdmin, { name: "p2p", args: "policy whitelist" }, p2pTarget)).resolves.toBe(true);
    await expect(canRunBridgeCommand(superAdmin, { name: "tools", args: "on read" }, groupTarget)).resolves.toBe(true);
    await expect(canRunBridgeCommand(superAdmin, { name: "restart", args: "" }, groupTarget)).resolves.toBe(false);
    await expect(canRunBridgeCommand(superAdmin, { name: "p2p", args: "policy whitelist" }, groupTarget)).resolves.toBe(false);
    await expect(canRunBridgeCommand(superAdmin, { name: "group", args: "allowlist show" }, groupTarget)).resolves.toBe(false);
  });

  it("群聊普通成员只能执行低风险命令", async () => {
    await expect(canRunBridgeCommand(identity, { name: "tools", args: "" }, groupTarget)).resolves.toBe(true);
    await expect(canRunBridgeCommand(identity, { name: "tools", args: "on read" }, groupTarget)).resolves.toBe(false);
    await expect(canRunBridgeCommand(identity, { name: "skill-folder", args: "" }, groupTarget)).resolves.toBe(true);
    await expect(canRunBridgeCommand(identity, { name: "skill-folder", args: "on" }, groupTarget)).resolves.toBe(false);
    await expect(canRunBridgeCommand(identity, { name: "model", args: "" }, groupTarget)).resolves.toBe(true);
    await expect(canRunBridgeCommand(identity, { name: "model", args: "2" }, groupTarget)).resolves.toBe(false);
    await expect(canRunBridgeCommand(identity, { name: "route", args: "" }, groupTarget)).resolves.toBe(true);
    await expect(canRunBridgeCommand(identity, { name: "route", args: "on" }, groupTarget)).resolves.toBe(false);
    await expect(canRunBridgeCommand(identity, { name: "new", args: "" }, groupTarget)).resolves.toBe(false);
    await expect(canRunBridgeCommand(identity, { name: "stop", args: "" }, groupTarget)).resolves.toBe(true);
    await expect(canRunBridgeCommand(identity, { name: "skills", args: "" }, groupTarget)).resolves.toBe(true);
    await expect(canRunBridgeCommand(identity, { name: "status", args: "" }, groupTarget)).resolves.toBe(true);
    await expect(canRunBridgeCommand(identity, { name: "group", args: "" }, groupTarget)).resolves.toBe(false);
  });

  it("真实群主可以执行当前群高级命令", async () => {
    const resolver = {
      isGroupOwner: async () => true,
    };
    await expect(canRunBridgeCommand(identity, { name: "new", args: "" }, groupTarget, resolver)).resolves.toBe(true);
    await expect(canRunBridgeCommand(identity, { name: "tools", args: "on read" }, groupTarget, resolver)).resolves.toBe(true);
    await expect(canRunBridgeCommand(identity, { name: "skill-folder", args: "off" }, groupTarget, resolver)).resolves.toBe(true);
    await expect(canRunBridgeCommand(identity, { name: "cron", args: "" }, groupTarget, resolver)).resolves.toBe(true);
    await expect(canRunBridgeCommand(identity, { name: "restart", args: "" }, groupTarget, resolver)).resolves.toBe(false);
  });
});
