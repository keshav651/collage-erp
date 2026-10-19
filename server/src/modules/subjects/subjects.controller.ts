
import type { Request, Response } from "express";
import prisma from "../../config/prisma.js";


export const getSubjects = async (
  req: Request,
  res: Response,
) => {
  try {
    const branchId = req.query.branchId;
    const semesterId = req.query.semesterId;

    if (
      branchId !== undefined &&
      typeof branchId !== "string"
    ) {
      return res.status(400).json({
        message: "Invalid branchId",
      });
    }

    if (
      semesterId !== undefined &&
      typeof semesterId !== "string"
    ) {
      return res.status(400).json({
        message: "Invalid semesterId",
      });
    }

    if (branchId) {
      const branch = await prisma.branch.findUnique({
        where: { id: branchId },
      });

      if (!branch) {
        return res.status(404).json({
          message: "Branch not found",
        });
      }
    }

    if (semesterId) {
      const semester = await prisma.semester.findUnique({
        where: { id: semesterId },
      });

      if (!semester) {
        return res.status(404).json({
          message: "Semester not found",
        });
      }
    }

    const subjects = await prisma.subject.findMany({
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
      },
      include: {
        branch: true,
        semester: true,
        assignments: {
          where: { active: true },
          include: {
            teacher: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return res.status(200).json({
      message: "Subjects fetched successfully",
      count: subjects.length,
      data: subjects,
    });
  } catch (error) {
    console.error("Get Subjects Error:", error);

    return res.status(500).json({
      message: "Failed to fetch subjects",
    });
  }
};


export const createSubject = async (
  req: Request,
  res: Response,
) => {
  try {
    const { name, code, branchId, semesterId } = req.body;

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof code !== "string" ||
      !code.trim() ||
      typeof semesterId !== "string" ||
      !semesterId.trim()
    ) {
      return res.status(400).json({
        message: "name, code and semesterId are required",
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

    const normalizedCode = code.trim().toUpperCase();

    // Semester 1-2: common subjects are allowed.
    // Semester 3-6: branch-specific subject is required.
    const semester = await prisma.semester.findUnique({
      where: { id: semesterId },
    });

    if (!semester) {
      return res.status(404).json({
        message: "Semester not found",
      });
    }

    const isFirstYear = semester.number === 1 || semester.number === 2;
    const isCommonSubject = branchId === undefined || branchId === null;

    if (!isFirstYear && isCommonSubject) {
      return res.status(400).json({
        message: "Branch-specific subjects are required after Semester 2",
      });
    }

    if (branchId && isCommonSubject === false) {
      const branch = await prisma.branch.findUnique({
        where: { id: branchId },
      });

      if (!branch) {
        return res.status(404).json({
          message: "Branch not found",
        });
      }
    }

    const existing = await prisma.subject.findUnique({
      where: { code: normalizedCode },
    });

    if (existing) {
      return res.status(409).json({
        message: "A subject with this code already exists",
      });
    }

    const subject = await prisma.subject.create({
      data: {
        name: name.trim(),
        code: normalizedCode,
        semesterId,
        branchId: isCommonSubject ? null : branchId,
      },
      include: {
        branch: true,
        semester: true,
      },
    });

    return res.status(201).json({
      message: "Subject created successfully",
      data: subject,
    });
  } catch (error) {
    console.error("Create Subject Error:", error);

    return res.status(500).json({
      message: "Failed to create subject",
    });
  }
};




export const updateSubject = async (
  req: Request,
  res: Response,
) => {
  try {
    const { id } = req.params;
    const { name, code, branchId, semesterId } = req.body;

    if (typeof id !== "string") {
      return res.status(400).json({
        message: "Invalid subject ID",
      });
    }
    const existing = await prisma.subject.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({
        message: "Subject not found",
      });
    }

    // Validate supplied fields
    if (
      name !== undefined &&
      (typeof name !== "string" || !name.trim())
    ) {
      return res.status(400).json({
        message: "name must be a non-empty string",
      });
    }

    if (
      code !== undefined &&
      (typeof code !== "string" || !code.trim())
    ) {
      return res.status(400).json({
        message: "code must be a non-empty string",
      });
    }

    if (
      semesterId !== undefined &&
      (typeof semesterId !== "string" || !semesterId.trim())
    ) {
      return res.status(400).json({
        message: "semesterId must be a valid string",
      });
    }

    if (
      branchId !== undefined &&
      branchId !== null &&
      (typeof branchId !== "string" || !branchId.trim())
    ) {
      return res.status(400).json({
        message: "branchId must be a branch ID or null",
      });
    }

    const finalSemesterId = semesterId ?? existing.semesterId;
    const finalBranchId =
      branchId !== undefined ? branchId : existing.branchId;

    const semester = await prisma.semester.findUnique({
      where: { id: finalSemesterId },
    });

    if (!semester) {
      return res.status(404).json({
        message: "Semester not found",
      });
    }

    // Semester 1-2 allow common subjects.
    // Semester 3-6 require a branch.
    if (
      semester.number > 2 &&
      finalBranchId === null
    ) {
      return res.status(400).json({
        message: "A branch is required after Semester 2",
      });
    }

    if (finalBranchId !== null) {
      const branch = await prisma.branch.findUnique({
        where: { id: finalBranchId },
      });

      if (!branch) {
        return res.status(404).json({
          message: "Branch not found",
        });
      }
    }

    const normalizedCode =
      typeof code === "string"
        ? code.trim().toUpperCase()
        : existing.code;

    const duplicate = await prisma.subject.findFirst({
      where: {
        code: normalizedCode,
        id: { not: id },
      },
    });

    if (duplicate) {
      return res.status(409).json({
        message: "Another subject already uses this code",
      });
    }

    const subject = await prisma.subject.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name: name.trim() } : {}),
        ...(code !== undefined ? { code: normalizedCode } : {}),
        ...(semesterId !== undefined ? { semesterId } : {}),
        ...(branchId !== undefined ? { branchId } : {}),
      },
      include: {
        branch: true,
        semester: true,
      },
    });

    return res.status(200).json({
      message: "Subject updated successfully",
      data: subject,
    });
  } catch (error) {
    console.error("Update Subject Error:", error);

    return res.status(500).json({
      message: "Failed to update subject",
    });
  }
};

export const deleteSubject = async (
  req: Request,
  res: Response,
) => {
  try {
    const { id } = req.params;

    if (typeof id !== "string") {
      return res.status(400).json({
        message: "Invalid subject ID",
      });
    }

    const subject = await prisma.subject.findUnique({
      where: { id },
    });

    if (!subject) {
      return res.status(404).json({
        message: "Subject not found",
      });
    }

    // Prevent deletion if academic records depend on this subject.
    const [
      assignmentCount,
      attendanceCount,
      assessmentCount,
      unitTestCount,
    ] = await Promise.all([
      prisma.teacherSubjectAssignment.count({
        where: { subjectId: id },
      }),
      prisma.attendanceSession.count({
        where: { subjectId: id },
      }),
      prisma.marksAssessment.count({
        where: { subjectId: id },
      }),
      prisma.unitTest.count({
        where: { subjectId: id },
      }),
    ]);

    if (
      assignmentCount > 0 ||
      attendanceCount > 0 ||
      assessmentCount > 0 ||
      unitTestCount > 0
    ) {
      return res.status(409).json({
        message:
          "Subject cannot be deleted because academic records are linked to it. Deactivate it instead.",
        linkedRecords: {
          teacherAssignments: assignmentCount,
          attendanceSessions: attendanceCount,
          marksAssessments: assessmentCount,
          unitTests: unitTestCount,
        },
      });
    }

    await prisma.subject.delete({
      where: { id },
    });

    return res.status(200).json({
      message: "Subject deleted successfully",
      data: { id },
    });
  } catch (error) {
    console.error("Delete Subject Error:", error);

    return res.status(500).json({
      message: "Failed to delete subject",
    });
  }
};
