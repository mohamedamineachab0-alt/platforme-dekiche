"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { supabase, adminSupabase, ensureBucketExists } from "@/lib/supabase";
import { Level, Stream } from "@/generated/prisma";

export type SubjectActionState = {
  error?: string;
  success?: boolean;
  codes?: any[];
};

import { z } from "zod";

const SubjectSchema = z.object({
  title: z.string().min(1, "العنوان مطلوب"),
  description: z.string().min(1, "الوصف مطلوب"),
  price: z.number().min(0),
  accessType: z.enum(["MONTHLY", "YEARLY"]),
  level: z.string().min(1, "المستوى مطلوب"),
  stream: z.string().min(1, "الشعبة مطلوبة"),
  levels: z.array(z.string()).min(1, "اختر مستوى واحد على الأقل"),
  streams: z.array(z.string()).min(1, "اختر شعبة واحدة على الأقل")
});

export async function createSubject(
  formData: FormData
): Promise<SubjectActionState> {
  try {
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const teacherId = formData.get("teacherId") as string;
    const manualTeacherName = formData.get("manualTeacherName") as string;
    
    let imageUrl = "https://images.unsplash.com/photo-1546410531-bea5acadb043?q=80&w=600&auto=format&fit=crop";
    const imageFile = formData.get("image") as File | null;
    
    if (imageFile && imageFile.size > 0) {
      await ensureBucketExists("subject-covers");
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      
      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      const { data, error } = await adminSupabase.storage.from("subject-covers").upload(fileName, buffer, { 
        contentType: imageFile.type,
        upsert: false 
      });
      
      if (data) {
        const { data: publicUrlData } = supabase.storage.from("subject-covers").getPublicUrl(fileName);
        imageUrl = publicUrlData.publicUrl;
      }
    }
    const priceStr = formData.get("price") as string;
    const price = priceStr ? parseFloat(priceStr) : 0;
    const accessType = formData.get("accessType") as string || "YEARLY";
    const levelStr = formData.get("level") as string;
    const streamStr = formData.get("stream") as string;
    const levelsArr = formData.getAll("levels") as string[];
    const streamsArr = formData.getAll("streams") as string[];

    const levels = levelsArr.length > 0 ? levelsArr : (levelStr ? [levelStr] : []);
    const streams = streamsArr.length > 0 ? streamsArr : (streamStr ? [streamStr] : []);
    const level = levelStr || levels[0];
    const stream = streamStr || streams[0];

    const validation = SubjectSchema.safeParse({
      title,
      description,
      price,
      accessType,
      level,
      stream,
      levels,
      streams
    });

    if (!validation.success) {
      return { error: validation.error.issues?.[0]?.message || "بيانات غير صالحة" };
    }

    const teacher = teacherId ? await prisma.teacher.findUnique({ where: { id: teacherId } }) : null;
    const teacherName = teacher?.name || manualTeacherName || "غير محدد";

    await prisma.subject.create({
      data: {
        title,
        description,
        teacherId: teacherId || null,
        teacherName,
        image: imageUrl,
        price,
        accessType, 
        level: level as Level,
        stream: stream as Stream,
        levels: levels as Level[],
        streams: streams as Stream[],
        isPublished: true,
      },
    });

    revalidatePath("/dashboard/admin/subjects");
    return { success: true };
  } catch (err: any) {
    return { error: "حدث خطأ أثناء إنشاء المادة" };
  }
}

export async function updateSubject(
  id: string,
  formData: FormData
): Promise<SubjectActionState> {
  try {
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const teacherId = formData.get("teacherId") as string;
    const manualTeacherName = formData.get("manualTeacherName") as string;
    
    let imageUrl = undefined;
    const imageFile = formData.get("image") as File | null;
    if (imageFile && imageFile.size > 0) {
      await ensureBucketExists("subject-covers");
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      
      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const { data, error } = await adminSupabase.storage.from("subject-covers").upload(fileName, buffer, { 
        contentType: imageFile.type,
        upsert: false 
      });
      if (data) {
        const { data: publicUrlData } = supabase.storage.from("subject-covers").getPublicUrl(fileName);
        imageUrl = publicUrlData.publicUrl;
      }
    }
    const priceStr = formData.get("price") as string;
    const price = priceStr ? parseFloat(priceStr) : 0;
    const accessType = formData.get("accessType") as string || "YEARLY";
    const levelStr = formData.get("level") as string;
    const streamStr = formData.get("stream") as string;
    const levelsArr = formData.getAll("levels") as string[];
    const streamsArr = formData.getAll("streams") as string[];

    const levels = levelsArr.length > 0 ? levelsArr : (levelStr ? [levelStr] : []);
    const streams = streamsArr.length > 0 ? streamsArr : (streamStr ? [streamStr] : []);
    const level = levelStr || levels[0];
    const stream = streamStr || streams[0];

    const validation = SubjectSchema.safeParse({
      title,
      description,
      price,
      accessType,
      level,
      stream,
      levels,
      streams
    });

    if (!validation.success) {
      return { error: validation.error.issues?.[0]?.message || "بيانات غير صالحة" };
    }

    const teacher = teacherId ? await prisma.teacher.findUnique({ where: { id: teacherId } }) : null;
    const teacherName = teacher?.name || manualTeacherName || "غير محدد";

    const dataToUpdate: any = {
      title,
      description,
      teacherId: teacherId || null,
      teacherName,
      price,
      accessType, 
      level: level as Level,
      stream: stream as Stream,
      levels: levels as Level[],
      streams: streams as Stream[],
    };

    if (imageUrl) {
      dataToUpdate.image = imageUrl;
    }

    await prisma.subject.update({
      where: { id },
      data: dataToUpdate,
    });

    revalidatePath("/dashboard/admin/subjects");
    return { success: true };
  } catch (err: any) {
    return { error: "حدث خطأ أثناء تعديل المادة" };
  }
}

export async function generateAccessCode(
  formData: FormData
): Promise<SubjectActionState> {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("session")?.value;
    
    if (!sessionId) {
      return { error: "غير مصرح" };
    }

    const user = await prisma.user.findUnique({
      where: { id: sessionId },
      select: { role: true },
    });

    if (!user || user.role !== "ADMIN") {
      return { error: "غير مصرح" };
    }

    const subjectId = formData.get("subjectId") as string;
    const accessType = formData.get("accessType") as string; // MONTHLY, YEARLY, or TIME_BASED
    const validMonthsStr = formData.getAll("validMonths") as string[];
    const validDaysStr = formData.get("validDays") as string;
    const count = parseInt(formData.get("count") as string) || 1;
    const startDateStr = formData.get("startDate") as string;
    const endDateStr = formData.get("endDate") as string;

    if (!subjectId || !accessType || count < 1) {
      return { error: "يرجى اختيار المادة ونوع الوصول والعدد" };
    }

    const startDate = startDateStr ? new Date(startDateStr) : null;
    const endDate = endDateStr ? new Date(endDateStr) : null;
    const validDays = validDaysStr ? parseInt(validDaysStr) : null;

    const validMonths = validMonthsStr.map(m => parseInt(m)).filter(n => !isNaN(n));

    // Generate N random codes
    const codes = Array.from({ length: count }).map(() => ({
      code: Math.random().toString(36).substring(2, 10).toUpperCase() + "-" + Math.random().toString(36).substring(2, 6).toUpperCase(),
      subjectId,
      accessType,
      validMonths,
      validDays,
      startDate,
      endDate,
    }));

    await prisma.accessCode.createMany({
      data: codes,
    });

    revalidatePath("/dashboard/admin/codes");
    return { success: true, codes };
  } catch (err: any) {
    return { error: "حدث خطأ أثناء توليد رموز الدخول" };
  }
}

export async function redeemAccessCode(
  formData: FormData
): Promise<any> {
  let redirectUrl = "";
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("session")?.value;
    if (!sessionId) return { error: "يجب تسجيل الدخول" };

    const codeStr = formData.get("code") as string;
    const targetSubjectId = formData.get("subjectId") as string;

    if (!codeStr) return { error: "يرجى إدخال رمز الدخول" };

    const code = await prisma.accessCode.findUnique({
      where: { code: codeStr.toUpperCase() },
      include: { subject: true },
    });

    if (!code) return { error: "الرمز غير صحيح" };
    if (targetSubjectId && code.subjectId !== targetSubjectId) return { error: "هذا الرمز لا يخص هذه المادة" };
    if (code.isUsed) return { error: "تم استخدام هذا الرمز مسبقاً" };

    // Valid, let's redeem it
    await prisma.$transaction(async (tx) => {
      // Mark code as used
      await tx.accessCode.update({
        where: { id: code.id },
        data: {
          isUsed: true,
          studentId: sessionId,
        },
      });

      // Find or create enrollment
      const existingEnrollment = await tx.enrollment.findUnique({
        where: {
          studentId_subjectId: {
            studentId: sessionId,
            subjectId: code.subjectId,
          }
        }
      });

      if (existingEnrollment) {
        // Merge months
        const newMonths = new Set([...existingEnrollment.enrolledMonths, ...code.validMonths]);
        if (code.accessType === "YEARLY" || code.accessType === "TIME_BASED") {
          // Add 1-12
          [1,2,3,4,5,6,7,8,9,10,11,12].forEach(m => newMonths.add(m));
        }

        let newValidUntil = existingEnrollment.validUntil;
        if (code.validDays) {
          const baseDate = (newValidUntil && newValidUntil > new Date()) ? newValidUntil : new Date();
          newValidUntil = new Date(baseDate.getTime() + code.validDays * 24 * 60 * 60 * 1000);
        }

        await tx.enrollment.update({
          where: { id: existingEnrollment.id },
          data: { 
            enrolledMonths: Array.from(newMonths),
            ...(newValidUntil && { validUntil: newValidUntil })
          },
        });
      } else {
        const initialMonths = (code.accessType === "YEARLY" || code.accessType === "TIME_BASED") ? [1,2,3,4,5,6,7,8,9,10,11,12] : code.validMonths;
        
        let initialValidUntil = null;
        if (code.validDays) {
          initialValidUntil = new Date(Date.now() + code.validDays * 24 * 60 * 60 * 1000);
        }

        await tx.enrollment.create({
          data: {
            studentId: sessionId,
            subjectId: code.subjectId,
            enrolledMonths: initialMonths,
            ...(initialValidUntil && { validUntil: initialValidUntil })
          }
        });
      }
    });

    revalidatePath("/dashboard/student/subjects");
    redirectUrl = `/dashboard/student/subjects/${code.subjectId}`;
  } catch (err: any) {
    return { error: "حدث خطأ أثناء تفعيل الرمز" };
  }

  if (redirectUrl) {
    redirect(redirectUrl);
  }

  return { success: true };
}

export async function deleteSubject(
  subjectId: string
): Promise<any> {
  try {
    await prisma.subject.delete({
      where: { id: subjectId },
    });
    revalidatePath("/dashboard/admin/subjects");
    return { success: true };
  } catch (err: any) {
    return { error: "حدث خطأ أثناء حذف المادة" };
  }
}
