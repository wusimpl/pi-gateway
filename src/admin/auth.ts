import { randomBytes, timingSafeEqual } from "node:crypto";

export interface AdminSession {
  token: string;
  expiresAtMs: number;
}

export interface AdminAuthService {
  verifyPassword(password: string): boolean;
  createSession(nowMs?: number): AdminSession;
  verifySession(token: string | undefined, nowMs?: number): boolean;
  removeSession(token: string | undefined): void;
}

export function createAdminAuthService(options: {
  password: string;
  sessionTtlMs: number;
}): AdminAuthService {
  const sessions = new Map<string, AdminSession>();
  const password = options.password;

  function verifyPassword(input: string): boolean {
    return safeEqual(input, password);
  }

  function createSession(nowMs = Date.now()): AdminSession {
    const session = {
      token: randomBytes(32).toString("base64url"),
      expiresAtMs: nowMs + options.sessionTtlMs,
    };
    sessions.set(session.token, session);
    return session;
  }

  function verifySession(token: string | undefined, nowMs = Date.now()): boolean {
    if (!token) {
      return false;
    }
    const session = sessions.get(token);
    if (!session) {
      return false;
    }
    if (session.expiresAtMs <= nowMs) {
      sessions.delete(token);
      return false;
    }
    return true;
  }

  function removeSession(token: string | undefined): void {
    if (token) {
      sessions.delete(token);
    }
  }

  return {
    verifyPassword,
    createSession,
    verifySession,
    removeSession,
  };
}

function safeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }
  return timingSafeEqual(leftBuffer, rightBuffer);
}
