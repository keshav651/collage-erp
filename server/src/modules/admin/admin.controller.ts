
import type { Request, Response } from "express";
import { getPendingTeachers } from "../teachers/teachers.service.js";

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
