import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdir, rm, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { setDataDir, readUserState, writeUserState, createUserState, touchUserState, switchActiveSession, userSessionsDir } from "../src/storage/users.js";

const TEST_DATA_DIR = join(import.meta.dirname, "__test_data__");

beforeEach(async () => {
  setDataDir(TEST_DATA_DIR);
  await mkdir(TEST_DATA_DIR, { recursive: true });
});

afterEach(async () => {
  await rm(TEST_DATA_DIR, { recursive: true, force: true });
});

describe("用户状态存储", () => {
  const openId = "ou_test_user";

  it("readUserState 不存在时返回 null", async () => {
    const state = await readUserState(openId);
    expect(state).toBeNull();
  });

  it("createUserState 应创建并写入状态", async () => {
    const state = await createUserState(openId, "session_001");
    expect(state.activeSessionId).toBe("session_001");
    expect(state.createdAt).toBeTruthy();
    expect(state.updatedAt).toBeTruthy();

    // 验证持久化
    const loaded = await readUserState(openId);
    expect(loaded!.activeSessionId).toBe("session_001");
  });

  it("writeUserState 应更新状态", async () => {
    const state = await createUserState(openId, "session_001");
    state.piSessionFile = "/path/to/session.json";
    await writeUserState(openId, state);

    const loaded = await readUserState(openId);
    expect(loaded!.piSessionFile).toBe("/path/to/session.json");
  });

  it("touchUserState 应更新 lastActiveAt 和 lastMessageId", async () => {
    await createUserState(openId, "session_001");
    await touchUserState(openId, "om_msg001");

    const loaded = await readUserState(openId);
    expect(loaded!.lastMessageId).toBe("om_msg001");
    expect(loaded!.lastActiveAt).toBeTruthy();
  });

  it("switchActiveSession 应切换活跃 session", async () => {
    await createUserState(openId, "session_001");
    const updated = await switchActiveSession(openId, "session_002");
    expect(updated.activeSessionId).toBe("session_002");
  });

  it("switchActiveSession 不存在时自动创建", async () => {
    const state = await switchActiveSession(openId, "session_001");
    expect(state.activeSessionId).toBe("session_001");
  });

  it("userSessionsDir 应返回正确路径", () => {
    const dir = userSessionsDir(openId);
    expect(dir).toContain(openId);
    expect(dir).toContain("sessions");
  });
});
