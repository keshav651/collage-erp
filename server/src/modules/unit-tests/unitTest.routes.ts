
import { Router } from "express";
import {
  createUnitTestCycle,
  getUnitTestCycles,
} from "./unitTest.controller.js";
import { initializeUnitTestMarks } from "./unitTestMarks.controller.js";

const router = Router();

// Create a new Unit Test cycle
router.post("/cycles", createUnitTestCycle);

// Get all Unit Test cycles
router.get("/cycles", getUnitTestCycles);

router.post(
  "/:id/initialize-marks",
  initializeUnitTestMarks,
);
export default router;
