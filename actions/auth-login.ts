"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { encryptSession } from "@/lib/security";

export type LoginState = {
  error?: string;
  success?: boolean;
  redirectUrl?: string;
};

export async function universalLoginAction(
  formData: FormData
): Promise<LoginState> {
  const fullName = (formData.get("fullName") as string)?.trim();
  const phoneNumber = (formData.get("phoneNumber") as string)?.trim();

  if (!fullName || !phoneNumber) {
    return { error: "يرجى إدخال الاسم الكامل ورقم الهاتف" };
  }

  let user = null;

  try {
    // Construct the alternative phone number format (+213) if it starts with 0
    const altPhoneNumber = phoneNumber.startsWith("0") 
      ? "+213" + phoneNumber.substring(1) 
      : phoneNumber.startsWith("+213") 
        ? "0" + phoneNumber.substring(4)
        : phoneNumber;

    // 2. Fetch by phone number (handling both formats)
    user = await prisma.user.findFirst({
      where: {
        OR: [
          { phoneNumber: phoneNumber },
          { phoneNumber: altPhoneNumber },
        ]
      },
    });

    // Normalize Arabic names to ignore common typos (spaces, أ/إ/آ vs ا, ة vs ه, ى vs ي)
    const normalizeArabicName = (name: string) => {
      if (!name) return "";
      return name
        .toLowerCase()
        .replace(/\s+/g, "")
        .replace(/[أإآ]/g, "ا")
        .replace(/ة/g, "ه")
        .replace(/ى/g, "ي");
    };

    // 3. Reject if the user does not exist or the name doesn't match after normalization
    if (
      !user ||
      normalizeArabicName(user.fullName) !== normalizeArabicName(fullName)
    ) {
      return { error: "بيانات الدخول غير صحيحة، أو الحساب غير موجود" };
    }

    const sessionToken = await encryptSession({ userId: user.id });

    const cookieStore = await cookies();
    cookieStore.set("session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    // 5. Update last login safely
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });
  } catch (error: any) {
    console.error("Auth Error (Login):", error);
    return { 
      error: error instanceof Error ? error.message : String(error)
    };
  }

  // 6. Return success and URL instead of throwing a Server-Side redirect
  let redirectUrl = "/dashboard/student"; // Fallback
  switch (user.role) {
    case "ADMIN":
      redirectUrl = "/dashboard/admin";
      break;
    case "TEACHER":
      redirectUrl = "/dashboard/teacher";
      break;
    case "STUDENT":
      redirectUrl = "/dashboard/student";
      break;
    case "PARENT":
      redirectUrl = "/dashboard/parent";
      break;
  }
  
  return { success: true, redirectUrl };
}
