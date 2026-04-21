-- Align index names with migration history to avoid drift in migrate dev.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND indexname = 'LabAllocation_labName_day_timeRange_key'
  ) AND NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND indexname = 'lab_time_conflict'
  ) THEN
    ALTER INDEX "LabAllocation_labName_day_timeRange_key" RENAME TO "lab_time_conflict";
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND indexname = 'LabAllocation_targetClass_day_timeRange_key'
  ) AND NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND indexname = 'class_time_conflict'
  ) THEN
    ALTER INDEX "LabAllocation_targetClass_day_timeRange_key" RENAME TO "class_time_conflict";
  END IF;
END $$;
