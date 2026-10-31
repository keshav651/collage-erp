

import type { Request, Response } from "express";

import ExcelJS from "exceljs";



import prisma from "../../config/prisma.js";



function getQueryString(value: unknown): string | undefined {

  return typeof value === "string" && value.trim()

    ? value.trim()

    : undefined;

}



function safeSheetName(value: string): string {

  return value.replace(/[\\\\/\*?:[\\]]/g, "").slice(0, 31);

}



function getUniqueSheetName(

  workbook: ExcelJS.Workbook,

  name: string,

): string {

  const baseName = safeSheetName(name) || "Marks";

  let candidate = baseName;

  let counter = 2;



  while (workbook.getWorksheet(candidate)) {

    const suffix = ` (${counter})`;

    candidate = `${baseName.slice(0, 31 - suffix.length)}${suffix}`;

    counter++;

  }



  return candidate;

}



export async function exportUnitTestMarks(

  req: Request,

  res: Response,

) {

  try {

    const semesterId = getQueryString(req.query.semesterId);

    const branchId = getQueryString(req.query.branchId);

    const subjectId = getQueryString(req.query.subjectId);

    const cycleId = getQueryString(req.query.cycleId);

    const academicYear = getQueryString(req.query.academicYear);



    // 1. Fetch cycles.*

    // If a branch is selected, include both its cycles and*

    // common cycles (branchId = null), which apply to that branch.*



    const cycles = await prisma.unitTestCycle.findMany({

      where: {

        ...(semesterId ? { semesterId } : {}),

        ...(branchId

          ? {

              OR: [

                { branchId },

                { branchId: null },

              ],

            }

          : {}),

        ...(academicYear ? { academicYear } : {}),

        ...(cycleId ? { id: cycleId } : {}),

      },



      include: {

        semester: true,

        branch: true,



        tests: {

          where: subjectId ? { subjectId } : undefined,



          include: {

            subject: true,



            marks: {

              select: {

                studentId: true,

                status: true,

                obtainedMarks: true,

              },

            },

          },



          orderBy: [

            { subject: { name: "asc" } },

            { testNumber: "asc" },

          ],

        },

      },



      orderBy: [

        { semester: { number: "asc" } },

        { academicYear: "asc" },

      ],

    });



    const applicableCycles = cycles.filter(

      (cycle) => cycle.tests.length > 0,

    );



    if (applicableCycles.length === 0) {

      return res.status(404).json({

        success: false,

        message: "No unit-test data found for the selected filters.",

      });

    }



    // 2. Fetch all active students for the selected semesters.*

    // This ensures students without UnitTestMark records also appear.*



    const semesterIds = [

      ...new Set(applicableCycles.map((cycle) => cycle.semesterId)),

    ];



    const students = await prisma.student.findMany({

      where: {

        isActive: true,

        semesterId: {

          in: semesterIds,

        },

        ...(branchId ? { branchId } : {}),

      },



      include: {

        branch: true,

        semester: true,

      },



      orderBy: [

        { semester: { number: "asc" } },

        { branch: { name: "asc" } },

        { rollNo: "asc" },

      ],

    });



    // 3. Group students by semester + actual student branch.*

    // Common cycles will later be applied to each matching branch.*



    type StudentInfo = {

      id: string;

      rollNo: string;

      name: string;

    };



    type MarkInfo = {

      status: string;

      obtainedMarks: number | null;

    };



    type TestInfo = {

      id: string;

      subjectName: string;

      subjectCode: string;

      testNumber: number;

      maxMarks: number;

      cycleName: string;

      academicYear: string;

      marksByStudent: Map<string, MarkInfo>;

    };



    type GroupInfo = {

      semesterId: string;

      semesterNumber: number;

      branchId: string;

      branchName: string;

      students: Map<string, StudentInfo>;

      tests: Map<string, TestInfo>;

    };



    const groups = new Map<string, GroupInfo>();



    for (const student of students) {

      if (!student.branch) {

        continue;

      }



      const groupKey = `${student.semesterId}\_\_${student.branchId}`;



      if (!groups.has(groupKey)) {

        groups.set(groupKey, {

          semesterId: student.semesterId,

          semesterNumber: student.semester.number,

          branchId: student.branchId,

          branchName: student.branch.name,

          students: new Map(),

          tests: new Map(),

        });

      }



      groups.get(groupKey)!.students.set(student.id, {

        id: student.id,

        rollNo: student.rollNo,

        name: student.name,

      });

    }



    // 4. Apply branch-specific and common-cycle tests to each group.*



    for (const cycle of applicableCycles) {

      for (const group of groups.values()) {

        if (group.semesterId !== cycle.semesterId) {

          continue;

        }



        // A branch-specific cycle applies only to that branch.*

        // A common cycle applies to every branch in its semester.*

        if (

          cycle.branchId !== null &&

          cycle.branchId !== group.branchId

        ) {

          continue;

        }



        for (const test of cycle.tests) {

          if (!group.tests.has(test.id)) {

            group.tests.set(test.id, {

              id: test.id,

              subjectName: test.subject.name,

              subjectCode: test.subject.code,

              testNumber: test.testNumber,

              maxMarks: Number(test.maxMarks),

              cycleName: cycle.name,

              academicYear: cycle.academicYear,

              marksByStudent: new Map(),

            });

          }



          const groupedTest = group.tests.get(test.id)!;



          for (const mark of test.marks) {

            // Marks belonging to students outside this worksheet*

            // are ignored.*

            if (!group.students.has(mark.studentId)) {

              continue;

            }



            groupedTest.marksByStudent.set(mark.studentId, {

              status: mark.status,

              obtainedMarks:

                mark.obtainedMarks === null

                  ? null

                  : Number(mark.obtainedMarks),

            });

          }

        }

      }

    }



    // Remove groups without applicable tests.*

    const exportGroups = [...groups.values()].filter(

      (group) => group.tests.size > 0,

    );



    if (exportGroups.length === 0) {

      return res.status(404).json({

        success: false,

        message: "No students or applicable tests found for these filters.",

      });

    }



    // 5. Create Excel workbook.*



    const workbook = new ExcelJS.Workbook();



    workbook.creator = "College ERP";

    workbook.subject = "Unit Test Marks Report";

    workbook.title = "Unit Test Marks";

    workbook.created = new Date();



    for (const group of exportGroups) {

      const worksheetName = getUniqueSheetName(

        workbook,

        `Sem ${group.semesterNumber} - ${group.branchName}`,

      );



      const worksheet = workbook.addWorksheet(worksheetName);



      const tests = [...group.tests.values()].sort(

        (a, b) =>

          a.subjectName.localeCompare(b.subjectName) ||

          a.testNumber - b.testNumber ||

          a.cycleName.localeCompare(b.cycleName),

      );



      const studentList = [...group.students.values()].sort(

        (a, b) =>

          a.rollNo.localeCompare(b.rollNo, undefined, {

            numeric: true,

            sensitivity: "base",

          }),

      );



      const totalColumns = 3 + tests.length;



      // Row 1: College name.
      worksheet.mergeCells(1, 1, 1, totalColumns);
      const collegeCell = worksheet.getCell(1, 1);
      collegeCell.value = "MSME TC SITARGANJ";
      collegeCell.font = { name: "Arial", bold: true, size: 14, color: { argb: "FFFFFFFF" } };
      collegeCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF921B25" } };
      collegeCell.alignment = { horizontal: "center", vertical: "middle" };
      worksheet.getRow(1).height = 30;

      // Row 2: Branch and semester.
      worksheet.mergeCells(2, 1, 2, totalColumns);
      const detailsCell = worksheet.getCell(2, 1);
      detailsCell.value = `Branch: ${group.branchName} | Semester: ${group.semesterNumber}`;
      detailsCell.font = { name: "Arial", bold: true, size: 12, color: { argb: "FF262626" } };
      detailsCell.alignment = { horizontal: "center", vertical: "middle" };
      worksheet.getRow(2).height = 24;

      // Row 3: Unit-test column headings.
      const header = [
        "S.No.",
        "Roll No.",
        "Student Name",
        ...tests.map(
          (test) =>
            `${test.subjectCode} - ${test.subjectName}\n` +
            `${test.cycleName} | UT-${test.testNumber} | Max: ${test.maxMarks}`,
        ),
      ];

      worksheet.addRow(header);
      const headerRow = worksheet.getRow(3);
      headerRow.height = 45;
      headerRow.font = { name: "Arial", bold: true, size: 10, color: { argb: "FFFFFFFF" } };
      headerRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF75151D" } };
      headerRow.alignment = { horizontal: "center", vertical: "middle", wrapText: true };

      // Student rows.*

      studentList.forEach((student, index) => {

        const marks = tests.map((test) => {

          const mark = test.marksByStudent.get(student.id);



          // Only PRESENT marks are exported.*

          // ABSENT, PENDING and missing marks stay blank.*

          if (mark?.status === "PRESENT") {

            return mark.obtainedMarks;

          }



          return null;

        });



        const row = worksheet.addRow([

          index + 1,

          student.rollNo,

          student.name,

          ...marks,

        ]);



        row.height = 22;

      });



      // Column widths.*

      worksheet.getColumn(1).width = 9;

      worksheet.getColumn(2).width = 17;

      worksheet.getColumn(3).width = 28;



      for (let columnIndex = 4; columnIndex <= totalColumns; columnIndex++) {

        worksheet.getColumn(columnIndex).width = 22;

      }



      // Borders and alternating row backgrounds.*

      const lastRow = worksheet.rowCount;



      for (let rowIndex = 1; rowIndex <= lastRow; rowIndex++) {

        const row = worksheet.getRow(rowIndex);



        for (

          let columnIndex = 1;

          columnIndex <= totalColumns;

          columnIndex++

        ) {

          const cell = row.getCell(columnIndex);



          cell.border = {

            top: {

              style: "thin",

              color: { argb: "FFD9D9D9" },

            },

            left: {

              style: "thin",

              color: { argb: "FFD9D9D9" },

            },

            bottom: {

              style: "thin",

              color: { argb: "FFD9D9D9" },

            },

            right: {

              style: "thin",

              color: { argb: "FFD9D9D9" },

            },

          };



          if (rowIndex >= 4) {

            cell.font = {

              name: "Arial",

              size: 10,

              color: { argb: "FF262626" },

            };



            cell.alignment = {

              vertical: "middle",

              horizontal: columnIndex <= 3 ? "left" : "center",

              wrapText: columnIndex === 3,

            };



            if (rowIndex % 2 === 0) {

              cell.fill = {

                type: "pattern",

                pattern: "solid",

                fgColor: { argb: "FFFFF5F5" },

              };

            }

          }

        }

      }



      // Center the serial number and marks.*

      for (let rowIndex = 4; rowIndex <= lastRow; rowIndex++) {

        worksheet.getCell(rowIndex, 1).alignment = {

          horizontal: "center",

          vertical: "middle",

        };



        for (

          let columnIndex = 4;

          columnIndex <= totalColumns;

          columnIndex++

        ) {

          worksheet.getCell(rowIndex, columnIndex).alignment = {

            horizontal: "center",

            vertical: "middle",

          };

        }

      }



      // Freeze title/header and first three student columns.*

      worksheet.views = [

        {

          state: "frozen",

          xSplit: 3,

          ySplit: 3,

          showGridLines: false,

        },

      ];



      // Enable filtering only over the actual data range.*

      if (lastRow >= 2) {

        worksheet.autoFilter = {

          from: { row: 2, column: 1 },

          to: { row: lastRow, column: totalColumns },

        };

      }



      // Print layout.*

      worksheet.pageSetup.orientation = "landscape";

      worksheet.pageSetup.fitToPage = true;

      worksheet.pageSetup.fitToWidth = 1;

      worksheet.pageSetup.fitToHeight = 0;

      worksheet.pageSetup.paperSize = 9;

      worksheet.pageSetup.margins = {

        left: 0.25,

        right: 0.25,

        top: 0.5,

        bottom: 0.5,

        header: 0.2,

        footer: 0.2,

      };



      worksheet.headerFooter.oddFooter =

        "&LMSME TC SITARGANJ&CUnit Test Marks&RPage &P of &N";

    }



    // 6. Send the workbook.*



    const buffer = await workbook.xlsx.writeBuffer();



    const date = new Date().toISOString().slice(0, 10);



    const filename =

      semesterId || branchId || subjectId || cycleId || academicYear

        ? `unit-test-marks-filtered-${date}.xlsx`

        : `unit-test-marks-all-${date}.xlsx`;



    res.setHeader(

      "Content-Type",

      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

    );



    res.setHeader(

      "Content-Disposition",

      `attachment; filename="${filename}"`,

    );



    res.setHeader("Cache-Control", "no-store");



    return res.status(200).send(Buffer.from(buffer));

  } catch (error) {

    console.error("Unit test marks export failed:", error);



    return res.status(500).json({

      success: false,

      message: "Failed to export unit test marks.",

    });

  }

}
