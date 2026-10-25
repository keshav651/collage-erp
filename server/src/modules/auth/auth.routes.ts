
import { Router } from "express";

import { googleSignup } from "./google-auth.controller.js";
import { adminLogin } from "./admin-auth.controller.js";
import {
  login,
  changePassword,
  logout,
  getCurrentUser
} from "./auth.controller.js";

import { authenticateToken } from "../../middlewares/auth.middleware.js";

const router = Router();

// Google signup
router.post("/google", googleSignup);

// Common login for Admin and Teacher
router.post("/login", login);

// Existing Admin login route retained for compatibility
router.post("/admin/login", adminLogin);

// Change password for authenticated user
router.patch(
  "/change-password",
  authenticateToken,
  changePassword
);

// Get currently authenticated user
router.get("/me", authenticateToken, getCurrentUser);

router.post("/logout", logout);


export default router;
