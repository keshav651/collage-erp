
import { Router } from "express";

import {
    getStudents,
    getStudentbusingId,
    creatingStudent,
    updatingStudent,
    updatingStudentStatus,
} from "./students.controller.js";

import { authenticateToken } from "../../middlewares/auth.middleware.js";
import { allowRoles } from "../../middlewares/role.middleware.js";

const router = Router();

// All student routes require an authenticated Admin
router.use(authenticateToken, allowRoles("ADMIN"));

// GET all students
router.get("/", getStudents);

// GET student by ID
router.get("/:id", getStudentbusingId);

// CREATE student
router.post("/", creatingStudent);

// UPDATE student details
router.patch("/:id", updatingStudent);

// UPDATE student active/inactive status
router.patch("/:id/status", updatingStudentStatus);

export default router;
