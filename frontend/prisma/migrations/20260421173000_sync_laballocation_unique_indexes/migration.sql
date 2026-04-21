-- Reconcile migration history with existing database state.
-- These indexes already exist in the dev database, so use IF NOT EXISTS to avoid failures.

CREATE UNIQUE INDEX IF NOT EXISTS "lab_time_conflict"
ON "LabAllocation"("labName", "day", "timeRange");

CREATE UNIQUE INDEX IF NOT EXISTS "class_time_conflict"
ON "LabAllocation"("targetClass", "day", "timeRange");
