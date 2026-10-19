
import type { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";

import {
  getPendingTeachers,
  approveTeacher,
  getAllTeachers,
  deactivateTeacher,
  getTeacherById,
  updateTeacher
} from "./teachers.service.js";

import { validateApproveTeacher } from "./teachers.validation.js";

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
  const validation = validateApproveTeacher(req.body);

  if (!validation.success) {
    return res.status(400).json({
      success: false,
      message: validation.message,
    });
  }

  const userId = req.params.userId;

  if (typeof userId !== "string" || !userId.trim()) {
    return res.status(400).json({
      success: false,
      message: "Valid teacher user ID is required",
    });
  }

  try {
    const teacher = await approveTeacher(
      userId,
      validation.data.branchId
    );

    return res.status(200).json({
      success: true,
      message: "Teacher approved successfully",
      data: teacher,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message === "PENDING_TEACHER_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "Pending teacher not found or already approved",
        });
      }

      if (error.message === "BRANCH_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "Selected branch not found",
        });
      }
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return res.status(409).json({
        success: false,
        message:
          "Teacher profile or teacher code already exists",
      });
    }

    console.error("Approve teacher error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to approve teacher",
    });
  }
};

// GET active teachers
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



export const deleteTeacherController = async (
  req: Request,
  res: Response
) => {
  const userId = req.params.userId;

  if (typeof userId !== "string" || !userId.trim()) {
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
      error: error instanceof Error ? error.message : String(error),
    });
  }
};





export const updateTeacherController = async (
  req: Request,
  res: Response
) => {
  const userId = req.params.userId;

  if (typeof userId !== "string" || !userId.trim()) {
    return res.status(400).json({
      success: false,
      message: "Valid teacher user ID is required",
    });
  }

  const body = req.body ?? {};
  const allowedFields = ["name", "branchId", "status", "password"];
  const suppliedFields = Object.keys(body);

  if (
    suppliedFields.length === 0 ||
    suppliedFields.some((field) => !allowedFields.includes(field))
  ) {
    return res.status(400).json({
      success: false,
      message: "Provide name, branchId, status, or password to update",
    });
  }

  const data: {
    name?: string;
    branchId?: string;
    status?: "ACTIVE" | "INACTIVE";
    passwordHash?: string;
  } = {};

  if ("name" in body) {
    if (typeof body.name !== "string" || !body.name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Name must be a non-empty string",
      });
    }

    data.name = body.name.trim();
  }

  if ("branchId" in body) {
    if (typeof body.branchId !== "string" || !body.branchId.trim()) {
      return res.status(400).json({
        success: false,
        message: "Valid branchId is required",
      });
    }

    data.branchId = body.branchId.trim();
  }

  if ("status" in body) {
    if (!["ACTIVE", "INACTIVE"].includes(body.status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be ACTIVE or INACTIVE",
      });
    }

    data.status = body.status;
  }

  if ("password" in body) {
    if (
      typeof body.password !== "string" ||
      body.password.length < 10 ||
      body.password.length > 72
    ) {
      return res.status(400).json({
        success: false,
        message: "Password must be between 10 and 72 characters",
      });
    }
  }

  try {
    // Hash the password exactly once.
    if ("password" in body) {
      data.passwordHash = await bcrypt.hash(body.password, 12);
    }

    const teacher = await updateTeacher(userId, data);

    return res.status(200).json({
      success: true,
      message: "Teacher updated successfully",
      data: teacher,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message === "TEACHER_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "Teacher not found",
        });
      }

      if (error.message === "BRANCH_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "Branch not found",
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



export const getTeacherByIdController = async (
  req: Request,
  res: Response
) => {
  const userId = req.params.userId;

  if (typeof userId !== "string" || !userId.trim()) {
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


