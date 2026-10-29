
import { z } from "zod";

export const approveTeacherSchema = z
  .object({
    branchId: z.string().trim().min(1, "Branch is required"),
    semesterId: z.string().trim().min(1, "Semester is required"),
    subjectIds: z
      .array(z.string().trim().min(1))
      .min(1, "Select at least one subject"),
    academicYear: z
      .string()
      .trim()
      .regex(/^\d{4}-\d{4}$/, "Academic year must be in YYYY-YYYY format")
      .refine((year) => {
        const [start, end] = year.split("-").map(Number);
        return end === start + 1;
      }, "Academic year must span consecutive years"),
  }).strict();

export type ApproveTeacherInput = z.infer<
  typeof approveTeacherSchema
>;

export const validateApproveTeacher = (data: unknown) => {
  const result = approveTeacherSchema.safeParse(data);

  if (!result.success) {
    return {
      success: false as const,
      message: result.error.issues
        .map((issue) => issue.message)
        .join(", "),
    };
  }

  return {
    success: true as const,
    data: result.data,
  };
};
