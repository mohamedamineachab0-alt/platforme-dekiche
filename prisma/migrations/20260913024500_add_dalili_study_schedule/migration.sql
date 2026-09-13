-- Dalili profile + weekly AI study schedule
CREATE TABLE IF NOT EXISTS "DaliliProfile" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "DaliliProfile_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "DaliliProfile_userId_key" ON "DaliliProfile"("userId");

CREATE TABLE IF NOT EXISTS "StudySchedule" (
  "id" TEXT NOT NULL,
  "daliliProfileId" TEXT NOT NULL,
  "plan" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "StudySchedule_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "StudySchedule_daliliProfileId_key" ON "StudySchedule"("daliliProfileId");
CREATE INDEX IF NOT EXISTS "StudySchedule_daliliProfileId_idx" ON "StudySchedule"("daliliProfileId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'DaliliProfile_userId_fkey'
  ) THEN
    ALTER TABLE "DaliliProfile"
      ADD CONSTRAINT "DaliliProfile_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'StudySchedule_daliliProfileId_fkey'
  ) THEN
    ALTER TABLE "StudySchedule"
      ADD CONSTRAINT "StudySchedule_daliliProfileId_fkey"
      FOREIGN KEY ("daliliProfileId") REFERENCES "DaliliProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
