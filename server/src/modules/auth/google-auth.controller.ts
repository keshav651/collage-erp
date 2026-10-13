
import type { Request, Response, NextFunction } from "express";
import { OAuth2Client } from "google-auth-library";
import prisma from "../../config/prisma.js";

const googleClientId = process.env.GOOGLE_CLIENT_ID;

if (!googleClientId) {
  throw new Error("GOOGLE_CLIENT_ID is not configured");
}

const googleClient = new OAuth2Client(googleClientId);

export const googleSignup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { credential } = req.body ?? {};

    if (typeof credential !== "string" || !credential.trim()) {
      return res.status(400).json({
        success: false,
        message: "Google credential is required",
      });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: googleClientId,
    });

    const payload = ticket.getPayload();

    if (
      !payload ||
      !payload.sub ||
      !payload.email ||
      !payload.name ||
      payload.email_verified !== true
    ) {
      return res.status(401).json({
        success: false,
        message: "Google account could not be verified",
      });
    }

    const googleId = payload.sub;
    const email = payload.email.toLowerCase();
    const name = payload.name;

    const existingGoogleUser = await prisma.user.findUnique({
      where: { googleId },
    });

    if (existingGoogleUser) {
      return res.status(409).json({
        success: false,
        message: "This Google account is already registered",
      });
    }

    const existingEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: "This email is already registered",
      });
    }

    const user = await prisma.user.create({
      data: {
        googleId,
        email,
        name,
        emailVerified: true,
        role: "TEACHER",
        status: "PENDING",
        passwordHash: null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        emailVerified: true,
        createdAt: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Registration successful. Awaiting admin approval.",
      data: user,
    });
  } catch (error) {
    return next(error);
  }
};
