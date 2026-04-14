import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const handlers: Record<string, (data: Record<string, unknown>) => unknown> = {};
  const dispatcher = {
    register: vi.fn((nextHandlers: Record<string, (data: Record<string, unknown>) => unknown>) => {
      Object.assign(handlers, nextHandlers);
      return dispatcher;
    }),
  };

  return {
    handlers,
    dispatcher,
    wsStart: vi.fn().mockResolvedValue(undefined),
    logger: {
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    },
  };
});

vi.mock("@larksuiteoapi/node-sdk", () => ({
  Domain: {
    Feishu: "feishu-domain",
    Lark: "lark-domain",
  },
  AppType: {
    SelfBuild: "self-build",
  },
  LoggerLevel: {
    warn: "warn",
  },
  Client: vi.fn(function Client() {
    return {};
  }),
  EventDispatcher: vi.fn(function EventDispatcher() {
    return mocks.dispatcher;
  }),
  WSClient: vi.fn(function WSClient() {
    return {
      start: mocks.wsStart,
    };
  }),
}));

vi.mock("../src/app/logger.js", () => ({
  logger: mocks.logger,
}));

import { createFeishuConnection } from "../src/feishu/client.js";

describe("createFeishuConnection", () => {
  beforeEach(() => {
    Object.keys(mocks.handlers).forEach((key) => {
      delete mocks.handlers[key];
    });
    mocks.dispatcher.register.mockClear();
    mocks.wsStart.mockClear();
    mocks.logger.debug.mockClear();
    mocks.logger.info.mockClear();
    mocks.logger.warn.mockClear();
    mocks.logger.error.mockClear();
  });

  it("长连接收到消息后应立即返回，由后台继续处理", async () => {
    const connection = createFeishuConnection({
      FEISHU_APP_ID: "app-id",
      FEISHU_APP_SECRET: "app-secret",
      FEISHU_DOMAIN: "feishu",
    } as any);

    const handler = vi.fn(
      () =>
        new Promise<void>(() => {
          // 模拟耗时处理，不主动结束
        }),
    );

    await connection.startMessageConnection(handler);

    const callback = mocks.handlers["im.message.receive_v1"];
    expect(callback).toBeTypeOf("function");

    const payload = { event: { message: { message_id: "om_1" } } };
    const result = callback?.(payload);

    expect(result).toBeUndefined();
    expect(handler).not.toHaveBeenCalled();

    await Promise.resolve();

    expect(handler).toHaveBeenCalledWith(payload);
  });
});
