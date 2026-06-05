import type { ConversationTarget } from "../../conversation.js";
import type { UserIdentity } from "../../types.js";
import { handleBridgeCommand, type BridgeCommand } from "../commands.js";
import {
  clearRestartReadyNotification,
  recordRestartReadyNotification,
  type RestartService,
} from "../restart.js";
import type { RuntimeStateStore } from "../state.js";
import type { CommandReplySender } from "./types.js";

interface SystemCommandHandlersDeps {
  dataDir: string;
  stopWaitTimeoutMs: number;
  runtimeState: Pick<
    RuntimeStateStore,
    "isLocked" | "beginRestartDrain" | "cancelRestartDrain" | "requestStop"
  > & Partial<Pick<RuntimeStateStore, "waitForUnlock">>;
  restartService: Pick<RestartService, "restartGateway">;
  sendTextReply: CommandReplySender;
  sendCommandReply: CommandReplySender;
}

export function createSystemCommandHandlers(deps: SystemCommandHandlersDeps) {
  async function handleStopCommand(
    identity: UserIdentity,
    command: BridgeCommand,
    conversationKey: string,
    conversationTarget?: ConversationTarget,
  ): Promise<void> {
    const openId = identity.openId;
    const result = await deps.runtimeState.requestStop(conversationKey);
    if (result === "not_running") {
      await deps.sendTextReply(identity, conversationTarget, "当前没有正在执行的任务。");
      return;
    }

    const stopped = deps.runtimeState.waitForUnlock
      ? await deps.runtimeState.waitForUnlock(conversationKey, undefined, deps.stopWaitTimeoutMs)
      : !deps.runtimeState.isLocked(conversationKey);
    if (!stopped) {
      await deps.sendTextReply(identity, conversationTarget, "停止请求已发出，但任务还没完全结束，请稍后再试。");
      return;
    }

    const reply = handleBridgeCommand(command, { openId });
    await deps.sendCommandReply(identity, conversationTarget, reply);
  }

  async function handleRestartCommand(
    identity: UserIdentity,
    command: BridgeCommand,
    conversationTarget?: ConversationTarget,
  ): Promise<void> {
    const openId = identity.openId;
    const drainState = deps.runtimeState.beginRestartDrain();
    if (drainState === "busy") {
      await deps.sendTextReply(identity, conversationTarget, "当前还有任务在跑，等这条回复结束后再重启网关。");
      return;
    }
    if (drainState === "already_draining") {
      await deps.sendTextReply(identity, conversationTarget, "网关正在重启，暂时不接新任务，请稍后再试。");
      return;
    }

    try {
      await recordRestartReadyNotification(deps.dataDir, openId, conversationTarget);
      const reply = handleBridgeCommand(command, { openId });
      await deps.sendCommandReply(identity, conversationTarget, reply);
      await deps.restartService.restartGateway();
    } catch (error) {
      deps.runtimeState.cancelRestartDrain();
      await clearRestartReadyNotification(deps.dataDir);
      throw error;
    }
  }

  async function handleNextCommand(
    identity: UserIdentity,
    command: BridgeCommand,
    conversationTarget?: ConversationTarget,
  ): Promise<void> {
    await deps.sendCommandReply(identity, conversationTarget, handleBridgeCommand(command, { openId: identity.openId }));
  }

  return {
    handleStopCommand,
    handleRestartCommand,
    handleNextCommand,
  };
}
