
import "dotenv/config";
import bcrypt from "bcryptjs";
import prisma from "../config/prisma.js";

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const name =
    process.env.ADMIN_NAME?.trim() || "System Administrator";

  if (!email || !password) {
    throw new Error(
      "ADMIN_EMAIL and ADMIN_PASSWORD must be configured"
    );
  }

  if (password.length < 12) {
    throw new Error(
      "ADMIN_PASSWORD must be at least 12 characters long"
    );
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      role: true,
      status: true,
    },
  });

  if (existingUser) {
    if (existingUser.role !== "ADMIN") {
      throw new Error(
        "This email already belongs to a non-admin user. Use a separate admin email."
      );
    }

    console.log("Admin already exists. No changes made.");
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await prisma.user.create({
    data: {
      email,
      name,
      passwordHash,
      role: "ADMIN",
      status: "ACTIVE",
      emailVerified: true,
    },
    select: {
      id: true,
      email: true,
      role: true,
      status: true,
    },
  });

  console.log("Admin created successfully:", admin);
}

main()
  .catch((error) => {
    console.error("Admin seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
