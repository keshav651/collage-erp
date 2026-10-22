
import type { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import prisma from "../../config/prisma.js";
import { signAuthToken } from "../../utils/jwt.js";

export const adminLogin = async (
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

    const admin = await prisma.user.findUnique({
      where: { email },
    });

    if (
      !admin ||
      admin.role !== "ADMIN" ||
      admin.status !== "ACTIVE" ||
      !admin.passwordHash
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      admin.passwordHash
    );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = signAuthToken({
      userId: admin.id,
      role: "ADMIN",
    });

    res.cookie("erp_access_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 15 * 60 * 1000,
      path: "/",
    });

    return res.status(200).json({
      success: true,
      message: "Admin login successful",
      data: {
        token,
        user: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          status: admin.status,
        },
      },
    });
  } catch (error) {
    return next(error);
  }
};
