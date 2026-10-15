
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
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Authentication token is required",
    });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Invalid authorization header",
    });
  }

  try {
    const payload = verifyAuthToken(token);

    if (
      typeof payload === "string" ||
      !payload ||
      typeof payload.userId !== "string" ||
      !["ADMIN", "TEACHER"].includes(payload.role as string)
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token",
      });
    }

    authReq.user = {
      userId: payload.userId,
      role: payload.role as "ADMIN" | "TEACHER",
    };

    next();
  } catch {
    return res.status(401).json({
      success: false,
      message: "Token is invalid or expired",
    });
  }
};
