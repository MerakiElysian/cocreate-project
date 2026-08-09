import { Router } from "express";
import { uploadController } from "./upload.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { upload } from "../../middlewares/upload.middleware";

const router = Router();

router.post(
  "/image",
  authenticate,
  upload.single("image"),
  uploadController.uploadImage
);

export default router;
