import { Router } from "express";
import multer from "multer";

import {
  downloadStudentTemplate,
  importStudents,
  exportStudents,
} from "./studentImportExport.controller.js";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
    files: 1,
  },
  fileFilter: (_req, file, callback) => {
    const allowedExtensions = [".xlsx", ".xlsm"];
    const fileName = file.originalname.toLowerCase();

    if (!allowedExtensions.some((ext) => fileName.endsWith(ext))) {
      return callback(new Error("Only Excel .xlsx files are allowed."));
    }

    callback(null, true);
  },
});

// Download blank Excel template
router.get("/template", downloadStudentTemplate);

// Import students from Excel
router.post("/import", upload.single("file"), importStudents);

// Export student records to Excel
router.get("/export", exportStudents);

export default router;