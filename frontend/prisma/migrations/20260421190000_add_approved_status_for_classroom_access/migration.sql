DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'ClassroomAccessStatus'
      AND e.enumlabel = 'APPROVED'
  ) THEN
    ALTER TYPE "ClassroomAccessStatus" ADD VALUE 'APPROVED' AFTER 'REQUESTED';
  END IF;
END $$;
