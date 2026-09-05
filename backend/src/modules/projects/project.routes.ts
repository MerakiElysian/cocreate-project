import { Router } from "express";
import { projectController } from "./project.controller";
import { roleController } from "../roles/role.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import {
  createProjectSchema,
  updateProjectSchema,
  addCollaboratorSchema,
} from "./project.validation";
import { createRoleSchema } from "../roles/role.validation";

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

router.post("/:id/roles", validate(createRoleSchema), roleController.createRole);
router.get("/:id/roles", roleController.getRolesByProject);

export default router;
