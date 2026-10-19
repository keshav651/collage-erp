
import type { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";

import prisma from "../../config/prisma.js";
import { signAuthToken } from "../../utils/jwt.js";

// Common login for Admin and Teacher
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const email =
      typeof req.body?.email === "string"
        ? req.body.email.trim().toLowerCase()
        : "";

    const password =
      typeof req.body?.password === "string"
        ? req.body.password
        : "";

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (
      !user ||
      !["ADMIN", "TEACHER"].includes(user.role) ||
      user.status !== "ACTIVE" ||
      !user.passwordHash
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.passwordHash
    );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = signAuthToken({
      userId: user.id,
      role: user.role,
    });

    res.cookie("erp_access_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 1000,
      path: "/",
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
        },
      },
    });
  } catch (error) {
    return next(error);
  }
};

// Change password for the currently logged-in Admin or Teacher
export const changePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Set by authenticateToken middleware
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const currentPassword =
      typeof req.body?.currentPassword === "string"
        ? req.body.currentPassword
        : "";

    const newPassword =
      typeof req.body?.newPassword === "string"
        ? req.body.newPassword
        : "";

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message:
          "Current password and new password are required",
      });
    }

    if (
      newPassword.length < 10 ||
      newPassword.length > 72
    ) {
      return res.status(400).json({
        success: false,
        message:
          "New password must be between 10 and 72 characters",
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message:
          "New password must be different from current password",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        passwordHash: true,
        status: true,
        role: true,
      },
    });

    if (
      !user ||
      !["ADMIN", "TEACHER"].includes(user.role) ||
      user.status !== "ACTIVE" ||
      !user.passwordHash
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Password change is not available for this account",
      });
    }

    const passwordMatches = await bcrypt.compare(
      currentPassword,
      user.passwordHash
    );

    if (!passwordMatches) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    const newPasswordHash = await bcrypt.hash(
      newPassword,
      12
    );

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: newPasswordHash,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    return next(error);
  }
};


export const logout = async (
  _req: Request,
  res: Response
) => {
  res.clearCookie("erp_access_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  return res.status(200).json({
    success: true,
    message: "Logout successful",
  });
};
