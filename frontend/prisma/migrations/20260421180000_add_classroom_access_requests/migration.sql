-- CreateEnum
CREATE TYPE "ClassroomAccessStatus" AS ENUM (
  'REQUESTED',
  'LOCK_PROOF_SUBMITTED',
  'LOCK_CONFIRMED',
  'LOCK_REJECTED'
);

-- CreateTable
CREATE TABLE "ClassroomAccessRequest" (
  "id" TEXT NOT NULL,
  "requestedById" TEXT NOT NULL,
  "classTeacherId" TEXT NOT NULL,
  "studentClass" "StudentClass" NOT NULL,
  "classroomName" TEXT NOT NULL,
  "requestedDate" TIMESTAMP(3) NOT NULL,
  "requestedStartTime" TEXT NOT NULL DEFAULT '15:30',
  "requestedEndTime" TEXT NOT NULL DEFAULT '18:30',
  "purpose" TEXT NOT NULL DEFAULT '',
  "status" "ClassroomAccessStatus" NOT NULL DEFAULT 'REQUESTED',
  "lockProofImageUrl" TEXT,
  "lockProofSubmittedAt" TIMESTAMP(3),
  "teacherRemarks" TEXT,
  "teacherConfirmedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ClassroomAccessRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ClassroomAccessRequest_requestedById_status_idx" ON "ClassroomAccessRequest"("requestedById", "status");

-- CreateIndex
CREATE INDEX "ClassroomAccessRequest_classTeacherId_status_idx" ON "ClassroomAccessRequest"("classTeacherId", "status");

-- AddForeignKey
ALTER TABLE "ClassroomAccessRequest"
ADD CONSTRAINT "ClassroomAccessRequest_requestedById_fkey"
FOREIGN KEY ("requestedById") REFERENCES "User"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassroomAccessRequest"
ADD CONSTRAINT "ClassroomAccessRequest_classTeacherId_fkey"
FOREIGN KEY ("classTeacherId") REFERENCES "User"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;
