import { describe, it, expect, vi, beforeEach } from "vitest";
import { authService } from "../modules/auth/auth.service";
import { prisma } from "../config/db";
import bcrypt from "bcryptjs";
import * as jwtUtils from "../utils/jwt";
import { ApiError } from "../utils/apiError";

vi.mock("../config/db", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    refreshToken: {
      create: vi.fn(),
      findUnique: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
}));

vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn(),
    compare: vi.fn(),
  },
}));

vi.mock("../utils/jwt", () => ({
  signAccessToken: vi.fn().mockReturnValue("mock_access_token"),
  signRefreshToken: vi.fn().mockReturnValue("mock_refresh_token"),
  verifyRefreshToken: vi.fn().mockReturnValue({ userId: "user-1", email: "test@example.com" }),
}));

describe("Task 7 & Auth Flow: Registration, Login, Refresh", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("authService.register", () => {
    it("should register a new user and return tokens", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(null);
      vi.mocked(bcrypt.hash).mockResolvedValueOnce("hashed_pw" as never);
      vi.mocked(prisma.user.create).mockResolvedValueOnce({
        id: "user-1",
        name: "Test User",
        email: "test@example.com",
        avatarUrl: null,
      } as any);

      const result = await authService.register({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      });

      expect(result.accessToken).toBe("mock_access_token");
      expect(result.refreshToken).toBe("mock_refresh_token");
      expect(result.user.email).toBe("test@example.com");
    });

    it("should throw error if email already registered", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({ id: "existing" } as any);

      await expect(
        authService.register({
          name: "Test User",
          email: "existing@example.com",
          password: "password123",
        })
      ).rejects.toThrowError(ApiError);
    });
  });

  describe("authService.login", () => {
    it("should authenticate valid user credentials", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
        id: "user-1",
        name: "Test User",
        email: "test@example.com",
        password: "hashed_pw",
        avatarUrl: null,
      } as any);
      vi.mocked(bcrypt.compare).mockResolvedValueOnce(true as never);

      const result = await authService.login({
        email: "test@example.com",
        password: "password123",
      });

      expect(result.accessToken).toBe("mock_access_token");
      expect(result.user.id).toBe("user-1");
    });

    it("should reject invalid credentials", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(null);

      await expect(
        authService.login({ email: "invalid@example.com", password: "wrong" })
      ).rejects.toThrowError(ApiError);
    });
  });

  describe("authService.refresh", () => {
    it("should issue new tokens for valid refresh token", async () => {
      vi.mocked(jwtUtils.verifyRefreshToken).mockReturnValueOnce({
        userId: "user-1",
        email: "test@example.com",
      } as any);
      vi.mocked(prisma.refreshToken.findUnique).mockResolvedValueOnce({
        id: "token-1",
        token: "mock_refresh_token",
        userId: "user-1",
        expiresAt: new Date(Date.now() + 100000),
      } as any);
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
        id: "user-1",
        name: "Test User",
        email: "test@example.com",
        avatarUrl: null,
      } as any);

      const result = await authService.refresh("mock_refresh_token");
      expect(result.accessToken).toBe("mock_access_token");
      expect(prisma.refreshToken.delete).toHaveBeenCalledWith({
        where: { token: "mock_refresh_token" },
      });
    });
  });
});
