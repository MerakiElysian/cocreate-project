import { Response, NextFunction } from "express";
import { uploadService } from "./upload.service";
import { sendSuccess } from "../../utils/apiResponse";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { ApiError } from "../../utils/apiError";

export const uploadController = {
  async uploadImage(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const file = (req as unknown as { file?: Express.Multer.File }).file;
      if (!file) throw ApiError.badRequest("No file uploaded");

      const folder = (req.query.folder as "avatars" | "projects" | "misc") || "misc";
      const result = await uploadService.optimizeAndUpload(file.buffer, folder);
      return sendSuccess(res, result, "Image uploaded successfully", 201);
    } catch (err) {
      next(err);
    }
  },
};
