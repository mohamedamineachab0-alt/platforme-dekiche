"use server";

import { prisma } from "@/lib/prisma";
import { assertAuth } from "@/lib/security";
import { studentHomePath } from "@/lib/platform-branch";
import { UnderstandingLevel } from "@/generated/prisma";

const ALLOWED: UnderstandingLevel[] = [
  UnderstandingLevel.FAST,
  UnderstandingLevel.AVERAGE,
  UnderstandingLevel.WEAK,
];

export async function saveUnderstandingLevel(
  level: string
): Promise<{ error?: string; success?: boolean; redirectUrl?: string }> {
  const user = await assertAuth({ requireRole: "STUDENT" });

  if (!ALLOWED.includes(level as UnderstandingLevel)) {
    return { error: "اختيار غير صالح" };
  }

  const profile = await prisma.studentProfile.findUnique({
    where: { userId: user.id },
    select: { id: true, branch: true },
  });

  if (!profile) {
    return { error: "الملف الشخصي غير موجود" };
  }

  await prisma.studentProfile.update({
    where: { userId: user.id },
    data: { understandingLevel: level as UnderstandingLevel },
  });

  return { success: true, redirectUrl: studentHomePath(profile.branch) };
}
