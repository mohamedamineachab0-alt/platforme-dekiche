"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { encryptSession } from "@/lib/security";
import { accountBranchForPlatform, studentHomePath } from "@/lib/platform-branch";
import type { PlatformBranch } from "@/generated/prisma";

export type LoginState = {
  error?: string;
  success?: boolean;
  redirectUrl?: string;
};

function normalizeAlgerianPhone(value: string) {
  const latinDigits = value.replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)));
  const compact = latinDigits.replace(/[^\d+]/g, "");

  if (compact.startsWith("+213")) return `0${compact.slice(4)}`;
  if (compact.startsWith("213")) return `0${compact.slice(3)}`;
  return compact;
}

function normalizeArabicName(name: string) {
  if (!name) return "";
  return name
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي");
}

export async function universalLoginAction(formData: FormData): Promise<LoginState> {
  const fullName = (formData.get("fullName") as string)?.trim();
  const rawPhone = (formData.get("phoneNumber") as string)?.trim() || "";
  const phoneNumber = normalizeAlgerianPhone(rawPhone);
  const accountBranch = accountBranchForPlatform(formData.get("platform") as string);

  if (!fullName || !phoneNumber) {
    return { error: "يرجى إدخال الاسم الكامل ورقم الهاتف" };
  }

  let user: {
    id: string;
    role: string;
    fullName: string;
    accountBranch: PlatformBranch;
    studentProfile: { branch: PlatformBranch } | null;
  } | null = null;

  try {
    const altPhoneNumber = phoneNumber.startsWith("0")
      ? `+213${phoneNumber.substring(1)}`
      : phoneNumber.startsWith("+213")
        ? `0${phoneNumber.substring(4)}`
        : phoneNumber;

    user = await prisma.user.findFirst({
      where: {
        accountBranch,
        OR: [{ phoneNumber }, { phoneNumber: altPhoneNumber }, { phoneNumber: rawPhone }],
      },
      include: { studentProfile: { select: { branch: true } } },
    });

    if (!user || normalizeArabicName(user.fullName) !== normalizeArabicName(fullName)) {
      return {
        error:
          accountBranch === "LANGUAGES"
            ? "لا يوجد حساب تعلّم لغات بهذه البيانات — أنشئ حسابا من صفحة اللغات"
            : "بيانات الدخول غير صحيحة أو الحساب غير موجود",
      };
    }

    if (user.role === "STUDENT" && user.studentProfile?.branch === "SMART_TEACHER") {
      await prisma.studentProfile.update({
        where: { userId: user.id },
        data: { branch: "STUDY" },
      });
      user.studentProfile.branch = "STUDY";
    }

    const sessionToken = await encryptSession({ userId: user.id });
    const cookieStore = await cookies();
    cookieStore.set("session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });
  } catch (error: unknown) {
    console.error("Auth Error (Login):", error);
    return {
      error: error instanceof Error ? error.message : String(error),
    };
  }

  if (!user) {
    return { error: "بيانات الدخول غير صحيحة أو الحساب غير موجود" };
  }

  let redirectUrl = "/dashboard/student";
  switch (user.role) {
    case "ADMIN":
      redirectUrl = "/dashboard/admin";
      break;
    case "TEACHER":
      redirectUrl = "/dashboard/teacher";
      break;
      case "STUDENT":
      redirectUrl = studentHomePath(
        user.accountBranch === "LANGUAGES"
          ? "LANGUAGES"
          : user.studentProfile?.branch ?? user.accountBranch
      );
      break;
    case "PARENT":
      redirectUrl = "/dashboard/parent";
      break;
  }

  return { success: true, redirectUrl };
}
