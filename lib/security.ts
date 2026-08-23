import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import DOMPurify from "isomorphic-dompurify";

// ============================================================================
// 1. BROKEN ACCESS CONTROL (IDOR) - Server Action Guard
// ============================================================================
export async function withAuthGuard<T>(
  action: (userId: string, data: any) => Promise<T>,
  options: { requireRole?: "ADMIN" | "TEACHER" | "STUDENT" | "PARENT" } = {}
) {
  return async (data: any): Promise<{ error?: string; data?: T }> => {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("session")?.value;

    if (!sessionId) {
      return { error: "Unauthorized access (IDOR blocked)" };
    }

    const user = await prisma.user.findUnique({
      where: { id: sessionId },
      select: { id: true, role: true },
    });

    if (!user) {
      return { error: "Session invalid or expired" };
    }

    if (options.requireRole && user.role !== options.requireRole && user.role !== "ADMIN") {
      return { error: "Forbidden: Insufficient privileges" };
    }

    // Pass the strictly verified userId down to the action logic to scope DB queries
    return { data: await action(user.id, data) };
  };
}

export async function assertAuth(requireRole?: "ADMIN" | "TEACHER" | "STUDENT" | "PARENT") {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session")?.value;

  if (!sessionId) {
    throw new Error("Unauthorized access (IDOR blocked)");
  }

  const user = await prisma.user.findUnique({
    where: { id: sessionId },
    select: { id: true, role: true },
  });

  if (!user) {
    throw new Error("Session invalid or expired");
  }

  if (requireRole && user.role !== requireRole && user.role !== "ADMIN") {
    throw new Error("Forbidden: Insufficient privileges");
  }

  return user;
}

// ============================================================================
// 2. SECURE FILE UPLOADS - MIME, Magic Bytes, Size, Sanitization
// ============================================================================
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "application/pdf"];
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

export async function secureFileGuard(file: File): Promise<{ error?: string; safeFile?: File }> {
  // 1. Size Check
  if (file.size > MAX_FILE_SIZE) {
    return { error: "File exceeds 2MB limit" };
  }

  // 2. Extension & MIME spoofing check
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return { error: "Invalid file type. Only JPEG, PNG, and PDF are allowed." };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  
  // 3. Magic Number (Signature) Validation
  const magicBytes = buffer.toString("hex", 0, 4);
  const isValidSignature = 
    magicBytes.startsWith("ffd8ff") || // JPEG
    magicBytes.startsWith("89504e47") || // PNG
    magicBytes.startsWith("25504446");   // PDF
    
  if (!isValidSignature) {
    return { error: "Corrupted file or malicious signature detected." };
  }

  // 4. Filename Sanitization (Remove path traversal attacks & shell chars)
  const sanitizedName = file.name
    .replace(/[^a-zA-Z0-9.\-_]/g, "")
    .replace(/\.{2,}/g, "."); // Prevent '..'

  // Return a cloned file with the sanitized name
  const safeFile = new File([buffer], sanitizedName, { type: file.type });

  return { safeFile };
}

// ============================================================================
// 3. CROSS-SITE SCRIPTING (XSS) PREVENTION
// ============================================================================
export function sanitizeHtml(dirtyHtml: string): string {
  // Strict isomorphic DOMPurify configuration
  return DOMPurify.sanitize(dirtyHtml, {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ["script", "style", "iframe", "object", "embed", "base", "form"],
    FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover"],
    ALLOW_DATA_ATTR: false, // Prevent React data attribute injections
  });
}

// ─── THREAT INTELLIGENCE UTILITIES ───────────────────────────────────────────────
import { Redis } from "@upstash/redis";

// Shared Upstash client (reuse env vars, fallback to Vercel KV if configured)
const redisUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
export const securityRedis = redisUrl && redisToken ? new Redis({ url: redisUrl, token: redisToken }) : null;

/** Log a bot signature event and add the IP to temporary blocklist */
export async function flagBotSignature(ip: string, reason: string) {
  if (!securityRedis) return;
  const ts = new Date().toISOString();
  const entry = JSON.stringify({ ip, reason, timestamp: ts });
  // Keep a rolling log of recent signatures (10k entries)
  await securityRedis.lpush("bot-signatures", entry);
  await securityRedis.ltrim("bot-signatures", 0, 9_999);
  // Block for 30 days
  await securityRedis.setex(`blocklist:${ip}`, 30 * 24 * 60 * 60, true);
}

/** Return a delayed generic response to waste bot resources */
export async function silentDrop<T>(payload: T, status = 200): Promise<Response> {
  // 3‑second tarpit (adjustable as needed)
  await new Promise(r => setTimeout(r, 3_000));
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
