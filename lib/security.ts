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
