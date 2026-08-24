"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getStudentsWithParents() {
  try {
    const students = await prisma.user.findMany({
      where: { role: "STUDENT" },
      select: {
        id: true,
        fullName: true,
        studentProfile: {
          select: {
            level: true,
            stream: true,
          }
        },
        studentLinks: {
          select: {
            parent: {
              select: {
                id: true,
                fullName: true,
                phoneNumber: true,
              }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return students.map(student => ({
      id: student.id,
      fullName: student.fullName,
      level: student.studentProfile?.level,
      stream: student.studentProfile?.stream,
      parent: student.studentLinks.length > 0 ? student.studentLinks[0].parent : null
    }));
  } catch (error) {
    console.error("Error fetching students with parents:", error);
    return [];
  }
}

export async function sendDirectNotification(userId: string, title: string, content: string) {
  try {
    if (!title.trim() || !content.trim()) {
      return { error: "يرجى ملء جميع الحقول" };
    }

    // The new Notification schema does not support direct userId targeting or month.
    // Direct notifications to parents will be handled via a different system or SMS in the future.
    console.log("Direct notification to parent requested, but schema deprecated it.", { userId, title, content });
    
    return { error: "ميزة الإشعارات المباشرة قيد التحديث للنسخة الجديدة" };

    revalidatePath("/dashboard/admin/parents");
    return { success: true };
  } catch (error) {
    console.error("Error sending notification:", error);
    return { error: "حدث خطأ أثناء إرسال الإشعار" };
  }
}

export async function closeParentTicket(ticketId: string) {
  try {
    await prisma.parentTicket.update({
      where: { id: ticketId },
      data: { status: "CLOSED" }
    });
    revalidatePath("/dashboard/admin/parent-messages");
    return { success: true };
  } catch (error) {
    console.error("Error closing ticket:", error);
    return { error: "حدث خطأ أثناء إغلاق الرسالة" };
  }
}

export async function replyToParentTicket(ticketId: string, replyContent: string) {
  try {
    if (!replyContent.trim()) {
      return { error: "لا يمكن إرسال رد فارغ" };
    }
    await prisma.parentTicket.update({
      where: { id: ticketId },
      data: { 
        adminReply: replyContent,
        status: "ANSWERED"
      }
    });
    revalidatePath("/dashboard/admin/parent-messages");
    return { success: true };
  } catch (error) {
    console.error("Error replying to ticket:", error);
    return { error: "حدث خطأ أثناء الرد على الرسالة" };
  }
}
