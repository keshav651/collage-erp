
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

  // Read JWT from the browser cookie
  const token = req.cookies?.erp_access_token;

  if (!token || typeof token !== "string") {
    return res.status(401).json({
      success: false,
      message: "Authentication cookie is required",
    });
  }

  try {
    const payload = verifyAuthToken(token);

    authReq.user = {
      userId: payload.userId,
      role: payload.role,
    };

    return next();
  } catch {
    return res.status(401).json({
      success: false,
      message: "Token is invalid or expired",
    });
  }
};
