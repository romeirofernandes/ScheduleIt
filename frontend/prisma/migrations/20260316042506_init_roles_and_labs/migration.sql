-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'STUDENT');

-- CreateEnum
CREATE TYPE "StudentClass" AS ENUM ('FE', 'SE', 'TE', 'BE');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'STUDENT',
ADD COLUMN     "studentClass" "StudentClass";

-- CreateTable
CREATE TABLE "LabAllocation" (
    "id" TEXT NOT NULL,
    "targetClass" "StudentClass" NOT NULL,
    "subject" TEXT NOT NULL,
    "labName" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "timeRange" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LabAllocation_pkey" PRIMARY KEY ("id")
);
