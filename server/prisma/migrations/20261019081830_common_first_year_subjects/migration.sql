-- DropForeignKey
ALTER TABLE "Subject" DROP CONSTRAINT "Subject_branchId_fkey";

-- DropForeignKey
ALTER TABLE "UnitTestCycle" DROP CONSTRAINT "UnitTestCycle_branchId_fkey";

-- AlterTable
ALTER TABLE "Subject" ALTER COLUMN "branchId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "UnitTestCycle" ALTER COLUMN "branchId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Subject" ADD CONSTRAINT "Subject_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnitTestCycle" ADD CONSTRAINT "UnitTestCycle_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
