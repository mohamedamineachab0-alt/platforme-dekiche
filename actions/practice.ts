"use server";

import { prisma } from "@/lib/prisma";
import { assertAuth } from "@/lib/security";
import { algeriaDay, levelStatus, parseQuizQuestions, type PracticeQuestion } from "@/lib/practice";
import { subjectAudienceWhere } from "@/lib/constants";
import type { PracticeDifficulty, PracticeKind } from "@/generated/prisma";

export type EnrolledSubjectOption = {
  id: string;
  title: string;
  image: string | null;
  months: number[];
  lessons: {
    id: string;
    title: string;
    month: number;
    hasQuiz: boolean;
    hasMaterials: boolean;
  }[];
};

export type SubjectLevelRow = {
  subjectId: string;
  title: string;
  score: number | null;
  status: "good" | "warn" | "low" | "empty";
  reviewLessons: { id: string; title: string }[];
};

const ALL_MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

function isFreeSubject(price?: number | null) {
  return !price || price === 0;
}

function isActiveEnrollment(enrollment: {
  validUntil: Date | null;
  enrolledMonths: number[];
}) {
  if (enrollment.validUntil && enrollment.validUntil < new Date()) return false;
  return enrollment.enrolledMonths.length > 0;
}

function practiceStore() {
  const store = (prisma as { practiceAttempt?: typeof prisma.practiceAttempt }).practiceAttempt;
  return store ?? null;
}

const lessonSelect = {
  id: true,
  title: true,
  month: true,
  materials: { select: { id: true } },
  quiz: { select: { questions: true } },
} as const;

function toCatalogItem(
  subject: {
    id: string;
    title: string;
    image: string | null;
    lessons: {
      id: string;
      title: string;
      month: number;
      materials: { id: string }[];
      quiz: { questions: unknown } | null;
    }[];
  },
  months: number[]
): EnrolledSubjectOption {
  return {
    id: subject.id,
    title: subject.title,
    image: subject.image,
    months,
    lessons: subject.lessons
      .filter((l) => months.includes(l.month))
      .map((l) => ({
        id: l.id,
        title: l.title,
        month: l.month,
        hasQuiz: Array.isArray(l.quiz?.questions) && (l.quiz?.questions as unknown[]).length > 0,
        hasMaterials: l.materials.length > 0,
      })),
  };
}

export async function getEnrolledPracticeCatalog(): Promise<{
  subjects: EnrolledSubjectOption[];
  error?: string;
}> {
  const user = await assertAuth({ requireRole: "STUDENT" });

  const profile = await prisma.studentProfile.findUnique({
    where: { userId: user.id },
    select: { level: true, stream: true },
  });

  const [enrollments, freeSubjects] = await Promise.all([
    prisma.enrollment.findMany({
      where: { studentId: user.id },
      include: {
        subject: {
          select: {
            id: true,
            title: true,
            image: true,
            isPublished: true,
            price: true,
            lessons: {
              where: { isPublished: true },
              select: lessonSelect,
              orderBy: [{ month: "asc" }, { createdAt: "asc" }],
            },
          },
        },
      },
    }),
    profile
      ? prisma.subject.findMany({
          where: {
            isPublished: true,
            price: 0,
            ...subjectAudienceWhere(profile.level, profile.stream),
          },
          select: {
            id: true,
            title: true,
            image: true,
            price: true,
            lessons: {
              where: { isPublished: true },
              select: lessonSelect,
              orderBy: [{ month: "asc" }, { createdAt: "asc" }],
            },
          },
        })
      : Promise.resolve([]),
  ]);

  const byId = new Map<string, EnrolledSubjectOption>();

  for (const e of enrollments) {
    if (!e.subject.isPublished) continue;
    if (!isFreeSubject(e.subject.price) && !isActiveEnrollment(e)) continue;
    byId.set(
      e.subject.id,
      toCatalogItem(e.subject, isFreeSubject(e.subject.price) ? ALL_MONTHS : e.enrolledMonths)
    );
  }

  for (const subject of freeSubjects) {
    if (byId.has(subject.id)) continue;
    byId.set(subject.id, toCatalogItem(subject, ALL_MONTHS));
  }

  return { subjects: [...byId.values()] };
}

export async function assertEnrolledSubjectAccess(subjectId: string, month?: number) {
  const user = await assertAuth({ requireRole: "STUDENT" });
  let enrollment = await prisma.enrollment.findUnique({
    where: {
      studentId_subjectId: {
        studentId: user.id,
        subjectId,
      },
    },
    include: {
      subject: { select: { id: true, title: true, isPublished: true, price: true } },
    },
  });

  if (!enrollment) {
    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
      select: { id: true, title: true, isPublished: true, price: true },
    });
    if (subject?.isPublished && isFreeSubject(subject.price)) {
      enrollment = await prisma.enrollment.upsert({
        where: {
          studentId_subjectId: {
            studentId: user.id,
            subjectId,
          },
        },
        create: {
          studentId: user.id,
          subjectId,
          enrolledMonths: ALL_MONTHS,
        },
        update: {},
        include: {
          subject: { select: { id: true, title: true, isPublished: true, price: true } },
        },
      });
    }
  }

  if (!enrollment || !enrollment.subject.isPublished) {
    return { ok: false as const, error: "هذه المادة غير متاحة" };
  }

  const free = isFreeSubject(enrollment.subject.price);
  if (!free && !isActiveEnrollment(enrollment)) {
    return { ok: false as const, error: "هذه المادة غير مفعّلة في اشتراكك" };
  }

  const months = free ? ALL_MONTHS : enrollment.enrolledMonths;
  if (month !== undefined && !months.includes(month)) {
    return { ok: false as const, error: "هذه الوحدة غير متاحة في اشتراكك" };
  }

  return {
    ok: true as const,
    userId: user.id,
    enrollment: { ...enrollment, enrolledMonths: months },
    subject: enrollment.subject,
  };
}

export async function savePracticeAttempt(input: {
  kind: PracticeKind;
  subjectId?: string | null;
  month?: number | null;
  difficulty?: PracticeDifficulty | null;
  correctCount: number;
  totalQuestions: number;
  score: number;
  durationSec?: number;
  reviewLessonIds?: string[];
  challengeDay?: string | null;
}) {
  const user = await assertAuth({ requireRole: "STUDENT" });

  const store = practiceStore();
  if (!store) {
    return { success: false, official: false };
  }

  try {
  if (input.kind === "DAILY_CHALLENGE") {
    const day = input.challengeDay || algeriaDay();
    const existing = await store.findFirst({
      where: {
        studentId: user.id,
        kind: "DAILY_CHALLENGE",
        challengeDay: day,
      },
      select: { id: true, score: true },
    });
    if (existing) {
      return { success: true, official: false, attemptId: existing.id };
    }
  }

  const attempt = await store.create({
    data: {
      studentId: user.id,
      kind: input.kind,
      subjectId: input.subjectId || null,
      month: input.month ?? null,
      difficulty: input.difficulty ?? null,
      score: input.score,
      maxScore: 20,
      correctCount: input.correctCount,
      totalQuestions: input.totalQuestions,
      durationSec: input.durationSec,
      challengeDay: input.kind === "DAILY_CHALLENGE" ? input.challengeDay || algeriaDay() : null,
      reviewLessonIds: input.reviewLessonIds || [],
    },
    select: { id: true },
  });

  return { success: true, official: true, attemptId: attempt.id };
  } catch (error) {
    console.error("savePracticeAttempt:", error);
    return { success: false, official: false };
  }
}

export async function getSubjectLevels(): Promise<{
  rows: SubjectLevelRow[];
  suggested: { id: string; title: string; subjectTitle: string }[];
}> {
  const user = await assertAuth({ requireRole: "STUDENT" });
  const catalog = await getEnrolledPracticeCatalog();

  let attempts: { subjectId: string | null; score: number; reviewLessonIds: string[] }[] = [];
  const store = practiceStore();
  try {
    if (store) {
    attempts = await store.findMany({
      where: { studentId: user.id },
      orderBy: { createdAt: "desc" },
      take: 80,
      select: {
        subjectId: true,
        score: true,
        reviewLessonIds: true,
      },
    });
    }
  } catch (error) {
    console.error("getSubjectLevels attempts:", error);
  }

  const latestBySubject = new Map<string, { score: number; reviewLessonIds: string[] }>();
  for (const attempt of attempts) {
    if (!attempt.subjectId || latestBySubject.has(attempt.subjectId)) continue;
    latestBySubject.set(attempt.subjectId, {
      score: attempt.score,
      reviewLessonIds: attempt.reviewLessonIds,
    });
  }

  const reviewIds = [...new Set(attempts.flatMap((a) => a.reviewLessonIds))].slice(0, 12);
  const reviewLessons = reviewIds.length
    ? await prisma.lesson.findMany({
        where: { id: { in: reviewIds }, isPublished: true },
        select: { id: true, title: true, subject: { select: { title: true } } },
      })
    : [];

  const rows: SubjectLevelRow[] = catalog.subjects.map((subject) => {
    const latest = latestBySubject.get(subject.id);
    const score = latest?.score ?? null;
    return {
      subjectId: subject.id,
      title: subject.title,
      score,
      status: levelStatus(score),
      reviewLessons: subject.lessons
        .filter((l) => latest?.reviewLessonIds.includes(l.id))
        .slice(0, 3)
        .map((l) => ({ id: l.id, title: l.title })),
    };
  });

  const weak = rows.filter((r) => r.status === "low" || r.status === "warn");
  const suggested = reviewLessons
    .filter((l) => weak.length === 0 || rows.some((r) => r.reviewLessons.some((x) => x.id === l.id) || r.status !== "good"))
    .map((l) => ({ id: l.id, title: l.title, subjectTitle: l.subject.title }))
    .slice(0, 6);

  return { rows, suggested };
}

export async function getTodayChallenge(): Promise<{
  subject: EnrolledSubjectOption | null;
  done: { score: number; correctCount: number; totalQuestions: number } | null;
}> {
  const catalog = await getEnrolledPracticeCatalog();
  if (catalog.subjects.length === 0) {
    return { subject: null, done: null };
  }

  const user = await assertAuth({ requireRole: "STUDENT" });
  const day = algeriaDay();
  const dayIndex = Number(day.replaceAll("-", ""));
  const subject = catalog.subjects[dayIndex % catalog.subjects.length];

  let existing: { score: number; correctCount: number; totalQuestions: number } | null = null;
  const store = practiceStore();
  if (store) {
    try {
      existing = await store.findFirst({
        where: {
          studentId: user.id,
          kind: "DAILY_CHALLENGE",
          challengeDay: day,
        },
        select: { score: true, correctCount: true, totalQuestions: true },
      });
    } catch (error) {
      console.error("getTodayChallenge:", error);
    }
  }

  return {
    subject,
    done: existing,
  };
}

export async function getFallbackQuestions(input: {
  subjectId: string;
  month?: number;
  count: number;
}): Promise<PracticeQuestion[]> {
  const access = await assertEnrolledSubjectAccess(input.subjectId, input.month);
  if (!access.ok) return [];

  const lessons = await prisma.lesson.findMany({
    where: {
      subjectId: input.subjectId,
      isPublished: true,
      month: input.month ? input.month : { in: access.enrollment.enrolledMonths },
      quiz: { isNot: null },
    },
    include: {
      quiz: true,
      subject: { select: { title: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  const questions: PracticeQuestion[] = [];
  for (const lesson of lessons) {
    const parsed = (lesson.quiz?.questions ? parseQuizQuestions(lesson.quiz.questions) : []).map(
      (q) => ({
        ...q,
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        subjectId: lesson.subjectId,
        subjectTitle: lesson.subject.title,
        quizId: lesson.quiz?.id ?? null,
      })
    );
    questions.push(...parsed);
  }

  return questions.slice(0, input.count);
}
