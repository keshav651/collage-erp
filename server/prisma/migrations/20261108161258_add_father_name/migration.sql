/*
  Warnings:

  - You are about to drop the column `rollNo` on the `Student` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Student_rollNo_key";

-- AlterTable
ALTER TABLE "Student" DROP COLUMN "rollNo",
ADD COLUMN     "fatherName" TEXT;
