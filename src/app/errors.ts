import { logger } from "../app/logger.js";

export type ErrorCategory =
  | "feishu_api_temp"
  | "feishu_auth"
  | "pi_init"
  | "pi_prompt_timeout"
  | "pi_prompt_error"
  | "pi_stream_interrupt"
  | "storage_error"
  | "unknown";

export class BridgeError extends Error {
  public readonly category: ErrorCategory;
  public readonly retryable: boolean;
  public readonly originalError?: unknown;

  constructor(
    message: string,
    category: ErrorCategory,
    retryable: boolean = false,
    originalError?: unknown
  ) {
    super(message);
    this.name = "BridgeError";
    this.category = category;
    this.retryable = retryable;
    this.originalError = originalError;
  }
}

/** 错误分类与用户提示映射 */
const ERROR_USER_MESSAGES: Record<ErrorCategory, string> = {
  feishu_api_temp: "⚠️ 飞书服务暂时不可用，请稍后重试",
  feishu_auth: "❌ 飞书认证失败，请联系管理员",
  pi_init: "❌ AI 服务初始化失败，请联系管理员",
  pi_prompt_timeout: "⏱️ 处理超时，请稍后重试或使用 /new 新建会话",
  pi_prompt_error: "❌ AI 处理失败，请稍后重试",
  pi_stream_interrupt: "⚠️ 回复被中断，请重试",
  storage_error: "❌ 存储错误，请稍后重试",
  unknown: "❌ 未知错误，请稍后重试",
};

/** 根据错误分类返回用户友好的提示文本 */
export function getUserMessage(error: unknown): string {
  if (error instanceof BridgeError) {
    return ERROR_USER_MESSAGES[error.category];
  }
  return ERROR_USER_MESSAGES.unknown;
}

/** 对飞书 API 临时错误做短重试 */
export async function retryOnTempError<T>(
  fn: () => Promise<T>,
  maxRetries: number = 2,
  delayMs: number = 1000
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt < maxRetries) {
        logger.warn(`重试 (${attempt + 1}/${maxRetries})`, { error: String(err) });
        await sleep(delayMs * (attempt + 1));
      }
    }
  }
  throw lastError;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** 带超时的 Promise 包装 */
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  message: string = "操作超时"
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new BridgeError(message, "pi_prompt_timeout"));
    }, timeoutMs);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      }
    );
  });
}
