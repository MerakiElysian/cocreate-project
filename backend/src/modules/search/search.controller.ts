import { Request, Response, NextFunction } from "express";
import { searchService } from "./search.service";
import { sendSuccess } from "../../utils/apiResponse";
import { ApiError } from "../../utils/apiError";

export const searchController = {
  async projects(req: Request, res: Response, next: NextFunction) {
    try {
      const q = (req.query.q as string) || "";
      if (!q.trim()) throw ApiError.badRequest("Query parameter 'q' is required");
      const page = parseInt((req.query.page as string) || "1", 10);
      const limit = Math.min(parseInt((req.query.limit as string) || "20", 10), 100);
      const result = await searchService.searchProjects(q, page, limit);
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  },

  async users(req: Request, res: Response, next: NextFunction) {
    try {
      const q = (req.query.q as string) || "";
      if (!q.trim()) throw ApiError.badRequest("Query parameter 'q' is required");
      const page = parseInt((req.query.page as string) || "1", 10);
      const limit = Math.min(parseInt((req.query.limit as string) || "20", 10), 100);
      const result = await searchService.searchUsers(q, page, limit);
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  },
};
