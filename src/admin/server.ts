import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join } from "node:path";
import type { Config } from "../config.js";
import { logger } from "../app/logger.js";
import { createAdminAuthService, type AdminAuthService } from "./auth.js";
import type { AdminCommandExecutor } from "./command-executor.js";
import type { AdminPageDataService } from "./page-data.js";
import type { AdminTargetService } from "./targets.js";

const COOKIE_NAME = "pi_gateway_admin";

export interface AdminServer {
  start(): Promise<void>;
  stop(): Promise<void>;
  getUrl(): string;
}

export function createAdminServer(config: Pick<
  Config,
  "ADMIN_HOST" | "ADMIN_PORT" | "ADMIN_PASSWORD" | "ADMIN_SESSION_TTL_MS"
>, deps?: {
  targets?: AdminTargetService;
  pages?: AdminPageDataService;
  commands?: AdminCommandExecutor;
}): AdminServer {
  const auth = createAdminAuthService({
    password: config.ADMIN_PASSWORD,
    sessionTtlMs: config.ADMIN_SESSION_TTL_MS,
  });
  const publicDir = join(process.cwd(), "src", "admin", "public");
  const server = createServer((req, res) => {
    void handleRequest(req, res, auth, publicDir, deps ?? {});
  });

  async function start(): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      const onError = (error: Error) => {
        server.off("listening", onListening);
        reject(error);
      };
      const onListening = () => {
        server.off("error", onError);
        resolve();
      };
      server.once("error", onError);
      server.once("listening", onListening);
      server.listen(config.ADMIN_PORT, config.ADMIN_HOST);
    });
    logger.info("后台管理已启动", { url: getUrl() });
  }

  async function stop(): Promise<void> {
    await closeServer(server);
  }

  function getUrl(): string {
    return `http://${config.ADMIN_HOST}:${config.ADMIN_PORT}/admin/`;
  }

  return {
    start,
    stop,
    getUrl,
  };
}

async function handleRequest(
  req: IncomingMessage,
  res: ServerResponse,
  auth: AdminAuthService,
  publicDir: string,
  deps: {
    targets?: AdminTargetService;
    pages?: AdminPageDataService;
    commands?: AdminCommandExecutor;
  },
): Promise<void> {
  const url = new URL(req.url ?? "/", "http://127.0.0.1");
  try {
    if (url.pathname === "/admin") {
      redirect(res, "/admin/");
      return;
    }

    if (url.pathname === "/admin/api/login" && req.method === "POST") {
      await handleLogin(req, res, auth);
      return;
    }

    if (url.pathname === "/admin/api/logout" && req.method === "POST") {
      auth.removeSession(readCookie(req, COOKIE_NAME));
      setSessionCookie(res, "", 0);
      sendJson(res, 200, { ok: true });
      return;
    }

    if (url.pathname === "/admin/api/me" && req.method === "GET") {
      if (!auth.verifySession(readCookie(req, COOKIE_NAME))) {
        sendJson(res, 401, { error: "UNAUTHORIZED" });
        return;
      }
      sendJson(res, 200, { ok: true });
      return;
    }

    if (url.pathname.startsWith("/admin/api/")) {
      if (!auth.verifySession(readCookie(req, COOKIE_NAME))) {
        sendJson(res, 401, { error: "UNAUTHORIZED" });
        return;
      }
      await handleApiRequest(req, res, url, deps);
      return;
    }

    if (url.pathname.startsWith("/admin/") && req.method === "GET") {
      await serveStatic(res, publicDir, url.pathname);
      return;
    }

    sendText(res, 404, "Not found", "text/plain; charset=utf-8");
  } catch (error) {
    logger.error("后台请求处理失败", { path: url.pathname, error: String(error) });
    sendJson(res, 500, { error: "INTERNAL_ERROR" });
  }
}

async function handleApiRequest(
  req: IncomingMessage,
  res: ServerResponse,
  url: URL,
  deps: {
    targets?: AdminTargetService;
    pages?: AdminPageDataService;
    commands?: AdminCommandExecutor;
  },
): Promise<void> {
  if (url.pathname === "/admin/api/bootstrap" && req.method === "GET") {
    const targets = await deps.targets?.listTargets?.() ?? [];
    sendJson(res, 200, {
      targets,
      defaultTargetKey: targets[0]?.key ?? "",
    });
    return;
  }

  if (url.pathname === "/admin/api/pages/sessions" && req.method === "GET") {
    const targetKey = url.searchParams.get("targetKey") ?? "";
    if (!targetKey) {
      sendJson(res, 400, { error: "TARGET_REQUIRED", message: "请先选择私聊或群聊。" });
      return;
    }
    try {
      sendJson(res, 200, await deps.pages?.getSessionsPage(targetKey) ?? {});
    } catch (error) {
      if ((error as Error).message === "ADMIN_TARGET_NOT_FOUND") {
        sendJson(res, 404, { error: "TARGET_NOT_FOUND", message: "目标不存在。" });
        return;
      }
      throw error;
    }
    return;
  }

  if (url.pathname === "/admin/api/pages/models" && req.method === "GET") {
    const targetKey = url.searchParams.get("targetKey") ?? "";
    if (!targetKey) {
      sendJson(res, 400, { error: "TARGET_REQUIRED", message: "请先选择私聊或群聊。" });
      return;
    }
    try {
      sendJson(res, 200, await deps.pages?.getModelsPage(targetKey) ?? {});
    } catch (error) {
      if ((error as Error).message === "ADMIN_TARGET_NOT_FOUND") {
        sendJson(res, 404, { error: "TARGET_NOT_FOUND", message: "目标不存在。" });
        return;
      }
      throw error;
    }
    return;
  }

  if (url.pathname === "/admin/api/pages/settings" && req.method === "GET") {
    const targetKey = url.searchParams.get("targetKey") ?? "";
    if (!targetKey) {
      sendJson(res, 400, { error: "TARGET_REQUIRED", message: "请先选择私聊或群聊。" });
      return;
    }
    try {
      sendJson(res, 200, await deps.pages?.getSettingsPage(targetKey) ?? {});
    } catch (error) {
      if ((error as Error).message === "ADMIN_TARGET_NOT_FOUND") {
        sendJson(res, 404, { error: "TARGET_NOT_FOUND", message: "目标不存在。" });
        return;
      }
      throw error;
    }
    return;
  }

  if (url.pathname === "/admin/api/pages/cron" && req.method === "GET") {
    const targetKey = url.searchParams.get("targetKey") ?? "";
    if (!targetKey) {
      sendJson(res, 400, { error: "TARGET_REQUIRED", message: "请先选择私聊或群聊。" });
      return;
    }
    try {
      sendJson(res, 200, await deps.pages?.getCronPage(targetKey) ?? {});
    } catch (error) {
      if ((error as Error).message === "ADMIN_TARGET_NOT_FOUND") {
        sendJson(res, 404, { error: "TARGET_NOT_FOUND", message: "目标不存在。" });
        return;
      }
      throw error;
    }
    return;
  }

  if (url.pathname === "/admin/api/pages/group" && req.method === "GET") {
    const targetKey = url.searchParams.get("targetKey") ?? "";
    if (!targetKey) {
      sendJson(res, 400, { error: "TARGET_REQUIRED", message: "请先选择私聊或群聊。" });
      return;
    }
    try {
      sendJson(res, 200, await deps.pages?.getGroupPage(targetKey) ?? {});
    } catch (error) {
      if ((error as Error).message === "ADMIN_TARGET_NOT_FOUND") {
        sendJson(res, 404, { error: "TARGET_NOT_FOUND", message: "目标不存在。" });
        return;
      }
      if ((error as Error).message === "ADMIN_GROUP_TARGET_REQUIRED") {
        sendJson(res, 400, { error: "GROUP_TARGET_REQUIRED", message: "请先选择一个群聊。" });
        return;
      }
      throw error;
    }
    return;
  }

  if (url.pathname === "/admin/api/command" && req.method === "POST") {
    const body = await readJsonBody(req);
    const targetKey = typeof body.targetKey === "string" ? body.targetKey : "";
    const rawCommand = typeof body.command === "string" ? body.command : "";
    const syncToFeishu = body.syncToFeishu === true;
    if (!targetKey) {
      sendJson(res, 400, { error: "TARGET_REQUIRED", message: "请先选择私聊或群聊。" });
      return;
    }
    const resolvedTarget = await deps.targets?.resolveTarget(targetKey);
    if (!resolvedTarget) {
      sendJson(res, 404, { error: "TARGET_NOT_FOUND", message: "目标不存在。" });
      return;
    }
    const result = await deps.commands?.executeRawCommand({
      resolvedTarget,
      rawCommand,
      syncToFeishu,
    });
    sendJson(res, 200, result ?? { command: rawCommand, output: "当前环境不支持执行命令。" });
    return;
  }

  sendText(res, 404, "Not found", "text/plain; charset=utf-8");
}

async function handleLogin(
  req: IncomingMessage,
  res: ServerResponse,
  auth: AdminAuthService,
): Promise<void> {
  const body = await readJsonBody(req);
  const password = typeof body.password === "string" ? body.password : "";
  if (!auth.verifyPassword(password)) {
    sendJson(res, 401, { error: "INVALID_PASSWORD" });
    return;
  }

  const session = auth.createSession();
  setSessionCookie(res, session.token, session.expiresAtMs);
  sendJson(res, 200, { ok: true });
}

async function serveStatic(res: ServerResponse, publicDir: string, pathname: string): Promise<void> {
  const relativePath = pathname === "/admin/" ? "index.html" : pathname.slice("/admin/".length);
  if (relativePath.includes("..")) {
    sendText(res, 400, "Bad request", "text/plain; charset=utf-8");
    return;
  }
  const filePath = join(publicDir, relativePath);
  const content = await readFile(filePath);
  sendText(res, 200, content, contentType(filePath));
}

async function readJsonBody(req: IncomingMessage): Promise<Record<string, unknown>> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  if (chunks.length === 0) {
    return {};
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf-8")) as Record<string, unknown>;
}

function readCookie(req: IncomingMessage, name: string): string | undefined {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) {
    return undefined;
  }
  for (const item of cookieHeader.split(";")) {
    const [rawKey, ...rawValue] = item.trim().split("=");
    if (rawKey === name) {
      return decodeURIComponent(rawValue.join("="));
    }
  }
  return undefined;
}

function setSessionCookie(res: ServerResponse, token: string, expiresAtMs: number): void {
  const expires = expiresAtMs > 0 ? new Date(expiresAtMs).toUTCString() : new Date(0).toUTCString();
  res.setHeader(
    "Set-Cookie",
    `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/admin; HttpOnly; SameSite=Lax; Expires=${expires}`,
  );
}

function redirect(res: ServerResponse, location: string): void {
  res.statusCode = 302;
  res.setHeader("Location", location);
  res.end();
}

function sendJson(res: ServerResponse, statusCode: number, payload: unknown): void {
  sendText(res, statusCode, JSON.stringify(payload), "application/json; charset=utf-8");
}

function sendText(
  res: ServerResponse,
  statusCode: number,
  body: string | Buffer,
  type: string,
): void {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", type);
  res.end(body);
}

function contentType(filePath: string): string {
  switch (extname(filePath)) {
    case ".css":
      return "text/css; charset=utf-8";
    case ".js":
      return "text/javascript; charset=utf-8";
    case ".html":
      return "text/html; charset=utf-8";
    default:
      return "application/octet-stream";
  }
}

function closeServer(server: Server): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!server.listening) {
      resolve();
      return;
    }
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
}
