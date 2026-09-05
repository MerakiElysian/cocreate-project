import { Response, NextFunction } from "express";
import { applicationService } from "./application.service";
import { sendSuccess } from "../../utils/apiResponse";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { ApiError } from "../../utils/apiError";

export const applicationController = {
  async applyToRole(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw ApiError.unauthorized();
      const application = await applicationService.applyToRole(
        req.params.id,
        req.user.userId,
        req.body
      );
      return sendSuccess(res, application, "Application submitted", 201);
    } catch (err) {
      next(err);
    }
  },

  async getApplicationsForRole(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      if (!req.user) throw ApiError.unauthorized();
      const applications = await applicationService.getApplicationsForRole(
        req.params.id,
        req.user.userId
      );
      return sendSuccess(res, applications);
    } catch (err) {
      next(err);
    }
  },

  async updateStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw ApiError.unauthorized();
      const updated = await applicationService.updateStatus(
        req.params.id,
        req.user.userId,
        req.body.status
      );
      return sendSuccess(res, updated, "Application status updated");
    } catch (err) {
      next(err);
    }
  },
};
