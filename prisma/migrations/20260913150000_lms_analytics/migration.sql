-- LMS analytics tracking tables
CREATE TABLE IF NOT EXISTS "WatchHistory" (
  "id" TEXT NOT NULL,
  "studentId" TEXT NOT NULL,
  "lessonId" TEXT NOT NULL,
  "subjectId" TEXT NOT NULL,
  "watchedSeconds" INTEGER NOT NULL DEFAULT 0,
  "lastWatchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "WatchHistory_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "WatchHistory_studentId_lessonId_key"
  ON "WatchHistory"("studentId", "lessonId");
CREATE INDEX IF NOT EXISTS "WatchHistory_studentId_lastWatchedAt_idx"
  ON "WatchHistory"("studentId", "lastWatchedAt" DESC);
CREATE INDEX IF NOT EXISTS "WatchHistory_subjectId_idx"
  ON "WatchHistory"("subjectId");

CREATE TABLE IF NOT EXISTS "CourseProgress" (
  "id" TEXT NOT NULL,
  "studentId" TEXT NOT NULL,
  "lessonId" TEXT NOT NULL,
  "subjectId" TEXT NOT NULL,
  "completed" BOOLEAN NOT NULL DEFAULT true,
  "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CourseProgress_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "CourseProgress_studentId_lessonId_key"
  ON "CourseProgress"("studentId", "lessonId");
CREATE INDEX IF NOT EXISTS "CourseProgress_studentId_subjectId_idx"
  ON "CourseProgress"("studentId", "subjectId");
CREATE INDEX IF NOT EXISTS "CourseProgress_studentId_completedAt_idx"
  ON "CourseProgress"("studentId", "completedAt" DESC);

CREATE TABLE IF NOT EXISTS "QuizAttempt" (
  "id" TEXT NOT NULL,
  "studentId" TEXT NOT NULL,
  "examId" TEXT,
  "subjectId" TEXT,
  "score" INTEGER NOT NULL,
  "maxScore" INTEGER NOT NULL DEFAULT 20,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "QuizAttempt_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "QuizAttempt_studentId_createdAt_idx"
  ON "QuizAttempt"("studentId", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS "QuizAttempt_examId_idx" ON "QuizAttempt"("examId");
CREATE INDEX IF NOT EXISTS "QuizAttempt_subjectId_idx" ON "QuizAttempt"("subjectId");

DO $$ BEGIN
  ALTER TABLE "WatchHistory" ADD CONSTRAINT "WatchHistory_studentId_fkey"
    FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "WatchHistory" ADD CONSTRAINT "WatchHistory_lessonId_fkey"
    FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "WatchHistory" ADD CONSTRAINT "WatchHistory_subjectId_fkey"
    FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "CourseProgress" ADD CONSTRAINT "CourseProgress_studentId_fkey"
    FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "CourseProgress" ADD CONSTRAINT "CourseProgress_lessonId_fkey"
    FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "CourseProgress" ADD CONSTRAINT "CourseProgress_subjectId_fkey"
    FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "QuizAttempt" ADD CONSTRAINT "QuizAttempt_studentId_fkey"
    FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "QuizAttempt" ADD CONSTRAINT "QuizAttempt_examId_fkey"
    FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "QuizAttempt" ADD CONSTRAINT "QuizAttempt_subjectId_fkey"
    FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
