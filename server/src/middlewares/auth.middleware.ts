
import type { Request, Response, NextFunction } from "express";
import { verifyAuthToken } from "../utils/jwt.js";

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    role: "ADMIN" | "TEACHER";
  };
}

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authReq = req as AuthenticatedRequest;

  // Diagnostic logs: never log the actual JWT.
  console.log("[AUTH] Request origin:", req.headers.origin);
  console.log(
    "[AUTH] Cookie names:",
    Object.keys(req.cookies ?? {})
  );

  const token = req.cookies?.erp_access_token;

  // Check whether the authentication cookie exists.
  if (!token || typeof token !== "string") {
    return res.status(401).json({
      success: false,
      message: "Authentication cookie is required",
    });
  }

  try {
    // Verify JWT signature and expiration.
    const payload = verifyAuthToken(token);

    if (
      !payload.userId ||
      (payload.role !== "ADMIN" && payload.role !== "TEACHER")
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token payload",
      });
    }

    // Attach authenticated user to the request.
    authReq.user = {
      userId: payload.userId,
      role: payload.role,
    };

    return next();
  } catch (error: unknown) {
    console.error(
      "[AUTH] JWT verification failed:",
      error instanceof Error ? error.message : "Unknown error"
    );

    return res.status(401).json({
      success: false,
      message: "Token is invalid or expired",
    });
  }
};
