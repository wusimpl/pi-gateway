import {
  AuthStorage,
  DefaultResourceLoader,
  ModelRegistry,
  SessionManager,
  createAgentSession,
  getAgentDir,
  type AgentSession,
  type ExtensionFactory,
  type SessionInfo,
} from "@mariozechner/pi-coding-agent";
import type { Model } from "@mariozechner/pi-ai";
import { existsSync, readFileSync } from "node:fs";
import { resolve, join } from "node:path";
import { logger } from "../app/logger.js";
import { createRuntimeMetadataExtension } from "./extensions/runtime-metadata.js";

export interface PiRuntime {
  getAuthStorage(): AuthStorage;
  getModelRegistry(): ModelRegistry;
  createPiSession(cwd: string, sessionDir?: string, model?: Model<any>): Promise<AgentSession>;
  listPiSessions(cwd: string, sessionDir?: string): Promise<SessionInfo[]>;
  continueRecentPiSession(
    cwd: string,
    sessionDir?: string,
  ): Promise<{ session: AgentSession; fallbackMessage?: string } | null>;
  openPiSession(sessionFile: string, cwd: string): Promise<AgentSession>;
}

export interface CreatePiRuntimeOptions {
  extensionFactories?: ExtensionFactory[];
  disableGlobalAgents?: boolean;
  gatewayAgentsFile?: string;
}

export function createPiRuntime(options: CreatePiRuntimeOptions = {}): PiRuntime {
  const authStorage = AuthStorage.create();
  const modelRegistry = ModelRegistry.create(authStorage);
  const extensionFactories = [...(options.extensionFactories ?? []), createRuntimeMetadataExtension()];
  const agentsFilesOverride = createAgentsFilesOverride({
    disableGlobalAgents: options.disableGlobalAgents === true,
    gatewayAgentsFile: options.gatewayAgentsFile,
  });

  async function createResourceLoader(cwd: string) {
    const resourceLoader = new DefaultResourceLoader({
      cwd,
      agentDir: getAgentDir(),
      extensionFactories,
      agentsFilesOverride,
    });
    await resourceLoader.reload();
    return resourceLoader;
  }

  async function createPiSession(
    cwd: string,
    sessionDir?: string,
    model?: Model<any>,
  ): Promise<AgentSession> {
    const sessionManager = SessionManager.create(cwd, sessionDir);
    const resourceLoader = await createResourceLoader(cwd);
    const { session } = await createAgentSession({
      cwd,
      sessionManager,
      authStorage,
      modelRegistry,
      resourceLoader,
      model,
    });

    logger.info("Pi session 已创建", {
      sessionId: session.sessionId,
      sessionFile: session.sessionFile,
    });
    return session;
  }

  async function listPiSessions(cwd: string, sessionDir?: string): Promise<SessionInfo[]> {
    return SessionManager.list(cwd, sessionDir);
  }

  async function continueRecentPiSession(
    cwd: string,
    sessionDir?: string
  ): Promise<{ session: AgentSession; fallbackMessage?: string } | null> {
    try {
      const sessionManager = SessionManager.continueRecent(cwd, sessionDir);
      const resourceLoader = await createResourceLoader(cwd);
      const { session, modelFallbackMessage } = await createAgentSession({
        cwd,
        sessionManager,
        authStorage,
        modelRegistry,
        resourceLoader,
      });
      logger.info("Pi session 已恢复", {
        sessionId: session.sessionId,
        sessionFile: session.sessionFile,
      });
      return { session, fallbackMessage: modelFallbackMessage };
    } catch (err) {
      logger.warn("Pi session 恢复失败，将创建新 session", { error: String(err) });
      return null;
    }
  }

  async function openPiSession(
    sessionFile: string,
    cwd: string,
  ): Promise<AgentSession> {
    const sessionManager = SessionManager.open(sessionFile, undefined, cwd);
    const resourceLoader = await createResourceLoader(cwd);
    const { session } = await createAgentSession({
      cwd,
      sessionManager,
      authStorage,
      modelRegistry,
      resourceLoader,
    });
    logger.info("Pi session 已打开", {
      sessionId: session.sessionId,
      sessionFile: session.sessionFile,
    });
    return session;
  }

  return {
    getAuthStorage: () => authStorage,
    getModelRegistry: () => modelRegistry,
    createPiSession,
    listPiSessions,
    continueRecentPiSession,
    openPiSession,
  };
}

function createAgentsFilesOverride(options: {
  disableGlobalAgents: boolean;
  gatewayAgentsFile?: string;
}) {
  if (!options.disableGlobalAgents && !options.gatewayAgentsFile) {
    return undefined;
  }

  const agentDir = getAgentDir();
  const globalContextFiles = new Set([
    resolve(join(agentDir, "AGENTS.md")),
    resolve(join(agentDir, "CLAUDE.md")),
  ]);
  const gatewayAgentsFile = options.gatewayAgentsFile ? resolve(options.gatewayAgentsFile) : undefined;

  return (base: { agentsFiles: Array<{ path: string; content: string }> }) => {
    const agentsFiles = options.disableGlobalAgents
      ? base.agentsFiles.filter((file) => !globalContextFiles.has(resolve(file.path)))
      : [...base.agentsFiles];

    if (!gatewayAgentsFile || agentsFiles.some((file) => resolve(file.path) === gatewayAgentsFile)) {
      return { agentsFiles };
    }

    const gatewayAgents = readGatewayAgentsFile(gatewayAgentsFile);
    if (!gatewayAgents) {
      return { agentsFiles };
    }

    const firstProjectIndex = agentsFiles.findIndex(
      (file) => !globalContextFiles.has(resolve(file.path)),
    );
    const insertIndex = firstProjectIndex === -1 ? agentsFiles.length : firstProjectIndex;
    agentsFiles.splice(insertIndex, 0, gatewayAgents);
    return { agentsFiles };
  };
}

function readGatewayAgentsFile(path: string): { path: string; content: string } | null {
  if (!existsSync(path)) {
    return null;
  }

  try {
    return { path, content: readFileSync(path, "utf-8") };
  } catch (err) {
    logger.warn("飞书网关 AGENTS.md 读取失败，已跳过", { path, error: String(err) });
    return null;
  }
}

let defaultPiRuntime: PiRuntime | null = null;

export function initPiRuntime(): PiRuntime {
  defaultPiRuntime = createPiRuntime();
  logger.info("Pi 运行时初始化完成");
  return defaultPiRuntime;
}

function getDefaultPiRuntime(): PiRuntime {
  if (!defaultPiRuntime) {
    throw new Error("Pi 运行时尚未初始化");
  }
  return defaultPiRuntime;
}

export function getAuthStorage(): AuthStorage {
  return getDefaultPiRuntime().getAuthStorage();
}

export function getModelRegistry(): ModelRegistry {
  return getDefaultPiRuntime().getModelRegistry();
}

export async function createPiSession(
  cwd: string,
  sessionDir?: string,
  model?: Model<any>,
): Promise<AgentSession> {
  return getDefaultPiRuntime().createPiSession(cwd, sessionDir, model);
}

export async function continueRecentPiSession(
  cwd: string,
  sessionDir?: string
): Promise<{ session: AgentSession; fallbackMessage?: string } | null> {
  return getDefaultPiRuntime().continueRecentPiSession(cwd, sessionDir);
}

export async function listPiSessions(
  cwd: string,
  sessionDir?: string
): Promise<SessionInfo[]> {
  return getDefaultPiRuntime().listPiSessions(cwd, sessionDir);
}

export async function openPiSession(
  sessionFile: string,
  cwd: string,
): Promise<AgentSession> {
  return getDefaultPiRuntime().openPiSession(sessionFile, cwd);
}
