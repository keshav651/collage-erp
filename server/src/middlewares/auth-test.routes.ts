
import { Router } from "express";
import {
  authenticateToken,
  type AuthenticatedRequest,
} from "./auth.middleware.js";
import { allowRoles } from "./role.middleware.js";

const router = Router();

// Any authenticated user
router.get("/me", authenticateToken, (req, res) => {
  const authReq = req as AuthenticatedRequest;

  return res.json({
    success: true,
    user: authReq.user,
  });
});

// Admin only
router.get(
  "/admin-check",
  authenticateToken,
  allowRoles("ADMIN"),
  (req, res) => {
    return res.json({
      success: true,
      message: "Admin access granted",
    });
  }
);
  
// Teacher only
router.get(
  "/teacher-check",
  authenticateToken,
  allowRoles("TEACHER"),
  (req, res) => {
    return res.json({
      success: true,
      message: "Teacher access granted",
    });
  }
);

export default router;
