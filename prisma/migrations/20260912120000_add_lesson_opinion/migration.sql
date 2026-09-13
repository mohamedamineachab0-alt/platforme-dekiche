-- CreateTable
CREATE TABLE "LessonOpinion" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LessonOpinion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LessonOpinion_lessonId_idx" ON "LessonOpinion"("lessonId");

-- CreateIndex
CREATE INDEX "LessonOpinion_createdAt_idx" ON "LessonOpinion"("createdAt");

-- CreateIndex
CREATE INDEX "LessonOpinion_studentId_idx" ON "LessonOpinion"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "LessonOpinion_studentId_lessonId_key" ON "LessonOpinion"("studentId", "lessonId");

-- CreateIndex
CREATE INDEX "LessonMaterial_lessonId_idx" ON "LessonMaterial"("lessonId");

-- AddForeignKey
ALTER TABLE "LessonOpinion" ADD CONSTRAINT "LessonOpinion_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonOpinion" ADD CONSTRAINT "LessonOpinion_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
