-- CreateEnum
CREATE TYPE "PracticeKind" AS ENUM ('SELF_TEST', 'MOCK_EXAM', 'DAILY_CHALLENGE', 'BANK');

-- CreateEnum
CREATE TYPE "PracticeDifficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD', 'CHALLENGE');

-- CreateTable
CREATE TABLE "PracticeAttempt" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "kind" "PracticeKind" NOT NULL,
    "subjectId" TEXT,
    "month" INTEGER,
    "difficulty" "PracticeDifficulty",
    "score" INTEGER NOT NULL,
    "maxScore" INTEGER NOT NULL DEFAULT 20,
    "correctCount" INTEGER NOT NULL,
    "totalQuestions" INTEGER NOT NULL,
    "durationSec" INTEGER,
    "challengeDay" TEXT,
    "reviewLessonIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PracticeAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PracticeAttempt_studentId_createdAt_idx" ON "PracticeAttempt"("studentId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "PracticeAttempt_studentId_subjectId_createdAt_idx" ON "PracticeAttempt"("studentId", "subjectId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "PracticeAttempt_studentId_kind_challengeDay_idx" ON "PracticeAttempt"("studentId", "kind", "challengeDay");

-- CreateIndex
CREATE INDEX "PracticeAttempt_subjectId_idx" ON "PracticeAttempt"("subjectId");

-- AddForeignKey
ALTER TABLE "PracticeAttempt" ADD CONSTRAINT "PracticeAttempt_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PracticeAttempt" ADD CONSTRAINT "PracticeAttempt_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE SET NULL ON UPDATE CASCADE;
