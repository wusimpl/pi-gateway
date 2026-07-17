import {
  AuthStorage,
  DefaultResourceLoader,
  ModelRegistry,
  SessionManager,
  createAgentSession,
  getAgentDir,
  type AgentSession,
  type ExtensionFactory,
  type ResourceDiagnostic,
  type SessionInfo,
  type Skill,
} from "@mariozechner/pi-coding-agent";
import type { Model } from "@mariozechner/pi-ai";
import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { isAbsolute, join, relative, resolve } from "node:path";
import { logger } from "../app/logger.js";
import { createGroupWorkspaceFilesExtension } from "./extensions/group-workspace-files.js";
import { createRuntimeMetadataExtension } from "./extensions/runtime-metadata.js";
import { installGatewayToolFilter } from "./tool-filter.js";

export interface PiSessionResourceOptions {
  loadGlobalAgentsSkills?: boolean;
}

export interface PiRuntime {
  getAuthStorage(): AuthStorage;
  getModelRegistry(): ModelRegistry;
  createPiSession(
    cwd: string,
    sessionDir?: string,
    model?: Model<any>,
    resourceOptions?: PiSessionResourceOptions,
  ): Promise<AgentSession>;
  listPiSessions(cwd: string, sessionDir?: string): Promise<SessionInfo[]>;
  continueRecentPiSession(
    cwd: string,
    sessionDir?: string,
    resourceOptions?: PiSessionResourceOptions,
  ): Promise<{ session: AgentSession; fallbackMessage?: string } | null>;
  openPiSession(
    sessionFile: string,
    cwd: string,
    resourceOptions?: PiSessionResourceOptions,
  ): Promise<AgentSession>;
}

export interface CreatePiRuntimeOptions {
  extensionFactories?: ExtensionFactory[];
  disableGlobalAgents?: boolean;
  gatewayAgentsFile?: string;
}

const retryClassifierPatchMarker = Symbol("piGatewayRetryClassifier");

type RetryableMessage = {
  stopReason?: unknown;
  errorMessage?: unknown;
};

type RetryClassifierSession = {
  _isRetryableError?: (message: RetryableMessage) => boolean;
  [retryClassifierPatchMarker]?: true;
};

export function createPiRuntime(options: CreatePiRuntimeOptions = {}): PiRuntime {
  const authStorage = AuthStorage.create();
  const modelRegistry = ModelRegistry.create(authStorage);
  const extensionFactories = [
    ...(options.extensionFactories ?? []),
    createRuntimeMetadataExtension(),
    createGroupWorkspaceFilesExtension(),
  ];
  const agentsFilesOverride = createAgentsFilesOverride({
    disableGlobalAgents: options.disableGlobalAgents === true,
    gatewayAgentsFile: options.gatewayAgentsFile,
  });

  async function createResourceLoader(cwd: string, resourceOptions?: PiSessionResourceOptions) {
    const resourceLoader = new DefaultResourceLoader({
      cwd,
      agentDir: getAgentDir(),
      extensionFactories,
      agentsFilesOverride,
      skillsOverride: createSkillsOverride(resourceOptions),
    });
    await resourceLoader.reload();
    return resourceLoader;
  }

  async function createPiSession(
    cwd: string,
    sessionDir?: string,
    model?: Model<any>,
    resourceOptions?: PiSessionResourceOptions,
  ): Promise<AgentSession> {
    const sessionManager = SessionManager.create(cwd, sessionDir);
    const resourceLoader = await createResourceLoader(cwd, resourceOptions);
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
    await bindGatewayExtensions(session);
    installGatewayToolFilter(session);
    installGatewayRetryClassifier(session);
    return session;
  }

  async function listPiSessions(cwd: string, sessionDir?: string): Promise<SessionInfo[]> {
    return SessionManager.list(cwd, sessionDir);
  }

  async function continueRecentPiSession(
    cwd: string,
    sessionDir?: string,
    resourceOptions?: PiSessionResourceOptions,
  ): Promise<{ session: AgentSession; fallbackMessage?: string } | null> {
    try {
      const sessionManager = SessionManager.continueRecent(cwd, sessionDir);
      const resourceLoader = await createResourceLoader(cwd, resourceOptions);
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
      await bindGatewayExtensions(session);
      installGatewayToolFilter(session);
      installGatewayRetryClassifier(session);
      return { session, fallbackMessage: modelFallbackMessage };
    } catch (err) {
      logger.warn("Pi session 恢复失败，将创建新 session", { error: String(err) });
      return null;
    }
  }

  async function openPiSession(
    sessionFile: string,
    cwd: string,
    resourceOptions?: PiSessionResourceOptions,
  ): Promise<AgentSession> {
    const sessionManager = SessionManager.open(sessionFile, undefined, cwd);
    const resourceLoader = await createResourceLoader(cwd, resourceOptions);
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
    await bindGatewayExtensions(session);
    installGatewayToolFilter(session);
    installGatewayRetryClassifier(session);
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

async function bindGatewayExtensions(session: AgentSession): Promise<void> {
  await session.bindExtensions({});
}

function installGatewayRetryClassifier(session: AgentSession): void {
  const retrySession = session as unknown as RetryClassifierSession;
  if (retrySession[retryClassifierPatchMarker] || typeof retrySession._isRetryableError !== "function") {
    return;
  }

  const defaultClassifier = retrySession._isRetryableError.bind(session);
  retrySession._isRetryableError = (message: RetryableMessage) =>
    defaultClassifier(message) || isRetryableStreamInterruption(message);
  retrySession[retryClassifierPatchMarker] = true;
}

function isRetryableStreamInterruption(message: RetryableMessage): boolean {
  if (message.stopReason !== "error" || typeof message.errorMessage !== "string") {
    return false;
  }

  return /\bunexpected\s+EOF\b/i.test(message.errorMessage);
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

function createSkillsOverride(resourceOptions?: PiSessionResourceOptions) {
  if (resourceOptions?.loadGlobalAgentsSkills === true) {
    return undefined;
  }

  const globalAgentsSkillsDir = resolve(join(getHomeDir(), ".agents", "skills"));
  return (base: { skills: Skill[]; diagnostics: ResourceDiagnostic[] }) => ({
    skills: base.skills.filter((skill) => !isUnderPath(skill.filePath, globalAgentsSkillsDir)),
    diagnostics: base.diagnostics.filter((diagnostic) => !isBlockedSkillDiagnostic(diagnostic, globalAgentsSkillsDir)),
  });
}

function isBlockedSkillDiagnostic(diagnostic: ResourceDiagnostic, globalAgentsSkillsDir: string): boolean {
  if (diagnostic.path && isUnderPath(diagnostic.path, globalAgentsSkillsDir)) {
    return true;
  }

  const collision = diagnostic.collision;
  return Boolean(
    collision
      && (isUnderPath(collision.winnerPath, globalAgentsSkillsDir)
        || isUnderPath(collision.loserPath, globalAgentsSkillsDir)),
  );
}

function isUnderPath(filePath: string, rootDir: string): boolean {
  const relativePath = relative(rootDir, resolve(filePath));
  return relativePath === "" || (relativePath.length > 0 && !relativePath.startsWith("..") && !isAbsolute(relativePath));
}

function getHomeDir(): string {
  return process.env.HOME || homedir();
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
  resourceOptions?: PiSessionResourceOptions,
): Promise<AgentSession> {
  return getDefaultPiRuntime().createPiSession(cwd, sessionDir, model, resourceOptions);
}

export async function continueRecentPiSession(
  cwd: string,
  sessionDir?: string,
  resourceOptions?: PiSessionResourceOptions,
): Promise<{ session: AgentSession; fallbackMessage?: string } | null> {
  return getDefaultPiRuntime().continueRecentPiSession(cwd, sessionDir, resourceOptions);
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
  resourceOptions?: PiSessionResourceOptions,
): Promise<AgentSession> {
  return getDefaultPiRuntime().openPiSession(sessionFile, cwd, resourceOptions);
}
