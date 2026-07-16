import type { AgentSession } from "@mariozechner/pi-coding-agent";

export const GATEWAY_REMOVED_TOOL_NAMES = new Set([
  "init_experiment",
  "run_experiment",
  "log_experiment",
  "subagent",
  "subagent_status",
  "grok_search",
]);

const toolFilterInstalled = Symbol("gatewayToolFilterInstalled");

type ToolConfigSession = Pick<AgentSession, "getAllTools" | "getActiveToolNames" | "setActiveToolsByName"> & {
  [toolFilterInstalled]?: true;
};

export function installGatewayToolFilter(session: AgentSession): void {
  const toolSession = session as ToolConfigSession;
  if (toolSession[toolFilterInstalled]) {
    return;
  }

  const getAllTools = toolSession.getAllTools.bind(toolSession);
  const getActiveToolNames = toolSession.getActiveToolNames.bind(toolSession);
  const setActiveToolsByName = toolSession.setActiveToolsByName.bind(toolSession);
  toolSession[toolFilterInstalled] = true;

  toolSession.getAllTools = () => getAllTools().filter((tool) => !GATEWAY_REMOVED_TOOL_NAMES.has(tool.name));
  toolSession.setActiveToolsByName = (toolNames) => {
    setActiveToolsByName(toolNames.filter((toolName) => !GATEWAY_REMOVED_TOOL_NAMES.has(toolName)));
  };
  toolSession.setActiveToolsByName(getActiveToolNames());
}
