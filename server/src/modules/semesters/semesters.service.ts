import prisma from "../../config/prisma.js";

export const getAllSemesters = async () => {
  return prisma.semester.findMany({
    orderBy: {
      number: "asc",
    },
  });
};