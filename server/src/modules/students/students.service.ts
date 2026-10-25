
import prisma from "../../config/prisma.js";

export const listStudents = async () => {
  return prisma.student.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      branch: true,
      semester: true,
    },
  });
};

export const getStudentById = async (id: string) => {
  return prisma.student.findUnique({
    where: { id },
    include: {
      branch: true,
      semester: true,
    },
  });
};

export const createStudent = async (data: {
  rollNo: string;
  name: string;
  branchId: string;
  semesterId: string;
}) => {
  return prisma.student.create({
    data,
    include: {
      branch: true,
      semester: true,
    },
  });
};

export const updateStudent = async (
  id: string,
  data: {
    rollNo?: string;
    name?: string;
    branchId?: string;
    semesterId?: string;
  }
) => {
  return prisma.student.update({
    where: { id },
    data,
    include: {
      branch: true,
      semester: true,
    },
  });
};

export const setStudentStatus = async (
  id: string,
  isActive: boolean
) => {
  return prisma.student.update({
    where: { id },
    data: { isActive },
  });
};


export const deleteStudent = async (id: string) => {
  return prisma.student.delete({
    where: { id },
  });
};