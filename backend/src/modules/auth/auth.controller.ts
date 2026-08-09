import { Request, Response, NextFunction } from "express";
import { authService } from "./auth.service";
import { sendSuccess } from "../../utils/apiResponse";

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.register(req.body);
      return sendSuccess(res, result, "Account created successfully", 201);
    } catch (err) {
      next(err);
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.login(req.body);
      return sendSuccess(res, result, "Logged in successfully");
    } catch (err) {
      next(err);
    }
  },

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.refresh(req.body.refreshToken);
      return sendSuccess(res, result, "Token refreshed successfully");
    } catch (err) {
      next(err);
    }
  },

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      await authService.logout(req.body.refreshToken);
      return sendSuccess(res, null, "Logged out successfully");
    } catch (err) {
      next(err);
    }
  },
};
