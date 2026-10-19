/*
  Warnings:

  - Added the required column `branchId` to the `Subject` table without a default value. This is not possible if the table is not empty.
  - Added the required column `semesterId` to the `Subject` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Subject" ADD COLUMN     "branchId" TEXT NOT NULL,
ADD COLUMN     "semesterId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Subject_branchId_semesterId_idx" ON "Subject"("branchId", "semesterId");

-- AddForeignKey
ALTER TABLE "Subject" ADD CONSTRAINT "Subject_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subject" ADD CONSTRAINT "Subject_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "Semester"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
