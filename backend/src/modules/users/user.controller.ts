import { Response, NextFunction } from "express";
import { userService } from "./user.service";
import { sendSuccess } from "../../utils/apiResponse";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { ApiError } from "../../utils/apiError";

export const userController = {
  async me(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw ApiError.unauthorized();
      const user = await userService.getById(req.user.userId);
      return sendSuccess(res, user);
    } catch (err) {
      next(err);
    }
  },

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await userService.getById(req.params.id);
      return sendSuccess(res, user);
    } catch (err) {
      next(err);
    }
  },

  async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw ApiError.unauthorized();
      const updated = await userService.updateProfile(req.user.userId, req.body);
      return sendSuccess(res, updated, "Profile updated");
    } catch (err) {
      next(err);
    }
  },

  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt((req.query.page as string) || "1", 10);
      const limit = parseInt((req.query.limit as string) || "20", 10);
      const result = await userService.listUsers(page, limit);
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  },
};
