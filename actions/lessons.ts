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
import { supabase, adminSupabase, ensureBucketExists } from "@/lib/supabase";

const LessonSchema = z.object({
  title: z.string().min(1, "عنوان الدرس مطلوب"),
  description: z.string().nullable().optional(),
  subjectId: z.string().min(1, "المادة مطلوبة"),
  month: z.number().min(1).max(12),
  vimeoVideoId: z.string().min(1, "رابط الفيديو مطلوب"),
  settings: z.object({
    streams: z.array(z.string()).default([]),
    levels: z.array(z.string()).default([]),
    isPublished: z.boolean().default(true)
  }).optional().default({ streams: [], levels: [], isPublished: true }),
  quiz: z.object({
    maxScore: z.number(),
    aiGenerated: z.boolean(),
    questions: z.array(z.any())
  }).nullable().optional()
});

const DEFAULT_DESCRIPTION = "في هذه الحصة، سنتناول المفاهيم الأساسية المتعلقة بموضوع الدرس مع تقديم شرح مبسط وأمثلة تطبيقية لتسهيل الفهم. تأكد من إحضار كراسك وتدوين أهم الملاحظات.";

export async function createLesson(formData: FormData): Promise<ActionState> {
  const title = formData.get("title") as string;
  let description = formData.get("description") as string;
  
  if (!description || description.trim() === '') {
    description = DEFAULT_DESCRIPTION;
  }
  const subjectId = formData.get("subjectId") as string;
  const monthStr = formData.get("month") as string;
  const vimeoVideoId = formData.get("vimeoVideoId") as string;
  const quizStr = formData.get("quiz") as string;
  const month = parseInt(monthStr || "1");

  let quizConfig = null;
  if (quizStr) {
    try {
      quizConfig = JSON.parse(quizStr);
    } catch (e) {
      console.error("Failed to parse quiz config");
    }
  }

  let settingsConfig = undefined;
  const settingsStr = formData.get("settings") as string | null;
  if (settingsStr) {
    try {
      settingsConfig = JSON.parse(settingsStr);
    } catch(e) {}
  }

  const validation = LessonSchema.safeParse({
    title,
    description,
    subjectId,
    month,
    vimeoVideoId,
    quiz: quizConfig,
    settings: settingsConfig
  });

  if (!validation.success) {
    return { error: validation.error.issues?.[0]?.message || "بيانات غير صالحة" };
  }

  try {
    let imageUrl = null;
    const imageFile = formData.get("image") as File | null;
    if (imageFile && imageFile.size > 0) {
      await ensureBucketExists("lesson-covers");
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const { data } = await adminSupabase.storage.from("lesson-covers").upload(fileName, imageFile, { upsert: false });
      if (data) {
        const { data: publicUrlData } = adminSupabase.storage.from("lesson-covers").getPublicUrl(fileName);
        imageUrl = publicUrlData.publicUrl;
      }
    }

    const materialFiles = formData.getAll("materials") as File[];
    const uploadedMaterials = [];

    if (materialFiles.length > 0) {
      await ensureBucketExists("lesson-materials");
      for (const file of materialFiles) {
        if (file && file.size > 0) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
          const arrayBuffer = await file.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          const { data } = await adminSupabase.storage.from("lesson-materials").upload(fileName, buffer, { 
            contentType: file.type || undefined,
            upsert: false 
          });
          if (data) {
            const { data: publicUrlData } = adminSupabase.storage.from("lesson-materials").getPublicUrl(fileName);
            uploadedMaterials.push({
              title: file.name,
              fileUrl: publicUrlData.publicUrl,
              fileType: file.type || fileExt,
            });
          }
        }
      }
    }
    const levels = validation.data.settings.levels as any[];
    const streams = validation.data.settings.streams as any[];
    const isPublished = validation.data.settings.isPublished;

    const subjectIds = [validation.data.subjectId];

    const lesson = await prisma.lesson.create({
      data: {
        title: validation.data.title,
        description: validation.data.description,
        subjectId: validation.data.subjectId,
        subjectIds: subjectIds,
        month: validation.data.month,
        vimeoVideoId: validation.data.vimeoVideoId,
        image: imageUrl,
        levels: levels,
        streams: streams,
        isPublished: isPublished,
        materials: {
          create: uploadedMaterials,
        },
        ...(validation.data.quiz && {
          quiz: {
            create: {
              maxScore: validation.data.quiz.maxScore,
              aiGenerated: validation.data.quiz.aiGenerated,
              questions: validation.data.quiz.questions,
            }
          }
        })
      },
    });

    revalidatePath(`/dashboard/admin/lessons`);
    revalidatePath(`/dashboard/student/subjects/${validation.data.subjectId}`);
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

export async function updateLesson(id: string, formData: FormData): Promise<ActionState> {
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const monthStr = formData.get("month") as string;
  const vimeoVideoId = formData.get("vimeoVideoId") as string;
  const quizStr = formData.get("quiz") as string;
  const deletedMaterialIdsStr = formData.get("deletedMaterialIds") as string;
  const subjectId = formData.get("subjectId") as string;
  const month = parseInt(monthStr || "1");

  const deletedMaterialIds = deletedMaterialIdsStr ? JSON.parse(deletedMaterialIdsStr) : [];

  let quizConfig = null;
  if (quizStr) {
    try {
      quizConfig = JSON.parse(quizStr);
    } catch (e) {
      console.error("Failed to parse quiz config");
    }
  }

  const validation = LessonSchema.safeParse({
    title,
    description,
    subjectId: subjectId || "placeholder", // Might not be changed
    month,
    vimeoVideoId,
    quiz: quizConfig
  });

  if (!validation.success) {
    return { error: validation.error.issues?.[0]?.message || "بيانات غير صالحة" };
  }

  try {
    const existingLesson = await prisma.lesson.findUnique({ where: { id } });
    if (!existingLesson) return { error: "الدرس غير موجود" };

    let imageUrl = undefined;
    const imageFile = formData.get("image") as File | null;
    if (imageFile && imageFile.size > 0) {
      await ensureBucketExists("lesson-covers");
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const { data } = await adminSupabase.storage.from("lesson-covers").upload(fileName, imageFile, { upsert: false });
      if (data) {
        const { data: publicUrlData } = adminSupabase.storage.from("lesson-covers").getPublicUrl(fileName);
        imageUrl = publicUrlData.publicUrl;
      }
    }

    const materialFiles = formData.getAll("materials") as File[];
    const uploadedMaterials = [];

    if (materialFiles.length > 0) {
      await ensureBucketExists("lesson-materials");
      for (const file of materialFiles) {
        if (file && file.size > 0) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
          const arrayBuffer = await file.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          const { data } = await adminSupabase.storage.from("lesson-materials").upload(fileName, buffer, { 
            contentType: file.type || undefined,
            upsert: false 
          });
          if (data) {
            const { data: publicUrlData } = adminSupabase.storage.from("lesson-materials").getPublicUrl(fileName);
            uploadedMaterials.push({
              title: file.name,
              fileUrl: publicUrlData.publicUrl,
              fileType: file.type || fileExt,
            });
          }
        }
      }
    }

    const updateData: any = {
      title: validation.data.title,
      description: validation.data.description,
      month: validation.data.month,
      vimeoVideoId: validation.data.vimeoVideoId,
    };
    if (imageUrl) {
      updateData.image = imageUrl;
    }
    
    // Delete materials marked for deletion
    if (deletedMaterialIds && deletedMaterialIds.length > 0) {
      await prisma.lessonMaterial.deleteMany({
        where: {
          id: { in: deletedMaterialIds },
          lessonId: id
        }
      });
    }

    if (uploadedMaterials.length > 0) {
      updateData.materials = {
        create: uploadedMaterials
      };
    }

    await prisma.lesson.update({
      where: { id },
      data: updateData
    });

    if (validation.data.quiz) {
      await prisma.quiz.upsert({
        where: { lessonId: id },
        create: {
          lessonId: id,
          maxScore: validation.data.quiz.maxScore,
          aiGenerated: validation.data.quiz.aiGenerated,
          questions: validation.data.quiz.questions,
        },
        update: {
          maxScore: validation.data.quiz.maxScore,
          aiGenerated: validation.data.quiz.aiGenerated,
          questions: validation.data.quiz.questions,
        }
      });
    }

    revalidatePath(`/dashboard/admin/lessons`);
    return { success: true };
  } catch (error) {
    console.error("خطا اثناء تعديل الدرس", error);
    return { error: "حدث خطا اثناء الحفظ يرجى المحاولة" };
  }
}


export async function deleteLesson(id: string): Promise<ActionState> {
  try {
    const lesson = await prisma.lesson.findUnique({ where: { id } });
    if (!lesson) return { error: "الدرس غير موجود" };

    await prisma.lesson.delete({ where: { id } });

    revalidatePath(`/dashboard/admin/lessons`);
    revalidatePath(`/dashboard/student/subjects/${lesson.subjectId}`);
    return { success: true };
  } catch (error) {
    console.error("خطأ أثناء حذف الدرس", error);
    return { error: "حدث خطأ أثناء الحذف يرجى المحاولة" };
  }
}
