"use server";

import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { assertAuth } from "@/lib/security";

export async function getAvailableSubjects() {
  try {
    const subjects = await prisma.subject.findMany({
      where: {
        isPublished: true,
      },
      select: {
        id: true,
        title: true,
        level: true,
        stream: true,
        teacherName: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return subjects;
  } catch (error: any) {
    if (error?.digest?.includes("DYNAMIC_SERVER_USAGE") || error?.message?.includes("Dynamic server usage")) {
      throw error;
    }
    console.error("Error fetching available subjects:", error);
    return [];
  }
}

export async function createSubscriptionRequest(data: {
  subjectIds: string[];
  level: string;
  stream: string;
  wilaya: string;
  address: string;
  phoneNumber: string;
}) {
  try {
    const sessionUser = await assertAuth("STUDENT");

    const newRequest = await prisma.subscriptionRequest.create({
      data: {
        studentId: sessionUser.id,
        subjectIds: data.subjectIds,
        level: data.level,
        stream: data.stream,
        wilaya: data.wilaya,
        address: data.address,
        phoneNumber: data.phoneNumber,
        status: "PENDING",
      },
    });

    return { success: true, request: newRequest };
  } catch (error: any) {
    if (error?.digest?.includes("DYNAMIC_SERVER_USAGE") || error?.message?.includes("Dynamic server usage")) {
      throw error;
    }
    console.error("Error creating subscription request:", error);
    return { error: "حدث خطأ أثناء إرسال الطلب" };
  }
}

export async function getAdminSubscriptionRequests() {
  try {
    await assertAuth("ADMIN");

    const requests = await prisma.subscriptionRequest.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        student: {
          select: { fullName: true, phoneNumber: true, avatarUrl: true },
        },
      },
    });

    return { success: true, requests };
  } catch (error) {
    console.error("Error fetching admin subscription requests:", error);
    return { error: "حدث خطأ أثناء جلب الطلبات", requests: [] };
  }
}

export async function updateSubscriptionRequestStatus(id: string, status: string) {
  try {
    await assertAuth("ADMIN");

    await prisma.subscriptionRequest.update({
      where: { id },
      data: { status },
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating subscription request status:", error);
    return { error: "حدث خطأ أثناء تحديث حالة الطلب" };
  }
}

export async function getSubjectsByIds(subjectIds: string[]) {
  try {
    const subjects = await prisma.subject.findMany({
      where: { id: { in: subjectIds } },
      select: { id: true, title: true },
    });
    return { success: true, subjects };
  } catch (error) {
    console.error("Error fetching subjects by ids:", error);
    return { error: "حدث خطأ أثناء جلب المواد", subjects: [] };
  }
}
