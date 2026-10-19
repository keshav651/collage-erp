
import type { Request, Response } from "express";
import prisma from "../../config/prisma.js";

type AuthenticatedRequest = Request & {
  user?: {
    userId?: string;
  };
};

export const initializeUnitTestMarks = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const unitTestId = req.params.id;

    if (typeof unitTestId !== "string" || !unitTestId) {
      return res.status(400).json({
        message: "Invalid unit test ID",
      });
    }

    const unitTest = await prisma.unitTest.findUnique({
      where: { id: unitTestId },
      include: {
        subject: true,
        cycle: {
          include: {
            semester: true,
          },
        },
      },
    });

    if (!unitTest) {
      return res.status(404).json({
        message: "Unit test not found",
      });
    }

    const semesterNumber = unitTest.cycle.semester.number;
    const isFirstYear = semesterNumber <= 2;

    const students = await prisma.student.findMany({
      where: {
        semesterId: unitTest.cycle.semesterId,
        isActive: true,
        ...(isFirstYear
          ? {}
          : {
              branchId: unitTest.subject.branchId ?? "__NO_MATCH__",
            }),
      },
      select: {
        id: true,
        name: true,
        rollNo: true,
      },
    });

    if (students.length === 0) {
      return res.status(400).json({
        message: "No eligible active students found",
      });
    }

    const result = await prisma.unitTestMark.createMany({
      data: students.map((student) => ({
        unitTestId: unitTest.id,
        studentId: student.id,
        status: "PENDING",
      })),
      skipDuplicates: true,
    });

    return res.status(200).json({
      message: "Marks initialized successfully",
      data: {
        subject: unitTest.subject.name,
        testNumber: unitTest.testNumber,
        eligibleStudents: students.length,
        recordsCreated: result.count,
        alreadyExisting: students.length - result.count,
      },
    });
  } catch (error) {
    console.error("Initialize marks error:", error);

    return res.status(500).json({
      message: "Failed to initialize marks",
    });
  }
};
