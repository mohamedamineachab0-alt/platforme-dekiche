"use server";

import { prisma } from "@/lib/prisma";
import { assertAuth } from "@/lib/security";
import { revalidatePath } from "next/cache";

export async function submitLessonOpinion(input: {
  lessonId: string;
  rating: number;
  comment: string;
}): Promise<{ error?: string; success?: boolean }> {
  try {
    const user = await assertAuth({ requireRole: "STUDENT" });
    const lessonId = input.lessonId?.trim();
    const rating = Number(input.rating);
    const comment = (input.comment || "").trim();

    if (!lessonId) return { error: "معرّف الدرس مطلوب" };
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return { error: "التقييم يجب أن يكون بين 1 و 5" };
    }
    if (comment.length < 5) {
      return { error: "اكتب رأيك في 5 أحرف على الأقل" };
    }
    if (comment.length > 1000) {
      return { error: "الرأي طويل جداً (الحد 1000 حرف)" };
    }

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      select: { id: true, subjectId: true, month: true },
    });
    if (!lesson) return { error: "الدرس غير موجود" };

    const enrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_subjectId: {
          studentId: user.id,
          subjectId: lesson.subjectId,
        },
      },
    });

    if (!enrollment || !enrollment.enrolledMonths.includes(lesson.month)) {
      return { error: "غير مسموح لك بتقييم هذا الدرس" };
    }

    await prisma.lessonOpinion.upsert({
      where: {
        studentId_lessonId: {
          studentId: user.id,
          lessonId,
        },
      },
      create: {
        studentId: user.id,
        lessonId,
        rating,
        comment,
      },
      update: {
        rating,
        comment,
      },
    });

    revalidatePath(`/dashboard/student/lessons/${lessonId}`);
    revalidatePath("/dashboard/admin/lesson-opinions");

    return { success: true };
  } catch (error: any) {
    console.error("submitLessonOpinion error:", error);
    return { error: error?.message || "حدث خطأ أثناء إرسال الرأي" };
  }
}
