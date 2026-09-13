-- Lazy generation cache key: lessonId on flashcards and quest exercises
ALTER TABLE "Flashcard" ADD COLUMN IF NOT EXISTS "lessonId" TEXT;
ALTER TABLE "DaliliDailyExercise" ADD COLUMN IF NOT EXISTS "lessonId" TEXT;

CREATE INDEX IF NOT EXISTS "Flashcard_lessonId_gradeLevel_stream_idx"
  ON "Flashcard"("lessonId", "gradeLevel", "stream");
CREATE INDEX IF NOT EXISTS "DaliliDailyExercise_lessonId_gradeLevel_stream_idx"
  ON "DaliliDailyExercise"("lessonId", "gradeLevel", "stream");
