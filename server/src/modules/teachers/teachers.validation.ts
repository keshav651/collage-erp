
import { z } from "zod";

export const approveTeacherSchema = z.object({});


export const validateApproveTeacher = (
  data: unknown
):
  | { success: true; data: { branchId: string } }
  | { success: false; message: string } => {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return {
      success: false,
      message: "Request body must be an object",
    };
  }

  const body = data as Record<string, unknown>;

  if (
    Object.keys(body).some((key) => key !== "branchId")
  ) {
    return {
      success: false,
      message: "Only branchId is allowed",
    };
  }

  if (
    typeof body.branchId !== "string" ||
    !body.branchId.trim()
  ) {
    return {
      success: false,
      message: "Valid branchId is required",
    };
  }

  return {
    success: true,
    data: { branchId: body.branchId.trim() },
  };
};

