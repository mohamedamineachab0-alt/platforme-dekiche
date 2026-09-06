"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
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

export type PendingQuizLesson = {
  id: string;
  title: string;
  subjectId: string;
  subjectTitle: string;
  month: number;
  vimeoUrl: string;
  pdfUrl?: string;
  level?: string;
  stream?: string;
};

export async function getPendingQuizLessons(subjectId?: string): Promise<{
  success: boolean;
  lessons: PendingQuizLesson[];
  error?: string;
}> {
  try {
    const whereClause: any = {
      quiz: null,
      OR: [
        { vimeoVideoId: { not: "" } },
        { materials: { some: { fileUrl: { not: "" } } } },
      ],
    };

    if (subjectId && subjectId !== "ALL") {
      whereClause.subjectId = subjectId;
    }

    const lessons = await prisma.lesson.findMany({
      where: whereClause,
      include: {
        subject: true,
        materials: true,
      },
      orderBy: [{ month: "asc" }, { createdAt: "asc" }],
    });

    const formatted: PendingQuizLesson[] = lessons.map((l) => {
      const pdfMat =
        l.materials.find(
          (m) =>
            m.fileUrl?.toLowerCase().endsWith(".pdf") ||
            m.fileType?.toLowerCase().includes("pdf")
        ) || l.materials.find((m) => !!m.fileUrl);

      let vimeo = (l.vimeoVideoId || "").trim();
      if (vimeo && !vimeo.startsWith("http")) {
        vimeo = `https://vimeo.com/${vimeo}`;
      }

      return {
        id: l.id,
        title: l.title,
        subjectId: l.subjectId,
        subjectTitle: l.subject?.title || "عام",
        month: l.month,
        vimeoUrl: vimeo,
        pdfUrl: pdfMat?.fileUrl,
        level: l.levels?.[0],
        stream: l.streams?.[0],
      };
    });

    return { success: true, lessons: formatted };
  } catch (error: any) {
    console.error("Error in getPendingQuizLessons:", error);
    return { success: false, lessons: [], error: error?.message || "فشل جلب الدروس غير المكتملة" };
  }
}

export async function saveLessonQuiz(
  lessonId: string,
  questions: any[],
  maxScore: number = 20
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!lessonId) return { success: false, error: "معرف الدرس مطلوب" };
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return { success: false, error: "قائمة الأسئلة فارغة" };
    }

    const sanitizedQuestions = questions.map((q: any, idx: number) => {
      let opts = Array.isArray(q.options) ? q.options.map(String) : [];
      while (opts.length < 4) {
        opts.push(`الخيار ${opts.length + 1}`);
      }
      return {
        id: q.id || `q_${idx + 1}`,
        question: String(q.question || `السؤال ${idx + 1}`),
        options: opts.slice(0, 4),
        correctAnswerIndex:
          typeof q.correctAnswerIndex === "number" &&
          q.correctAnswerIndex >= 0 &&
          q.correctAnswerIndex <= 3
            ? q.correctAnswerIndex
            : 0,
      };
    });

    await prisma.quiz.upsert({
      where: { lessonId },
      update: {
        questions: sanitizedQuestions,
        maxScore,
        aiGenerated: true,
      },
      create: {
        lessonId,
        questions: sanitizedQuestions,
        maxScore,
        aiGenerated: true,
      },
    });

    try {
      revalidatePath("/dashboard/admin/lessons");
    } catch (revErr) {
      console.warn("revalidatePath notice in saveLessonQuiz:", revErr);
    }
    return { success: true };
  } catch (error: any) {
    console.error("Error in saveLessonQuiz:", error);
    return { success: false, error: error?.message || "فشل حفظ الكويز في قاعدة البيانات" };
  }
}
