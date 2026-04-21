-- CreateEnum
CREATE TYPE "TimetablePlanStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "TimetableEntryType" AS ENUM ('THEORY', 'LAB');

-- CreateTable
CREATE TABLE "TimetablePlan" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "targetClass" "StudentClass" NOT NULL,
  "status" "TimetablePlanStatus" NOT NULL DEFAULT 'DRAFT',
  "effectiveFrom" TIMESTAMP(3),
  "usedExtendedHours" BOOLEAN NOT NULL DEFAULT false,
  "createdById" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "TimetablePlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimetableRequirement" (
  "id" TEXT NOT NULL,
  "planId" TEXT NOT NULL,
  "subjectName" TEXT NOT NULL,
  "theoryHours" INTEGER NOT NULL DEFAULT 0,
  "labHours" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "TimetableRequirement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimetableEntry" (
  "id" TEXT NOT NULL,
  "planId" TEXT NOT NULL,
  "day" TEXT NOT NULL,
  "startTime" TEXT NOT NULL,
  "endTime" TEXT NOT NULL,
  "slotIndex" INTEGER NOT NULL,
  "subjectName" TEXT NOT NULL,
  "entryType" "TimetableEntryType" NOT NULL,
  "classroom" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "TimetableEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TimetablePlan_targetClass_status_effectiveFrom_idx" ON "TimetablePlan"("targetClass", "status", "effectiveFrom");

-- CreateIndex
CREATE INDEX "TimetablePlan_createdById_createdAt_idx" ON "TimetablePlan"("createdById", "createdAt");

-- CreateIndex
CREATE INDEX "TimetableRequirement_planId_idx" ON "TimetableRequirement"("planId");

-- CreateIndex
CREATE INDEX "TimetableEntry_planId_day_slotIndex_idx" ON "TimetableEntry"("planId", "day", "slotIndex");

-- AddForeignKey
ALTER TABLE "TimetablePlan"
ADD CONSTRAINT "TimetablePlan_createdById_fkey"
FOREIGN KEY ("createdById") REFERENCES "User"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimetableRequirement"
ADD CONSTRAINT "TimetableRequirement_planId_fkey"
FOREIGN KEY ("planId") REFERENCES "TimetablePlan"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimetableEntry"
ADD CONSTRAINT "TimetableEntry_planId_fkey"
FOREIGN KEY ("planId") REFERENCES "TimetablePlan"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
