import { EventEmitter } from "node:events";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createRestartService } from "../src/app/restart.js";

function createChildProcessDouble() {
  const child = new EventEmitter() as EventEmitter & { unref: ReturnType<typeof vi.fn> };
  child.unref = vi.fn();
  return child;
}

describe("restart service", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("直接运行时会先拉起一个新进程，再请求旧进程退出", async () => {
    const child = createChildProcessDouble();
    const spawnProcess = vi.fn(() => child as any);
    const killProcess = vi.fn(() => true);
    const service = createRestartService({
      spawnProcess,
      killProcess,
      execPath: "/usr/local/bin/node",
      execArgv: ["--loader", "tsx"],
      argv: ["/usr/local/bin/node", "src/index.ts", "--inspect"],
      cwd: "/tmp/pi-gateway",
      env: { TEST_ENV: "1" },
      pid: 4321,
      exitDelayMs: 50,
      isPm2Managed: false,
    });

    const restartPromise = service.restartGateway();

    expect(spawnProcess).toHaveBeenCalledWith(
      "/usr/local/bin/node",
      ["--loader", "tsx", "src/index.ts", "--inspect"],
      expect.objectContaining({
        cwd: "/tmp/pi-gateway",
        env: { TEST_ENV: "1" },
        detached: true,
        stdio: "ignore",
      }),
    );
    expect(killProcess).not.toHaveBeenCalled();

    child.emit("spawn");
    await restartPromise;

    expect(child.unref).toHaveBeenCalledTimes(1);
    expect(killProcess).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(50);

    expect(killProcess).toHaveBeenCalledWith(4321, "SIGTERM");
  });

  it("PM2 托管时不额外拉起进程，只请求自身退出", async () => {
    const spawnProcess = vi.fn();
    const killProcess = vi.fn(() => true);
    const service = createRestartService({
      spawnProcess,
      killProcess,
      pid: 1234,
      exitDelayMs: 20,
      isPm2Managed: true,
    });

    await service.restartGateway();

    expect(spawnProcess).not.toHaveBeenCalled();
    expect(killProcess).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(20);

    expect(killProcess).toHaveBeenCalledWith(1234, "SIGTERM");
  });
});
