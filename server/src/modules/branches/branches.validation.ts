
export interface CreateBranchInput {
  name: string;
  codePrefix: string;
}

export const validateCreateBranch = (
  data: unknown
): { success: true; data: CreateBranchInput } | { success: false; message: string } => {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return { success: false, message: "Request body must be an object" };
  }

  const body = data as Record<string, unknown>;

  if (typeof body.name !== "string" || !body.name.trim()) {
    return { success: false, message: "Branch name is required" };
  }

  if (typeof body.codePrefix !== "string" || !body.codePrefix.trim()) {
    return { success: false, message: "Branch code prefix is required" };
  }

  const name = body.name.trim();
  const codePrefix = body.codePrefix.trim().toUpperCase();

  if (name.length > 100) {
    return { success: false, message: "Branch name cannot exceed 100 characters" };
  }

  if (!/^[A-Z0-9]{2,10}$/.test(codePrefix)) {
    return {
      success: false,
      message: "Code prefix must contain 2-10 uppercase letters or numbers",
    };
  }

  return {
    success: true,
    data: { name, codePrefix },
  };
};


export const validateUpdateBranch = (
  data: unknown
):
  | {
      success: true;
      data: { name?: string; codePrefix?: string };
    }
  | { success: false; message: string } => {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return {
      success: false,
      message: "Request body must be an object",
    };
  }

  const body = data as Record<string, unknown>;
  const result: { name?: string; codePrefix?: string } = {};

  if (Object.keys(body).length === 0) {
    return {
      success: false,
      message: "At least one field is required",
    };
  }

  if (Object.keys(body).some(
    (key) => !["name", "codePrefix"].includes(key)
  )) {
    return {
      success: false,
      message: "Only name and codePrefix can be updated",
    };
  }

  if ("name" in body) {
    if (
      typeof body.name !== "string" ||
      !body.name.trim() ||
      body.name.trim().length > 100
    ) {
      return {
        success: false,
        message: "Branch name must be 1-100 characters",
      };
    }

    result.name = body.name.trim();
  }

  if ("codePrefix" in body) {
    if (
      typeof body.codePrefix !== "string" ||
      !/^[A-Za-z0-9]{2,10}$/.test(body.codePrefix.trim())
    ) {
      return {
        success: false,
        message: "Code prefix must contain 2-10 letters or numbers",
      };
    }

    result.codePrefix = body.codePrefix.trim().toUpperCase();
  }

  return { success: true, data: result };
};
