export type LogLevel = "debug" | "info" | "warn" | "error";

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

let currentLevel: LogLevel = "info";

export function setLogLevel(level: LogLevel) {
  currentLevel = level;
}

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[currentLevel];
}

function formatMessage(level: LogLevel, msg: string, meta?: Record<string, unknown>): string {
  const ts = new Date().toISOString();
  const base = `[${ts}] [${level.toUpperCase()}] ${msg}`;
  if (meta && Object.keys(meta).length > 0) {
    return `${base} ${JSON.stringify(meta)}`;
  }
  return base;
}

export const logger = {
  debug(msg: string, meta?: Record<string, unknown>) {
    if (shouldLog("debug")) console.debug(formatMessage("debug", msg, meta));
  },
  info(msg: string, meta?: Record<string, unknown>) {
    if (shouldLog("info")) console.info(formatMessage("info", msg, meta));
  },
  warn(msg: string, meta?: Record<string, unknown>) {
    if (shouldLog("warn")) console.warn(formatMessage("warn", msg, meta));
  },
  error(msg: string, meta?: Record<string, unknown>) {
    if (shouldLog("error")) console.error(formatMessage("error", msg, meta));
  },
};
