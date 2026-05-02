import { describe, expect, it, vi } from "vitest";
import {
  createModelRouter,
  getModelRoutingConfig,
  hasCompleteModelRoutingConfig,
  parseModelRouteSlot,
  setModelRouteSlot,
} from "../src/pi/model-routing.js";
import type { UserState } from "../src/types.js";

function createRegistry() {
  const models = new Map([
    ["cpa/router", { provider: "cpa", id: "router" }],
    ["zen/light", { provider: "zen", id: "light" }],
    ["cpa/heavy", { provider: "cpa", id: "heavy" }],
  ]);
  return {
    find: vi.fn((provider: string, id: string) => models.get(`${provider}/${id}`)),
    hasConfiguredAuth: vi.fn(() => true),
    getApiKeyAndHeaders: vi.fn(async () => ({ ok: true, apiKey: "key" })),
  };
}

const baseState: UserState = {
  activeSessionId: "session_1",
  createdAt: "2026-04-30T00:00:00.000Z",
  updatedAt: "2026-04-30T00:00:00.000Z",
  lastActiveAt: "2026-04-30T00:00:00.000Z",
  modelRouting: {
    enabled: true,
    routerModel: { provider: "cpa", id: "router" },
    lightModel: { provider: "zen", id: "light" },
    heavyModel: { provider: "cpa", id: "heavy" },
  },
};

describe("model routing", () => {
  it("图片消息直接走重模型，不调用 router 模型", async () => {
    const registry = createRegistry();
    const complete = vi.fn();
    const router = createModelRouter({ registry: registry as any, complete: complete as any });

    const decision = await router.route({
      userState: baseState,
      message: {
        kind: "image",
        identity: { openId: "ou_1" },
        conversationTarget: { kind: "p2p", key: "ou_1", receiveIdType: "open_id", receiveId: "ou_1" },
        messageId: "om_img_1",
        messageType: "image",
        createTime: "123",
        rawContent: "{}",
        imageKey: "img_1",
      },
    });

    expect(decision).toMatchObject({ difficulty: "hard", slot: "heavy", reasonCode: "image" });
    expect(complete).not.toHaveBeenCalled();
  });

  it("router 判断 simple 时走轻量模型", async () => {
    const registry = createRegistry();
    const complete = vi.fn(async () => ({
      content: [{ type: "text", text: JSON.stringify({ difficulty: "simple", reason_code: "casual_qa", reason: "普通问答" }) }],
    }));
    const router = createModelRouter({ registry: registry as any, complete: complete as any });

    const decision = await router.route({
      userState: baseState,
      message: {
        kind: "text",
        identity: { openId: "ou_1" },
        conversationTarget: { kind: "p2p", key: "ou_1", receiveIdType: "open_id", receiveId: "ou_1" },
        messageId: "om_text_1",
        messageType: "text",
        createTime: "123",
        rawContent: "{}",
        text: "介绍一下珠海",
      },
    });

    expect(decision).toMatchObject({
      difficulty: "simple",
      slot: "light",
      modelPreference: { provider: "zen", id: "light" },
    });
    expect(complete).toHaveBeenCalledTimes(1);
  });

  it("router 失败时默认走重模型", async () => {
    const registry = createRegistry();
    const complete = vi.fn(async () => ({ content: [{ type: "text", text: "not json" }] }));
    const router = createModelRouter({ registry: registry as any, complete: complete as any });
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);

    const decision = await router.route({
      userState: baseState,
      message: {
        kind: "text",
        identity: { openId: "ou_1" },
        conversationTarget: { kind: "p2p", key: "ou_1", receiveIdType: "open_id", receiveId: "ou_1" },
        messageId: "om_text_2",
        messageType: "text",
        createTime: "123",
        rawContent: "{}",
        text: "写个包含 secret 的方案",
      },
    });

    expect(decision).toMatchObject({ difficulty: "hard", slot: "heavy", reasonCode: "router_failed" });
    const logLines = warnSpy.mock.calls.map(([line]) => String(line)).join("\n");
    expect(logLines).toContain("模型路由模型调用失败，使用重模型");
    expect(logLines).toContain("INVALID_ROUTER_RESPONSE_JSON");
    expect(logLines).not.toContain("secret");
    expect(logLines).not.toContain("not json");
    warnSpy.mockRestore();
  });

  it("route off 时使用重模型且不调用 router", async () => {
    const registry = createRegistry();
    const complete = vi.fn();
    const router = createModelRouter({ registry: registry as any, complete: complete as any });

    const decision = await router.route({
      userState: { ...baseState, modelRouting: { ...baseState.modelRouting, enabled: false } },
      message: {
        kind: "text",
        identity: { openId: "ou_1" },
        conversationTarget: { kind: "p2p", key: "ou_1", receiveIdType: "open_id", receiveId: "ou_1" },
        messageId: "om_text_3",
        messageType: "text",
        createTime: "123",
        rawContent: "{}",
        text: "hello",
      },
    });

    expect(decision).toMatchObject({ difficulty: "hard", slot: "heavy", reasonCode: "route_off" });
    expect(complete).not.toHaveBeenCalled();
  });

  it("heavyModel 兼容旧 modelPreference", () => {
    const state = { modelPreference: { provider: "cpa", id: "heavy" } } as UserState;
    expect(getModelRoutingConfig(state).heavyModel).toEqual({ provider: "cpa", id: "heavy" });
    expect(hasCompleteModelRoutingConfig(baseState)).toBe(true);
    expect(parseModelRouteSlot("LIGHT")).toBe("light");

    setModelRouteSlot(state, "heavy", { provider: "x", id: "y" });
    expect(state.modelPreference).toEqual({ provider: "x", id: "y" });
    expect(state.modelRouting?.heavyModel).toEqual({ provider: "x", id: "y" });
  });
});
