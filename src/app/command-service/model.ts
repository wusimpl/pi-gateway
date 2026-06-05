import type { ConversationTarget } from "../../conversation.js";
import {
  type AvailableModelInfo,
  filterAvailableModels,
  formatModelLabel,
} from "../../pi/models.js";
import {
  getModelRoutingConfig,
  hasCompleteModelRoutingConfig,
  setModelRouteSlot,
} from "../../pi/model-routing.js";
import type { UserIdentity } from "../../types.js";
import { handleBridgeCommand, type BridgeCommand } from "../commands.js";
import {
  getCurrentModelLabel,
  getCurrentThinkingLevel,
  normalizeModelPreference,
} from "./helpers.js";
import {
  parseModelCommandArgs,
  parseModelProviderFilterArg,
  parseOnOffArgs,
} from "./parsers.js";
import type { CommandReplySender, TargetStateAccess } from "./types.js";

interface ModelCommandHandlersDeps extends TargetStateAccess {
  listAvailableModels(): Promise<AvailableModelInfo[]>;
  findAvailableModel(rawRef: string): Promise<AvailableModelInfo | null>;
  isConversationLocked(identity: UserIdentity, conversationTarget?: ConversationTarget): boolean;
  sendTextReply: CommandReplySender;
  sendCommandReply: CommandReplySender;
}

export function createModelCommandHandlers(deps: ModelCommandHandlersDeps) {
  async function handleModelCommand(
    identity: UserIdentity,
    command: BridgeCommand,
    conversationTarget?: ConversationTarget,
  ): Promise<void> {
    const openId = identity.openId;
    const argText = command.args.trim();

    if (!argText || argText.toLowerCase() === "status") {
      const sessionState = await deps.getActiveSession(identity, conversationTarget);
      const userState = await deps.readTargetState(identity, conversationTarget);
      const availableModels = await deps.listAvailableModels();
      const reply = handleBridgeCommand(command, {
        openId,
        currentModel: getCurrentModelLabel(sessionState.piSession),
        availableModelCount: availableModels.length,
        availableModels,
        modelRouting: getModelRoutingConfig(userState),
      });
      await deps.sendCommandReply(identity, conversationTarget, reply);
      return;
    }

    const providerFilter = parseModelProviderFilterArg(argText);
    if (providerFilter) {
      const sessionState = await deps.getActiveSession(identity, conversationTarget);
      const userState = await deps.readTargetState(identity, conversationTarget);
      const availableModels = await deps.listAvailableModels();
      const reply = handleBridgeCommand(command, {
        openId,
        currentModel: getCurrentModelLabel(sessionState.piSession),
        requestedProvider: providerFilter,
        availableModels: filterAvailableModels(availableModels, providerFilter),
        modelRouting: getModelRoutingConfig(userState),
      });
      await deps.sendCommandReply(identity, conversationTarget, reply);
      return;
    }

    if (deps.isConversationLocked(identity, conversationTarget)) {
      await deps.sendTextReply(identity, conversationTarget, "当前还有任务在跑，等这条回复结束后再切模型。");
      return;
    }

    const parsed = parseModelCommandArgs(argText);
    if (parsed.error) {
      await deps.sendTextReply(identity, conversationTarget, parsed.error);
      return;
    }

    if (!parsed.modelRef || !parsed.slot) {
      await deps.sendTextReply(identity, conversationTarget, "用法：/model router|light|heavy <序号或provider/model>。");
      return;
    }

    const targetModel = await deps.findAvailableModel(parsed.modelRef);
    if (!targetModel) {
      await deps.sendTextReply(
        identity,
        conversationTarget,
        "没找到这个模型，或者它现在还不能用。\n\n先用 /model 看编号，再用 /model router|light|heavy <序号或provider/model> 设置。",
      );
      return;
    }

    const sessionState = await deps.getActiveSession(identity, conversationTarget);
    const previousModel = getCurrentModelLabel(sessionState.piSession);
    const userState = await deps.ensureTargetState(identity, conversationTarget, sessionState);
    const modelPreference = normalizeModelPreference(targetModel.model) ?? {
      provider: targetModel.provider,
      id: targetModel.id,
    };
    setModelRouteSlot(userState, parsed.slot, modelPreference);
    userState.updatedAt = new Date().toISOString();

    if (parsed.slot === "heavy") {
      await sessionState.piSession.setModel!(targetModel.model);
      if (userState.thinkingLevel) {
        sessionState.piSession.setThinkingLevel!(userState.thinkingLevel);
      }
    }

    await deps.writeTargetState(identity, conversationTarget, userState);

    const reply = handleBridgeCommand(command, {
      openId,
      currentModel: getCurrentModelLabel(sessionState.piSession) ?? formatModelLabel(targetModel.provider, targetModel.id),
      currentThinkingLevel: getCurrentThinkingLevel(sessionState.piSession),
      previousModel,
      modelRouting: getModelRoutingConfig(userState),
      modelRouteSlot: parsed.slot,
    });
    await deps.sendCommandReply(identity, conversationTarget, reply);
  }

  async function handleRouteCommand(
    identity: UserIdentity,
    command: BridgeCommand,
    conversationTarget?: ConversationTarget,
  ): Promise<void> {
    const openId = identity.openId;
    const argText = command.args.trim();
    if (!argText || argText.toLowerCase() === "status") {
      const sessionState = await deps.getActiveSession(identity, conversationTarget);
      const userState = await deps.readTargetState(identity, conversationTarget);
      const reply = handleBridgeCommand(command, {
        openId,
        currentModel: getCurrentModelLabel(sessionState.piSession),
        modelRouting: getModelRoutingConfig(userState),
      });
      await deps.sendCommandReply(identity, conversationTarget, reply);
      return;
    }

    const parsed = parseOnOffArgs(command.args, "route");
    if (parsed.error) {
      await deps.sendTextReply(identity, conversationTarget, parsed.error);
      return;
    }

    const sessionState = await deps.getActiveSession(identity, conversationTarget);
    const userState = await deps.ensureTargetState(identity, conversationTarget, sessionState);
    userState.modelRouting = getModelRoutingConfig(userState);

    if (parsed.enabled && !hasCompleteModelRoutingConfig(userState)) {
      await deps.sendTextReply(
        identity,
        conversationTarget,
        "请先设置 router/light/heavy 三类模型。\n\n用法：/model router <模型>、/model light <模型>、/model heavy <模型>。",
      );
      return;
    }

    userState.modelRouting.enabled = parsed.enabled;
    userState.updatedAt = new Date().toISOString();
    await deps.writeTargetState(identity, conversationTarget, userState);

    const reply = handleBridgeCommand(command, {
      openId,
      currentModel: getCurrentModelLabel(sessionState.piSession),
      modelRouting: getModelRoutingConfig(userState),
      routeEnabled: parsed.enabled,
    });
    await deps.sendCommandReply(identity, conversationTarget, reply);
  }

  return {
    handleModelCommand,
    handleRouteCommand,
  };
}
