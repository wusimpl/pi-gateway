import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { createConversationStateStore } from "../src/storage/conversations.js";

describe("conversation state store", () => {
  const tempDirs: string[] = [];

  afterEach(async () => {
    await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
  });

  it("应把会话目标状态写入 conversations 目录", async () => {
    const dataDir = await mkdtemp(join(tmpdir(), "pi-gateway-conversations-"));
    tempDirs.push(dataDir);
    const store = createConversationStateStore(dataDir);

    const state = await store.createConversationState("oc_1", "session_1");
    state.piSessionFile = "/tmp/session_1.jsonl";
    await store.writeConversationState("oc_1", state);

    await expect(store.readConversationState("oc_1")).resolves.toMatchObject({
      activeSessionId: "session_1",
      piSessionFile: "/tmp/session_1.jsonl",
    });
    expect(store.conversationSessionsDir("oc_1")).toBe(join(dataDir, "conversations", "oc_1", "sessions"));
  });

  it("会转义带分隔符的会话 key", async () => {
    const dataDir = await mkdtemp(join(tmpdir(), "pi-gateway-conversations-"));
    tempDirs.push(dataDir);
    const store = createConversationStateStore(dataDir);

    expect(store.conversationSessionsDir("oc_1:omt_1")).toBe(
      join(dataDir, "conversations", "oc_1%3Aomt_1", "sessions"),
    );
  });
});
