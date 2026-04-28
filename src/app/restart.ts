import { spawn, type SpawnOptions } from "node:child_process";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { ConversationTarget } from "../conversation.js";
import type { FeishuMessenger } from "../feishu/send.js";
import { logger } from "./logger.js";

export const RESTART_MESSAGE = "🔄 正在重启网关...";
export const RESTART_READY_MESSAGE = "✅ 网关已重启完成，已经重新上线。";

const RESTART_EXIT_DELAY_MS = 150;
const RESTART_READY_TIMEOUT_MS = 30_000;
const RESTART_READY_SIGNAL_ENV = "PI_GATEWAY_RESTART_READY_SIGNAL";
const RESTART_READY_IPC_MESSAGE_TYPE = "pi-gateway-ready";
const RESTART_READY_NOTIFICATION_FILE = "ready-notification.json";

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

interface RestartReadyNotification {
  openId: string;
  conversationTarget?: ConversationTarget;
  requestedAt: string;
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

export async function recordRestartReadyNotification(
  dataDir: string,
  openId: string,
  conversationTarget?: ConversationTarget,
): Promise<void> {
  const filePath = restartReadyNotificationPath(dataDir);
  await mkdir(restartReadyNotificationDir(dataDir), { recursive: true });
  await writeFile(
    filePath,
    JSON.stringify(
      {
        openId,
        conversationTarget: conversationTarget ? { ...conversationTarget } : undefined,
        requestedAt: new Date().toISOString(),
      } satisfies RestartReadyNotification,
      null,
      2,
    ),
    "utf-8",
  );
  logger.debug("重启完成通知已记录", {
    openId,
    conversationKey: conversationTarget?.key,
    filePath,
  });
}

export async function clearRestartReadyNotification(dataDir: string): Promise<void> {
  try {
    await rm(restartReadyNotificationPath(dataDir), { force: true });
  } catch (error) {
    logger.warn("清理重启完成通知失败", { error: String(error) });
  }
}

export async function notifyRestartReadyIfNeeded(
  dataDir: string,
  messenger: Pick<FeishuMessenger, "sendTextMessage"> & Partial<Pick<FeishuMessenger, "sendTextMessageToTarget">>,
): Promise<void> {
  const notification = await consumeRestartReadyNotification(dataDir);
  if (!notification) {
    return;
  }

  try {
    const target = notification.conversationTarget;
    const messageId = target && target.kind !== "p2p" && messenger.sendTextMessageToTarget
      ? await messenger.sendTextMessageToTarget(target, RESTART_READY_MESSAGE)
      : await messenger.sendTextMessage(notification.openId, RESTART_READY_MESSAGE);
    if (!messageId) {
      logger.warn("重启完成通知发送失败", {
        openId: notification.openId,
        conversationKey: target?.key,
      });
    }
  } catch (error) {
    logger.warn("重启完成通知发送失败", {
      openId: notification.openId,
      conversationKey: notification.conversationTarget?.key,
      error: String(error),
    });
  }
}

function detectPm2(env: NodeJS.ProcessEnv): boolean {
  return typeof env.pm_id === "string" && env.pm_id.length > 0;
}

async function consumeRestartReadyNotification(dataDir: string): Promise<RestartReadyNotification | null> {
  const notification = await readRestartReadyNotification(dataDir);
  if (!notification) {
    return null;
  }

  await clearRestartReadyNotification(dataDir);
  return notification;
}

async function readRestartReadyNotification(dataDir: string): Promise<RestartReadyNotification | null> {
  try {
    const raw = await readFile(restartReadyNotificationPath(dataDir), "utf-8");
    const parsed = JSON.parse(raw);
    if (isRestartReadyNotification(parsed)) {
      return parsed;
    }

    logger.warn("重启完成通知记录格式无效，已忽略");
    await clearRestartReadyNotification(dataDir);
    return null;
  } catch (error) {
    if (error instanceof SyntaxError) {
      logger.warn("重启完成通知记录格式无效，已忽略");
      await clearRestartReadyNotification(dataDir);
      return null;
    }

    if ((error as NodeJS.ErrnoException)?.code !== "ENOENT") {
      logger.warn("读取重启完成通知失败", { error: String(error) });
    }
    return null;
  }
}

function isRestartReadyNotification(value: unknown): value is RestartReadyNotification {
  if (!value || typeof value !== "object") {
    return false;
  }

  return (
    typeof Reflect.get(value, "openId") === "string"
    && isOptionalConversationTarget(Reflect.get(value, "conversationTarget"))
    && typeof Reflect.get(value, "requestedAt") === "string"
  );
}

function isOptionalConversationTarget(value: unknown): boolean {
  if (value === undefined) {
    return true;
  }
  if (!value || typeof value !== "object") {
    return false;
  }
  const target = value as Record<string, unknown>;
  const kind = target.kind;
  const receiveIdType = target.receiveIdType;
  return (
    (kind === "p2p" || kind === "group" || kind === "thread")
    && typeof target.key === "string"
    && (receiveIdType === "open_id" || receiveIdType === "chat_id")
    && typeof target.receiveId === "string"
    && (target.chatId === undefined || typeof target.chatId === "string")
    && (target.threadId === undefined || typeof target.threadId === "string")
  );
}

function restartReadyNotificationDir(dataDir: string): string {
  return join(dataDir, "restart");
}

function restartReadyNotificationPath(dataDir: string): string {
  return join(restartReadyNotificationDir(dataDir), RESTART_READY_NOTIFICATION_FILE);
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
