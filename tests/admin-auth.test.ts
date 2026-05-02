import { describe, expect, it } from "vitest";
import { createAdminAuthService } from "../src/admin/auth.js";

describe("admin auth", () => {
  it("只接受正确的管理密码", () => {
    const auth = createAdminAuthService({ password: "secret", sessionTtlMs: 1000 });

    expect(auth.verifyPassword("secret")).toBe(true);
    expect(auth.verifyPassword("wrong")).toBe(false);
  });

  it("会拒绝过期会话", () => {
    const auth = createAdminAuthService({ password: "secret", sessionTtlMs: 1000 });
    const session = auth.createSession(10);

    expect(auth.verifySession(session.token, 1000)).toBe(true);
    expect(auth.verifySession(session.token, 1011)).toBe(false);
    expect(auth.verifySession(session.token, 1012)).toBe(false);
  });
});
