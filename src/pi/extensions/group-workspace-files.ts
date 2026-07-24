import { realpath } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, isAbsolute, relative, resolve } from "node:path";
import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { getWorkspaceContext } from "../workspace-identity.js";

const WORKSPACE_FILE_TOOL_NAMES = new Set(["read", "edit", "write", "ls"]);
const ACCESS_DENIED_REASON = "文件工具只能访问当前会话工作空间。";
const BASH_ACCESS_DENIED_REASON = "bash 仅允许在当前会话工作空间内执行 rm 或 python 脚本。";
const UNSAFE_BASH_COMMAND_PATTERN = /[\n\r;|&><$`*?\[\]{}()'"\\]/;
const ALLOWED_RM_OPTIONS = new Set(["-f", "-r", "-R", "-rf", "-fr", "-rF", "-Rf", "--force", "--recursive"]);
const PYTHON_EXECUTABLES = new Set(["python", "python3"]);

type FileAccessKind = "read" | "write";

export function createGroupWorkspaceFilesExtension(): (pi: ExtensionAPI) => void {
  return (pi) => {
    pi.on("tool_call", async (event, ctx) => {
      // TEMP: disable workspace path restriction for group/p2p bash/write/etc.
      return undefined;

      /*
      if (!WORKSPACE_FILE_TOOL_NAMES.has(event.toolName) && event.toolName !== "bash") {
        return undefined;
      }

      const workspaceContext = getWorkspaceContext(ctx.cwd, ctx.sessionManager);
      if (!workspaceContext) {
        return { block: true, reason: event.toolName === "bash" ? BASH_ACCESS_DENIED_REASON : ACCESS_DENIED_REASON };
      }

      if (event.toolName === "bash") {
        const command = (event.input as { command?: unknown }).command;
        if (typeof command !== "string" || !await isWorkspaceBashCommandAllowed(ctx.cwd, command)) {
          return { block: true, reason: BASH_ACCESS_DENIED_REASON };
        }
        return undefined;
      }

      const path = (event.input as { path?: unknown }).path;
      if (typeof path !== "string" || !await isGroupWorkspacePathAllowed(
        ctx.cwd,
        path,
        event.toolName === "write" ? "write" : "read",
      )) {
        return { block: true, reason: ACCESS_DENIED_REASON };
      }

      return undefined;
      */
    });
  };
}

export async function isGroupWorkspacePathAllowed(
  workspaceDir: string,
  requestedPath: string,
  access: FileAccessKind,
): Promise<boolean> {
  const workspacePath = resolve(workspaceDir);
  const targetPath = resolveWorkspacePath(workspacePath, requestedPath);
  if (!isWithinPath(workspacePath, targetPath)) {
    return false;
  }

  try {
    const realWorkspacePath = await realpath(workspacePath);
    const realTargetPath = access === "write"
      ? await getRealWriteTargetPath(targetPath)
      : await realpath(targetPath);
    return isWithinPath(realWorkspacePath, realTargetPath);
  } catch {
    return false;
  }
}

export async function isWorkspaceBashCommandAllowed(workspaceDir: string, command: string): Promise<boolean> {
  const trimmedCommand = command.trim();
  if (!trimmedCommand || UNSAFE_BASH_COMMAND_PATTERN.test(trimmedCommand)) {
    return false;
  }

  const tokens = trimmedCommand.split(/\s+/);
  const executable = tokens.shift();
  if (executable === "rm") {
    return isWorkspaceRmCommandAllowed(workspaceDir, tokens);
  }
  if (executable && PYTHON_EXECUTABLES.has(executable)) {
    return isWorkspacePythonCommandAllowed(workspaceDir, tokens);
  }
  return false;
}

export async function isWorkspaceRmCommandAllowed(workspaceDir: string, tokens: string[]): Promise<boolean> {
  let optionsAllowed = true;
  const targets: string[] = [];
  for (const token of tokens) {
    if (optionsAllowed && token === "--") {
      optionsAllowed = false;
    } else if (optionsAllowed && token.startsWith("-")) {
      if (!ALLOWED_RM_OPTIONS.has(token)) {
        return false;
      }
    } else {
      targets.push(token);
    }
  }

  if (targets.length === 0) {
    return false;
  }

  return Promise.all(targets.map((target) => isWorkspaceRmTargetAllowed(workspaceDir, target)))
    .then((allowed) => allowed.every(Boolean));
}

async function isWorkspacePythonCommandAllowed(workspaceDir: string, tokens: string[]): Promise<boolean> {
  const [scriptPath, ...args] = tokens;
  if (!scriptPath || scriptPath.startsWith("-") || !await isGroupWorkspacePathAllowed(workspaceDir, scriptPath, "read")) {
    return false;
  }

  return args.every((arg) => !isPathOutsideWorkspace(arg));
}

function isPathOutsideWorkspace(value: string): boolean {
  return isAbsolute(value) || value === "~" || value.startsWith("~/") || value.split("/").includes("..");
}

async function isWorkspaceRmTargetAllowed(workspaceDir: string, target: string): Promise<boolean> {
  const workspacePath = resolve(workspaceDir);
  const targetPath = resolveWorkspacePath(workspacePath, target);
  if (targetPath === workspacePath || !isWithinPath(workspacePath, targetPath)) {
    return false;
  }

  try {
    const realWorkspacePath = await realpath(workspacePath);
    const realParentPath = await getRealWriteTargetPath(dirname(targetPath));
    return isWithinPath(realWorkspacePath, realParentPath);
  } catch {
    return false;
  }
}

function resolveWorkspacePath(workspaceDir: string, requestedPath: string): string {
  const expandedPath = requestedPath === "~"
    ? homedir()
    : requestedPath.startsWith("~/")
      ? `${homedir()}${requestedPath.slice(1)}`
      : requestedPath;
  return isAbsolute(expandedPath) ? resolve(expandedPath) : resolve(workspaceDir, expandedPath);
}

async function getRealWriteTargetPath(targetPath: string): Promise<string> {
  try {
    return await realpath(targetPath);
  } catch {
    let existingPath = dirname(targetPath);
    while (true) {
      try {
        return await realpath(existingPath);
      } catch {
        const parentPath = dirname(existingPath);
        if (parentPath === existingPath) {
          throw new Error("WRITE_TARGET_HAS_NO_EXISTING_PARENT");
        }
        existingPath = parentPath;
      }
    }
  }
}

function isWithinPath(rootPath: string, targetPath: string): boolean {
  const pathRelative = relative(rootPath, targetPath);
  return pathRelative === "" || (!pathRelative.startsWith("..") && !isAbsolute(pathRelative));
}
