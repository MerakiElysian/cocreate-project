import bcrypt from "bcryptjs";
import { prisma } from "../../config/db";
import { ApiError } from "../../utils/apiError";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../../utils/jwt";
import { env } from "../../config/env";

interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

interface LoginInput {
  email: string;
  password: string;
}

function msFromExpiry(expiry: string): number {
  const match = /^(\d+)([smhd])$/.exec(expiry);
  if (!match) return 7 * 24 * 60 * 60 * 1000;
  const value = parseInt(match[1], 10);
  const unit = match[2];
  const multipliers: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };
  return value * multipliers[unit];
}

export const authService = {
  async register({ name, email, password }: RegisterInput) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw ApiError.conflict("An account with this email already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });

    return authService.issueTokens(user.id, user.email, user.name, user.avatarUrl);
  },

  async login({ email, password }: LoginInput) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw ApiError.unauthorized("Invalid email or password");
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw ApiError.unauthorized("Invalid email or password");
    }

    return authService.issueTokens(user.id, user.email, user.name, user.avatarUrl);
  },

  async refresh(refreshToken: string) {
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw ApiError.unauthorized("Invalid or expired refresh token");
    }

    const stored = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });
    if (!stored || stored.expiresAt < new Date()) {
      throw ApiError.unauthorized("Refresh token expired or revoked");
    }

    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) {
      throw ApiError.unauthorized("User no longer exists");
    }

    await prisma.refreshToken.delete({ where: { token: refreshToken } });

    return authService.issueTokens(user.id, user.email, user.name, user.avatarUrl);
  },

  async logout(refreshToken: string) {
    await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
  },

  async issueTokens(
    userId: string,
    email: string,
    name: string,
    avatarUrl: string | null
  ) {
    const accessToken = signAccessToken({ userId, email });
    const refreshToken = signRefreshToken({ userId, email });

    const expiresAt = new Date(
      Date.now() + msFromExpiry(env.jwt.refreshExpiry)
    );

    await prisma.refreshToken.create({
      data: { token: refreshToken, userId, expiresAt },
    });

    return {
      user: { id: userId, name, email, avatarUrl },
      accessToken,
      refreshToken,
    };
  },
};
