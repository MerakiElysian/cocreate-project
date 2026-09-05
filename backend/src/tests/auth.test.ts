import { describe, it, expect, vi } from "vitest";
import { authController } from "../modules/auth/auth.controller";
import { authService } from "../modules/auth/auth.service";

vi.mock("../modules/auth/auth.service", () => ({
  authService: {
    register: vi.fn().mockResolvedValue({
      user: { id: "u-1", name: "Alice", email: "alice@example.com", avatarUrl: null },
      accessToken: "mock_access_token",
      refreshToken: "mock_refresh_token",
    }),
    login: vi.fn().mockResolvedValue({
      user: { id: "u-1", name: "Alice", email: "alice@example.com", avatarUrl: null },
      accessToken: "mock_access_token",
      refreshToken: "mock_refresh_token",
    }),
    refresh: vi.fn().mockResolvedValue({
      user: { id: "u-1", name: "Alice", email: "alice@example.com", avatarUrl: null },
      accessToken: "new_mock_access_token",
      refreshToken: "new_mock_refresh_token",
    }),
    logout: vi.fn().mockResolvedValue(undefined),
  },
}));

describe("Task 7 & Auth basics: Auth flow and HttpOnly cookie security", () => {
  it("does NOT include refreshToken in login response JSON body", async () => {
    let jsonOutput: any = null;
    const cookieCalls: Array<{ name: string; value: string; options: any }> = [];

    const req: any = { body: { email: "alice@example.com", password: "Password123" } };
    const res: any = {
      cookie: (name: string, value: string, options: any) => {
        cookieCalls.push({ name, value, options });
      },
      status: vi.fn().mockReturnThis(),
      json: (data: any) => {
        jsonOutput = data;
      },
    };
    const next = vi.fn();

    await authController.login(req, res, next);

    expect(cookieCalls.some((c) => c.name === "refreshToken" && c.options.httpOnly)).toBe(true);
    expect(jsonOutput?.data?.refreshToken).toBeUndefined();
    expect(jsonOutput?.data?.accessToken).toBe("mock_access_token");
  });

  it("handles register -> login -> refresh -> logout happy path", async () => {
    const res: any = {
      cookie: vi.fn(),
      clearCookie: vi.fn(),
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    const next = vi.fn();

    // 1. Register
    await authController.register({ body: { name: "Alice", email: "alice@example.com", password: "Password123" } } as any, res, next);
    expect(res.cookie).toHaveBeenCalledWith("refreshToken", "mock_refresh_token", expect.objectContaining({ httpOnly: true }));

    // 2. Refresh
    const refreshReq: any = { cookies: { refreshToken: "mock_refresh_token" } };
    await authController.refresh(refreshReq, res, next);
    expect(authService.refresh).toHaveBeenCalledWith("mock_refresh_token");

    // 3. Logout
    const logoutReq: any = { cookies: { refreshToken: "new_mock_refresh_token" } };
    await authController.logout(logoutReq, res, next);
    expect(authService.logout).toHaveBeenCalledWith("new_mock_refresh_token");
    expect(res.clearCookie).toHaveBeenCalledWith("refreshToken");
  });
});
