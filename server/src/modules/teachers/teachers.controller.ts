
import type { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";

import {
  getPendingTeachers,
  approveTeacher,
  getAllTeachers,
  deactivateTeacher,
  getTeacherById,
  updateTeacher,
} from "./teachers.service.js";

function getRouteParam(
  req: Request,
  key: string
): string | null {
  const value = req.params[key];

  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  if (
    Array.isArray(value) &&
    typeof value[0] === "string" &&
    value[0].trim()
  ) {
    return value[0].trim();
  }

  return null;
}

// GET pending teachers
export const getPendingTeachersController = async (
  _req: Request,
  res: Response
) => {
  try {
    const teachers = await getPendingTeachers();

    return res.status(200).json({
      success: true,
      message: "Pending teachers fetched successfully",
      count: teachers.length,
      data: teachers,
    });
  } catch (error) {
    console.error("Get pending teachers error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch pending teachers",
    });
  }
};

// PATCH approve teacher
export const approveTeacherController = async (
  req: Request,
  res: Response
) => {
  const userId = getRouteParam(req, "userId");

  if (!userId) {
    return res.status(400).json({
      success: false,
      message: "Valid teacher user ID is required",
    });
  }

  try {
    const {
      branchId,
      semesterId,
      subjectIds,
      academicYear,
    } = req.body ?? {};

    const result = await approveTeacher(userId, {
      branchId,
      semesterId,
      subjectIds,
      academicYear,
    });

    return res.status(200).json({
      success: true,
      message: "Teacher approved successfully",
      data: result,
    });
  } catch (error: unknown) {
    console.error("APPROVAL FAILED:", error);

    if (error instanceof Error) {
      const knownErrors: Record<
        string,
        { status: number; message: string }
      > = {
        PENDING_TEACHER_NOT_FOUND: {
          status: 404,
          message: "Pending teacher not found",
        },
        BRANCH_NOT_FOUND: {
          status: 404,
          message: "Branch not found",
        },
        SEMESTER_NOT_FOUND: {
          status: 404,
          message: "Semester not found",
        },
        SUBJECTS_INVALID: {
          status: 400,
          message: "Selected subjects are invalid",
        },
      };

      const knownError = knownErrors[error.message];

      if (knownError) {
        return res.status(knownError.status).json({
          success: false,
          message: knownError.message,
        });
      }
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return res.status(409).json({
        success: false,
        message: "A conflicting teacher record already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to approve teacher",
    });
  }
};

// GET teachers
export const getAllTeachersController = async (
  _req: Request,
  res: Response
) => {
  try {
    const teachers = await getAllTeachers();

    return res.status(200).json({
      success: true,
      message: "Teachers fetched successfully",
      count: teachers.length,
      data: teachers,
    });
  } catch (error) {
    console.error("Get all teachers error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch teachers",
    });
  }
};

// DELETE / deactivate teacher
export const deleteTeacherController = async (
  req: Request,
  res: Response
) => {
  const userId = getRouteParam(req, "userId");

  if (!userId) {
    return res.status(400).json({
      success: false,
      message: "Valid teacher user ID is required",
    });
  }

  try {
    const teacher = await deactivateTeacher(userId);

    return res.status(200).json({
      success: true,
      message: "Teacher deactivated successfully",
      data: teacher,
    });
  } catch (error) {
    console.error("Deactivate teacher error:", error);

    if (
      error instanceof Error &&
      error.message === "ACTIVE_TEACHER_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message: "Active teacher not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to deactivate teacher",
      error:
        error instanceof Error ? error.message : String(error),
    });
  }
};

// PATCH update teacher
export const updateTeacherController = async (
  req: Request,
  res: Response
) => {
  const userId = getRouteParam(req, "teacherId");

  if (!userId) {
    return res.status(400).json({
      success: false,
      message: "Valid teacher user ID is required",
    });
  }

  const body = req.body ?? {};

  const allowedFields = [
    "name",
    "branchId",
    "status",
    "password",
    "semesterId",
    "subjectIds",
    "academicYear",
    "semesterAssignments",
  ];

  const suppliedFields = Object.keys(body);

  if (
    suppliedFields.length === 0 ||
    suppliedFields.some(
      (field) => !allowedFields.includes(field)
    )
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid fields provided for teacher update",
    });
  }

  type SemesterAssignmentInput = {
    semesterId: string;
    subjectIds: string[];
  };

  const data: {
    name?: string;
    branchId?: string;
    status?: "ACTIVE" | "INACTIVE";
    passwordHash?: string;
    semesterId?: string;
    subjectIds?: string[];
    academicYear?: string;
    semesterAssignments?: SemesterAssignmentInput[];
  } = {};

  // Validate name
  if ("name" in body) {
    if (
      typeof body.name !== "string" ||
      !body.name.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Name must be a non-empty string",
      });
    }

    data.name = body.name.trim();
  }

  // Validate branch
  if ("branchId" in body) {
    if (
      typeof body.branchId !== "string" ||
      !body.branchId.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid branchId is required",
      });
    }

    data.branchId = body.branchId.trim();
  }

  // Validate status
  if ("status" in body) {
    if (
      body.status !== "ACTIVE" &&
      body.status !== "INACTIVE"
    ) {
      return res.status(400).json({
        success: false,
        message: "Status must be ACTIVE or INACTIVE",
      });
    }

    data.status = body.status;
  }

  // Validate password
  if ("password" in body) {
    if (
      typeof body.password !== "string" ||
      body.password.length < 10 ||
      body.password.length > 72
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be between 10 and 72 characters",
      });
    }
  }

  const assignmentFields = [
    "semesterId",
    "subjectIds",
  ];

  const hasLegacyAssignmentFields =
    assignmentFields.some((field) => field in body);

  const hasMultipleSemesterAssignments =
    "semesterAssignments" in body;

  // Prevent mixing old and new assignment payload formats.
  if (
    hasLegacyAssignmentFields &&
    hasMultipleSemesterAssignments
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Use either semesterAssignments or the legacy assignment fields, not both",
    });
  }

  // New format: multiple semesters
  if (hasMultipleSemesterAssignments) {
    if (
      !Array.isArray(body.semesterAssignments) ||
      typeof body.academicYear !== "string" ||
      !body.academicYear.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "semesterAssignments must be an array and academicYear is required",
      });
    }

    const seenSemesterIds = new Set<string>();

    const semesterAssignments: SemesterAssignmentInput[] = [];

    for (const assignment of body.semesterAssignments) {
      if (
        !assignment ||
        typeof assignment.semesterId !== "string" ||
        !assignment.semesterId.trim() ||
        !Array.isArray(assignment.subjectIds) ||
        !assignment.subjectIds.every(
          (id: unknown) =>
            typeof id === "string" &&
            id.trim().length > 0
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Each semester assignment must contain a valid semesterId and subjectIds array",
        });
      }

      const semesterId = assignment.semesterId.trim();

      if (seenSemesterIds.has(semesterId)) {
        return res.status(400).json({
          success: false,
          message:
            "Each semester can appear only once in semesterAssignments",
        });
      }

      seenSemesterIds.add(semesterId);

      const subjectIds = assignment.subjectIds.map(
        (id: string) => id.trim()
      );

      if (new Set(subjectIds).size !== subjectIds.length) {
        return res.status(400).json({
          success: false,
          message:
            "Duplicate subject IDs are not allowed within a semester",
        });
      }

      semesterAssignments.push({
        semesterId,
        subjectIds,
      });
    }

    data.semesterAssignments = semesterAssignments;
    data.academicYear = body.academicYear.trim();
  }

  // Legacy format: one semester
  else if (hasLegacyAssignmentFields) {
    if (
      typeof body.semesterId !== "string" ||
      !body.semesterId.trim() ||
      !Array.isArray(body.subjectIds) ||
      !body.subjectIds.every(
        (id: unknown) =>
          typeof id === "string" &&
          id.trim().length > 0
      ) ||
      typeof body.academicYear !== "string" ||
      !body.academicYear.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "semesterId, subjectIds, and academicYear must be provided together",
      });
    }

    const subjectIds = body.subjectIds.map(
      (id: string) => id.trim()
    );

    if (new Set(subjectIds).size !== subjectIds.length) {
      return res.status(400).json({
        success: false,
        message: "Duplicate subject IDs are not allowed",
      });
    }

    data.semesterId = body.semesterId.trim();
    data.subjectIds = subjectIds;
    data.academicYear = body.academicYear.trim();
  }

  try {
    // Hash password once, only if supplied.
    if ("password" in body) {
      data.passwordHash = await bcrypt.hash(
        body.password,
        12
      );
    }

    console.log("UPDATE TEACHER DATA:", {
      userId,
      name: data.name,
      branchId: data.branchId,
      status: data.status,
      semesterId: data.semesterId,
      academicYear: data.academicYear,
      subjectIds: data.subjectIds,
      semesterAssignments: data.semesterAssignments,
      assignmentUpdateRequested:
        hasLegacyAssignmentFields ||
        hasMultipleSemesterAssignments,
    });

    const teacher = await updateTeacher(userId, data);

    return res.status(200).json({
      success: true,
      message: "Teacher updated successfully",
      data: teacher,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      const knownErrors: Record<
        string,
        { status: number; message: string }
      > = {
        TEACHER_NOT_FOUND: {
          status: 404,
          message: "Teacher not found",
        },
        BRANCH_NOT_FOUND: {
          status: 404,
          message: "Branch not found",
        },
        SEMESTER_NOT_FOUND: {
          status: 404,
          message: "Semester not found",
        },
        SUBJECTS_INVALID: {
          status: 400,
          message: "Selected subjects are invalid",
        },
      };

      const knownError = knownErrors[error.message];

      if (knownError) {
        return res.status(knownError.status).json({
          success: false,
          message: knownError.message,
        });
      }
    }

    console.error("Update teacher error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update teacher",
    });
  }
};

// GET teacher by ID
export const getTeacherByIdController = async (
  req: Request,
  res: Response
) => {
  const userId = getRouteParam(req, "userId");

  if (!userId) {
    return res.status(400).json({
      success: false,
      message: "Valid teacher user ID is required",
    });
  }

  try {
    const teacher = await getTeacherById(userId);

    return res.status(200).json({
      success: true,
      message: "Teacher fetched successfully",
      data: teacher,
    });
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      error.message === "TEACHER_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    console.error("Get teacher by ID error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch teacher",
    });
  }
};
