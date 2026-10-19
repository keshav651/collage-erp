import type { Request, Response } from "express";
import ExcelJS from "exceljs";
import  prisma  from "../../config/prisma.js";

// Excel template download
export const downloadStudentTemplate = async (
  _req: Request,
  res: Response
) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Students");

    worksheet.columns = [
      { header: "rollNo", key: "rollNo", width: 20 },
      { header: "name", key: "name", width: 30 },
      { header: "branchId", key: "branchId", width: 40 },
      { header: "semesterId", key: "semesterId", width: 40 },
    ];

    worksheet.addRow({
      rollNo: "CSE001",
      name: "Example Student",
      branchId: "PASTE_VALID_BRANCH_ID",
      semesterId: "PASTE_VALID_SEMESTER_ID",
    });

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(2).getCell("rollNo").note =
      "Example row: replace this data with real student details.";

    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="students-template.xlsx"'
    );

    return res.status(200).send(Buffer.from(buffer));
  } catch (error) {
    console.error("Download student template error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate student template",
    });
  }
};

// Import students from Excel
export const importStudents = async (
  req: Request,
  res: Response
) => {
  let batchId: string | undefined;

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Excel file is required. Upload it using field name "file".',
      });
    }

    const allowedExtensions = [".xlsx", ".xlsm"];
    const fileName = req.file.originalname.toLowerCase();

    if (!allowedExtensions.some((ext) => fileName.endsWith(ext))) {
      return res.status(400).json({
        success: false,
        message: "Upload a valid Excel .xlsx file.",
      });
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(req.file.buffer as never);

    const worksheet = workbook.worksheets[0];

    if (!worksheet || worksheet.rowCount < 2) {
      return res.status(400).json({
        success: false,
        message: "Excel sheet has no student data.",
      });
    }

    const headers = worksheet.getRow(1).values as unknown[];
    const headerMap = new Map<string, number>();

    headers.forEach((value, index) => {
      if (typeof value === "string" && value.trim()) {
        headerMap.set(value.trim().toLowerCase(), index);
      }
    });

    const requiredHeaders = [
      "rollno",
      "name",
      "branchid",
      "semesterid",
    ];

    const missingHeaders = requiredHeaders.filter(
      (header) => !headerMap.has(header)
    );

    if (missingHeaders.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Required Excel columns are missing.",
        missingHeaders,
      });
    }

    const getCellValue = (
      row: ExcelJS.Row,
      header: string
    ): string => {
      const columnIndex = headerMap.get(header);

      if (!columnIndex) return "";

      const value = row.getCell(columnIndex).value;

      if (value === null || value === undefined) return "";

      if (
        typeof value === "object" &&
        "text" in value &&
        typeof value.text === "string"
      ) {
        return value.text.trim();
      }

      if (
        typeof value === "object" &&
        "result" in value
      ) {
        return String(value.result ?? "").trim();
      }

      return String(value).trim();
    };

    const dataRows: Array<{
      rowNumber: number;
      rollNo: string;
      name: string;
      branchId: string;
      semesterId: string;
    }> = [];

    const errors: Array<{
      row: number;
      rollNo?: string;
      reason: string;
    }> = [];

    if (worksheet.rowCount - 1 > 5000) {
      return res.status(400).json({
        success: false,
        message: "Maximum 5000 student rows are allowed per upload.",
      });
    }

    for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
      const row = worksheet.getRow(rowNumber);

      const rollNo = getCellValue(row, "rollno");
      const name = getCellValue(row, "name");
      const branchId = getCellValue(row, "branchid");
      const semesterId = getCellValue(row, "semesterid");

      if (!rollNo && !name && !branchId && !semesterId) {
        continue;
      }

      if (!rollNo || !name || !branchId || !semesterId) {
        errors.push({
          row: rowNumber,
          rollNo: rollNo || undefined,
          reason: "rollNo, name, branchId and semesterId are required.",
        });
        continue;
      }

      dataRows.push({
        rowNumber,
        rollNo,
        name,
        branchId,
        semesterId,
      });
    }

    if (dataRows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid student rows were found.",
        errors,
      });
    }

    const duplicateRollNos = new Set<string>();
    const seenRollNos = new Set<string>();

    for (const student of dataRows) {
      const normalizedRollNo = student.rollNo.toLowerCase();

      if (seenRollNos.has(normalizedRollNo)) {
        duplicateRollNos.add(normalizedRollNo);
        errors.push({
          row: student.rowNumber,
          rollNo: student.rollNo,
          reason: "Duplicate roll number inside the Excel file.",
        });
      } else {
        seenRollNos.add(normalizedRollNo);
      }
    }

    const uniqueBranchIds = [
      ...new Set(dataRows.map((student) => student.branchId)),
    ];

    const uniqueSemesterIds = [
      ...new Set(dataRows.map((student) => student.semesterId)),
    ];

    const [branches, semesters, existingStudents] = await Promise.all([
      prisma.branch.findMany({
        where: { id: { in: uniqueBranchIds } },
        select: { id: true },
      }),
      prisma.semester.findMany({
        where: { id: { in: uniqueSemesterIds } },
        select: { id: true },
      }),
      prisma.student.findMany({
        where: {
          rollNo: { in: dataRows.map((student) => student.rollNo) },
        },
        select: { rollNo: true },
      }),
    ]);

    const validBranchIds = new Set(branches.map((branch) => branch.id));
    const validSemesterIds = new Set(semesters.map((semester) => semester.id));
    const existingRollNos = new Set(
      existingStudents.map((student) => student.rollNo.toLowerCase())
    );

    const validStudents: Array<{
      rollNo: string;
      name: string;
      branchId: string;
      semesterId: string;
      isActive: boolean;
    }> = [];

    for (const student of dataRows) {
      const normalizedRollNo = student.rollNo.toLowerCase();

      if (duplicateRollNos.has(normalizedRollNo)) continue;

      if (existingRollNos.has(normalizedRollNo)) {
        errors.push({
          row: student.rowNumber,
          rollNo: student.rollNo,
          reason: "Roll number already exists in the database.",
        });
        continue;
      }

      if (!validBranchIds.has(student.branchId)) {
        errors.push({
          row: student.rowNumber,
          rollNo: student.rollNo,
          reason: "Invalid branchId.",
        });
        continue;
      }

      if (!validSemesterIds.has(student.semesterId)) {
        errors.push({
          row: student.rowNumber,
          rollNo: student.rollNo,
          reason: "Invalid semesterId.",
        });
        continue;
      }

      validStudents.push({
        rollNo: student.rollNo,
        name: student.name,
        branchId: student.branchId,
        semesterId: student.semesterId,
        isActive: true,
      });
    }

    const batch = await prisma.studentImportBatch.create({
      data: {
        fileName: req.file.originalname,
        totalRecords: dataRows.length + errors.filter((e) => !e.rollNo).length,
        successfulRecords: 0,
        failedRecords: errors.length,
        status: "PROCESSING",
      },
    });

    batchId = batch.id;

    let successfulRecords = 0;

    if (validStudents.length > 0) {
      const result = await prisma.student.createMany({
        data: validStudents,
        skipDuplicates: true,
      });

      successfulRecords = result.count;

      if (result.count < validStudents.length) {
        errors.push({
          row: 0,
          reason:
            "Some rows were skipped because a duplicate was detected during insertion.",
        });
      }
    }

    const failedRecords = dataRows.length - successfulRecords;

    await prisma.studentImportBatch.update({
      where: { id: batchId },
      data: {
        totalRecords: dataRows.length,
        successfulRecords,
        failedRecords,
        status:
          failedRecords === 0
            ? "COMPLETED"
            : successfulRecords > 0
              ? "PARTIAL"
              : "FAILED",
      },
    });

    return res.status(200).json({
      success: true,
      message: "Student import processed.",
      batchId,
      totalRecords: dataRows.length,
      successfulRecords,
      failedRecords,
      errors,
    });
  } catch (error) {
    console.error("Import students error:", error);

    if (batchId) {
      await prisma.studentImportBatch
        .update({
          where: { id: batchId },
          data: { status: "FAILED" },
        })
        .catch((updateError) => {
          console.error("Failed to update import batch:", updateError);
        });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to import students.",
    });
  }
};

// Export students to Excel
export const exportStudents = async (
  req: Request,
  res: Response
) => {
  try {
    const branchId =
      typeof req.query.branchId === "string" ? req.query.branchId : undefined;

    const semesterId =
      typeof req.query.semesterId === "string"
        ? req.query.semesterId
        : undefined;

    const students = await prisma.student.findMany({
      where: {
        ...(branchId ? { branchId } : {}),
        ...(semesterId ? { semesterId } : {}),
      },
      include: {
        branch: { select: { name: true, codePrefix: true } },
        semester: { select: { number: true } },
      },
      orderBy: [{ rollNo: "asc" }],
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Students");

    worksheet.columns = [
      { header: "rollNo", key: "rollNo", width: 20 },
      { header: "name", key: "name", width: 30 },
      { header: "branch", key: "branch", width: 25 },
      { header: "branchId", key: "branchId", width: 40 },
      { header: "semester", key: "semester", width: 15 },
      { header: "semesterId", key: "semesterId", width: 40 },
      { header: "isActive", key: "isActive", width: 15 },
      { header: "createdAt", key: "createdAt", width: 25 },
    ];

    for (const student of students) {
      worksheet.addRow({
        rollNo: student.rollNo,
        name: student.name,
        branch: student.branch.name,
        branchId: student.branchId,
        semester: student.semester.number,
        semesterId: student.semesterId,
        isActive: student.isActive ? "Yes" : "No",
        createdAt: student.createdAt.toISOString(),
      });
    }

    worksheet.getRow(1).font = { bold: true };
    worksheet.views = [{ state: "frozen", ySplit: 1 }];
    worksheet.autoFilter = {
      from: "A1",
      to: "H1",
    };

    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="students-export.xlsx"'
    );

    return res.status(200).send(Buffer.from(buffer));
  } catch (error) {
    console.error("Export students error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to export students.",
    });
  }
};