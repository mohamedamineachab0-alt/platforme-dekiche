// file:///Users/istore/platforme/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Shared Upstash client (Edge compatible)
const redisUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const securityRedis = redisUrl && redisToken ? new Redis({ url: redisUrl, token: redisToken }) : null;

/** Log a bot signature event and add the IP to temporary blocklist */
async function flagBotSignature(ip: string, reason: string) {
  if (!securityRedis) return;
  const ts = new Date().toISOString();
  const entry = JSON.stringify({ ip, reason, timestamp: ts });
  await securityRedis.lpush("bot-signatures", entry);
  await securityRedis.ltrim("bot-signatures", 0, 9_999);
  await securityRedis.setex(`blocklist:${ip}`, 30 * 24 * 60 * 60, true);
}

// Rate limiter for registration endpoint (3 requests per 15 min per IP)
const registerLimiter = securityRedis
  ? new Ratelimit({
      redis: securityRedis,
      limiter: Ratelimit.fixedWindow(3, "15 m"),
      analytics: true,
    })
  : null;

// Honey‑URL trap list (common scanner paths)
const HONEY_PATHS = new Set([
  "/.env",
  "/.env.local",
  "/.git",
  "/.git/config",
  "/wp-admin",
  "/wp-login.php",
  "/phpmyadmin",
  "/api/backup",
  "/backup.zip",
]);

// Helper: log IP, UA, path, timestamp to Upstash KV (daily list)
async function logThreat(ip: string, ua: string | null, path: string) {
  if (!securityRedis) return;
  const ts = new Date().toISOString();
  const entry = JSON.stringify({ ip, userAgent: ua, path, timestamp: ts });
  const dayKey = `threat-log:${ts.slice(0, 10)}`; // e.g. threat-log:2026-08-23
  await securityRedis.lpush(dayKey, entry);
  await securityRedis.ltrim(dayKey, 0, 9_999);
}

export async function middleware(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "127.0.0.1";
  const ua = request.headers.get("user-agent");
  const pathname = request.nextUrl.pathname.toLowerCase();

  // Helper to return HTML for browser WAF blocks instead of JSON (which triggers downloads)
  const wafBlockResponse = () => new NextResponse(
    `<!DOCTYPE html><html><head><title>Access Denied</title></head><body><h1>403 Forbidden</h1><p>Your IP (${ip}) has been blocked by the security firewall.</p></body></html>`,
    { status: 403, headers: { "Content-Type": "text/html" } }
  );

  // ---------------------------------------------------
  // 1️⃣ Log all protected endpoint traffic
  // ---------------------------------------------------
  const isProtected = pathname.startsWith("/register") || pathname.startsWith("/api/");
  if (isProtected) await logThreat(ip, ua, pathname);

  // ---------------------------------------------------
  // 2️⃣ Fast blocklist check – silent drop (tarpit)
  // ---------------------------------------------------
  if (ua && /k6/i.test(ua)) {
    await flagBotSignature(ip, "k6 load tester detected");
    if (securityRedis) await securityRedis.setex(`blocklist:${ip}`, 30 * 24 * 60 * 60, true);
    await new Promise(r => setTimeout(r, 3_000));
    return wafBlockResponse();
  }

  if (securityRedis && (await securityRedis.get<boolean>(`blocklist:${ip}`))) {
    await flagBotSignature(ip, "Blocklist hit");
    await new Promise(r => setTimeout(r, 3_000));
    return wafBlockResponse();
  }

  // ---------------------------------------------------
  // 3️⃣ Honey‑URL trap – immediate blacklist + silent drop
  // ---------------------------------------------------
  if (HONEY_PATHS.has(pathname)) {
    if (securityRedis) await securityRedis.setex(`blocklist:${ip}`, 30 * 24 * 60 * 60, true);
    await flagBotSignature(ip, `Honey‑URL accessed: ${pathname}`);
    await new Promise(r => setTimeout(r, 3_000));
    return wafBlockResponse();
  }

  // ---------------------------------------------------
  // 4️⃣ Rate limiting for registration
  // ---------------------------------------------------
  if (pathname.startsWith("/register") && registerLimiter) {
    const { success, limit, remaining, reset } = await registerLimiter.limit(ip);
    if (!success) {
      if (securityRedis) await securityRedis.setex(`blocklist:${ip}`, 30 * 24 * 60 * 60, true);
      await flagBotSignature(ip, "Rate limit exceeded on /register");
      await new Promise(r => setTimeout(r, 3_000));
      return wafBlockResponse();
    }
  }

  // ---------------------------------------------------
  // 5️⃣ Allow normal traffic
  // ---------------------------------------------------
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
    "/api/:path*",
  ],
};
