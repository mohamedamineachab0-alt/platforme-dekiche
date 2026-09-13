-- Dalili pre-seeded flashcards + daily MCQ bank
CREATE TABLE IF NOT EXISTS "Flashcard" (
  "id" TEXT NOT NULL,
  "subjectId" TEXT NOT NULL,
  "gradeLevel" TEXT NOT NULL,
  "lessonTitle" TEXT NOT NULL,
  "frontText" TEXT NOT NULL,
  "backText" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Flashcard_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Flashcard_subjectId_gradeLevel_idx"
  ON "Flashcard"("subjectId", "gradeLevel");
CREATE INDEX IF NOT EXISTS "Flashcard_subjectId_gradeLevel_lessonTitle_idx"
  ON "Flashcard"("subjectId", "gradeLevel", "lessonTitle");

CREATE TABLE IF NOT EXISTS "DaliliDailyExercise" (
  "id" TEXT NOT NULL,
  "subjectId" TEXT NOT NULL,
  "gradeLevel" TEXT NOT NULL,
  "lessonTitle" TEXT NOT NULL,
  "question" TEXT NOT NULL,
  "options" TEXT[],
  "correctAnswer" TEXT NOT NULL,
  "explanation" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "DaliliDailyExercise_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "DaliliDailyExercise_subjectId_gradeLevel_idx"
  ON "DaliliDailyExercise"("subjectId", "gradeLevel");
CREATE INDEX IF NOT EXISTS "DaliliDailyExercise_subjectId_gradeLevel_lessonTitle_idx"
  ON "DaliliDailyExercise"("subjectId", "gradeLevel", "lessonTitle");
