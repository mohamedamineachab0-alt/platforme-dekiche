-- Separate study vs languages accounts for the same phone number
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "accountBranch" "PlatformBranch" NOT NULL DEFAULT 'STUDY';

UPDATE "User" AS u
SET "accountBranch" = sp.branch
FROM "StudentProfile" AS sp
WHERE sp."userId" = u.id;

ALTER TABLE "User" DROP CONSTRAINT IF EXISTS "User_phoneNumber_key";
DROP INDEX IF EXISTS "User_phoneNumber_key";

CREATE UNIQUE INDEX IF NOT EXISTS "User_phoneNumber_accountBranch_key"
  ON "User"("phoneNumber", "accountBranch");

CREATE INDEX IF NOT EXISTS "User_accountBranch_phoneNumber_idx"
  ON "User"("accountBranch", "phoneNumber");
