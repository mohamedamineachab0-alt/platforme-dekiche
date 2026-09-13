import { cookies } from "next/headers";
import { decryptSession } from "@/lib/security";
import { prisma } from "@/lib/prisma";

export type LessonAccessResult =
  | {
      ok: true;
      userId: string;
      lesson: {
        id: string;
        title: string;
        description: string | null;
        month: number;
        subjectId: string;
        subjectTitle: string;
        materialTitles: string[];
      };
    }
  | { ok: false; status: number; error: string };

/** Verify student session + enrollment unlock for a lesson. */
export async function assertStudentLessonAccess(
  lessonId: string
): Promise<LessonAccessResult> {
  if (!lessonId) {
    return { ok: false, status: 400, error: "معرّف الدرس مطلوب" };
  }

  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session")?.value;
  if (!sessionToken) {
    return { ok: false, status: 401, error: "غير مسجل الدخول" };
  }

  const payload = await decryptSession(sessionToken);
  const userId = (payload?.userId as string) || null;
  if (!userId) {
    return { ok: false, status: 401, error: "الجلسة غير صالحة" };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true },
  });

  if (!user || user.role !== "STUDENT") {
    return { ok: false, status: 403, error: "غير مصرح" };
  }

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      subject: { select: { title: true } },
      materials: { select: { title: true } },
    },
  });

  if (!lesson) {
    return { ok: false, status: 404, error: "الدرس غير موجود" };
  }

  const enrollment = await prisma.enrollment.findUnique({
    where: {
      studentId_subjectId: {
        studentId: userId,
        subjectId: lesson.subjectId,
      },
    },
  });

  if (!enrollment) {
    const priced = await prisma.subject.findUnique({
      where: { id: lesson.subjectId },
      select: { price: true },
    });
    if (!priced || (priced.price !== 0 && priced.price !== null)) {
      return { ok: false, status: 403, error: "غير مسجل في هذه المادة" };
    }
    await prisma.enrollment.create({
      data: {
        studentId: userId,
        subjectId: lesson.subjectId,
        enrolledMonths: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      },
    });
  } else if (!enrollment.enrolledMonths.includes(lesson.month)) {
    const priced = await prisma.subject.findUnique({
      where: { id: lesson.subjectId },
      select: { price: true },
    });
    if (priced && (priced.price === 0 || priced.price === null)) {
      // free subject: all months available
    } else {
      return { ok: false, status: 403, error: "هذا الدرس غير مفعّل في اشتراكك" };
    }
  }

  return {
    ok: true,
    userId,
    lesson: {
      id: lesson.id,
      title: lesson.title,
      description: lesson.description,
      month: lesson.month,
      subjectId: lesson.subjectId,
      subjectTitle: lesson.subject.title,
      materialTitles: lesson.materials.map((m) => m.title),
    },
  };
}
