"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Stream } from "@/generated/prisma";

export type LessonMaterialInput = {
  title: string;
  fileUrl: string;
  fileType?: string;
};

export type LessonPayload = {
  title: string;
  subjectId: string;
  subjectIds?: string[];
  month: number;
  vimeoVideoId: string;
  streams?: Stream[];
  materials: LessonMaterialInput[];
  quiz?: {
    maxScore: number;
    aiGenerated: boolean;
    questions: any[];
  } | null;
};

export type ActionState = {
  error?: string;
  success?: boolean;
};

import { z } from "zod";

const LessonSchema = z.object({
  title: z.string().min(1, "عنوان الدرس مطلوب"),
  subjectId: z.string().min(1, "المادة مطلوبة"),
  subjectIds: z.array(z.string()).min(1, "اختر مادة واحدة على الأقل"),
  month: z.number().min(1).max(12),
  vimeoVideoId: z.string().min(1, "رابط الفيديو مطلوب"),
  streams: z.array(z.string()).default([]),
  materials: z.array(z.object({
    title: z.string(),
    fileUrl: z.string(),
    fileType: z.string().optional()
  })).default([]),
  quiz: z.object({
    maxScore: z.number(),
    aiGenerated: z.boolean(),
    questions: z.array(z.any())
  }).nullable().optional()
});

export async function createLesson(payload: LessonPayload): Promise<ActionState> {
  const validation = LessonSchema.safeParse(payload);
  if (!validation.success) {
    return { error: validation.error.issues?.[0]?.message || "بيانات غير صالحة" };
  }

  const validPayload = validation.data;

  try {
    const lesson = await prisma.lesson.create({
      data: {
        title: validPayload.title,
        subjectId: validPayload.subjectId,
        subjectIds: validPayload.subjectIds.length ? validPayload.subjectIds : [validPayload.subjectId],
        streams: validPayload.streams as Stream[],
        month: validPayload.month,
        vimeoVideoId: validPayload.vimeoVideoId,
        materials: {
          create: validPayload.materials.map(m => ({
            title: m.title,
            fileUrl: m.fileUrl,
            fileType: m.fileType,
          })),
        },
        ...(validPayload.quiz && {
          quiz: {
            create: {
              maxScore: validPayload.quiz.maxScore,
              aiGenerated: validPayload.quiz.aiGenerated,
              questions: validPayload.quiz.questions,
            }
          }
        })
      },
    });

    revalidatePath(`/dashboard/admin/lessons`);
    revalidatePath(`/dashboard/student/subjects/${payload.subjectId}`);
    return { success: true };
  } catch (error) {
    console.error("خطا اثناء حفظ الدرس", error);
    return { error: "حدث خطا اثناء الحفظ يرجى المحاولة" };
  }
}

export async function addLessonMaterial(
  formData: FormData
): Promise<ActionState> {
  try {
    const lessonId = formData.get("lessonId") as string;
    const title = formData.get("title") as string;
    const fileUrl = formData.get("fileUrl") as string;
    const fileType = formData.get("fileType") as string;

    if (!lessonId || !title || !fileUrl) {
      return { error: "جميع الحقول مطلوبة" };
    }

    await prisma.lessonMaterial.create({
      data: {
        lessonId,
        title,
        fileUrl,
        fileType,
      },
    });

    revalidatePath("/dashboard/admin/lessons");
    return { success: true };
  } catch (error) {
    console.error("خطا اثناء رفع الملف", error);
    return { error: "حدث خطا اثناء الرفع يرجى المحاولة" };
  }
}
