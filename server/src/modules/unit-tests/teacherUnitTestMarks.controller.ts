
import type { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import prisma from "../../config/prisma.js";
import type { AuthenticatedRequest } from "../../middlewares/auth.middleware.js";

type MarkStatus = "PENDING" | "PRESENT" | "ABSENT";

type MarkInput = {
  studentId: string;
  status: MarkStatus;
  obtainedMarks: number | null;
};

function normalizeAcademicYear(year: string): string {
  const match = year.trim().match(/^(\d{4})[-/](\d{2}|\d{4})$/);

  if (!match) {
    return year.trim();
  }

  const startYear = match[1];

  const endYear =
    match[2].length === 2
      ? `${startYear.slice(0, 2)}${match[2]}`
      : match[2];

  return `${startYear}-${endYear}`;
}

async function getAuthorizedTeacher(
  req: AuthenticatedRequest,
  testId: string
) {
  if (!req.user?.userId || req.user.role !== "TEACHER") {
    return { error: "FORBIDDEN" as const };
  }

  const teacher = await prisma.teacherProfile.findUnique({
    where: {
      userId: req.user.userId,
    },
    select: {
      id: true,
      branchId: true,
      name: true,
    },
  });

  if (!teacher) {
    return { error: "TEACHER_PROFILE_NOT_FOUND" as const };
  }

  const test = await prisma.unitTest.findUnique({
    where: {
      id: testId,
    },
    include: {
      subject: true,
      cycle: {
        include: {
          semester: true,
        },
      },
    },
  });

  if (!test) {
    return { error: "TEST_NOT_FOUND" as const };
  }

  const semesterNumber = test.cycle.semester.number;

  // Subject and test cycle must belong to the same semester.
  if (test.subject.semesterId !== test.cycle.semesterId) {
    return { error: "SEMESTER_MISMATCH" as const };
  }

  // Validate common subjects for semesters 1 and 2.
  if (semesterNumber <= 2) {
    if (
      test.subject.branchId !== null ||
      test.cycle.branchId !== null
    ) {
      return { error: "BRANCH_MISMATCH" as const };
    }
  } else {
    // Validate branch-specific subjects for semester 3 onwards.
    if (
      !test.subject.branchId ||
      test.subject.branchId !== teacher.branchId ||
      test.cycle.branchId !== teacher.branchId
    ) {
      return { error: "BRANCH_MISMATCH" as const };
    }
  }

  // Verify active teacher assignment for the subject and academic year.
  // Verify active teacher assignment for the subject and academic year.
  // Normalize academic years because "2026-27" and "2026-2027"
  // represent the same academic year.
  const assignments = await prisma.teacherSubjectAssignment.findMany({
    where: {
      teacherId: teacher.id,
      subjectId: test.subjectId,
      active: true,
    },
    select: {
      id: true,
      academicYear: true,
    },
  });

  const testAcademicYear = normalizeAcademicYear(
    test.cycle.academicYear
  );

  const assignment = assignments.find(
    (item) =>
      normalizeAcademicYear(item.academicYear) === testAcademicYear
  );

  if (!assignment) {
    console.log("SUBJECT ASSIGNMENT MISMATCH:", {
      teacherId: teacher.id,
      subjectId: test.subjectId,
      assignmentAcademicYears: assignments.map(
        (item) => item.academicYear
      ),
      testAcademicYear: test.cycle.academicYear,
      normalizedTestAcademicYear: testAcademicYear,
    });

    return { error: "SUBJECT_NOT_ASSIGNED" as const };
  }

  if (!assignment) {
    return { error: "SUBJECT_NOT_ASSIGNED" as const };
  }

  return {
    teacher,
    test,
  };
}

function sendAuthorizationError(res: Response, error: string) {
  const responses: Record<string, { status: number; message: string }> = {
    FORBIDDEN: {
      status: 403,
      message: "Teacher access required.",
    },
    TEACHER_PROFILE_NOT_FOUND: {
      status: 403,
      message: "Teacher profile was not found.",
    },
    TEST_NOT_FOUND: {
      status: 404,
      message: "Unit test was not found.",
    },
    SUBJECT_NOT_ASSIGNED: {
      status: 403,
      message: "This subject is not assigned to you for this academic year.",
    },
    BRANCH_MISMATCH: {
      status: 403,
      message: "You cannot access a subject outside your branch.",
    },
    SEMESTER_MISMATCH: {
      status: 403,
      message: "The subject and unit test cycle belong to different semesters.",
    },
  };

  const result = responses[error] ?? {
    status: 403,
    message: "Access denied.",
  };

  return res.status(result.status).json({
    success: false,
    message: result.message,
  });
}

function getTestId(req: Request): string | null {
  const testId = req.params.testId;

  if (typeof testId !== "string" || !testId.trim()) {
    return null;
  }

  return testId.trim();
}

// GET /api/teacher/unit-tests/:testId/marks
export const getTeacherUnitTestMarks = async (
  req: Request,
  res: Response
) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const testId = getTestId(req);

    if (!testId) {
      return res.status(400).json({
        success: false,
        message: "Valid testId is required.",
      });
    }

    const access = await getAuthorizedTeacher(authReq, testId);

    if ("error" in access) {
      return sendAuthorizationError(
        res,
        access.error ?? "FORBIDDEN"
      );
    }

    const { teacher, test } = access;
    const semesterNumber = test.cycle.semester.number;

    const students = await prisma.student.findMany({
      where: {
        semesterId: test.cycle.semesterId,
        isActive: true,
        ...(semesterNumber >= 3
          ? { branchId: test.subject.branchId ?? "__NO_MATCH__" }
          : {}),
      },
      select: {
        id: true,
        rollNo: true,
        name: true,
        branchId: true,
        semesterId: true,
      },
      orderBy: {
        rollNo: "asc",
      },
    });

    const marks = await prisma.unitTestMark.findMany({
      where: {
        unitTestId: test.id,
        studentId: {
          in: students.map((student) => student.id),
        },
      },
      select: {
        id: true,
        studentId: true,
        status: true,
        obtainedMarks: true,
        enteredAt: true,
        enteredById: true,
      },
    });

    const marksByStudent = new Map(
      marks.map((mark) => [mark.studentId, mark])
    );

    return res.json({
      success: true,
      data: {
        teacher: {
          id: teacher.id,
          name: teacher.name,
        },
        test: {
          id: test.id,
          title: test.title,
          testNumber: test.testNumber,
          maxMarks: test.maxMarks,
          testDate: test.testDate,
          subject: test.subject,
          academicYear: test.cycle.academicYear,
          semester: test.cycle.semester,
        },
        students: students.map((student) => ({
          ...student,
          mark: marksByStudent.get(student.id) ?? {
            status: "PENDING",
            obtainedMarks: null,
          },
        })),
      },
    });
  } catch (error) {
    console.error("getTeacherUnitTestMarks error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load marks sheet.",
    });
  }
};

// PATCH /api/teacher/unit-tests/:testId/marks
// Body: { "marks": [{ "studentId": "...", "status": "PRESENT", "obtainedMarks": 18 }] }
export const saveTeacherUnitTestMarks = async (
  req: Request,
  res: Response
) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const testId = getTestId(req);

    if (!testId) {
      return res.status(400).json({
        success: false,
        message: "Valid testId is required.",
      });
    }

    const access = await getAuthorizedTeacher(authReq, testId);

    if ("error" in access) {
      return sendAuthorizationError(
        res,
        access.error ?? "FORBIDDEN"
      );
    }

    const { teacher, test } = access;
    const body = req.body as { marks?: unknown };

    if (
      !Array.isArray(body.marks) ||
      body.marks.length === 0 ||
      body.marks.length > 200
    ) {
      return res.status(400).json({
        success: false,
        message: "marks must contain between 1 and 200 records.",
      });
    }

    const marks = body.marks as MarkInput[];
    const seen = new Set<string>();

    for (const mark of marks) {
      if (
        !mark ||
        typeof mark.studentId !== "string" ||
        !mark.studentId.trim() ||
        seen.has(mark.studentId)
      ) {
        return res.status(400).json({
          success: false,
          message: "Each studentId must be valid and unique.",
        });
      }

      seen.add(mark.studentId);

      if (!["PENDING", "PRESENT", "ABSENT"].includes(mark.status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status for student ${mark.studentId}.`,
        });
      }

      if (mark.status === "PRESENT") {
        if (
          typeof mark.obtainedMarks !== "number" ||
          !Number.isFinite(mark.obtainedMarks) ||
          mark.obtainedMarks < 0 ||
          mark.obtainedMarks > test.maxMarks
        ) {
          return res.status(400).json({
            success: false,
            message: `Marks must be between 0 and ${test.maxMarks} for a PRESENT student.`,
          });
        }
      } else if (mark.obtainedMarks !== null) {
        return res.status(400).json({
          success: false,
          message: "Use obtainedMarks: null for ABSENT or PENDING students.",
        });
      }
    }

    const semesterNumber = test.cycle.semester.number;

    const eligibleStudents = await prisma.student.findMany({
      where: {
        id: {
          in: marks.map((mark) => mark.studentId),
        },
        semesterId: test.cycle.semesterId,
        isActive: true,
        ...(semesterNumber >= 3
          ? { branchId: test.subject.branchId ?? "__NO_MATCH__" }
          : {}),
      },
      select: {
        id: true,
      },
    });

    if (eligibleStudents.length !== seen.size) {
      return res.status(400).json({
        success: false,
        message:
          "One or more students are inactive or do not belong to this subject's semester/branch.",
      });
    }

    await prisma.$transaction(
      marks.map((mark) =>
        prisma.unitTestMark.upsert({
          where: {
            unitTestId_studentId: {
              unitTestId: test.id,
              studentId: mark.studentId,
            },
          },
          create: {
            unitTestId: test.id,
            studentId: mark.studentId,
            status: mark.status,
            obtainedMarks:
              mark.status === "PRESENT" ? mark.obtainedMarks : null,
            enteredById: teacher.id,
            enteredAt: new Date(),
          },
          update: {
            status: mark.status,
            obtainedMarks:
              mark.status === "PRESENT" ? mark.obtainedMarks : null,
            enteredById: teacher.id,
            enteredAt: new Date(),
          },
        })
      )
    );

    return res.json({
      success: true,
      message: "Marks saved successfully.",
      updatedCount: marks.length,
    });
  } catch (error) {
    console.error("saveTeacherUnitTestMarks error:", error);

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return res.status(409).json({
        success: false,
        message:
          "A concurrent marks update occurred. Reload the sheet and try again.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to save marks.",
    });
  }
};

// GET /api/teacher/unit-tests
export const getMyUnitTests = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    // Verify teacher authentication.
    if (req.user?.role !== "TEACHER" || !req.user.userId) {
      return res.status(403).json({
        success: false,
        message: "Only teachers can access this resource.",
      });
    }

    // Fetch teacher profile.
    const teacher = await prisma.teacherProfile.findUnique({
      where: {
        userId: req.user.userId,
      },
      select: {
        id: true,
        branchId: true,
      },
    });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher profile not found.",
      });
    }

    // Fetch active subject assignments for this teacher.
    const assignments = await prisma.teacherSubjectAssignment.findMany({
      where: {
        teacherId: teacher.id,
        active: true,
      },
      select: {
        subjectId: true,
        academicYear: true,
      },
    });

    // Return empty data if no active assignments exist.
    if (assignments.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
      });
    }

    // DEBUG: Verify the actual assigned subjects.
    console.log(
      "ASSIGNED SUBJECT DETAILS:",
      await prisma.subject.findMany({
        where: {
          id: {
            in: assignments.map((assignment) => assignment.subjectId),
          },
        },
        select: {
          id: true,
          name: true,
          semesterId: true,
          branchId: true,
        },
      })
    );

    // Collect assigned subject IDs.
    const assignedSubjectIds = [
      ...new Set(assignments.map((assignment) => assignment.subjectId)),
    ];

    // Map each assigned subject to its normalized academic years.
    const assignedYearsBySubject = new Map<string, Set<string>>();

    for (const assignment of assignments) {
      const normalizedYear = normalizeAcademicYear(
        assignment.academicYear
      );

      const years =
        assignedYearsBySubject.get(assignment.subjectId) ??
        new Set<string>();

      years.add(normalizedYear);

      assignedYearsBySubject.set(assignment.subjectId, years);
    }

    // Fetch unit tests for assigned subjects.
    // Academic year is normalized and checked below.
    const tests = await prisma.unitTest.findMany({
      where: {
        subjectId: {
          in: assignedSubjectIds,
        },
      },
      include: {
        subject: true,
        cycle: {
          include: {
            semester: true,
          },
        },
      },
      orderBy: [
        {
          testDate: "asc",
        },
        {
          testNumber: "asc",
        },
      ],
    });

    // Filter tests by assigned subject and academic year.
    const assignedTests = tests.filter((test) => {
      const assignedYears = assignedYearsBySubject.get(test.subjectId);

      if (!assignedYears) {
        return false;
      }

      const testAcademicYear = normalizeAcademicYear(
        test.cycle.academicYear
      );

      return assignedYears.has(testAcademicYear);
    });

    // DEBUG: Check all tests for assigned subjects.
    console.log(
      "ALL TESTS FOR ASSIGNED SUBJECTS:",
      await prisma.unitTest.findMany({
        where: {
          subjectId: {
            in: assignedSubjectIds,
          },
        },
        select: {
          id: true,
          title: true,
          testNumber: true,
          subjectId: true,
          cycle: {
            select: {
              name: true,
              academicYear: true,
              semesterId: true,
              branchId: true,
            },
          },
        },
      })
    );

    // Validate semester and branch relationships.
    const filteredTests = assignedTests.filter((test) => {
      const semesterNumber = test.cycle.semester.number;

      // Subject and test cycle must belong to the same semester.
      if (test.subject.semesterId !== test.cycle.semesterId) {
        return false;
      }

      // Semesters 1 and 2 use common subjects.
      if (semesterNumber <= 2) {
        return (
          test.subject.branchId === null &&
          test.cycle.branchId === null
        );
      }

      // Semester 3 onwards requires a matching branch.
      return (
        test.subject.branchId === teacher.branchId &&
        test.cycle.branchId === teacher.branchId
      );
    });

    // DEBUG: Show assignments and filtering results.
    console.log("========== TEACHER UNIT TEST DEBUG ==========");

    console.log("TEACHER BRANCH:", teacher.branchId);

    console.log("ACTIVE ASSIGNMENTS:", assignments);

    console.log(
      "FETCHED TESTS:",
      tests.map((test) => ({
        subject: test.subject.name,
        subjectId: test.subjectId,
        subjectSemester: test.subject.semesterId,
        subjectBranch: test.subject.branchId,
        assignmentAcademicYears: [
          ...(assignedYearsBySubject.get(test.subjectId) ?? []),
        ],
        testAcademicYear: test.cycle.academicYear,
        normalizedTestAcademicYear: normalizeAcademicYear(
          test.cycle.academicYear
        ),
        cycleSemester: test.cycle.semesterId,
        cycleBranch: test.cycle.branchId,
        semesterNumber: test.cycle.semester.number,
      }))
    );

    console.log(
      "ACADEMIC YEAR MATCHED TESTS:",
      assignedTests.map((test) => ({
        subject: test.subject.name,
        testNumber: test.testNumber,
        academicYear: test.cycle.academicYear,
      }))
    );

    console.log(
      "FILTERED TESTS:",
      filteredTests.map((test) => ({
        subject: test.subject.name,
        testNumber: test.testNumber,
      }))
    );

    console.log("TOTAL MATCHED TESTS:", filteredTests.length);

    console.log("=============================================");

    // Return filtered unit tests.
    return res.status(200).json({
      success: true,
      data: filteredTests,
    });
  } catch (error) {
    console.error("getMyUnitTests error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch unit tests.",
    });
  }
};
