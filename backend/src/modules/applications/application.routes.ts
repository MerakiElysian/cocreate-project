import { Router } from "express";
import { applicationController } from "./application.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { updateApplicationSchema } from "./application.validation";

const router = Router();

router.use(authenticate);

router.patch("/:id", validate(updateApplicationSchema), applicationController.updateStatus);

export default router;
