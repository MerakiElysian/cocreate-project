import { Router } from "express";
import { searchController } from "./search.controller";
import { authenticate } from "../../middlewares/auth.middleware";

const router = Router();

router.get("/projects", authenticate, searchController.projects);
router.get("/users", authenticate, searchController.users);

export default router;
