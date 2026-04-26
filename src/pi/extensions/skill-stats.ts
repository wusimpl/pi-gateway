import { existsSync, realpathSync } from "node:fs";
import { homedir } from "node:os";
import { isAbsolute, resolve } from "node:path";
import {
  isToolCallEventType,
  type ExtensionFactory,
  type SlashCommandInfo,
} from "@mariozechner/pi-coding-agent";
import type { SkillStatsStore } from "../skill-stats.js";

interface SkillInfo {
  name: string;
  path: string;
  scope?: string;
}

export function createSkillStatsExtension(store: SkillStatsStore): ExtensionFactory {
  return (pi) => {
    const countedToolCalls = new Set<string>();
    let turnIndex = 0;

    pi.on("turn_start", () => {
      turnIndex += 1;
      countedToolCalls.clear();
    });

    pi.on("tool_call", async (event, ctx) => {
      if (!isToolCallEventType("read", event)) {
        return;
      }

      const rawPath = event.input.path;
      if (typeof rawPath !== "string" || !rawPath.trim()) {
        return;
      }

      const skill = findSkillByReadPath(pi.getCommands(), rawPath, ctx.cwd);
      if (!skill) {
        return;
      }

      const dedupeKey = `${ctx.sessionManager.getSessionId()}:${turnIndex}:${skill.name}`;
      if (countedToolCalls.has(dedupeKey)) {
        return;
      }
      countedToolCalls.add(dedupeKey);

      await store.incrementSkillUsage({
        name: skill.name,
        path: skill.path,
        scope: skill.scope,
      });
    });
  };
}

function findSkillByReadPath(commands: SlashCommandInfo[], rawReadPath: string, cwd: string): SkillInfo | null {
  const readPath = normalizePathForCompare(resolveReadPathLikePi(rawReadPath, cwd));
  if (!readPath) {
    return null;
  }

  for (const command of commands) {
    if (command.source !== "skill") {
      continue;
    }

    const skillPath = normalizePathForCompare(command.sourceInfo.path);
    if (skillPath && skillPath === readPath) {
      return {
        name: command.name.replace(/^skill:/, ""),
        path: command.sourceInfo.path,
        scope: command.sourceInfo.scope,
      };
    }
  }

  return null;
}

function resolveReadPathLikePi(filePath: string, cwd: string): string {
  const expanded = expandPath(filePath.trim());
  return isAbsolute(expanded) ? expanded : resolve(cwd, expanded);
}

function expandPath(filePath: string): string {
  const withoutAtPrefix = filePath.startsWith("@") ? filePath.slice(1) : filePath;
  if (withoutAtPrefix === "~") {
    return homedir();
  }
  if (withoutAtPrefix.startsWith("~/")) {
    return `${homedir()}${withoutAtPrefix.slice(1)}`;
  }
  return withoutAtPrefix;
}

function normalizePathForCompare(filePath: string): string | null {
  try {
    return existsSync(filePath) ? realpathSync(filePath) : resolve(filePath);
  } catch {
    return resolve(filePath);
  }
}
