import { Router } from "express";
import { roleController } from "./role.controller";
import { applicationController } from "../applications/application.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { createApplicationSchema } from "../applications/application.validation";

const router = Router();

router.use(authenticate);

router.post("/:id/save", roleController.saveRole);
router.delete("/:id/save", roleController.unsaveRole);

router.post(
  "/:id/applications",
  validate(createApplicationSchema),
  applicationController.applyToRole
);
router.get("/:id/applications", applicationController.getApplicationsForRole);

export default router;
