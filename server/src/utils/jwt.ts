
import jwt from "jsonwebtoken";

const configuredSecret = process.env.JWT_SECRET;

if (!configuredSecret || configuredSecret.length < 32) {
  throw new Error(
    "JWT_SECRET must be configured with at least 32 characters"
  );
}

// Validation ke baad TypeScript ko definite string milegi.
const jwtSecret: string = configuredSecret;

export interface AuthTokenPayload {
  userId: string;
  role: "ADMIN" | "TEACHER";
}

export function signAuthToken(
  payload: AuthTokenPayload
): string {
  return jwt.sign(payload, jwtSecret, {
    expiresIn: "15m",
    issuer: "college-erp",
    audience: "college-erp-client",
  });
}

export function verifyAuthToken(
  token: string
): AuthTokenPayload {
  const decoded = jwt.verify(token, jwtSecret, {
    issuer: "college-erp",
    audience: "college-erp-client",
  });

  if (
    typeof decoded === "string" ||
    typeof decoded.userId !== "string" ||
    (decoded.role !== "ADMIN" && decoded.role !== "TEACHER")
  ) {
    throw new Error("Invalid authentication token");
  }

  return {
    userId: decoded.userId,
    role: decoded.role,
  };
}
