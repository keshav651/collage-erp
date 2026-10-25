import "dotenv/config";
import prisma from "../config/prisma.js";

async function main() {
  const semesters = await prisma.semester.findMany({
    orderBy: { number: "asc" },
    select: {
      id: true,
      number: true,
    },
  });

  console.log("Semesters in database:");
  console.log(JSON.stringify(semesters, null, 2));
}

main()
  .catch((error) => {
    console.error("Failed to fetch semesters:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });