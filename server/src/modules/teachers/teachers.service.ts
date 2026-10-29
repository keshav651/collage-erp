
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
  data: {
    branchId: string;
    semesterId: string;
    subjectIds: string[];
    academicYear: string;
  }
) => {
  return prisma.$transaction(
    async (tx) => {
      // 1. Find the pending teacher
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

      // 2. Validate the selected branch
      const branch = await tx.branch.findUnique({
        where: {
          id: data.branchId,
        },
        select: {
          id: true,
          codePrefix: true,
        },
      });

      if (!branch) {
        throw new Error("BRANCH_NOT_FOUND");
      }

      // 3. Validate the semester
      const semester = await tx.semester.findUnique({
        where: {
          id: data.semesterId,
        },
        select: {
          id: true,
        },
      });

      if (!semester) {
        throw new Error("SEMESTER_NOT_FOUND");
      }

      // 4. Validate all selected subjects
      // A subject must belong to the selected semester
      // and either the selected branch or be a common subject.
      const subjects = await tx.subject.findMany({
        where: {
          id: {
            in: data.subjectIds,
          },
          semesterId: data.semesterId,
          OR: [
            {
              branchId: data.branchId,
            },
            {
              branchId: null,
            },
          ],
        },
        select: {
          id: true,
        },
      });

      if (
        subjects.length !== data.subjectIds.length
      ) {
        throw new Error("SUBJECTS_INVALID");
      }

      // 5. Generate a temporary password
      const temporaryPassword = generateTemporaryPassword(
        teacher.name
      );

      const passwordHash = await bcrypt.hash(
        temporaryPassword,
        12
      );

      // 6. Increment the branch's teacher counter
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

      // 7. Generate the teacher code
      const teacherCode =
        `${updatedBranch.codePrefix}-TCH-` +
        String(updatedBranch.nextTeacherNumber).padStart(
          3,
          "0"
        );

      // 8. Create the teacher profile
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

      // 9. Save subject assignments
      await tx.teacherSubjectAssignment.createMany({
        data: subjects.map((subject) => ({
          teacherId: profile.id,
          subjectId: subject.id,
          academicYear: data.academicYear,
          active: true,
        })),
      });

      // 10. Activate the account
      await tx.user.update({
        where: {
          id: teacher.id,
        },
        data: {
          status: "ACTIVE",
          passwordHash,
        },
      });

      // 11. Return the teacher details and temporary password
      return {
        ...profile,
        email: teacher.email,
        temporaryPassword,
        semesterId: data.semesterId,
        subjectIds: subjects.map((subject) => subject.id),
        academicYear: data.academicYear,
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


