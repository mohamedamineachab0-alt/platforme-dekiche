"use server";

import { prisma } from "@/lib/prisma";
import { assertAuth } from "@/lib/security";
import { revalidatePath } from "next/cache";

async function assertLessonAccess(studentId: string, lessonId: string) {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: { id: true, subjectId: true, month: true, title: true },
  });
  if (!lesson) return { error: "الدرس غير موجود" as const };

  const enrollment = await prisma.enrollment.findUnique({
    where: {
      studentId_subjectId: {
        studentId,
        subjectId: lesson.subjectId,
      },
    },
    select: { enrolledMonths: true },
  });
  if (!enrollment) return { error: "غير مسجل في المادة" as const };
  if (!enrollment.enrolledMonths.includes(lesson.month)) {
    return { error: "الدرس غير مفعّل في اشتراكك" as const };
  }

  return { lesson };
}

export async function recordLessonWatch(input: {
  lessonId: string;
  watchedSeconds: number;
}): Promise<{ error?: string; success?: boolean; completed?: boolean }> {
  try {
    const user = await assertAuth({ requireRole: "STUDENT" });
    const lessonId = input.lessonId?.trim();
    const watchedSeconds = Math.max(0, Math.floor(Number(input.watchedSeconds) || 0));

    if (!lessonId) return { error: "معرّف الدرس مطلوب" };
    if (watchedSeconds <= 0) return { success: true };

    const access = await assertLessonAccess(user.id, lessonId);
    if ("error" in access && access.error) return { error: access.error };
    const { lesson } = access as { lesson: { id: string; subjectId: string; month: number; title: string } };

    const existing = await prisma.watchHistory.findUnique({
      where: {
        studentId_lessonId: { studentId: user.id, lessonId: lesson.id },
      },
      select: { watchedSeconds: true },
    });

    const nextSeconds = Math.max(existing?.watchedSeconds ?? 0, watchedSeconds);

    await prisma.watchHistory.upsert({
      where: {
        studentId_lessonId: { studentId: user.id, lessonId: lesson.id },
      },
      create: {
        studentId: user.id,
        lessonId: lesson.id,
        subjectId: lesson.subjectId,
        watchedSeconds: nextSeconds,
        lastWatchedAt: new Date(),
      },
      update: {
        watchedSeconds: nextSeconds,
        lastWatchedAt: new Date(),
      },
    });

    return { success: true };
  } catch {
    return { error: "تعذر حفظ المشاهدة" };
  }
}

export async function markLessonComplete(input: {
  lessonId: string;
}): Promise<{ error?: string; success?: boolean }> {
  try {
    const user = await assertAuth({ requireRole: "STUDENT" });
    const lessonId = input.lessonId?.trim();
    if (!lessonId) return { error: "معرّف الدرس مطلوب" };

    const access = await assertLessonAccess(user.id, lessonId);
    if ("error" in access && access.error) return { error: access.error };
    const { lesson } = access as { lesson: { id: string; subjectId: string; month: number; title: string } };

    await prisma.courseProgress.upsert({
      where: {
        studentId_lessonId: { studentId: user.id, lessonId: lesson.id },
      },
      create: {
        studentId: user.id,
        lessonId: lesson.id,
        subjectId: lesson.subjectId,
        completed: true,
        completedAt: new Date(),
      },
      update: {
        completed: true,
        completedAt: new Date(),
      },
    });

    // Ensure watch row exists so analytics timeline has activity
    await prisma.watchHistory.upsert({
      where: {
        studentId_lessonId: { studentId: user.id, lessonId: lesson.id },
      },
      create: {
        studentId: user.id,
        lessonId: lesson.id,
        subjectId: lesson.subjectId,
        watchedSeconds: 1,
        lastWatchedAt: new Date(),
      },
      update: {
        lastWatchedAt: new Date(),
      },
    });

    revalidatePath(`/dashboard/student/lessons/${lesson.id}`);
    revalidatePath(`/dashboard/student/subjects/${lesson.subjectId}`);
    revalidatePath("/dashboard/student/analytics");

    return { success: true };
  } catch {
    return { error: "تعذر تحديث التقدم" };
  }
}
