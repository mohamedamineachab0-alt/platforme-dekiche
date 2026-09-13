import { openai } from "@/lib/openai";
import { prisma } from "@/lib/prisma";
import {
  normalizeSeedExercises,
  normalizeSeedFlashcards,
  type SeedExercise,
  type SeedFlashcard,
} from "@/lib/content-bank";
import { LEVELS, STREAMS } from "@/lib/constants";
import type { Level, Stream } from "@/generated/prisma";

export const ALGERIA_CURRICULUM_SYSTEM = `أنت مفتش تربوي جزائري معتمد وخبير في المنهاج الرسمي لوزارة التربية الوطنية الجزائرية

قاعدة الدقة إلزامية
FIRST READ AND ANALYZE THE PROVIDED LESSON CONTEXT EXTREMELY CAREFULLY AND DEEPLY
اقرأ الدرس بدقة متناهية وحلله بعمق وفق المنهاج الجزائري الرسمي
Do not skim

قواعد المحتوى الصارمة
1 المحتوى يجب أن يطابق بالضبط عنوان الدرس والمادة والمستوى والشعبة في المنهاج الجزائري
2 استخدم المصطلحات والتعاريف والقوانين كما في الكتاب المدرسي الجزائري الرسمي
3 يمنع اختراع معلومات عامة أو دروس من مناهج دول أخرى
4 إن وُجد نص درس فاستخرج منه فقط وإن لم يوجد فالتزم بمحاور هذا الدرس في المنهاج الجزائري لهذا المستوى والشعبة
5 العربية الفصحى المدرسية إلا إذا كانت المادة لغة أجنبية فاستخدم لغة المادة
6 تجنب علامات الترقيم مثل النقطة والفاصلة وعلامة الاستفهام في النصوص المولدة

أرجع JSON فقط`;

function labelOf(list: { value: string; label: string }[], value: string) {
  return list.find((item) => item.value === value)?.label || value;
}

export function buildCurriculumContext(params: {
  subjectTitle: string;
  lessonTitle: string;
  gradeLevel: string;
  stream: string;
  lessonContent?: string | null;
}) {
  const levelLabel = labelOf(LEVELS, params.gradeLevel);
  const streamLabel = labelOf(STREAMS, params.stream);
  const body = (params.lessonContent || "").trim();

  return `المادة ${params.subjectTitle}
المستوى ${levelLabel} (${params.gradeLevel})
الشعبة ${streamLabel} (${params.stream})
عنوان الدرس الرسمي ${params.lessonTitle}

${
  body.length >= 80
    ? `نص الدرس للتحليل العميق
${body.slice(0, 14000)}`
    : `لا يوجد نص مرفق كامل
اعتمادا على المنهاج الجزائري الرسمي فقط أنشئ محتوى دقيقا لمحاور درس "${params.lessonTitle}" في مادة "${params.subjectTitle}" للمستوى "${levelLabel}" والشعبة "${streamLabel}" كما في مقررات وزارة التربية الوطنية`
}`;
}

async function generateBatch(params: {
  kind: "flashcards" | "exercises";
  count: number;
  subjectTitle: string;
  gradeLevel: string;
  stream: string;
  lessonTitle: string;
  lessonContent?: string | null;
}): Promise<{ flashcards: SeedFlashcard[]; exercises: SeedExercise[] }> {
  const schemaHint =
    params.kind === "flashcards"
      ? `{"flashcards":[{"frontText":"وجه السؤال","backText":"وجه الجواب"}]}`
      : `{"exercises":[{"question":"نص","options":["أ","ب","ج","د"],"correctAnswer":"أ","explanation":"سبب"}]}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.25,
    max_tokens: 3500,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: ALGERIA_CURRICULUM_SYSTEM },
      {
        role: "user",
        content: `أنشئ بالضبط ${params.count} عنصرا من نوع ${
          params.kind === "flashcards" ? "بطاقات مراجعة وحفظ" : "تمارين اختيار من متعدد"
        }

${buildCurriculumContext(params)}

الصيغة المطلوبة فقط
${schemaHint}

لكل تمرين 4 خيارات و correctAnswer يجب أن يطابق أحد options حرفيا
المحتوى يجب أن يكون دقيقا حسب المنهاج الجزائري لهذا الدرس حصرا
لا تكرر نفس الفكرة في أكثر من عنصر`,
      },
    ],
  });

  const raw = response.choices[0]?.message?.content;
  if (!raw) throw new Error("empty_openai");
  const parsed = JSON.parse(raw) as Record<string, unknown>;

  if (params.kind === "flashcards") {
    return {
      flashcards: normalizeSeedFlashcards(parsed.flashcards ?? parsed.cards ?? parsed.items),
      exercises: [],
    };
  }

  return {
    flashcards: [],
    exercises: normalizeSeedExercises(parsed.exercises ?? parsed.items),
  };
}

async function generateMany(params: {
  kind: "flashcards" | "exercises";
  target: number;
  batchSize: number;
  subjectTitle: string;
  gradeLevel: string;
  stream: string;
  lessonTitle: string;
  lessonContent?: string | null;
}) {
  const collectedFlashcards: SeedFlashcard[] = [];
  const collectedExercises: SeedExercise[] = [];
  const errors: string[] = [];

  for (let made = 0; made < params.target; ) {
    const need = Math.min(params.batchSize, params.target - made);
    try {
      const batch = await generateBatch({ ...params, count: need });
      if (params.kind === "flashcards") {
        if (batch.flashcards.length === 0) {
          errors.push(`دفعة بطاقات فارغة عند ${made}`);
          break;
        }
        collectedFlashcards.push(...batch.flashcards);
        made += batch.flashcards.length;
      } else {
        if (batch.exercises.length === 0) {
          errors.push(`دفعة تمارين فارغة عند ${made}`);
          break;
        }
        collectedExercises.push(...batch.exercises);
        made += batch.exercises.length;
      }
    } catch (err) {
      console.error("seed batch error", err);
      errors.push(`فشل دفعة ${params.kind} عند ${made}`);
      break;
    }
  }

  return { collectedFlashcards, collectedExercises, errors };
}

export type SeedLessonBankInput = {
  subjectId: string;
  subjectTitle: string;
  gradeLevel: string;
  stream: string;
  lessonTitle: string;
  lessonId?: string;
  lessonMonth?: number;
  lessonContent?: string | null;
  flashcardCount?: number;
  exerciseCount?: number;
  batchSize?: number;
  /** Also write into academy ReviewCard table for بطاقات المراجعة */
  writeReviewCards?: boolean;
  /** Skip generation when bank already has enough items */
  skipIfExists?: boolean;
};

export type SeedLessonBankResult = {
  skipped: boolean;
  reason?: string;
  flashcardsInserted: number;
  exercisesInserted: number;
  reviewCardsInserted: number;
  errors: string[];
  lessonTitle: string;
  gradeLevel: string;
  stream: string;
};

export async function seedLessonBank(
  input: SeedLessonBankInput
): Promise<SeedLessonBankResult> {
  const flashcardCount = Math.min(Math.max(input.flashcardCount ?? 50, 0), 50);
  const exerciseCount = Math.min(Math.max(input.exerciseCount ?? 50, 0), 50);
  const batchSize = Math.min(Math.max(input.batchSize ?? 10, 5), 15);
  const writeReviewCards = input.writeReviewCards !== false;
  const skipIfExists = input.skipIfExists !== false;

  if (flashcardCount === 0 && exerciseCount === 0) {
    return {
      skipped: true,
      reason: "لا يوجد عدد للتوليد",
      flashcardsInserted: 0,
      exercisesInserted: 0,
      reviewCardsInserted: 0,
      errors: [],
      lessonTitle: input.lessonTitle,
      gradeLevel: input.gradeLevel,
      stream: input.stream,
    };
  }

  if (skipIfExists) {
    const [existingFlash, existingQuest] = await Promise.all([
      flashcardCount > 0
        ? prisma.flashcard.count({
            where: {
              gradeLevel: input.gradeLevel,
              stream: input.stream,
              lessonTitle: input.lessonTitle,
            },
          })
        : Promise.resolve(Number.POSITIVE_INFINITY),
      exerciseCount > 0
        ? prisma.questExercise.count({
            where: {
              gradeLevel: input.gradeLevel,
              stream: input.stream,
              lessonTitle: input.lessonTitle,
            },
          })
        : Promise.resolve(Number.POSITIVE_INFINITY),
    ]);
    const flashOk = flashcardCount === 0 || existingFlash >= flashcardCount;
    const questOk = exerciseCount === 0 || existingQuest >= exerciseCount;
    if (flashOk && questOk) {
      return {
        skipped: true,
        reason: "البنك موجود مسبقا لهذا الدرس والمستوى والشعبة",
        flashcardsInserted: 0,
        exercisesInserted: 0,
        reviewCardsInserted: 0,
        errors: [],
        lessonTitle: input.lessonTitle,
        gradeLevel: input.gradeLevel,
        stream: input.stream,
      };
    }

    // Only generate the missing half (avoid duplicating flashcards when quests are empty)
    if (flashOk) {
      input = { ...input, flashcardCount: 0, writeReviewCards: false };
    }
    if (questOk) {
      input = { ...input, exerciseCount: 0 };
    }
  }

  const flashcardCountFinal = Math.min(Math.max(input.flashcardCount ?? 0, 0), 50);
  const exerciseCountFinal = Math.min(Math.max(input.exerciseCount ?? 0, 0), 50);
  const writeReviewCardsFinal = input.writeReviewCards !== false;

  const errors: string[] = [];
  let flashcardsInserted = 0;
  let exercisesInserted = 0;
  let reviewCardsInserted = 0;

  if (flashcardCountFinal > 0) {
    const flashResult = await generateMany({
      kind: "flashcards",
      target: flashcardCountFinal,
      batchSize,
      subjectTitle: input.subjectTitle,
      gradeLevel: input.gradeLevel,
      stream: input.stream,
      lessonTitle: input.lessonTitle,
      lessonContent: input.lessonContent,
    });
    errors.push(...flashResult.errors);

    if (flashResult.collectedFlashcards.length > 0) {
      const created = await prisma.flashcard.createMany({
        data: flashResult.collectedFlashcards.map((c) => ({
          subjectId: input.subjectId,
          lessonId: input.lessonId || null,
          gradeLevel: input.gradeLevel,
          stream: input.stream,
          lessonTitle: input.lessonTitle,
          frontText: c.frontText,
          backText: c.backText,
        })),
      });
      flashcardsInserted = created.count;

      if (writeReviewCardsFinal) {
        const month = Math.min(Math.max(input.lessonMonth || 1, 1), 12);
        const reviewData = flashResult.collectedFlashcards.map((c, index) => ({
          title: input.lessonTitle,
          question: c.frontText,
          answer: c.backText,
          subjectId: input.subjectId,
          level: input.gradeLevel as Level,
          stream: input.stream as Stream,
          month,
          exerciseRef: input.lessonId
            ? `lesson:${input.lessonId}:${index + 1}`
            : `lesson-title:${input.lessonTitle}:${index + 1}`,
        }));
        const reviewCreated = await prisma.reviewCard.createMany({ data: reviewData });
        reviewCardsInserted = reviewCreated.count;
      }
    }
  }

  if (exerciseCountFinal > 0) {
    const exerciseResult = await generateMany({
      kind: "exercises",
      target: exerciseCountFinal,
      batchSize,
      subjectTitle: input.subjectTitle,
      gradeLevel: input.gradeLevel,
      stream: input.stream,
      lessonTitle: input.lessonTitle,
      lessonContent: input.lessonContent,
    });
    errors.push(...exerciseResult.errors);

    if (exerciseResult.collectedExercises.length > 0) {
      const created = await prisma.questExercise.createMany({
        data: exerciseResult.collectedExercises.map((e) => ({
          subjectId: input.subjectId,
          lessonId: input.lessonId || null,
          gradeLevel: input.gradeLevel,
          stream: input.stream,
          lessonTitle: input.lessonTitle,
          question: e.question,
          options: e.options,
          correctAnswer: e.correctAnswer,
          explanation: e.explanation,
        })),
      });
      exercisesInserted = created.count;
    }
  }

  return {
    skipped: false,
    flashcardsInserted,
    exercisesInserted,
    reviewCardsInserted,
    errors,
    lessonTitle: input.lessonTitle,
    gradeLevel: input.gradeLevel,
    stream: input.stream,
  };
}

export function resolveLessonAudience(lesson: {
  levels: Level[];
  streams: Stream[];
  subject: {
    level: Level;
    stream: Stream;
    levels: Level[];
    streams: Stream[];
  };
}) {
  const levels =
    lesson.levels.length > 0
      ? lesson.levels
      : lesson.subject.levels.length > 0
        ? lesson.subject.levels
        : [lesson.subject.level];
  const streams =
    lesson.streams.length > 0
      ? lesson.streams
      : lesson.subject.streams.length > 0
        ? lesson.subject.streams
        : [lesson.subject.stream];
  return { levels, streams };
}
