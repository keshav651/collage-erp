-- CreateEnum
CREATE TYPE "UnitTestMarkStatus" AS ENUM ('PENDING', 'PRESENT', 'ABSENT');

-- CreateTable
CREATE TABLE "UnitTestCycle" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "academicYear" TEXT NOT NULL,
    "startTestNumber" INTEGER NOT NULL,
    "endTestNumber" INTEGER NOT NULL,
    "marksEntryDeadline" TIMESTAMP(3) NOT NULL,
    "correctionDeadline" TIMESTAMP(3),
    "correctionReason" TEXT,
    "createdByUserId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "semesterId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UnitTestCycle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UnitTest" (
    "id" TEXT NOT NULL,
    "cycleId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "testNumber" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "maxMarks" DOUBLE PRECISION NOT NULL,
    "testDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UnitTest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UnitTestMark" (
    "id" TEXT NOT NULL,
    "unitTestId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "status" "UnitTestMarkStatus" NOT NULL DEFAULT 'PENDING',
    "obtainedMarks" DOUBLE PRECISION,
    "enteredById" TEXT,
    "enteredAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UnitTestMark_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UnitTestCycle_branchId_semesterId_academicYear_idx" ON "UnitTestCycle"("branchId", "semesterId", "academicYear");

-- CreateIndex
CREATE INDEX "UnitTestCycle_marksEntryDeadline_idx" ON "UnitTestCycle"("marksEntryDeadline");

-- CreateIndex
CREATE INDEX "UnitTest_subjectId_testDate_idx" ON "UnitTest"("subjectId", "testDate");

-- CreateIndex
CREATE UNIQUE INDEX "UnitTest_cycleId_subjectId_testNumber_key" ON "UnitTest"("cycleId", "subjectId", "testNumber");

-- CreateIndex
CREATE INDEX "UnitTestMark_studentId_idx" ON "UnitTestMark"("studentId");

-- CreateIndex
CREATE INDEX "UnitTestMark_enteredById_idx" ON "UnitTestMark"("enteredById");

-- CreateIndex
CREATE UNIQUE INDEX "UnitTestMark_unitTestId_studentId_key" ON "UnitTestMark"("unitTestId", "studentId");

-- AddForeignKey
ALTER TABLE "UnitTestCycle" ADD CONSTRAINT "UnitTestCycle_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnitTestCycle" ADD CONSTRAINT "UnitTestCycle_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnitTestCycle" ADD CONSTRAINT "UnitTestCycle_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "Semester"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnitTest" ADD CONSTRAINT "UnitTest_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "UnitTestCycle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnitTest" ADD CONSTRAINT "UnitTest_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnitTestMark" ADD CONSTRAINT "UnitTestMark_unitTestId_fkey" FOREIGN KEY ("unitTestId") REFERENCES "UnitTest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnitTestMark" ADD CONSTRAINT "UnitTestMark_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnitTestMark" ADD CONSTRAINT "UnitTestMark_enteredById_fkey" FOREIGN KEY ("enteredById") REFERENCES "TeacherProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
