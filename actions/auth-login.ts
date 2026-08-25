"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

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
    // 2. Exact match validation against the database
    user = await prisma.user.findFirst({
      where: {
        fullName: fullName,
        phoneNumber: phoneNumber,
      },
    });

    // 3. Reject if the user does not exist
    if (!user) {
      return { error: "بيانات الدخول غير صحيحة، أو الحساب غير موجود" };
    }

    // 4. Encrypt the JWT session and set the HTTP-only session cookie
    const { encryptSession } = await import("@/lib/security");
    const jwtToken = await encryptSession({ userId: user.id, role: user.role });
    
    const cookieStore = await cookies();
    cookieStore.set("session", jwtToken, {
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
