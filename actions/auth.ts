"use server";

import { prisma } from "@/lib/prisma";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { Level, Stream, Wilaya } from "@/generated/prisma";

// ─── REGISTER ──────────────────────────────────────────────────────────────

export type RegisterState = {
  error?: string;
  success?: boolean;
};

// Advanced Security Mitigation Config
const ALLOWED_ORIGIN = process.env.NODE_ENV === "production" ? "https://dekiche-academy.com" : "http://localhost:3000";
const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY || "1x0000000000000000000000000000000AA"; // Dummy default for typing
const DISPOSABLE_DOMAINS = ["mailinator.com", "yopmail.com", "tempmail.com", "guerrillamail.com", "10minutemail.com", "temp-mail.org"];

async function verifyTurnstile(token: string) {
  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `secret=${TURNSTILE_SECRET_KEY}&response=${token}`,
  });
  const data = await res.json();
  return data.success;
}

export async function registerUser(
  formData: FormData
): Promise<any> {
  const reqHeaders = await headers();
  const origin = reqHeaders.get("origin") || reqHeaders.get("referer");
  
  if (process.env.NODE_ENV === "production" && (!origin || !origin.startsWith(ALLOWED_ORIGIN))) {
    return { error: "Forbidden: Invalid Origin (Anti-CSRF trigger)" };
  }

  const turnstileToken = formData.get("cf-turnstile-response") as string;
  if (!turnstileToken) {
    return { error: "Missing Turnstile validation token" };
  }

  const isHuman = await verifyTurnstile(turnstileToken);
  if (!isHuman) {
    return { error: "Bot detected. Turnstile challenge failed." };
  }

  const role        = (formData.get("role")        as string)?.trim() || "STUDENT";
  const fullName    = (formData.get("fullName")    as string)?.trim();
  const phoneNumber = (formData.get("phoneNumber") as string)?.trim();
  const email       = (formData.get("email")       as string)?.trim();
  
  if (email) {
    const domain = email.split("@")[1]?.toLowerCase();
    if (DISPOSABLE_DOMAINS.includes(domain)) {
      return { error: "Disposable email providers are prohibited." };
    }
  }

  if (!fullName || !phoneNumber) {
    return { error: "جميع الحقول مطلوبة" };
  }

  const isSuperAdmin = phoneNumber === "0562388085";

  const existing = await prisma.user.findUnique({ where: { phoneNumber } });
  if (existing) return { error: "رقم الهاتف مسجل مسبقا جرب تسجيل الدخول" };

  const passwordHash = "";

  if (role === "PARENT") {
    const user = await prisma.user.create({
      data: {
        fullName,
        phoneNumber,
        passwordHash,
        role: isSuperAdmin ? "ADMIN" : "PARENT",
        parentProfile: {
          create: {},
        },
      },
    });

    const cookieStore = await cookies();
    cookieStore.set("session", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    if (isSuperAdmin) {
      redirect("/dashboard/admin");
    } else {
      redirect("/dashboard/parent");
    }
  } else {
    // STUDENT ROLE
    const wilaya      = formData.get("wilaya")      as string;
    const level       = formData.get("level")       as string;
    const stream      = formData.get("stream")      as string;
    const parentName  = "غير محدد";
    const parentPhone = "غير محدد";

    if (!wilaya || !level || !stream) {
      return { error: "جميع الحقول مطلوبة" };
    }

    if (!Object.values(Wilaya).includes(wilaya as Wilaya)) return { error: "الولاية غير صالحة" };
    if (!Object.values(Level).includes(level as Level))   return { error: "المستوى غير صالح" };
    if (!Object.values(Stream).includes(stream as Stream)) return { error: "الشعبة غير صالحة" };

    const user = await prisma.user.create({
      data: {
        fullName,
        phoneNumber,
        passwordHash,
        role: isSuperAdmin ? "ADMIN" : "STUDENT",
        studentProfile: {
          create: {
            parentName,
            parentPhone,
            level: level as Level,
            stream: stream as Stream,
            wilaya: wilaya as Wilaya,
          },
        },
      },
    });

    const cookieStore = await cookies();
    cookieStore.set("session", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    if (isSuperAdmin) {
      redirect("/dashboard/admin");
    } else {
      redirect("/dashboard/student");
    }
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
  const phoneNumber = (formData.get("phoneNumber") as string)?.trim();
  
  if (!fullName || !phoneNumber) {
    return { error: "يرجى إدخال اسمك الكامل ورقم الهاتف" };
  }

  let user = await prisma.user.findFirst({
    where: {
      phoneNumber: phoneNumber
    }
  });

  const isSuperAdmin = phoneNumber === "0562388085";

  if (!user) {
    // Smart Auto-Register
    user = await prisma.user.create({
      data: {
        fullName,
        phoneNumber,
        passwordHash: "",
        role: isSuperAdmin ? "ADMIN" : "STUDENT",
        ...(isSuperAdmin ? {} : {
          studentProfile: {
            create: {
              parentName: "غير محدد",
              parentPhone: "غير محدد",
              level: "AS3",
              stream: "SCIENCES",
              wilaya: "W16",
            }
          }
        })
      }
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

  const cookieStore = await cookies();
  cookieStore.set("session", user.id, {
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
  redirect("/dashboard/student");
}

// ─── LOGOUT ────────────────────────────────────────────────────────────────
export async function logoutUser() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
  redirect("/login");
}
