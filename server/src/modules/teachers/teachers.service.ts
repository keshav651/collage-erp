
import prisma from "../../config/prisma.js";
import bcrypt from "bcryptjs";
import { randomInt } from "node:crypto";

// Generate a readable temporary password.
// Example: Deepak@583214
const generateTemporaryPassword = (name: string): string => {
  const firstName =
    name.trim().split(/\s+/)[0].replace(/[^a-zA-Z]/g, "") ||
    "Teacher";

  const randomNumber = randomInt(100000, 1000000);

  return `${firstName}@${randomNumber}`;
};

// Get all pending teachers
export const getPendingTeachers = async () => {
  return prisma.user.findMany({
    where: {
      role: "TEACHER",
      status: "PENDING",
    },
    select: {
      id: true,
      name: true,
      email: true,
      emailVerified: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });
};

// Approve a pending teacher, assign a branch,
// generate a temporary password, and activate the account.
export const approveTeacher = async (
  userId: string,
  branchId: string
) => {
  return prisma.$transaction(
    async (tx) => {
      // 1. Find pending teacher
      const teacher = await tx.user.findFirst({
        where: {
          id: userId,
          role: "TEACHER",
          status: "PENDING",
        },
        select: {
          id: true,
          name: true,
          email: true,
        },
      });

      if (!teacher) {
        throw new Error("PENDING_TEACHER_NOT_FOUND");
      }

      // 2. Check branch
      const branch = await tx.branch.findUnique({
        where: {
          id: branchId,
        },
        select: {
          id: true,
          codePrefix: true,
        },
      });

      if (!branch) {
        throw new Error("BRANCH_NOT_FOUND");
      }

      // 3. Generate temporary password and its hash
      const temporaryPassword = generateTemporaryPassword(
        teacher.name
      );

      const passwordHash = await bcrypt.hash(
        temporaryPassword,
        12
      );

      // 4. Increment teacher counter for this branch
      const updatedBranch = await tx.branch.update({
        where: {
          id: branch.id,
        },
        data: {
          nextTeacherNumber: {
            increment: 1,
          },
        },
        select: {
          nextTeacherNumber: true,
          codePrefix: true,
        },
      });

      // 5. Generate teacher code, e.g. CSE-TCH-001
      const teacherCode =
        `${updatedBranch.codePrefix}-TCH-` +
        String(updatedBranch.nextTeacherNumber).padStart(3, "0");

      // 6. Create teacher profile
      const profile = await tx.teacherProfile.create({
        data: {
          userId: teacher.id,
          branchId: branch.id,
          teacherCode,
          name: teacher.name,
        },
        select: {
          id: true,
          userId: true,
          teacherCode: true,
          name: true,
          branchId: true,
        },
      });

      // 7. Activate account and save password hash
      await tx.user.update({
        where: {
          id: teacher.id,
        },
        data: {
          status: "ACTIVE",
          passwordHash,
        },
      });

      // Plain-text password is returned only in this response.
      // It is never saved as plain text in the database.
      return {
        ...profile,
        email: teacher.email,
        temporaryPassword,
      };
    },
    {
      maxWait: 10000,
      timeout: 20000,
    }
  );
};

// Get all active teachers

// Get all teachers, including active and inactive
export const getAllTeachers = async () => {
  return prisma.teacherProfile.findMany({
    where: {
      user: {
        role: "TEACHER",
        status: {
          in: ["ACTIVE", "INACTIVE"],
        },
      },
    },
    select: {
      id: true,
      userId: true,
      teacherCode: true,
      name: true,
      branchId: true,
      user: {
        select: {
          email: true,
          emailVerified: true,
          status: true,
        },
      },
      branch: {
        select: {
          name: true,
          codePrefix: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });
};





export const deactivateTeacher = async (userId: string) => {
  const teacher = await prisma.user.findFirst({
    where: {
      id: userId,
      role: "TEACHER",
      status: "ACTIVE",
    },
    select: {
      id: true,
      name: true,
      email: true,
      teacherProfile: {
        select: {
          teacherCode: true,
        },
      },
    },
  });

  if (!teacher || !teacher.teacherProfile) {
    throw new Error("ACTIVE_TEACHER_NOT_FOUND");
  }

  await prisma.user.update({
    where: {
      id: teacher.id,
    },
    data: {
      status: "INACTIVE",
    },
  });

  return {
    userId: teacher.id,
    name: teacher.name,
    email: teacher.email,
    teacherCode: teacher.teacherProfile.teacherCode,
    status: "INACTIVE",
  };
};




type UpdateTeacherInput = {
  name?: string;
  branchId?: string;
  status?: "ACTIVE" | "INACTIVE";
  passwordHash?: string;
};

export const updateTeacher = async (
  userId: string,
  data: UpdateTeacherInput
) => {
  const existingTeacher = await prisma.user.findFirst({
    where: {
      id: userId,
      role: "TEACHER",
      teacherProfile: {
        isNot: null,
      },
    },
    select: {
      id: true,
      email: true,
      role: true,
      status: true,
      teacherProfile: {
        select: {
          teacherCode: true,
        },
      },
    },
  });

  if (!existingTeacher) {
    throw new Error("TEACHER_NOT_FOUND");
  }

  if (data.branchId) {
    const branch = await prisma.branch.findUnique({
      where: { id: data.branchId },
      select: { id: true },
    });

    if (!branch) {
      throw new Error("BRANCH_NOT_FOUND");
    }
  }

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.update({
      where: { id: userId },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.passwordHash !== undefined && {
          passwordHash: data.passwordHash,
        }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
      },
    });

    const profile = await tx.teacherProfile.update({
      where: { userId },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.branchId !== undefined && {
          branchId: data.branchId,
        }),
      },
      select: {
        teacherCode: true,
        name: true,
        phone: true,
        branchId: true,
      },
    });

    return {
      ...user,
      teacherProfile: profile,
    };
  });
};



export const getTeacherById = async (userId: string) => {
  const teacher = await prisma.user.findFirst({
    where: {
      id: userId,
      role: "TEACHER",
      teacherProfile: {
        isNot: null,
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      teacherProfile: {
        select: {
          teacherCode: true,
          name: true,
          phone: true,
          branchId: true,
          branch: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  if (!teacher) {
    throw new Error("TEACHER_NOT_FOUND");
  }

  return teacher;
};


