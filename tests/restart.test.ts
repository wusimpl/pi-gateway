import { EventEmitter } from "node:events";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createRestartService } from "../src/app/restart.js";

function createChildProcessDouble() {
  const child = new EventEmitter() as EventEmitter & {
    connected: boolean;
    disconnect: ReturnType<typeof vi.fn>;
    kill: ReturnType<typeof vi.fn>;
    pid: number;
    unref: ReturnType<typeof vi.fn>;
  };
  child.connected = true;
  child.disconnect = vi.fn(() => {
    child.connected = false;
  });
  child.kill = vi.fn(() => true);
  child.pid = 6789;
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

  it("直接运行时会等新进程报到就绪后，再请求旧进程退出", async () => {
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
      readinessTimeoutMs: 1_000,
      isPm2Managed: false,
    });

    const restartPromise = service.restartGateway();

    expect(spawnProcess).toHaveBeenCalledWith(
      "/usr/local/bin/node",
      ["--loader", "tsx", "src/index.ts", "--inspect"],
      expect.objectContaining({
        cwd: "/tmp/pi-gateway",
        env: expect.objectContaining({
          TEST_ENV: "1",
          PI_GATEWAY_RESTART_READY_SIGNAL: "1",
        }),
        detached: true,
        stdio: ["ignore", "ignore", "ignore", "ipc"],
      }),
    );
    expect(killProcess).not.toHaveBeenCalled();

    child.emit("message", { type: "pi-gateway-ready" });
    await restartPromise;

    expect(child.disconnect).toHaveBeenCalledTimes(1);
    expect(child.unref).toHaveBeenCalledTimes(1);
    expect(killProcess).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(50);

    expect(killProcess).toHaveBeenCalledWith(4321, "SIGTERM");
  });

  it("新进程如果在就绪前退出，不应请求旧进程退出", async () => {
    const child = createChildProcessDouble();
    const spawnProcess = vi.fn(() => child as any);
    const killProcess = vi.fn(() => true);
    const service = createRestartService({
      spawnProcess,
      killProcess,
      pid: 4321,
      exitDelayMs: 50,
      readinessTimeoutMs: 1_000,
      isPm2Managed: false,
    });

    const restartPromise = service.restartGateway();
    const rejection = expect(restartPromise).rejects.toThrow("新的网关进程在就绪前退出");
    child.emit("exit", 1, null);

    await rejection;
    await vi.advanceTimersByTimeAsync(50);

    expect(killProcess).not.toHaveBeenCalled();
  });

  it("新进程一直没报到时，应终止它并保留旧进程", async () => {
    const child = createChildProcessDouble();
    const spawnProcess = vi.fn(() => child as any);
    const killProcess = vi.fn(() => true);
    const service = createRestartService({
      spawnProcess,
      killProcess,
      pid: 4321,
      exitDelayMs: 50,
      readinessTimeoutMs: 200,
      isPm2Managed: false,
    });

    const restartPromise = service.restartGateway();
    const rejection = expect(restartPromise).rejects.toThrow("新的网关进程在 200ms 内未完成启动");
    await vi.advanceTimersByTimeAsync(200);

    await rejection;
    expect(child.kill).toHaveBeenCalledWith("SIGTERM");
    expect(killProcess).not.toHaveBeenCalled();
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
