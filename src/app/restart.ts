import { spawn, type SpawnOptions } from "node:child_process";
import { logger } from "./logger.js";

export const RESTART_MESSAGE = "🔄 正在重启网关...";

const RESTART_EXIT_DELAY_MS = 150;

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
      await spawnReplacementProcess(snapshot, spawnProcess);
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
): Promise<void> {
  const runtimeArgs = [...snapshot.execArgv, ...snapshot.argv.slice(1)];
  if (runtimeArgs.length === 0) {
    throw new Error("无法确定当前进程的启动参数");
  }

  await new Promise<void>((resolve, reject) => {
    const child = spawnProcess(snapshot.execPath, runtimeArgs, {
      cwd: snapshot.cwd,
      env: snapshot.env,
      detached: true,
      stdio: "ignore",
    } satisfies SpawnOptions);

    child.once("error", reject);
    child.once("spawn", () => {
      child.unref();
      resolve();
    });
  });

  logger.info("新的网关进程已拉起", {
    pid: snapshot.pid,
    entry: snapshot.argv[1] ?? "(unknown)",
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
