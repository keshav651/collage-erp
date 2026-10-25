import type { Request, Response } from "express";
import { getAllSemesters } from "./semesters.service.js";

export const getAllSemestersController = async (
  _req: Request,
  res: Response
) => {
  try {
    const semesters = await getAllSemesters();

    return res.status(200).json({
      success: true,
      count: semesters.length,
      data: semesters,
    });
  } catch (error) {
    console.error("Get semesters error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch semesters",
    });
  }
};