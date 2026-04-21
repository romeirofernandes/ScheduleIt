-- AlterEnum: Add new values to the Role enum
-- PostgreSQL requires creating a new enum and altering the column type

-- Step 1: Add new values to the existing Role enum
ALTER TYPE "Role" ADD VALUE 'SUPER_ADMIN';
ALTER TYPE "Role" ADD VALUE 'TIMETABLE_SETTER';
ALTER TYPE "Role" ADD VALUE 'CLASS_TEACHER';
ALTER TYPE "Role" ADD VALUE 'NORMAL_TEACHER';

-- Step 2: Add isCR column to User (Class Representative flag for students)
ALTER TABLE "User" ADD COLUMN "isCR" BOOLEAN NOT NULL DEFAULT false;

-- Step 3: Add assignedClass column to User (which class a CLASS_TEACHER is assigned to)
ALTER TABLE "User" ADD COLUMN "assignedClass" "StudentClass";
