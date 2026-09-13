-- CreateEnum
CREATE TYPE "UnderstandingLevel" AS ENUM ('FAST', 'AVERAGE', 'WEAK');

-- AlterTable
ALTER TABLE "StudentProfile" ADD COLUMN "understandingLevel" "UnderstandingLevel";
