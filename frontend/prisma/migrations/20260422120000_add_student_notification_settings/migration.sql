-- Add student notification preference fields
ALTER TABLE "User"
ADD COLUMN IF NOT EXISTS "notificationEmail" TEXT,
ADD COLUMN IF NOT EXISTS "notificationEnabled" BOOLEAN NOT NULL DEFAULT true;
