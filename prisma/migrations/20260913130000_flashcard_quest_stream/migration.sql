-- Add stream column and re-key indexes for lesson + level + stream lookups

ALTER TABLE "Flashcard" ADD COLUMN IF NOT EXISTS "stream" TEXT NOT NULL DEFAULT '';

DROP INDEX IF EXISTS "Flashcard_subjectId_gradeLevel_idx";
DROP INDEX IF EXISTS "Flashcard_subjectId_gradeLevel_lessonTitle_idx";

CREATE INDEX IF NOT EXISTS "Flashcard_gradeLevel_stream_lessonTitle_idx"
  ON "Flashcard"("gradeLevel", "stream", "lessonTitle");
CREATE INDEX IF NOT EXISTS "Flashcard_subjectId_gradeLevel_stream_idx"
  ON "Flashcard"("subjectId", "gradeLevel", "stream");

ALTER TABLE "DaliliDailyExercise" ADD COLUMN IF NOT EXISTS "stream" TEXT NOT NULL DEFAULT '';

DROP INDEX IF EXISTS "DaliliDailyExercise_subjectId_gradeLevel_idx";
DROP INDEX IF EXISTS "DaliliDailyExercise_subjectId_gradeLevel_lessonTitle_idx";

CREATE INDEX IF NOT EXISTS "DaliliDailyExercise_gradeLevel_stream_lessonTitle_idx"
  ON "DaliliDailyExercise"("gradeLevel", "stream", "lessonTitle");
CREATE INDEX IF NOT EXISTS "DaliliDailyExercise_subjectId_gradeLevel_stream_idx"
  ON "DaliliDailyExercise"("subjectId", "gradeLevel", "stream");
