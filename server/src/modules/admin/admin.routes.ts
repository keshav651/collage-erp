import { Router } from "express";
import { authenticateToken } from "../../middlewares/auth.middleware.js";
import { allowRoles } from "../../middlewares/role.middleware.js";
import teacherRoutes from "../teachers/teachers.routes.js";
import unitTestRoutes from "../unit-tests/unitTest.routes.js";
import subjectRoutes from "../subjects/subjects.routes.js";
import studentImportExportRoutes from "../students/studentImportExport.routes.js"

const router = Router();

router.use(authenticateToken);
router.use(allowRoles("ADMIN"));

router.use("/teachers", teacherRoutes);
router.use("/unit-tests", unitTestRoutes);
router.use("/subjects", subjectRoutes);
router.use("/students", studentImportExportRoutes);

export default router;
