/**
 * Bulk-seed review/flash cards for every published academy lesson.
 *
 * Usage:
 *   SEED_FLASHCARD_COUNT=50 SEED_EXERCISE_COUNT=0 npx tsx scripts/seed-all-lesson-banks.ts
 */
import { config } from "dotenv";
config({ path: ".env.local" });
config();

async function main() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY missing");
  }

  const { prisma } = await import("../lib/prisma");
  const {
    resolveLessonAudience,
    seedLessonBank,
  } = await import("../lib/academy/seed-lesson-bank");

  const FLASHCARD_COUNT = Number(process.env.SEED_FLASHCARD_COUNT || 50);
  const EXERCISE_COUNT = Number(process.env.SEED_EXERCISE_COUNT || 0);
  const LIMIT = process.env.SEED_LIMIT ? Number(process.env.SEED_LIMIT) : undefined;
  const ONLY_LEVEL = process.env.SEED_LEVEL?.trim() || "";
  const ONLY_STREAM = process.env.SEED_STREAM?.trim() || "";

  const lessons = await prisma.lesson.findMany({
    where: { isPublished: true },
    select: {
      id: true,
      title: true,
      month: true,
      description: true,
      subjectId: true,
      levels: true,
      streams: true,
      subject: {
        select: {
          title: true,
          level: true,
          stream: true,
          levels: true,
          streams: true,
        },
      },
    },
    orderBy: [{ subject: { title: "asc" } }, { title: "asc" }],
  });

  type Job = {
    lessonId: string;
    lessonTitle: string;
    subjectId: string;
    subjectTitle: string;
    gradeLevel: string;
    stream: string;
    month: number;
    description: string | null;
  };

  const jobs: Job[] = [];
  for (const lesson of lessons) {
    const audience = resolveLessonAudience(lesson);
    for (const gradeLevel of audience.levels) {
      if (ONLY_LEVEL && gradeLevel !== ONLY_LEVEL) continue;
      for (const stream of audience.streams) {
        if (ONLY_STREAM && stream !== ONLY_STREAM) continue;
        jobs.push({
          lessonId: lesson.id,
          lessonTitle: lesson.title,
          subjectId: lesson.subjectId,
          subjectTitle: lesson.subject.title,
          gradeLevel,
          stream,
          month: lesson.month,
          description: lesson.description,
        });
      }
    }
  }

  const queue = typeof LIMIT === "number" && LIMIT > 0 ? jobs.slice(0, LIMIT) : jobs;

  console.log(
    `Jobs: ${queue.length} (from ${lessons.length} lessons) | cards=${FLASHCARD_COUNT} exercises=${EXERCISE_COUNT}`
  );

  let success = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < queue.length; i += 1) {
    const job = queue[i];
    const label = `[${i + 1}/${queue.length}] ${job.subjectTitle} | ${job.lessonTitle} | ${job.gradeLevel}/${job.stream}`;
    process.stdout.write(`${label} ... `);
    try {
      const result = await seedLessonBank({
        subjectId: job.subjectId,
        subjectTitle: job.subjectTitle,
        gradeLevel: job.gradeLevel,
        stream: job.stream,
        lessonTitle: job.lessonTitle,
        lessonId: job.lessonId,
        lessonMonth: job.month,
        lessonContent: job.description,
        flashcardCount: FLASHCARD_COUNT,
        exerciseCount: EXERCISE_COUNT,
        batchSize: 10,
        skipIfExists: true,
        writeReviewCards: true,
      });
      if (result.skipped) {
        skipped += 1;
        console.log(`SKIP ${result.reason || ""}`);
      } else {
        success += 1;
        console.log(
          `OK flash=${result.flashcardsInserted} review=${result.reviewCardsInserted} quest=${result.exercisesInserted}` +
            (result.errors.length ? ` warnings=${result.errors.length}` : "")
        );
      }
    } catch (err) {
      failed += 1;
      console.log(`FAIL ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  console.log(`\nDone. success=${success} skipped=${skipped} failed=${failed}`);
  await prisma.$disconnect().catch(() => undefined);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
