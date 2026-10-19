
import { Router } from "express";
import { authenticateToken } from "../../middlewares/auth.middleware.js";
import {
    getMyUnitTests,
  getTeacherUnitTestMarks,
  saveTeacherUnitTestMarks,
} from "./teacherUnitTestMarks.controller.js";

const router = Router();

router.get(
  "/unit-tests/:testId/marks",
  authenticateToken,
  getTeacherUnitTestMarks
);

router.patch(
  "/unit-tests/:testId/marks",
  authenticateToken,
  saveTeacherUnitTestMarks
);

router.get(
  "/unit-tests",
  authenticateToken,
  getMyUnitTests
);

export default router;
