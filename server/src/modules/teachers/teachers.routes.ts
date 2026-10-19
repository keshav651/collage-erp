
import { Router } from "express";

import {
  authenticateToken,
} from "../../middlewares/auth.middleware.js";

import {
  allowRoles,
} from "../../middlewares/role.middleware.js";

import {
  approveTeacherController,
  getPendingTeachersController,
  getAllTeachersController,
  deleteTeacherController,
  updateTeacherController,
  getTeacherByIdController
} from "./teachers.controller.js";

const router = Router();

// All teacher-management routes are Admin-only
router.use(authenticateToken);
router.use(allowRoles("ADMIN"));

// Pending teachers
router.get("/pending", getPendingTeachersController);

// Approve teacher and generate temporary password
router.patch(
  "/:userId/approve",
  approveTeacherController
);

// List active teachers
router.get("/", getAllTeachersController);

router.delete("/:userId", deleteTeacherController);

router.patch("/:userId", updateTeacherController);

router.get("/:userId", getTeacherByIdController);

export default router;
