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
  vimeoUrl?: string;
  pdfUrls?: string[];
  level?: string;
  stream?: string;
};

export type SubjectQuizStat = {
  id: string;
  title: string;
  image?: string | null;
  totalLessons: number;
  lessonsWithFiles: number;
  lessonsWithQuiz: number;
  pendingWithFiles: number;
  lessonsWithoutFiles: number;
};

export async function getSubjectQuizStats(): Promise<{
  success: boolean;
  subjects: SubjectQuizStat[];
  error?: string;
}> {
  try {
    const subjects = await prisma.subject.findMany({
      include: {
        lessons: {
          include: {
            materials: true,
            quiz: true,
          },
        },
      },
      orderBy: { title: "asc" },
    });

    const stats: SubjectQuizStat[] = subjects.map((s) => {
      const totalLessons = s.lessons.length;
      let lessonsWithFiles = 0;
      let lessonsWithQuiz = 0;
      let pendingWithFiles = 0;
      let lessonsWithoutFiles = 0;

      for (const l of s.lessons) {
        const hasValidFile = l.materials && l.materials.some((m) => !!m.fileUrl && m.fileUrl.trim() !== "");
        const hasValidQuiz =
          !!l.quiz &&
          Array.isArray(l.quiz.questions) &&
          (l.quiz.questions as any[]).length > 0 &&
          (l.quiz.questions as any[]).some((q: any) => q && q.question && q.question.trim().length > 0);

        if (hasValidFile) {
          lessonsWithFiles++;
          if (hasValidQuiz) {
            lessonsWithQuiz++;
          } else {
            pendingWithFiles++;
          }
        } else {
          lessonsWithoutFiles++;
        }
      }

      return {
        id: s.id,
        title: s.title,
        image: s.image,
        totalLessons,
        lessonsWithFiles,
        lessonsWithQuiz,
        pendingWithFiles,
        lessonsWithoutFiles,
      };
    });

    return { success: true, subjects: stats };
  } catch (error: any) {
    console.error("Error in getSubjectQuizStats:", error);
    return { success: false, subjects: [], error: error?.message || "فشل جلب إحصائيات المواد" };
  }
}

export async function getPendingQuizLessons(subjectId?: string): Promise<{
  success: boolean;
  lessons: PendingQuizLesson[];
  error?: string;
}> {
  try {
    // STRICT RULE: Lesson MUST have an attached file/material and NO existing quiz
    const whereClause: any = {
      quiz: null,
      materials: {
        some: {
          fileUrl: { not: "" },
        },
      },
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
      const validMaterials = l.materials.filter((m) => !!m.fileUrl && m.fileUrl.trim() !== "");
      const pdfUrls = validMaterials.map((m) => m.fileUrl);

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
        pdfUrls: pdfUrls.length > 0 ? pdfUrls : undefined,
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

export async function getLessonQuiz(lessonId: string) {
  try {
    if (!lessonId) return { success: false, error: "معرف الدرس مطلوب" };
    const quiz = await prisma.quiz.findUnique({
      where: { lessonId },
    });
    if (!quiz) return { success: false, error: "لا يوجد كويز لهذا الدرس" };
    const questions =
      typeof quiz.questions === "string" ? JSON.parse(quiz.questions) : quiz.questions;
    return { success: true, quiz: { ...quiz, questions } };
  } catch (error: any) {
    return { success: false, error: error?.message || "فشل جلب الكويز" };
  }
}

export async function deleteLessonQuiz(lessonId: string) {
  try {
    if (!lessonId) return { success: false, error: "معرف الدرس مطلوب" };
    await prisma.quiz.deleteMany({
      where: { lessonId },
    });
    try {
      revalidatePath("/dashboard/admin/lessons");
    } catch (revErr) {}
    return { success: true };
  } catch (error: any) {
    console.error("Error in deleteLessonQuiz:", error);
    return { success: false, error: error?.message || "فشل حذف الكويز" };
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
