import { Response, NextFunction } from "express";
import { roleService } from "./role.service";
import { sendSuccess } from "../../utils/apiResponse";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { ApiError } from "../../utils/apiError";

export const roleController = {
  async createRole(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw ApiError.unauthorized();
      const role = await roleService.createRole(
        req.params.id,
        req.user.userId,
        req.body
      );
      return sendSuccess(res, role, "Role created successfully", 201);
    } catch (err) {
      next(err);
    }
  },

  async updateRole(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw ApiError.unauthorized();
      const role = await roleService.updateRole(
        req.params.id,
        req.user.userId,
        req.body
      );
      return sendSuccess(res, role, "Role updated successfully");
    } catch (err) {
      next(err);
    }
  },

  async deleteRole(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw ApiError.unauthorized();
      await roleService.deleteRole(req.params.id, req.user.userId);
      return sendSuccess(res, null, "Role deleted successfully");
    } catch (err) {
      next(err);
    }
  },

  async getRolesByProject(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const roles = await roleService.getRolesByProject(req.params.id);
      return sendSuccess(res, roles);
    } catch (err) {
      next(err);
    }
  },

  async saveRole(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw ApiError.unauthorized();
      const saved = await roleService.saveRole(req.params.id, req.user.userId);
      return sendSuccess(res, saved, "Role saved successfully");
    } catch (err) {
      next(err);
    }
  },

  async unsaveRole(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw ApiError.unauthorized();
      await roleService.unsaveRole(req.params.id, req.user.userId);
      return sendSuccess(res, null, "Role unsaved successfully");
    } catch (err) {
      next(err);
    }
  },
};
