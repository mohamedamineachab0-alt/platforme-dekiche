import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SignJWT, jwtVerify } from "jose";
import { Redis } from "@upstash/redis";

// ============================================================================
// 1. JWT SESSION SECURITY & RBAC
// ============================================================================
const secretKey = process.env.AUTH_SECRET || "default_super_secret_key_change_me_in_prod";
const encodedKey = new TextEncoder().encode(secretKey);

export async function encryptSession(payload: any) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encodedKey);
}

export async function decryptSession(token: string | undefined = "") {
  try {
    const { payload } = await jwtVerify(token, encodedKey, {
      algorithms: ["HS256"],
    });
    return payload;
  } catch (error) {
    return null;
  }
}

type Role = "ADMIN" | "TEACHER" | "STUDENT" | "PARENT";

const ROLE_PERMISSIONS: Record<Role, string[]> = {
  ADMIN: ["*"],
  TEACHER: ["manage:own_lessons", "view:own_students", "create:content"],
  STUDENT: ["view:published_lessons", "submit:exercises"],
  PARENT: ["view:children_progress", "send:messages"],
};

export function hasPermission(userRole: Role, requiredPermission?: string): boolean {
  if (!requiredPermission) return true;
  if (userRole === "ADMIN") return true;
  const perms = ROLE_PERMISSIONS[userRole] || [];
  return perms.includes("*") || perms.includes(requiredPermission);
}

export async function withAuthGuard<T>(
  action: (userId: string, data: any) => Promise<T>,
  options: { requireRole?: Role; requirePermission?: string } = {}
) {
  return async (data: any): Promise<{ error?: string; data?: T }> => {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session")?.value;

    if (!sessionToken) {
      return { error: "Unauthorized access (IDOR blocked)" };
    }

    const payload = await decryptSession(sessionToken);
    if (!payload || !payload.userId) {
      return { error: "Session invalid or expired" };
    }

    const userId = payload.userId as string;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });

    if (!user) {
      return { error: "User not found or deleted" };
    }

    if (options.requireRole && user.role !== options.requireRole && user.role !== "ADMIN") {
      return { error: "Forbidden: Insufficient role privileges" };
    }

    if (options.requirePermission && !hasPermission(user.role as Role, options.requirePermission)) {
      return { error: "Forbidden: Missing required permission" };
    }

    return { data: await action(user.id, data) };
  };
}

export async function assertAuth(options: { requireRole?: Role; requirePermission?: string } = {}) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session")?.value;

  if (!sessionToken) {
    redirect("/login");
  }

  const payload = await decryptSession(sessionToken);
  if (!payload || !payload.userId) {
    redirect("/login");
  }

  const userId = payload.userId as string;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true },
  });

  if (!user) {
    redirect("/login");
  }

  if (options.requireRole && user.role !== options.requireRole && user.role !== "ADMIN") {
    redirect("/login");
  }

  if (options.requirePermission && !hasPermission(user.role as Role, options.requirePermission)) {
    redirect("/login");
  }

  return user;
}

// ============================================================================
// 2. CSRF PROTECTION
// ============================================================================
export async function generateCsrfToken() {
  const token = crypto.randomUUID();
  const cookieStore = await cookies();
  cookieStore.set("csrf_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  });
  return token;
}

export async function validateCsrfToken(submittedToken: string) {
  const cookieStore = await cookies();
  const storedToken = cookieStore.get("csrf_token")?.value;
  
  if (!storedToken || storedToken !== submittedToken) {
    throw new Error("CSRF token validation failed. Possible Cross-Site Request Forgery attempt.");
  }
  return true;
}

// ============================================================================
// 3. SECURE FILE UPLOADS - MIME, Magic Bytes, Size, Sanitization
// ============================================================================
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "application/pdf"];
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

export async function secureFileGuard(file: File): Promise<{ error?: string; safeFile?: File }> {
  if (file.size > MAX_FILE_SIZE) {
    return { error: "File exceeds 2MB limit" };
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return { error: "Invalid file type. Only JPEG, PNG, and PDF are allowed." };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  
  const magicBytes = buffer.toString("hex", 0, 4);
  const isValidSignature = 
    magicBytes.startsWith("ffd8ff") || 
    magicBytes.startsWith("89504e47") || 
    magicBytes.startsWith("25504446");
    
  if (!isValidSignature) {
    return { error: "Corrupted file or malicious signature detected." };
  }

  const sanitizedName = file.name
    .replace(/[^a-zA-Z0-9.\-_]/g, "")
    .replace(/\.{2,}/g, "."); 

  const safeFile = new File([buffer], sanitizedName, { type: file.type });

  return { safeFile };
}

// ============================================================================
// 4. CROSS-SITE SCRIPTING (XSS) PREVENTION
// ============================================================================
export async function sanitizeHtml(dirtyHtml: string): Promise<string> {
  const DOMPurify = (await import("isomorphic-dompurify")).default;
  
  return DOMPurify.sanitize(dirtyHtml, {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ["script", "style", "iframe", "object", "embed", "base", "form"],
    FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover"],
    ALLOW_DATA_ATTR: false,
  });
}

// ============================================================================
// 5. THREAT INTELLIGENCE UTILITIES
// ============================================================================
const redisUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
export const securityRedis = redisUrl && redisToken ? new Redis({ url: redisUrl, token: redisToken }) : null;

export async function flagBotSignature(ip: string, reason: string) {
  if (!securityRedis) return;
  const ts = new Date().toISOString();
  const entry = JSON.stringify({ ip, reason, timestamp: ts });
  await securityRedis.lpush("bot-signatures", entry);
  await securityRedis.ltrim("bot-signatures", 0, 9_999);
  await securityRedis.setex(`blocklist:${ip}`, 30 * 24 * 60 * 60, true);
}

export async function silentDrop<T>(payload: T, status = 200): Promise<Response> {
  await new Promise(r => setTimeout(r, 3_000));
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
