import { Router } from "express";
import { authenticateToken } from "../../middlewares/auth.middleware.js";
import { allowRoles } from "../../middlewares/role.middleware.js";
import teacherRoutes from "../teachers/teachers.routes.js";

const router = Router();

router.use(authenticateToken);
router.use(allowRoles("ADMIN"));

router.use("/teachers", teacherRoutes);

export default router;