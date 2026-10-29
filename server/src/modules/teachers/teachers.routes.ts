import { Router } from "express";

import {
  getPendingTeachersController,
  approveTeacherController,
  getAllTeachersController,
  deleteTeacherController,
  updateTeacherController,
  getTeacherByIdController,
} from "./teachers.controller.js";

const router = Router();

// Get all pending teachers
router.get("/pending", getPendingTeachersController);

// Get all teachers
router.get("/", getAllTeachersController);

// Approve a teacher and assign subjects
router.patch("/:userId/approve", approveTeacherController);

// Get teacher by ID
router.get("/:teacherId", getTeacherByIdController);

// Update teacher
router.patch("/:teacherId", updateTeacherController);

// Deactivate teacher
router.patch("/:teacherId/deactivate", deleteTeacherController);

export default router;