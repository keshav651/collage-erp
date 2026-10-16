import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "./auth.middleware.js";

type UserRole = "ADMIN" | "TEACHER";

export const allowRoles = (...allowedRoles: UserRole[]) => {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Please authenticate first",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to access this resource",
      });
    }

    next();
  };
};