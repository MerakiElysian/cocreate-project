import { Request, Response, NextFunction } from "express";
import { authService } from "./auth.service";
import { sendSuccess } from "../../utils/apiResponse";
import { ApiError } from "../../utils/apiError";
import { env } from "../../config/env";

function setRefreshTokenCookie(res: Response, refreshToken: string) {
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: env.nodeEnv === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.register(req.body);
      setRefreshTokenCookie(res, result.refreshToken);
      const data = { user: result.user, accessToken: result.accessToken };
      return sendSuccess(res, data, "Account created successfully", 201);
    } catch (err) {
      next(err);
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.login(req.body);
      setRefreshTokenCookie(res, result.refreshToken);
      const data = { user: result.user, accessToken: result.accessToken };
      return sendSuccess(res, data, "Logged in successfully");
    } catch (err) {
      next(err);
    }
  },

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies?.refreshToken || req.body?.refreshToken;
      if (!token) throw ApiError.unauthorized("Refresh token missing");
      const result = await authService.refresh(token);
      setRefreshTokenCookie(res, result.refreshToken);
      const data = { user: result.user, accessToken: result.accessToken };
      return sendSuccess(res, data, "Token refreshed successfully");
    } catch (err) {
      next(err);
    }
  },

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies?.refreshToken || req.body?.refreshToken;
      if (token) {
        await authService.logout(token);
      }
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: env.nodeEnv === "production",
        sameSite: "strict",
        path: "/",
      });
      return sendSuccess(res, null, "Logged out successfully");
    } catch (err) {
      next(err);
    }
  },
};
