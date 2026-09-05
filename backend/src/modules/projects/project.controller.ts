import { Request, Response, NextFunction } from "express";
import { projectService } from "./project.service";
import { sendSuccess } from "../../utils/apiResponse";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { ApiError } from "../../utils/apiError";

export const projectController = {
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw ApiError.unauthorized();
      const project = await projectService.create(req.user.userId, req.body);
      return sendSuccess(res, project, "Project created", 201);
    } catch (err) {
      next(err);
    }
  },

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const project = await projectService.getById(req.params.id);
      return sendSuccess(res, project);
    } catch (err) {
      next(err);
    }
  },

  async listExplore(req: Request, res: Response, next: NextFunction) {
    try {
      const filter = req.query.filter as string;
      const category = req.query.category as string;
      const role = req.query.role as string;
      const page = parseInt((req.query.page as string) || "1", 10);
      const limit = Math.min(parseInt((req.query.limit as string) || "20", 10), 100);

      const result = await projectService.listExplore({
        filter,
        category,
        role,
        page,
        limit,
      });
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  },

  async listMine(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw ApiError.unauthorized();
      const page = parseInt((req.query.page as string) || "1", 10);
      const limit = Math.min(parseInt((req.query.limit as string) || "20", 10), 100);
      const result = await projectService.listByUser(req.user.userId, page, limit);
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  },

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw ApiError.unauthorized();
      const updated = await projectService.update(
        req.params.id,
        req.user.userId,
        req.body
      );
      return sendSuccess(res, updated, "Project updated");
    } catch (err) {
      next(err);
    }
  },

  async remove(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw ApiError.unauthorized();
      await projectService.remove(req.params.id, req.user.userId);
      return sendSuccess(res, null, "Project deleted");
    } catch (err) {
      next(err);
    }
  },

  async addCollaborator(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw ApiError.unauthorized();
      const { userId, role } = req.body;
      const collaborator = await projectService.addCollaborator(
        req.params.id,
        req.user.userId,
        userId,
        role
      );
      return sendSuccess(res, collaborator, "Collaborator added");
    } catch (err) {
      next(err);
    }
  },

  async removeCollaborator(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw ApiError.unauthorized();
      await projectService.removeCollaborator(
        req.params.id,
        req.user.userId,
        req.params.userId
      );
      return sendSuccess(res, null, "Collaborator removed");
    } catch (err) {
      next(err);
    }
  },

  async getMessages(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw ApiError.unauthorized();
      const messages = await projectService.getMessages(
        req.params.id,
        req.user.userId
      );
      return sendSuccess(res, messages);
    } catch (err) {
      next(err);
    }
  },
};
