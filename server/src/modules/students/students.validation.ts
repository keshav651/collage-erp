import { z } from "zod";

export const createStudentSchema = z.object({
  fatherName: z.string().trim().min(1, "Father's name is required"),
  name: z.string().trim().min(1, "Student name is required"),
  branchId: z.string().trim().min(1, "Branch ID is required"),
  semesterId: z.string().trim().min(1, "Semester ID is required"),
});

export const updateStudentSchema = z.object({
  fatherName: z.string().trim().min(1).optional(),
  name: z.string().trim().min(1).optional(),
  branchId: z.string().trim().min(1).optional(),
  semesterId: z.string().trim().min(1).optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: "At least one field is required" }
);
