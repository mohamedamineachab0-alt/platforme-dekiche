import type { PracticeDifficulty, PracticeKind } from "@/generated/prisma";

export type PracticeQuestion = {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  hint1?: string;
  hint2?: string;
  explanation?: string;
  lessonId?: string | null;
  lessonTitle?: string;
  subjectId?: string | null;
  subjectTitle?: string;
  quizId?: string | null;
  difficulty?: PracticeDifficulty;
};

export const PRACTICE_KIND_LABEL: Record<PracticeKind, string> = {
  SELF_TEST: "اختبر نفسك",
  MOCK_EXAM: "امتحان تجريبي",
  DAILY_CHALLENGE: "تحدي اليوم",
  BANK: "بنك التمارين",
};

export const DIFFICULTY_LABEL: Record<PracticeDifficulty, string> = {
  EASY: "سهل",
  MEDIUM: "متوسط",
  HARD: "صعب",
  CHALLENGE: "تحدي",
};

export function algeriaDay(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Algiers",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function parseQuizQuestions(raw: unknown): PracticeQuestion[] {
  let list: unknown[] = [];
  try {
    list = typeof raw === "string" ? JSON.parse(raw) : Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }

  return list
    .map((item) => {
      const q = item as Record<string, unknown>;
      const question = String(q?.question || "").trim();
      const options = Array.isArray(q?.options) ? q.options.map((o) => String(o)) : [];
      const correctAnswerIndex =
        typeof q?.correctAnswerIndex === "number" && q.correctAnswerIndex >= 0 && q.correctAnswerIndex < options.length
          ? q.correctAnswerIndex
          : 0;
      if (!question || options.length < 2) return null;
      return {
        question,
        options,
        correctAnswerIndex,
        hint1: typeof q.hint1 === "string" ? q.hint1 : undefined,
        hint2: typeof q.hint2 === "string" ? q.hint2 : undefined,
        explanation: typeof q.explanation === "string" ? q.explanation : undefined,
        lessonId: typeof q.lessonId === "string" ? q.lessonId : null,
        lessonTitle: typeof q.lessonTitle === "string" ? q.lessonTitle : undefined,
        subjectId: typeof q.subjectId === "string" ? q.subjectId : null,
        subjectTitle: typeof q.subjectTitle === "string" ? q.subjectTitle : undefined,
        quizId: typeof q.quizId === "string" ? q.quizId : null,
      } satisfies PracticeQuestion;
    })
    .filter((q): q is PracticeQuestion => q !== null);
}

export function scoreOn20(correctCount: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((correctCount / total) * 20);
}

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Convert QuestExercise MCQs into practice questions */
export function questExercisesToQuestions(
  items: {
    question: string;
    options: string[];
    correctAnswer: string;
    explanation?: string;
    lessonId?: string | null;
    lessonTitle?: string;
    subjectId?: string | null;
  }[],
  limit = 10
): PracticeQuestion[] {
  return shuffle(items)
    .slice(0, limit)
    .map((item) => {
      let options = shuffle([...new Set(item.options.map((o) => String(o).trim()).filter(Boolean))]);
      const correct = String(item.correctAnswer).trim();
      if (!options.includes(correct)) options = [...options, correct];
      options = options.slice(0, 4);
      while (options.length < 2) options.push(`خيار ${options.length + 1}`);
      options = shuffle(options);
      return {
        question: item.question,
        options,
        correctAnswerIndex: Math.max(0, options.indexOf(correct)),
        explanation: item.explanation,
        lessonId: item.lessonId ?? null,
        lessonTitle: item.lessonTitle,
        subjectId: item.subjectId ?? null,
      } satisfies PracticeQuestion;
    });
}

/** Build MCQ quiz from review cards using other answers as distractors */
export function reviewCardsToQuestions(
  cards: {
    question: string;
    answer: string;
    subjectId?: string | null;
  }[],
  limit = 10
): PracticeQuestion[] {
  if (cards.length === 0) return [];
  const pool = shuffle(cards).slice(0, Math.min(limit, cards.length));
  const allAnswers = [...new Set(cards.map((c) => c.answer.trim()).filter(Boolean))];

  return pool
    .map((card) => {
      const correct = card.answer.trim();
      if (!correct || !card.question.trim()) return null;
      const distractors = shuffle(allAnswers.filter((a) => a !== correct)).slice(0, 3);
      let options = shuffle([correct, ...distractors]);
      while (options.length < 2) options.push(`خيار ${options.length + 1}`);
      return {
        question: card.question.trim(),
        options,
        correctAnswerIndex: Math.max(0, options.indexOf(correct)),
        subjectId: card.subjectId ?? null,
      } satisfies PracticeQuestion;
    })
    .filter((q): q is PracticeQuestion => q !== null);
}

export function levelStatus(score: number | null): "good" | "warn" | "low" | "empty" {
  if (score === null) return "empty";
  if (score >= 14) return "good";
  if (score >= 11) return "warn";
  return "low";
}

export function sanitizeGeneratedQuestions(
  raw: unknown,
  count: number,
  lessons: { id: string; title: string; subjectId: string; subjectTitle: string }[]
): PracticeQuestion[] {
  const parsed = parseQuizQuestions(
    raw && typeof raw === "object" && raw !== null && "questions" in raw
      ? (raw as { questions: unknown }).questions
      : raw
  );

  return parsed.slice(0, count).map((q) => {
    const match =
      lessons.find((l) => l.title === q.lessonTitle) ||
      lessons.find((l) => q.lessonTitle && l.title.includes(q.lessonTitle)) ||
      lessons[0];
    const options = q.options.slice(0, 4);
    while (options.length < 4) options.push(`خيار ${options.length + 1}`);
    return {
      ...q,
      options,
      correctAnswerIndex: Math.min(Math.max(q.correctAnswerIndex, 0), options.length - 1),
      lessonId: match?.id ?? q.lessonId ?? null,
      lessonTitle: match?.title ?? q.lessonTitle,
      subjectId: match?.subjectId ?? q.subjectId ?? null,
      subjectTitle: match?.subjectTitle ?? q.subjectTitle,
    };
  });
}
