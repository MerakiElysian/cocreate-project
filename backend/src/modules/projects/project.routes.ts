import { Router } from "express";
import { projectController } from "./project.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import {
  createProjectSchema,
  updateProjectSchema,
  addCollaboratorSchema,
} from "./project.validation";

const router = Router();

router.use(authenticate);

router.post("/", validate(createProjectSchema), projectController.create);
router.get("/", projectController.listMine);
router.get("/:id", projectController.getById);
router.patch("/:id", validate(updateProjectSchema), projectController.update);
router.delete("/:id", projectController.remove);

router.post(
  "/:id/collaborators",
  validate(addCollaboratorSchema),
  projectController.addCollaborator
);
router.delete("/:id/collaborators/:userId", projectController.removeCollaborator);

router.get("/:id/messages", projectController.getMessages);

export default router;
