import { Router } from "express";
import { authenticateToken } from "../../middlewares/auth.middleware.js";
import { allowRoles } from "../../middlewares/role.middleware.js";
import { getAllSemestersController } from "./semesters.controller.js";

const router = Router();

router.use(authenticateToken, allowRoles("ADMIN"));

router.get("/", getAllSemestersController);

export default router;