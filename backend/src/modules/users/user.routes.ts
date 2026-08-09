import { Router } from "express";
import { userController } from "./user.controller";
import { authenticate } from "../../middlewares/auth.middleware";

const router = Router();

router.get("/me", authenticate, userController.me);
router.patch("/me", authenticate, userController.updateProfile);
router.get("/", authenticate, userController.list);
router.get("/:id", authenticate, userController.getById);

export default router;
