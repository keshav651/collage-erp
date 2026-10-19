
import { Router } from "express";
import {
  createSubject,
  getSubjects,
  updateSubject,
  deleteSubject,
} from "./subjects.controller.js";

const router = Router();

router.post("/", createSubject);
router.get("/", getSubjects);

router.patch("/:id", updateSubject);
router.delete("/:id", deleteSubject);

export default router;
  