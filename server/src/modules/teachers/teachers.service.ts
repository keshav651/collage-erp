
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

      // Fetch the teacher's currently active subject assignments
      assignments: {
        where: {
          active: true,
        },
        select: {
          id: true,
          subjectId: true,
          academicYear: true,

          subject: {
            select: {
              id: true,
              name: true,
              code: true,
              semesterId: true,
              branchId: true,

              semester: {
                select: {
                  id: true,
                  number: true,
                },
              },
            },
          },
        },
        orderBy: {
          assignedAt: "desc",
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




type SemesterAssignmentInput = {
  semesterId: string;
  subjectIds: string[];
};

type UpdateTeacherInput = {
  name?: string;
  branchId?: string;
  status?: "ACTIVE" | "INACTIVE";
  passwordHash?: string;

  // Existing single-semester support
  semesterId?: string;
  subjectIds?: string[];
  academicYear?: string;

  // New multiple-semester support
  semesterAssignments?: SemesterAssignmentInput[];
};

export const updateTeacher = async (
  userId: string,
  data: UpdateTeacherInput
) => {
  const hasLegacyAssignmentFields =
    data.semesterId !== undefined ||
    data.subjectIds !== undefined ;
    
  const hasMultipleSemesterAssignments =
    data.semesterAssignments !== undefined;

  if (
    hasLegacyAssignmentFields &&
    hasMultipleSemesterAssignments
  ) {
    throw new Error("INVALID_ASSIGNMENT_DATA");
  }

  if (hasLegacyAssignmentFields) {
    if (
      typeof data.semesterId !== "string" ||
      !data.semesterId.trim() ||
      !Array.isArray(data.subjectIds) ||
      !data.subjectIds.every(
        (id) => typeof id === "string" && id.trim().length > 0
      ) ||
      typeof data.academicYear !== "string" ||
      !data.academicYear.trim()
    ) {
      throw new Error("INVALID_ASSIGNMENT_DATA");
    }

    if (
      new Set(data.subjectIds).size !== data.subjectIds.length
    ) {
      throw new Error("DUPLICATE_SUBJECT_IDS");
    }
  }

  if (hasMultipleSemesterAssignments) {
    if (
      !Array.isArray(data.semesterAssignments) ||
      typeof data.academicYear !== "string" ||
      !data.academicYear.trim()
    ) {
      throw new Error("INVALID_ASSIGNMENT_DATA");
    }

    const semesterIds = data.semesterAssignments.map(
      (assignment) => assignment.semesterId
    );

    if (
      semesterIds.some(
        (id) => typeof id !== "string" || !id.trim()
      ) ||
      new Set(semesterIds).size !== semesterIds.length
    ) {
      throw new Error("INVALID_ASSIGNMENT_DATA");
    }

    for (const assignment of data.semesterAssignments) {
      if (
        !Array.isArray(assignment.subjectIds) ||
        !assignment.subjectIds.every(
          (id) => typeof id === "string" && id.trim().length > 0
        )
      ) {
        throw new Error("INVALID_ASSIGNMENT_DATA");
      }

      if (
        new Set(assignment.subjectIds).size !==
        assignment.subjectIds.length
      ) {
        throw new Error("DUPLICATE_SUBJECT_IDS");
      }
    }
  }

  return prisma.$transaction(
    async (tx) => {
      // 1. Find teacher
      const existingTeacher = await tx.user.findFirst({
        where: {
          id: userId,
          role: "TEACHER",
          teacherProfile: {
            isNot: null,
          },
        },
        select: {
          id: true,
          teacherProfile: {
            select: {
              id: true,
              branchId: true,
            },
          },
        },
      });

      if (!existingTeacher?.teacherProfile) {
        throw new Error("TEACHER_NOT_FOUND");
      }

      const teacherProfile = existingTeacher.teacherProfile;
      const finalBranchId = data.branchId ?? teacherProfile.branchId;

      // 2. Validate branch
      const branch = await tx.branch.findUnique({
        where: {
          id: finalBranchId,
        },
        select: {
          id: true,
        },
      });

      if (!branch) {
        throw new Error("BRANCH_NOT_FOUND");
      }

      // 3. Update user account
      const user = await tx.user.update({
        where: {
          id: userId,
        },
        data: {
          ...(data.name !== undefined && {
            name: data.name,
          }),
          ...(data.status !== undefined && {
            status: data.status,
          }),
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

      // 4. Update teacher profile
      const profile = await tx.teacherProfile.update({
        where: {
          userId,
        },
        data: {
          ...(data.name !== undefined && {
            name: data.name,
          }),
          ...(data.branchId !== undefined && {
            branchId: data.branchId,
          }),
        },
        select: {
          id: true,
          userId: true,
          teacherCode: true,
          name: true,
          phone: true,
          branchId: true,
        },
      });

      // 5. Normalize legacy assignment format to the same
      // internal format used by multiple-semester assignments.
      const assignmentsToUpdate: SemesterAssignmentInput[] =
        hasMultipleSemesterAssignments
          ? data.semesterAssignments!
          : hasLegacyAssignmentFields
            ? [
                {
                  semesterId: data.semesterId!,
                  subjectIds: data.subjectIds!,
                },
              ]
            : [];

      // 6. Validate and synchronize each explicitly supplied semester.
      // Semesters absent from the request remain unchanged.
      for (const assignment of assignmentsToUpdate) {
        const semesterId = assignment.semesterId.trim();
        const subjectIds = assignment.subjectIds.map(
          (id) => id.trim()
        );

        const semester = await tx.semester.findUnique({
          where: {
            id: semesterId,
          },
          select: {
            id: true,
            number: true,
          },
        });

        if (!semester) {
          throw new Error("SEMESTER_NOT_FOUND");
        }

        // Validate subjects against the selected branch and semester.
        if (subjectIds.length > 0) {
          const subjectWhere = {
            id: {
              in: subjectIds,
            },
            semesterId: semester.id,
            ...(semester.number > 2
              ? {
                  branchId: finalBranchId,
                }
              : {
                  OR: [
                    {
                      branchId: finalBranchId,
                    },
                    {
                      branchId: null,
                    },
                  ],
                }),
          };

          const validSubjects = await tx.subject.findMany({
            where: subjectWhere,
            select: {
              id: true,
            },
          });

          if (validSubjects.length !== subjectIds.length) {
            throw new Error("SUBJECTS_INVALID");
          }
        }

        // Deactivate removed assignments only for this teacher,
        // this semester and this academic year.
        await tx.teacherSubjectAssignment.updateMany({
          where: {
            teacherId: profile.id,
            academicYear: data.academicYear!,
            subject: {
              semesterId: semester.id,
            },
            active: true,
            ...(subjectIds.length > 0
              ? {
                  subjectId: {
                    notIn: subjectIds,
                  },
                }
              : {}),
          },
          data: {
            active: false,
          },
        });

        // Create missing assignments or reactivate existing ones.
        for (const subjectId of subjectIds) {
          await tx.teacherSubjectAssignment.upsert({
            where: {
              teacherId_subjectId_academicYear: {
                teacherId: profile.id,
                subjectId,
                academicYear: data.academicYear!,
              },
            },
            create: {
              teacherId: profile.id,
              subjectId,
              academicYear: data.academicYear!,
              active: true,
            },
            update: {
              active: true,
            },
          });
        }
      }

      // 7. Return updated teacher with active assignments.
      const updatedTeacher = await tx.teacherProfile.findUnique({
        where: {
          userId,
        },
        select: {
          id: true,
          userId: true,
          teacherCode: true,
          name: true,
          phone: true,
          branchId: true,

          branch: {
            select: {
              id: true,
              name: true,
              codePrefix: true,
            },
          },

          assignments: {
            where: {
              active: true,
            },
            select: {
              id: true,
              subjectId: true,
              academicYear: true,

              subject: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                  semesterId: true,

                  semester: {
                    select: {
                      id: true,
                      number: true,
                    },
                  },
                },
              },
            },
            orderBy: {
              assignedAt: "desc",
            },
          },
        },
      });

      return {
        ...user,
        teacherProfile: updatedTeacher ?? profile,
      };
    },
    {
      maxWait: 10000,
      timeout: 20000,
    }
  );
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


