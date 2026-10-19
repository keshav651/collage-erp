
import type { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import {
  createBranch,
  getAllBranches,
} from "./branches.service.js";
import { validateCreateBranch } from "./branches.validation.js";

// Create a new branch
export const createBranchController = async (
  req: Request,
  res: Response
) => {
  const validation = validateCreateBranch(req.body);

  if (!validation.success) {
    return res.status(400).json({
      success: false,
      message: validation.message,
    });
  }

  try {
    const branch = await createBranch(validation.data);

    return res.status(201).json({
      success: true,
      message: "Branch created successfully",
      data: branch,
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return res.status(409).json({
        success: false,
        message: "Branch name or code prefix already exists",
      });
    }

    console.error("Create branch error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create branch",
    });
  }
};

// Get all branches
export const getAllBranchesController = async (
  _req: Request,
  res: Response
) => {
  try {
    const branches = await getAllBranches();

    return res.status(200).json({
      success: true,
      count: branches.length,
      data: branches,
    });
  } catch (error) {
    console.error("Get branches error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch branches",
    });
  }
};
