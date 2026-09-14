"use server";

import { prisma } from "@/lib/prisma";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { Level, Stream, Wilaya, UnderstandingLevel, PlatformBranch } from "@/generated/prisma";
import { isStreamAllowedForLevel } from "@/lib/constants";
import { flagBotSignature, securityRedis, silentDrop, encryptSession } from "@/lib/security";
import {
  accountBranchForPlatform,
  platformToBranch,
  studentHomePath,
} from "@/lib/platform-branch";
// ─── REGISTER ──────────────────────────────────────────────────────────────

export type RegisterState = {
  error?: string;
  success?: boolean;
};

function normalizeAlgerianPhone(value: string) {
  const latinDigits = value.replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)));
  const compact = latinDigits.replace(/[^\d+]/g, "");

  if (compact.startsWith("+213")) return `0${compact.slice(4)}`;
  if (compact.startsWith("213")) return `0${compact.slice(3)}`;
  return compact;
}

// Advanced Security Mitigation Config
const ALLOWED_ORIGIN = process.env.NODE_ENV === "production" ? "https://dekiche-academy.com" : "http://localhost:3000";

export async function registerUser(
  formData: FormData
): Promise<any> {
  try {
    const reqHeaders = await headers();
    const origin = reqHeaders.get("origin") || reqHeaders.get("referer");
    const ip = reqHeaders.get("x-forwarded-for") ?? "127.0.0.1";
    
    if (process.env.NODE_ENV === "production" && (!origin || !origin.startsWith(ALLOWED_ORIGIN))) {
      return { error: "Forbidden: Invalid Origin (Anti-CSRF trigger)" };
    }

    // ACTIVE DEFENSE: ESCALATING HONEYPOT
    const honeypot = formData.get("website_url") as string;
    if (honeypot) {
      await flagBotSignature(ip, "Honeypot field filled");
      if (securityRedis) await securityRedis.setex(`blocklist:${ip}`, 30 * 24 * 60 * 60, true);
      await new Promise(r => setTimeout(r, 3_000));
      return { ok: true };
    }

    const role        = (formData.get("role")        as string)?.trim() || "STUDENT";
    const fullName    = (formData.get("fullName")    as string)?.trim();
    const phoneNumber = normalizeAlgerianPhone((formData.get("phoneNumber") as string)?.trim() || "");
    const platformRaw = formData.get("platform") as string;
    const requestedBranch = platformToBranch(platformRaw);

    if (requestedBranch === "LANGUAGES" && role === "PARENT") {
      return { error: "فرع اللغات يدعم حساب التلميذ فقط" };
    }

    if (!fullName || !phoneNumber) {
      return { error: "جميع الحقول مطلوبة" };
    }

    if (!/^0[567][0-9]{8}$/.test(phoneNumber)) {
      return { error: "صيغة رقم الهاتف غير صحيحة" };
    }

    const isSuperAdmin = phoneNumber === "0562388085";
    const accountBranch = accountBranchForPlatform(platformRaw);

    const existing = await prisma.user.findUnique({
      where: {
        phoneNumber_accountBranch: { phoneNumber, accountBranch },
      },
    });
    if (existing) {
      return {
        error:
          accountBranch === "LANGUAGES"
            ? "رقم الهاتف مسجل مسبقا في تعلّم اللغات — جرّب تسجيل الدخول من صفحة اللغات"
            : "رقم الهاتف مسجل مسبقا في فرع الدراسة — جرّب تسجيل الدخول",
      };
    }

    const passwordHash = "";
    let userId: string | null = null;
    let studentBranch: PlatformBranch = "STUDY";

    if (role === "PARENT") {
      const user = await prisma.user.create({
        data: {
          fullName,
          phoneNumber,
          accountBranch: "STUDY",
          passwordHash,
          role: isSuperAdmin ? "ADMIN" : "PARENT",
          parentProfile: {
            create: {},
          },
        },
      });
      userId = user.id;
    } else {
      // STUDENT ROLE
      const wilaya = formData.get("wilaya") as string;
      const level = formData.get("level") as string;
      const stream = formData.get("stream") as string;
      const understandingLevel = formData.get("understandingLevel") as string;
      const branch = platformToBranch(formData.get("platform") as string);
      studentBranch = branch;
      const parentName = "غير محدد";
      const parentPhone = "غير محدد";
      const isLanguagesBranch = branch === "LANGUAGES";

      if (!wilaya || !level || !stream || (!isLanguagesBranch && !understandingLevel)) {
        return { error: "جميع الحقول مطلوبة" };
      }

      if (!Object.values(Wilaya).includes(wilaya as Wilaya)) return { error: "الولاية غير صالحة" };
      if (!Object.values(Level).includes(level as Level)) return { error: "المستوى غير صالح" };
      if (!Object.values(Stream).includes(stream as Stream)) return { error: "الفرع غير صالح" };
      if (!isStreamAllowedForLevel(level, stream)) return { error: "هذا الفرع لا ينتمي للدورة المختارة" };
      if (
        !isLanguagesBranch &&
        !Object.values(UnderstandingLevel).includes(understandingLevel as UnderstandingLevel)
      ) {
        return { error: "مستوى الفهم غير صالح" };
      }

      const user = await prisma.user.create({
        data: {
          fullName,
          phoneNumber,
          accountBranch,
          passwordHash,
          role: isSuperAdmin ? "ADMIN" : "STUDENT",
          studentProfile: {
            create: {
              parentName,
              parentPhone,
              level: level as Level,
              stream: stream as Stream,
              wilaya: wilaya as Wilaya,
              branch,
              ...(isLanguagesBranch
                ? {}
                : { understandingLevel: understandingLevel as UnderstandingLevel }),
            },
          },
        },
      });
      userId = user.id;
    }

    const sessionToken = await encryptSession({ userId });

    const cookieStore = await cookies();
    cookieStore.set("session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    if (isSuperAdmin) {
      return { success: true, redirectUrl: "/dashboard/admin" };
    } else {
      const homeBranch =
        accountBranch === "LANGUAGES" ? "LANGUAGES" : studentBranch;
      return {
        success: true,
        redirectUrl:
          role === "PARENT" ? "/dashboard/parent" : studentHomePath(homeBranch),
      };
    }
  } catch (error: any) {
    console.error("Auth Error (Register):", error);
    return { error: error instanceof Error ? error.message : String(error) };
  }
}

// ─── LOGIN ─────────────────────────────────────────────────────────────────

export type LoginState = {
  error?: string;
  success?: boolean;
};

export async function loginUser(
  formData: FormData
): Promise<any> {
  const fullName = (formData.get("fullName") as string)?.trim();
  const phoneNumber = normalizeAlgerianPhone((formData.get("phoneNumber") as string)?.trim() || "");
  const accountBranch = accountBranchForPlatform(formData.get("platform") as string);
  
  if (!fullName || !phoneNumber) {
    return { error: "يرجى إدخال اسمك الكامل ورقم الهاتف" };
  }

  let user = await prisma.user.findFirst({
    where: {
      phoneNumber,
      accountBranch,
    },
    include: { studentProfile: { select: { branch: true } } },
  });

  const isSuperAdmin = phoneNumber === "0562388085" && accountBranch === "STUDY";

  if (!user) {
    // Smart Auto-Register (study portal only — languages must register explicitly)
    if (accountBranch === "LANGUAGES") {
      return { error: "لا يوجد حساب تعلّم لغات بهذا الرقم — أنشئ حسابا من صفحة اللغات" };
    }

    user = await prisma.user.create({
      data: {
        fullName,
        phoneNumber,
        accountBranch: "STUDY",
        passwordHash: "",
        role: isSuperAdmin ? "ADMIN" : "STUDENT",
        ...(isSuperAdmin
          ? {}
          : {
              studentProfile: {
                create: {
                  parentName: "غير محدد",
                  parentPhone: "غير محدد",
                  level: "AS3",
                  stream: "SCIENCES",
                  wilaya: "W16",
                  branch: "STUDY",
                },
              },
            }),
      },
      include: { studentProfile: { select: { branch: true } } },
    });
  } else if (user.fullName !== fullName) {
    // Optionally update the name if it differs, or just proceed
    // We'll just proceed since they matched the phone number.
  }

  const headersList = await headers();
  const userAgent = headersList.get("user-agent") || "Unknown Device";
  const fingerprints = new Set(user.deviceFingerprints || []);
  fingerprints.add(userAgent);

  // Session handling
  await prisma.user.update({
    where: { id: user.id },
    data: { 
      lastLoginAt: new Date(),
      deviceFingerprints: Array.from(fingerprints),
      ...(isSuperAdmin ? { role: "ADMIN" } : {})
    },
  });

  const rememberMe = formData.get("rememberMe") === "on";
  
  const sessionToken = await encryptSession({ userId: user.id });

  const cookieStore = await cookies();
  cookieStore.set("session", sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    ...(rememberMe ? { maxAge: 60 * 60 * 24 * 30 } : {}), // 30 days if remembered, otherwise session cookie
  });

  const finalRole = isSuperAdmin ? "ADMIN" : user.role;

  // Role-based redirect
  if (finalRole === "ADMIN")   redirect("/dashboard/admin");
  if (finalRole === "TEACHER") redirect("/dashboard/teacher");
  if (finalRole === "PARENT")  redirect("/dashboard/parent");
  redirect(studentHomePath(user.studentProfile?.branch));
}

// ─── LOGOUT ────────────────────────────────────────────────────────────────
export async function logoutUser() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
  redirect("/login");
}

export async function logoutSmartTeacher() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
  redirect("/login");
}
