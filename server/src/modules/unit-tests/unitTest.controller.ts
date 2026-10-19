
import type { Request, Response } from "express";
import prisma from "../../config/prisma.js";

type AuthenticatedRequest = Request & {
  user?: {
    userId?: string;
  };
};

export const createUnitTestCycle = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const {
      name,
      academicYear,
      startTestNumber,
      endTestNumber,
      marksEntryDeadline,
      correctionDeadline,
      branchId,
      semesterId,
      maxMarks,
      testDate,
    } = req.body;

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof academicYear !== "string" ||
      !academicYear.trim() ||
      typeof semesterId !== "string" ||
      !semesterId.trim() ||
      startTestNumber == null ||
      endTestNumber == null ||
      !marksEntryDeadline ||
      maxMarks == null ||
      !testDate
    ) {
      return res.status(400).json({
        message:
          "name, academicYear, semesterId, test number range, marksEntryDeadline, maxMarks and testDate are required",
      });
    }

    const start = Number(startTestNumber);
    const end = Number(endTestNumber);
    const marks = Number(maxMarks);

    if (
      !Number.isInteger(start) ||
      !Number.isInteger(end) ||
      start < 1 ||
      end < start ||
      end - start > 49
    ) {
      return res.status(400).json({
        message: "Invalid test number range",
      });
    }

    if (!Number.isFinite(marks) || marks <= 0) {
      return res.status(400).json({
        message: "maxMarks must be a positive number",
      });
    }

    if (
      branchId !== undefined &&
      branchId !== null &&
      (typeof branchId !== "string" || !branchId.trim())
    ) {
      return res.status(400).json({
        message: "branchId must be a valid branch ID or null",
      });
    }

    const deadline = new Date(marksEntryDeadline);
    const date = new Date(testDate);

    if (
      Number.isNaN(deadline.getTime()) ||
      Number.isNaN(date.getTime())
    ) {
      return res.status(400).json({
        message: "Invalid marks entry deadline or test date",
      });
    }

    let correctionDate: Date | null = null;

    if (correctionDeadline != null) {
      correctionDate = new Date(correctionDeadline);

      if (Number.isNaN(correctionDate.getTime())) {
        return res.status(400).json({
          message: "Invalid correction deadline",
        });
      }
    }

    const semester = await prisma.semester.findUnique({
      where: { id: semesterId },
    });

    if (!semester) {
      return res.status(404).json({
        message: "Semester not found",
      });
    }

    const isFirstYear =
      semester.number === 1 || semester.number === 2;

    const normalizedBranchId =
      branchId === undefined || branchId === null
        ? null
        : branchId;

    if (isFirstYear && normalizedBranchId !== null) {
      return res.status(400).json({
        message:
          "Semester 1 and 2 use a common cycle. Send branchId as null.",
      });
    }

    if (!isFirstYear && normalizedBranchId === null) {
      return res.status(400).json({
        message:
          "A branchId is required for Semester 3 and above.",
      });
    }

    if (normalizedBranchId) {
      const branch = await prisma.branch.findUnique({
        where: { id: normalizedBranchId },
      });

      if (!branch) {
        return res.status(404).json({
          message: "Branch not found",
        });
      }
    }

    // Fetch subjects applicable to this cycle.
    const subjects = await prisma.subject.findMany({
      where: {
        semesterId,
        ...(isFirstYear
          ? { branchId: null }
          : { branchId: normalizedBranchId }),
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    if (subjects.length === 0) {
      return res.status(400).json({
        message:
          "No applicable subjects found. Create the subjects for this semester first.",
      });
    }

    const testNumbers = Array.from(
      { length: end - start + 1 },
      (_, index) => start + index,
    );

    const cycle = await prisma.$transaction(async (tx) => {
      const createdCycle = await tx.unitTestCycle.create({
        data: {
          name: name.trim(),
          academicYear: academicYear.trim(),
          startTestNumber: start,
          endTestNumber: end,
          marksEntryDeadline: deadline,
          correctionDeadline: correctionDate,
          branchId: normalizedBranchId,
          semesterId,
          createdByUserId: userId,
        },
      });

      const testData = subjects.flatMap((subject) =>
        testNumbers.map((testNumber) => ({
          cycleId: createdCycle.id,
          subjectId: subject.id,
          testNumber,
          title: `${subject.name} - UT-${testNumber}`,
          maxMarks: marks,
          testDate: date,
        })),
      );

      await tx.unitTest.createMany({
        data: testData,
      });

      await tx.auditLog.create({
        data: {
          userId,
          action: "UNIT_TEST_CYCLE_CREATED",
          entity: "UnitTestCycle",
          entityId: createdCycle.id,
          details: JSON.stringify({
            name: createdCycle.name,
            academicYear: createdCycle.academicYear,
            startTestNumber: start,
            endTestNumber: end,
            branchId: normalizedBranchId,
            semesterId,
            subjectCount: subjects.length,
            testCount: testData.length,
            marksEntryDeadline: deadline,
          }),
        },
      });

      return tx.unitTestCycle.findUniqueOrThrow({
        where: { id: createdCycle.id },
        include: {
          branch: true,
          semester: true,
          tests: {
            include: {
              subject: true,
            },
            orderBy: [
              { testNumber: "asc" },
              { subject: { name: "asc" } },
            ],
          },
        },
      });
    });

    return res.status(201).json({
      message: "Unit Test cycle and tests created successfully",
      data: cycle,
      summary: {
        subjectCount: subjects.length,
        testNumbers: testNumbers.length,
        totalTests: subjects.length * testNumbers.length,
      },
    });
  } catch (error) {
    console.error("Create Unit Test Cycle Error:", error);

    return res.status(500).json({
      message: "Failed to create Unit Test cycle",
    });
  }
};

export const getUnitTestCycles = async (
  _req: Request,
  res: Response,
) => {
  try {
    const cycles = await prisma.unitTestCycle.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        branch: true,
        semester: true,
        tests: {
          include: {
            subject: true,
          },
          orderBy: [
            { testNumber: "asc" },
            { subject: { name: "asc" } },
          ],
        },
      },
    });

    return res.status(200).json({
      message: "Unit Test cycles fetched successfully",
      count: cycles.length,
      data: cycles,
    });
  } catch (error) {
    console.error("Get Unit Test Cycles Error:", error);

    return res.status(500).json({
      message: "Failed to fetch Unit Test cycles",
    });
  }
};
