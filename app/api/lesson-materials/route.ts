import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/security";
import { getOrGenerateLessonMaterials } from "@/lib/academy/lesson-materials";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ error: "يجب تسجيل الدخول" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const lessonId = typeof body.lessonId === "string" ? body.lessonId.trim() : "";
    const lessonTitle =
      typeof body.lessonTitle === "string" ? body.lessonTitle.trim() : "";
    const gradeLevel =
      typeof body.gradeLevel === "string"
        ? body.gradeLevel.trim()
        : typeof body.level === "string"
          ? body.level.trim()
          : "";
    const stream =
      typeof body.branch === "string"
        ? body.branch.trim()
        : typeof body.stream === "string"
          ? body.stream.trim()
          : "";

    if (!lessonId || !gradeLevel || !stream) {
      return NextResponse.json(
        { error: "الحقول المطلوبة lessonId و gradeLevel و branch" },
        { status: 400 }
      );
    }

    const [user, lesson] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { role: true, studentProfile: { select: { level: true, stream: true } } },
      }),
      prisma.lesson.findUnique({
        where: { id: lessonId },
        select: {
          id: true,
          title: true,
          description: true,
          subjectId: true,
          subject: { select: { title: true } },
        },
      }),
    ]);

    if (!user || user.role !== "STUDENT") {
      return NextResponse.json({ error: "للطلاب فقط" }, { status: 403 });
    }

    if (!lesson) {
      return NextResponse.json({ error: "الدرس غير موجود" }, { status: 404 });
    }

    const enrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_subjectId: {
          studentId: userId,
          subjectId: lesson.subjectId,
        },
      },
      select: { id: true },
    });

    if (!enrollment) {
      return NextResponse.json({ error: "المادة غير مفعلة" }, { status: 403 });
    }

    const materials = await getOrGenerateLessonMaterials({
      lessonId: lesson.id,
      lessonTitle: lessonTitle || lesson.title,
      subjectId: lesson.subjectId,
      subjectTitle: lesson.subject.title,
      gradeLevel,
      stream,
      lessonContent: lesson.description,
    });

    return NextResponse.json({
      ok: true,
      lessonId: lesson.id,
      gradeLevel,
      branch: stream,
      ...materials,
    });
  } catch (error) {
    console.error("lesson-materials error:", error);
    const message = error instanceof Error ? error.message : "";
    if (message === "OPENAI_API_KEY_MISSING") {
      return NextResponse.json({ error: "مفتاح OpenAI غير مضبوط" }, { status: 500 });
    }
    return NextResponse.json({ error: "تعذر تحضير مواد الدرس" }, { status: 500 });
  }
}
