"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { decryptSession } from "@/lib/security";

type MistakePayload = {
  mistakeContent: string;
  correctSolution: string;
};

export async function saveQuizMistakes(
  lessonId: string | null | undefined,
  quizId: string,
  mistakes: MistakePayload[]
) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session")?.value;

    if (!sessionToken) {
      return { success: false, error: "غير مسجل الدخول" };
    }

    // Decrypt JWT session to resolve actual User.id
    const payload = await decryptSession(sessionToken);
    const userId = (payload?.userId as string) || sessionToken;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      return { success: false, error: "المستخدم غير موجود أو الجلسة غير صالحة" };
    }

    if (!mistakes || mistakes.length === 0) {
      return { success: true, count: 0 };
    }

    // Resolve lessonId from quiz relation if not explicitly passed
    let resolvedLessonId: string | null = lessonId || null;
    if (!resolvedLessonId && quizId) {
      const quiz = await prisma.quiz.findUnique({
        where: { id: quizId },
        select: { lessonId: true },
      });
      if (quiz?.lessonId) {
        resolvedLessonId = quiz.lessonId;
      }
    }

    await prisma.studentMistake.createMany({
      data: mistakes.map((m) => ({
        studentId: user.id,
        lessonId: resolvedLessonId,
        quizId,
        mistakeContent: m.mistakeContent.trim(),
        correctSolution: m.correctSolution.trim(),
      })),
    });

    return { success: true, count: mistakes.length };
  } catch (error: any) {
    console.error("Critical error in saveQuizMistakes:", error);
    return { success: false, error: error?.message || "فشل حفظ أخطاء الاختبار" };
  }
}
