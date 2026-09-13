import { openai } from "@/lib/openai";
import { prisma } from "@/lib/prisma";
import {
  normalizeSeedExercises,
  normalizeSeedFlashcards,
} from "@/lib/content-bank";
import {
  ALGERIA_CURRICULUM_SYSTEM,
  buildCurriculumContext,
} from "@/lib/academy/seed-lesson-bank";

const LAZY_FLASH_COUNT = 5;
const LAZY_EXERCISE_COUNT = 5;

export type LessonMaterialFlashcard = {
  id: string;
  frontText: string;
  backText: string;
};

export type LessonMaterialExercise = {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
};

export type LessonMaterialsPayload = {
  cached: boolean;
  flashcards: LessonMaterialFlashcard[];
  exercises: LessonMaterialExercise[];
};

async function generateLessonBundle(params: {
  subjectTitle: string;
  lessonTitle: string;
  gradeLevel: string;
  stream: string;
  lessonContent?: string | null;
}) {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.25,
    max_tokens: 2800,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: ALGERIA_CURRICULUM_SYSTEM },
      {
        role: "user",
        content: `أنشئ بالضبط ${LAZY_FLASH_COUNT} بطاقات حفظ و ${LAZY_EXERCISE_COUNT} تمارين اختيار من متعدد

${buildCurriculumContext(params)}

الصيغة المطلوبة فقط
{"flashcards":[{"frontText":"وجه السؤال","backText":"وجه الجواب"}],"exercises":[{"question":"نص","options":["أ","ب","ج","د"],"correctAnswer":"أ","explanation":"سبب"}]}

لكل تمرين 4 خيارات و correctAnswer يطابق أحد options حرفيا
المحتوى دقيق حسب المنهاج الجزائري لهذا الدرس حصرا`,
      },
    ],
  });

  const raw = response.choices[0]?.message?.content;
  if (!raw) throw new Error("empty_openai");
  const parsed = JSON.parse(raw) as Record<string, unknown>;
  return {
    flashcards: normalizeSeedFlashcards(parsed.flashcards ?? parsed.cards).slice(
      0,
      LAZY_FLASH_COUNT
    ),
    exercises: normalizeSeedExercises(parsed.exercises).slice(0, LAZY_EXERCISE_COUNT),
  };
}

export async function getOrGenerateLessonMaterials(params: {
  lessonId: string;
  lessonTitle: string;
  subjectId: string;
  subjectTitle: string;
  gradeLevel: string;
  stream: string;
  lessonContent?: string | null;
}): Promise<LessonMaterialsPayload> {
  const { lessonId, gradeLevel, stream } = params;

  const [existingFlashcards, existingExercises] = await Promise.all([
    prisma.flashcard.findMany({
      where: { lessonId, gradeLevel, stream },
      orderBy: { createdAt: "asc" },
      take: 20,
      select: { id: true, frontText: true, backText: true },
    }),
    prisma.questExercise.findMany({
      where: { lessonId, gradeLevel, stream },
      orderBy: { createdAt: "asc" },
      take: 20,
      select: {
        id: true,
        question: true,
        options: true,
        correctAnswer: true,
        explanation: true,
      },
    }),
  ]);

  if (existingFlashcards.length > 0 && existingExercises.length > 0) {
    return {
      cached: true,
      flashcards: existingFlashcards,
      exercises: existingExercises,
    };
  }

  // Legacy bulk seed matched by title + level + stream (no lessonId yet)
  if (existingFlashcards.length === 0 || existingExercises.length === 0) {
    const [legacyFlash, legacyQuest] = await Promise.all([
      existingFlashcards.length > 0
        ? Promise.resolve(existingFlashcards)
        : prisma.flashcard.findMany({
            where: {
              gradeLevel,
              stream,
              lessonTitle: params.lessonTitle,
            },
            orderBy: { createdAt: "asc" },
            take: 20,
            select: { id: true, frontText: true, backText: true },
          }),
      existingExercises.length > 0
        ? Promise.resolve(existingExercises)
        : prisma.questExercise.findMany({
            where: {
              gradeLevel,
              stream,
              lessonTitle: params.lessonTitle,
            },
            orderBy: { createdAt: "asc" },
            take: 20,
            select: {
              id: true,
              question: true,
              options: true,
              correctAnswer: true,
              explanation: true,
            },
          }),
    ]);

    if (legacyFlash.length > 0 && legacyQuest.length > 0) {
      await Promise.all([
        prisma.flashcard.updateMany({
          where: {
            gradeLevel,
            stream,
            lessonTitle: params.lessonTitle,
            lessonId: null,
          },
          data: { lessonId },
        }),
        prisma.questExercise.updateMany({
          where: {
            gradeLevel,
            stream,
            lessonTitle: params.lessonTitle,
            lessonId: null,
          },
          data: { lessonId },
        }),
      ]);
      return {
        cached: true,
        flashcards: legacyFlash.slice(0, 10),
        exercises: legacyQuest.slice(0, 10),
      };
    }
  }

  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY_MISSING");
  }

  const generated = await generateLessonBundle({
    subjectTitle: params.subjectTitle,
    lessonTitle: params.lessonTitle,
    gradeLevel,
    stream,
    lessonContent: params.lessonContent,
  });

  if (generated.flashcards.length === 0 || generated.exercises.length === 0) {
    throw new Error("GENERATION_EMPTY");
  }

  const [flashCreate, exerciseCreate] = await Promise.all([
    existingFlashcards.length === 0
      ? prisma.flashcard.createMany({
          data: generated.flashcards.map((c) => ({
            subjectId: params.subjectId,
            lessonId,
            gradeLevel,
            stream,
            lessonTitle: params.lessonTitle,
            frontText: c.frontText,
            backText: c.backText,
          })),
        })
      : Promise.resolve(null),
    existingExercises.length === 0
      ? prisma.questExercise.createMany({
          data: generated.exercises.map((e) => ({
            subjectId: params.subjectId,
            lessonId,
            gradeLevel,
            stream,
            lessonTitle: params.lessonTitle,
            question: e.question,
            options: e.options,
            correctAnswer: e.correctAnswer,
            explanation: e.explanation,
          })),
        })
      : Promise.resolve(null),
  ]);

  void flashCreate;
  void exerciseCreate;

  const [flashcards, exercises] = await Promise.all([
    prisma.flashcard.findMany({
      where: { lessonId, gradeLevel, stream },
      orderBy: { createdAt: "asc" },
      take: 20,
      select: { id: true, frontText: true, backText: true },
    }),
    prisma.questExercise.findMany({
      where: { lessonId, gradeLevel, stream },
      orderBy: { createdAt: "asc" },
      take: 20,
      select: {
        id: true,
        question: true,
        options: true,
        correctAnswer: true,
        explanation: true,
      },
    }),
  ]);

  return {
    cached: false,
    flashcards,
    exercises,
  };
}
