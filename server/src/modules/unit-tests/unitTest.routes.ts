import { Router } from "express";

import {
  createUnitTestCycle,
  getUnitTestCycles,
  deleteUnitTestCycle,
} from "./unitTest.controller.js";

import { initializeUnitTestMarks } from "./unitTestMarks.controller.js";
import { exportUnitTestMarks } from "./unitTestExport.controller.js";

const router = Router();

// Unit Test Cycle
router.post("/cycles", createUnitTestCycle);
router.get("/cycles", getUnitTestCycles);
router.delete("/cycles/:id", deleteUnitTestCycle);

// Unit Test Marks
router.post(
  "/cycles/:id/initialize-marks",
  initializeUnitTestMarks
);

// Excel Export
router.get("/export", exportUnitTestMarks);

export default router;