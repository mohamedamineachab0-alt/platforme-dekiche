"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { Level, Stream } from "@/generated/prisma";
import { z } from "zod";

const SendNotificationSchema = z.object({
  title: z.string().min(1, "العنوان مطلوب"),
  content: z.string().min(1, "المحتوى مطلوب"),
  levels: z.array(z.nativeEnum(Level)).default([]),
  streams: z.array(z.nativeEnum(Stream)).default([]),
  subjectIds: z.array(z.string()).default([]),
});

export type NotificationActionState = {
  error?: string;
  success?: boolean;
};

export async function createNotification(formData: FormData): Promise<NotificationActionState> {
  try {
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const levels = formData.getAll("levels") as Level[];
    const streams = formData.getAll("streams") as Stream[];
    const subjectIds = formData.getAll("subjectIds") as string[];

    const validation = SendNotificationSchema.safeParse({
      title,
      content,
      levels,
      streams,
      subjectIds,
    });

    if (!validation.success) {
      return { error: validation.error.issues?.[0]?.message || "بيانات غير صالحة" };
    }

    if (levels.length === 0 && streams.length === 0 && subjectIds.length === 0) {
      return { error: "يرجى اختيار مستوى أو شعبة أو مادة واحدة على الأقل" };
    }

    await prisma.notification.create({
      data: {
        title,
        content,
        levels,
        streams,
        subjectIds,
      }
    });

    revalidatePath("/dashboard/student/notifications");
    revalidatePath("/dashboard/admin/notifications");
    revalidatePath("/dashboard/student");
    
    return { success: true };
  } catch (error) {
    console.error("createNotification error:", error);
    return { error: "حدث خطأ أثناء إرسال الإشعار" };
  }
}

export async function deleteNotification(id: string) {
  try {
    await prisma.notification.delete({
      where: { id }
    });

    revalidatePath("/dashboard/admin/notifications");
    revalidatePath("/dashboard/student/notifications");

    return { success: true };
  } catch (error: any) {
    console.error("deleteNotification error:", error);
    return { error: "حدث خطأ أثناء حذف الإشعار" };
  }
}

export async function getMyNotifications() {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("session")?.value;
    
    if (!sessionId) return [];

    const user = await prisma.user.findUnique({
      where: { id: sessionId },
      include: {
        enrollments: true,
        studentProfile: true
      }
    });

    if (!user) return [];

    const enrolledSubjectIds = user.enrollments.map(e => e.subjectId);
    const userLevel = user.studentProfile?.level;
    const userStream = user.studentProfile?.stream;

    // Build Prisma OR query dynamically to avoid passing empty arrays to `hasSome` if not needed.
    // If a notification has no target arrays at all, it's global.
    // Otherwise, check if user's properties intersect.
    const notifications = await prisma.notification.findMany({
      where: {
        OR: [
          // Target by level
          ...(userLevel ? [{ levels: { has: userLevel } }] : []),
          // Target by stream
          ...(userStream ? [{ streams: { has: userStream } }] : []),
          // Target by enrolled subject
          ...(enrolledSubjectIds.length > 0 ? [{ subjectIds: { hasSome: enrolledSubjectIds } }] : []),
          // Global notifications (empty targeting)
          {
            AND: [
              { levels: { isEmpty: true } },
              { streams: { isEmpty: true } },
              { subjectIds: { isEmpty: true } }
            ]
          }
        ]
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return notifications;
  } catch (error) {
    console.error("Error fetching getMyNotifications:", error);
    return [];
  }
}
