import { Request, Response, NextFunction } from "express";
import { authService } from "./auth.service";
import { sendSuccess } from "../../utils/apiResponse";
import { ApiError } from "../../utils/apiError";

function setRefreshCookie(res: Response, token: string) {
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken, ...data } = await authService.register(req.body);
      setRefreshCookie(res, refreshToken);
      return sendSuccess(res, data, "Account created successfully", 201);
    } catch (err) {
      next(err);
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken, ...data } = await authService.login(req.body);
      setRefreshCookie(res, refreshToken);
      return sendSuccess(res, data, "Logged in successfully");
    } catch (err) {
      next(err);
    }
  },

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies?.refreshToken || req.body?.refreshToken;
      if (!token) {
        throw ApiError.unauthorized("Refresh token is required");
      }
      const { refreshToken, ...data } = await authService.refresh(token);
      setRefreshCookie(res, refreshToken);
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
      res.clearCookie("refreshToken");
      return sendSuccess(res, null, "Logged out successfully");
    } catch (err) {
      next(err);
    }
  },
};
