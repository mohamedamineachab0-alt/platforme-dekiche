-- Expand DaliliProfile with academic adaptation fields
ALTER TABLE "DaliliProfile" ADD COLUMN IF NOT EXISTS "educationPhase" TEXT;
ALTER TABLE "DaliliProfile" ADD COLUMN IF NOT EXISTS "gradeLevel" TEXT;
ALTER TABLE "DaliliProfile" ADD COLUMN IF NOT EXISTS "branch" TEXT;
ALTER TABLE "DaliliProfile" ADD COLUMN IF NOT EXISTS "understandingLevel" TEXT;

CREATE INDEX IF NOT EXISTS "DaliliProfile_educationPhase_gradeLevel_idx"
  ON "DaliliProfile"("educationPhase", "gradeLevel");
