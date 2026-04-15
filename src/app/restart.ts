import { spawn, type SpawnOptions } from "node:child_process";
import { logger } from "./logger.js";

export const RESTART_MESSAGE = "🔄 正在重启网关...";

const RESTART_EXIT_DELAY_MS = 150;
const RESTART_READY_TIMEOUT_MS = 30_000;
const RESTART_READY_SIGNAL_ENV = "PI_GATEWAY_RESTART_READY_SIGNAL";
const RESTART_READY_IPC_MESSAGE_TYPE = "pi-gateway-ready";

export interface RestartService {
  restartGateway(): Promise<void>;
}

interface RestartServiceOptions {
  spawnProcess?: typeof spawn;
  killProcess?: (pid: number, signal?: NodeJS.Signals | number) => boolean;
  execPath?: string;
  execArgv?: string[];
  argv?: string[];
  cwd?: string;
  env?: NodeJS.ProcessEnv;
  pid?: number;
  exitDelayMs?: number;
  readinessTimeoutMs?: number;
  isPm2Managed?: boolean;
}

interface RestartSnapshot {
  execPath: string;
  execArgv: string[];
  argv: string[];
  cwd: string;
  env: NodeJS.ProcessEnv;
  pid: number;
}

export function createRestartService(options: RestartServiceOptions = {}): RestartService {
  const spawnProcess = options.spawnProcess ?? spawn;
  const killProcess = options.killProcess ?? process.kill.bind(process);
  const exitDelayMs = options.exitDelayMs ?? RESTART_EXIT_DELAY_MS;
  const readinessTimeoutMs = options.readinessTimeoutMs ?? RESTART_READY_TIMEOUT_MS;
  const snapshot: RestartSnapshot = {
    execPath: options.execPath ?? process.execPath,
    execArgv: options.execArgv ?? [...process.execArgv],
    argv: options.argv ?? [...process.argv],
    cwd: options.cwd ?? process.cwd(),
    env: options.env ?? process.env,
    pid: options.pid ?? process.pid,
  };
  const isPm2Managed = options.isPm2Managed ?? detectPm2(snapshot.env);

  async function restartGateway(): Promise<void> {
    logger.info("收到网关重启请求", {
      pid: snapshot.pid,
      mode: isPm2Managed ? "pm2" : "self-spawn",
    });

    if (!isPm2Managed) {
      await spawnReplacementProcess(snapshot, spawnProcess, readinessTimeoutMs);
    }

    scheduleShutdown(snapshot.pid, exitDelayMs, killProcess);
  }

  return {
    restartGateway,
  };
}

function detectPm2(env: NodeJS.ProcessEnv): boolean {
  return typeof env.pm_id === "string" && env.pm_id.length > 0;
}

async function spawnReplacementProcess(
  snapshot: RestartSnapshot,
  spawnProcess: typeof spawn,
  readinessTimeoutMs: number,
): Promise<void> {
  const runtimeArgs = [...snapshot.execArgv, ...snapshot.argv.slice(1)];
  if (runtimeArgs.length === 0) {
    throw new Error("无法确定当前进程的启动参数");
  }

  await new Promise<void>((resolve, reject) => {
    const child = spawnProcess(snapshot.execPath, runtimeArgs, {
      cwd: snapshot.cwd,
      env: {
        ...snapshot.env,
        [RESTART_READY_SIGNAL_ENV]: "1",
      },
      detached: true,
      stdio: ["ignore", "ignore", "ignore", "ipc"],
    } satisfies SpawnOptions);

    const timeout = setTimeout(() => {
      cleanup();
      terminateChildProcess(child);
      reject(new Error(`新的网关进程在 ${readinessTimeoutMs}ms 内未完成启动`));
    }, readinessTimeoutMs);
    timeout.unref();

    const cleanup = () => {
      clearTimeout(timeout);
      child.removeListener("error", handleError);
      child.removeListener("exit", handleExit);
      child.removeListener("message", handleMessage);
    };

    const handleError = (error: Error) => {
      cleanup();
      terminateChildProcess(child);
      reject(error);
    };

    const handleExit = (code: number | null, signal: NodeJS.Signals | null) => {
      cleanup();
      reject(new Error(`新的网关进程在就绪前退出（code=${code ?? "null"}, signal=${signal ?? "null"}）`));
    };

    const handleMessage = (message: unknown) => {
      if (!isRestartReadyMessage(message)) {
        return;
      }

      cleanup();
      if (typeof child.disconnect === "function" && child.connected) {
        child.disconnect();
      }
      child.unref();
      resolve();
    };

    child.once("error", handleError);
    child.once("exit", handleExit);
    child.on("message", handleMessage);
  });

  logger.info("新的网关进程已就绪", {
    pid: snapshot.pid,
    entry: snapshot.argv[1] ?? "(unknown)",
  });
}

function isRestartReadyMessage(message: unknown): boolean {
  if (!message || typeof message !== "object") {
    return false;
  }

  return Reflect.get(message, "type") === RESTART_READY_IPC_MESSAGE_TYPE;
}

function terminateChildProcess(child: { kill?: (signal?: NodeJS.Signals | number) => boolean }): void {
  if (typeof child.kill !== "function") {
    return;
  }

  try {
    child.kill("SIGTERM");
  } catch (error) {
    logger.warn("终止未就绪的新网关进程失败", { error: String(error) });
  }
}

export async function signalRestartReadyIfNeeded(): Promise<void> {
  const shouldSignalReady = process.env[RESTART_READY_SIGNAL_ENV] === "1";
  delete process.env[RESTART_READY_SIGNAL_ENV];

  if (!shouldSignalReady) {
    return;
  }

  if (typeof process.send !== "function") {
    throw new Error("当前进程缺少 IPC 通道，无法上报重启就绪状态");
  }

  await new Promise<void>((resolve, reject) => {
    process.send?.({ type: RESTART_READY_IPC_MESSAGE_TYPE }, (error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
}

function scheduleShutdown(
  pid: number,
  exitDelayMs: number,
  killProcess: (pid: number, signal?: NodeJS.Signals | number) => boolean,
): void {
  const timer = setTimeout(() => {
    killProcess(pid, "SIGTERM");
  }, exitDelayMs);
  timer.unref();
}
