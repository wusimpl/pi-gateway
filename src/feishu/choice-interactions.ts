import { logger } from "../app/logger.js";
import {
  FEISHU_CHOICE_CANCEL_VALUE,
  buildFeishuChoiceActionToast,
  type FeishuChoiceCardAction,
  type FeishuChoiceCardActionResponse,
  type FeishuChoiceOption,
} from "./choice-card.js";

export type FeishuChoiceStatus = "answered" | "cancelled" | "timeout" | "aborted";

export interface FeishuChoiceResult {
  status: FeishuChoiceStatus;
  request_id: string;
  selected?: string;
  label?: string;
}

export interface PendingChoiceInput {
  requestId: string;
  openId: string;
  options: FeishuChoiceOption[];
  timeoutMs: number;
  signal?: AbortSignal;
}

export interface FeishuChoiceInteractionStore {
  waitForChoice(input: PendingChoiceInput): Promise<FeishuChoiceResult>;
  handleCardAction(action: FeishuChoiceCardAction): FeishuChoiceCardActionResponse;
  clear(): void;
}

interface PendingChoice {
  requestId: string;
  openId: string;
  options: FeishuChoiceOption[];
  timer: NodeJS.Timeout;
  abortListener?: () => void;
  resolve(result: FeishuChoiceResult): void;
}

export function createFeishuChoiceInteractionStore(): FeishuChoiceInteractionStore {
  const pending = new Map<string, PendingChoice>();

  function waitForChoice(input: PendingChoiceInput): Promise<FeishuChoiceResult> {
    if (pending.has(input.requestId)) {
      throw new Error(`重复的选择请求 ID: ${input.requestId}`);
    }

    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        settle(input.requestId, {
          status: "timeout",
          request_id: input.requestId,
        });
      }, input.timeoutMs);
      if (typeof timer.unref === "function") {
        timer.unref();
      }

      const choice: PendingChoice = {
        requestId: input.requestId,
        openId: input.openId,
        options: input.options,
        timer,
        resolve,
      };

      if (input.signal) {
        const onAbort = () => {
          settle(input.requestId, {
            status: "aborted",
            request_id: input.requestId,
          });
        };
        if (input.signal.aborted) {
          clearTimeout(timer);
          resolve({
            status: "aborted",
            request_id: input.requestId,
          });
          return;
        }
        input.signal.addEventListener("abort", onAbort, { once: true });
        choice.abortListener = () => input.signal?.removeEventListener("abort", onAbort);
      }

      pending.set(input.requestId, choice);
      logger.debug("飞书选择请求开始等待", {
        requestId: input.requestId,
        openId: input.openId,
        timeoutMs: input.timeoutMs,
      });
    });
  }

  function handleCardAction(action: FeishuChoiceCardAction): FeishuChoiceCardActionResponse {
    const choice = pending.get(action.requestId);
    if (!choice) {
      return buildFeishuChoiceActionToast("warning", "这个选择已过期，请重新发起。");
    }

    if (choice.openId !== action.openId) {
      logger.warn("飞书选择请求被非发起用户点击，已拒绝", {
        requestId: action.requestId,
        expectedOpenId: choice.openId,
        actualOpenId: action.openId,
      });
      return buildFeishuChoiceActionToast("warning", "这不是你的选择卡片。");
    }

    if (action.optionValue === FEISHU_CHOICE_CANCEL_VALUE) {
      settle(action.requestId, {
        status: "cancelled",
        request_id: action.requestId,
      });
      return buildFeishuChoiceActionToast("success", "已取消。");
    }

    const option = choice.options.find((item) => item.value === action.optionValue);
    if (!option) {
      return buildFeishuChoiceActionToast("warning", "这个选项无效。");
    }

    settle(action.requestId, {
      status: "answered",
      request_id: action.requestId,
      selected: option.value,
      label: option.label,
    });
    return buildFeishuChoiceActionToast("success", `已选择：${option.label}`);
  }

  function settle(requestId: string, result: FeishuChoiceResult): boolean {
    const choice = pending.get(requestId);
    if (!choice) return false;

    pending.delete(requestId);
    clearTimeout(choice.timer);
    choice.abortListener?.();
    logger.debug("飞书选择请求结束", {
      requestId,
      openId: choice.openId,
      status: result.status,
      selected: result.selected,
    });
    choice.resolve(result);
    return true;
  }

  function clear(): void {
    for (const requestId of pending.keys()) {
      settle(requestId, {
        status: "aborted",
        request_id: requestId,
      });
    }
  }

  return {
    waitForChoice,
    handleCardAction,
    clear,
  };
}
