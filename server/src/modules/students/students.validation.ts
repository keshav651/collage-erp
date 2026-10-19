import { z } from "zod";

export const createStudentSchema = z.object({
  rollNo: z.string().trim().min(1, "Roll number is required"),
  name: z.string().trim().min(1, "Student name is required"),
  branchId: z.string().uuid("Invalid branch ID"),
  semesterId: z.string().uuid("Invalid semester ID"),
});

export const updateStudentSchema = z.object({
  rollNo: z.string().trim().min(1).optional(),
  name: z.string().trim().min(1).optional(),
  branchId: z.string().uuid().optional(),
  semesterId: z.string().uuid().optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: "At least one field is required" }
);
