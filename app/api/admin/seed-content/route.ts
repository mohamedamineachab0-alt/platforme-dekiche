import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/security";
import {
  resolveLessonAudience,
  seedLessonBank,
} from "@/lib/academy/seed-lesson-bank";
import type { Level, Stream } from "@/generated/prisma";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

async function requireAdmin() {
  const userId = await getSessionUserId();
  if (!userId) {
    return { ok: false as const, status: 401, error: "يجب تسجيل الدخول" };
  }
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  if (!user || user.role !== "ADMIN") {
    return { ok: false as const, status: 403, error: "للمشرفين فقط" };
  }
  return { ok: true as const };
}

/** List published lessons for bulk seeding (optional level/stream/subject filters). */
export async function GET(req: Request) {
  const access = await requireAdmin();
  if (!access.ok) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  const { searchParams } = new URL(req.url);
  const gradeLevel = searchParams.get("gradeLevel")?.trim() || "";
  const stream = searchParams.get("stream")?.trim() || "";
  const subjectId = searchParams.get("subjectId")?.trim() || "";

  const lessons = await prisma.lesson.findMany({
    where: {
      isPublished: true,
      ...(subjectId ? { subjectId } : {}),
    },
    select: {
      id: true,
      title: true,
      month: true,
      description: true,
      levels: true,
      streams: true,
      subjectId: true,
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

  const items = lessons
    .map((lesson) => {
      const audience = resolveLessonAudience(lesson);
      return {
        id: lesson.id,
        title: lesson.title,
        month: lesson.month,
        description: lesson.description,
        subjectId: lesson.subjectId,
        subjectTitle: lesson.subject.title,
        levels: audience.levels,
        streams: audience.streams,
      };
    })
    .filter((lesson) => {
      const levelOk = !gradeLevel || lesson.levels.includes(gradeLevel as Level);
      const streamOk = !stream || lesson.streams.includes(stream as Stream);
      return levelOk && streamOk;
    });

  return NextResponse.json({ lessons: items, total: items.length });
}

/** Seed one lesson bank (flashcards + quest exercises + review cards). */
export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "مفتاح OpenAI غير مضبوط" }, { status: 500 });
    }

    const access = await requireAdmin();
    if (!access.ok) {
      return NextResponse.json({ error: access.error }, { status: access.status });
    }

    const body = await req.json().catch(() => ({}));
    const lessonId = typeof body.lessonId === "string" ? body.lessonId.trim() : "";
    const gradeLevel = typeof body.gradeLevel === "string" ? body.gradeLevel.trim() : "";
    const stream = typeof body.stream === "string" ? body.stream.trim() : "";
    let lessonTitle =
      typeof body.lessonTitle === "string"
        ? body.lessonTitle.trim()
        : typeof body.lesson === "string"
          ? body.lesson.trim()
          : "";
    let lessonContent =
      typeof body.lessonContent === "string"
        ? body.lessonContent.trim()
        : typeof body.content === "string"
          ? body.content.trim()
          : "";
    let subjectId = typeof body.subjectId === "string" ? body.subjectId.trim() : "";
    let subjectTitle = typeof body.subject === "string" ? body.subject.trim() : "";
    let lessonMonth = Number(body.month) || 1;

    const flashcardCount = Number(body.flashcardCount) || 50;
    const exerciseCount = Number(body.exerciseCount) || 50;
    const batchSize = Number(body.batchSize) || 10;
    const skipIfExists = body.skipIfExists !== false;
    const writeReviewCards = body.writeReviewCards !== false;

    if (!gradeLevel || !stream) {
      return NextResponse.json(
        { error: "المستوى والشعبة مطلوبان" },
        { status: 400 }
      );
    }

    if (lessonId) {
      const lesson = await prisma.lesson.findUnique({
        where: { id: lessonId },
        select: {
          id: true,
          title: true,
          month: true,
          description: true,
          subjectId: true,
          subject: { select: { title: true } },
        },
      });
      if (!lesson) {
        return NextResponse.json({ error: "الدرس غير موجود" }, { status: 404 });
      }
      lessonTitle = lesson.title;
      subjectId = lesson.subjectId;
      subjectTitle = lesson.subject.title;
      lessonMonth = lesson.month;
      if (!lessonContent && lesson.description) {
        lessonContent = lesson.description;
      }
    }

    if (!lessonTitle || !subjectId) {
      return NextResponse.json(
        { error: "اسم الدرس والمادة مطلوبان" },
        { status: 400 }
      );
    }

    if (!subjectTitle) {
      const subject = await prisma.subject.findUnique({
        where: { id: subjectId },
        select: { title: true },
      });
      subjectTitle = subject?.title || lessonTitle;
    }

    const result = await seedLessonBank({
      subjectId,
      subjectTitle,
      gradeLevel,
      stream,
      lessonTitle,
      lessonId: lessonId || undefined,
      lessonMonth,
      lessonContent: lessonContent || null,
      flashcardCount,
      exerciseCount,
      batchSize,
      skipIfExists,
      writeReviewCards,
    });

    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("seed-content error:", error);
    return NextResponse.json({ error: "تعذر توليد المحتوى" }, { status: 500 });
  }
}
