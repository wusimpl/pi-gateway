import type { AgentSession } from "@mariozechner/pi-coding-agent";
import { logger } from "../app/logger.js";

export interface PromptResult {
  /** 聚合的 assistant 文本 */
  text: string;
  /** 错误信息（如有） */
  error?: string;
}

/**
 * 调用 Pi session.prompt() 并聚合流式输出
 */
export async function promptSession(
  session: AgentSession,
  text: string
): Promise<PromptResult> {
  let fullText = "";
  let lastError: string | undefined;

  // 订阅流式事件
  const unsubscribe = session.subscribe((event) => {
    switch (event.type) {
      case "message_update":
        if (event.assistantMessageEvent.type === "text_delta") {
          fullText += event.assistantMessageEvent.delta;
        }
        break;
      case "message_end":
        logger.debug("Pi message_end");
        break;
      case "agent_end":
        logger.debug("Pi agent_end");
        break;
      case "tool_execution_start":
        logger.debug("Pi tool_execution_start", { toolName: event.toolName });
        break;
      case "tool_execution_end":
        logger.debug("Pi tool_execution_end", {
          toolName: event.toolName,
          isError: event.isError,
        });
        break;
      default:
        logger.debug("Pi event", { type: event.type });
    }
  });

  try {
    await session.prompt(text);
  } catch (err) {
    lastError = err instanceof Error ? err.message : String(err);
    logger.error("Pi prompt 执行失败", { error: lastError });
  } finally {
    unsubscribe();
  }

  return {
    text: fullText,
    error: lastError,
  };
}
