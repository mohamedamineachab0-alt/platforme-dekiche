-- Which landing branch the student registered from.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PlatformBranch') THEN
    CREATE TYPE "PlatformBranch" AS ENUM (
      'STUDY',
      'SMART_TEACHER',
      'LANGUAGES',
      'SOROBAN',
      'QURAN',
      'ISLAMIC',
      'TRAINING'
    );
  END IF;
END $$;

ALTER TABLE "StudentProfile"
ADD COLUMN IF NOT EXISTS "branch" "PlatformBranch" NOT NULL DEFAULT 'STUDY';
