import { mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { afterEach, describe, expect, it } from "vitest";
import { createP2PSettingsStore } from "../src/storage/p2p-settings.js";

let tempDir: string | null = null;

async function createTempDir(): Promise<string> {
  tempDir = await mkdtemp(join(tmpdir(), "pi-gateway-p2p-"));
  return tempDir;
}

afterEach(async () => {
  if (tempDir) {
    await rm(tempDir, { recursive: true, force: true });
    tempDir = null;
  }
});

describe("P2PSettingsStore", () => {
  it("应持久化私聊路由配置", async () => {
    const dataDir = await createTempDir();
    const store = createP2PSettingsStore(dataDir);

    await store.writeP2PRoutingConfig({
      FEISHU_P2P_CHAT_POLICY: "whitelist",
      FEISHU_P2P_CHAT_ALLOWLIST: ["ou_1", "ou_2", "ou_2"],
    });

    const reloaded = createP2PSettingsStore(dataDir);
    await expect(reloaded.readP2PRoutingConfig()).resolves.toEqual({
      FEISHU_P2P_CHAT_POLICY: "whitelist",
      FEISHU_P2P_CHAT_ALLOWLIST: ["ou_1", "ou_2"],
    });
  });
});
