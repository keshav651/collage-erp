
import { z } from "zod";

export const approveTeacherSchema = z
  .object({
    branchId: z.string().trim().min(1, "Valid branchId is required"),

    semesterId: z
      .string()
      .trim()
      .min(1, "Valid semesterId is required"),

    subjectIds: z
      .array(z.string().trim().min(1))
      .min(1, "Select at least one subject")
      .refine(
        (ids) => new Set(ids).size === ids.length,
        "Duplicate subject IDs are not allowed"
      ),

    academicYear: z
      .string()
      .trim()
      .regex(
        /^\d{4}-\d{4}$/,
        "Academic year must be in YYYY-YYYY format, e.g. 2026-2027"
      )
      .refine((year) => {
        const [start, end] = year.split("-").map(Number);
        return end === start + 1;
      }, "Academic year must contain consecutive years, e.g. 2026-2027"),
  })
  .strict();

export type ApproveTeacherInput = z.infer<
  typeof approveTeacherSchema
>;

export const validateApproveTeacher = (
  data: unknown
):
  | { success: true; data: ApproveTeacherInput }
  | { success: false; message: string } => {
  const result = approveTeacherSchema.safeParse(data);

  if (!result.success) {
    return {
      success: false,
      message: result.error.issues[0]?.message ?? "Invalid request body",
    };
  }

  return {
    success: true,
    data: result.data,
  };
};


export const createBranchSchema = z
  .object({
    name: z.string().trim().min(1, "Branch name is required"),
    codePrefix: z
      .string()
      .trim()
      .min(1, "Branch code prefix is required"),
  })
  .strict();

export type CreateBranchInput = z.infer<typeof createBranchSchema>;

export const validateCreateBranch = (
  data: unknown
):
  | { success: true; data: CreateBranchInput }
  | { success: false; message: string } => {
  const result = createBranchSchema.safeParse(data);

  if (!result.success) {
    return {
      success: false,
      message: result.error.issues[0]?.message ?? "Invalid request body",
    };
  }

  return {
    success: true,
    data: result.data,
  };
};