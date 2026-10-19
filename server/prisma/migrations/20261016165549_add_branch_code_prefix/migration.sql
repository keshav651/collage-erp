/*
  Warnings:

  - A unique constraint covering the columns `[codePrefix]` on the table `Branch` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `codePrefix` to the `Branch` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Branch" ADD COLUMN     "codePrefix" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Branch_codePrefix_key" ON "Branch"("codePrefix");
