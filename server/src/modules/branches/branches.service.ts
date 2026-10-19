
import prisma from "../../config/prisma.js";

interface CreateBranchInput {
  name: string;
  codePrefix: string;
}

export const createBranch = async (data: CreateBranchInput) => {
  return prisma.branch.create({
    data: {
      name: data.name,
      codePrefix: data.codePrefix,
    },
  });
};

export const getAllBranches = async () => {
  return prisma.branch.findMany({
    orderBy: {
      name: "asc",
    },
  });
};
