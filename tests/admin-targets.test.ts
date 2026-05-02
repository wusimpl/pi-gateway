import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { describe, expect, it } from "vitest";
import { createAdminTargetService } from "../src/admin/targets.js";

describe("admin targets", () => {
  it("从本地历史、白名单和定时任务收集目标", async () => {
    const dataDir = await mkdtemp(join(tmpdir(), "pi-admin-targets-"));
    await mkdir(join(dataDir, "users", "ou_user_1"), { recursive: true });
    await mkdir(join(dataDir, "conversations", encodeURIComponent("oc_group_1")), { recursive: true });
    await writeFile(
      join(dataDir, "conversations", encodeURIComponent("oc_group_1"), "group-routing.json"),
      JSON.stringify({ FEISHU_GROUP_CHAT_ALLOWLIST: ["oc_group_2"] }),
      "utf-8",
    );
    await mkdir(join(dataDir, "cron"), { recursive: true });
    await writeFile(
      join(dataDir, "cron", "jobs.json"),
      JSON.stringify([
        {
          id: "cron_1",
          openId: "ou_owner_1",
          scopeType: "group",
          scopeKey: "oc_group_3",
          name: "job",
          enabled: true,
          prompt: "run",
          schedule: { kind: "at", atMs: Date.now() + 1000 },
          deleteAfterRun: true,
          createdAtMs: Date.now(),
          updatedAtMs: Date.now(),
          state: {},
        },
      ]),
      "utf-8",
    );

    const service = createAdminTargetService({
      DATA_DIR: dataDir,
      FEISHU_OWNER_OPEN_IDS: ["ou_owner_1"],
      FEISHU_GROUP_CHAT_ALLOWLIST: ["oc_group_4"],
    });

    const targets = await service.listTargets();
    expect(targets.map((target) => target.key)).toEqual([
      "ou_owner_1",
      "ou_user_1",
      "oc_group_1",
      "oc_group_2",
      "oc_group_3",
      "oc_group_4",
    ]);
    expect(targets.find((target) => target.key === "oc_group_3")?.sources).toContain("定时任务");
  });

  it("解析目标时为群聊使用管理员身份", async () => {
    const dataDir = await mkdtemp(join(tmpdir(), "pi-admin-targets-"));
    await mkdir(join(dataDir, "conversations", encodeURIComponent("oc_group_1")), { recursive: true });
    const service = createAdminTargetService({
      DATA_DIR: dataDir,
      FEISHU_OWNER_OPEN_IDS: ["ou_owner_1"],
      FEISHU_GROUP_CHAT_ALLOWLIST: [],
    });

    const resolved = await service.resolveTarget("oc_group_1");

    expect(resolved?.identity.openId).toBe("ou_owner_1");
    expect(resolved?.conversationTarget).toMatchObject({
      kind: "group",
      key: "oc_group_1",
      chatId: "oc_group_1",
    });
  });
});
