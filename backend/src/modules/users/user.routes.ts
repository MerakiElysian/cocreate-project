import { Router } from "express";
import { userController } from "./user.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { updateProfileSchema } from "./user.validation";

const router = Router();

router.get("/me", authenticate, userController.me);
router.patch(
  "/me",
  authenticate,
  validate(updateProfileSchema),
  userController.updateProfile
);
router.get("/", authenticate, userController.list);
router.get("/:id", authenticate, userController.getById);

export default router;
