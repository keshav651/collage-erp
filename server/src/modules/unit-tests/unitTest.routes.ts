
import { Router } from "express";
import {
  createUnitTestCycle,
  getUnitTestCycles,
  deleteUnitTestCycle,
} from "./unitTest.controller.js";
import { initializeUnitTestMarks } from "./unitTestMarks.controller.js";
import { exportUnitTestMarks } from "./unitTestExport.controller.js";


const router = Router();

// Create a new Unit Test cycle
router.post("/cycles", createUnitTestCycle);

// Get all Unit Test cycles
router.get("/cycles", getUnitTestCycles);

router.post(
  "/:id/initialize-marks",
  initializeUnitTestMarks,
);

// Delete a Unit Test cycle
router.delete("/cycles/:id", deleteUnitTestCycle);

// Export UT marks to Excel
router.get("/export", exportUnitTestMarks);

export default router;
