import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redisUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

const redis = redisUrl && redisToken
  ? new Redis({ url: redisUrl, token: redisToken })
  : null;

const ratelimit = redis 
  ? new Ratelimit({
      redis: redis,
      limiter: Ratelimit.slidingWindow(20, "10 s"),
      analytics: true,
    })
  : null;

// ----------------------------------------------------------------------------
// ACTIVE DEFENSE: HONEY-URLS (Common bot scan paths)
// ----------------------------------------------------------------------------
const HONEY_URLS = new Set([
  "/.env", "/.env.local", "/.env.production", "/.env.test",
  "/.git", "/.git/config", 
  "/wp-admin", "/wp-login.php", "/xmlrpc.php", 
  "/phpmyadmin", "/pma", 
  "/config.php", "/api/backup", "/backup.zip"
]);

export async function proxy(request: NextRequest) {
  // request.ip is deprecated/removed in newer Next.js versions. We use headers instead.
  const ip = request.headers.get("x-forwarded-for") ?? "127.0.0.1";
  const geo = request.headers.get("x-vercel-ip-country");
  const pathname = request.nextUrl.pathname.toLowerCase();

  // 1. ACTIVE DEFENSE: TARPIT & BLACKLIST GUARD
  if (redis) {
    const blacklistKey = `blacklist:${ip}`;
    
    // Check if IP is already permanently banned
    let isBlacklisted = await redis.get<boolean>(blacklistKey);

    // If they hit a honeypot, ban them instantly
    if (!isBlacklisted && HONEY_URLS.has(pathname)) {
      await redis.setex(blacklistKey, 30 * 24 * 60 * 60, true); // Ban for 30 days
      isBlacklisted = true;
      console.warn(`[ACTIVE DEFENSE] IP ${ip} hit honeypot: ${pathname}. Banned for 30 days.`);
    }

    if (isBlacklisted) {
      // TARPIT: Waste bot resources by holding the connection open for 5 seconds
      await new Promise(r => setTimeout(r, 5000));
      return NextResponse.json(
        { error: "Forbidden: Malicious activity detected." },
        { status: 403 }
      );
    }
  }

  // 2. GEO-BLOCKING (Only allow DZ)
  if (process.env.NODE_ENV === "production" && geo && geo !== "DZ") {
    return NextResponse.json(
      { error: "Forbidden: Access restricted to Algeria only." },
      { status: 403 }
    );
  }

  // 2. RATE LIMITING (Apply to API and Actions)
  if (ratelimit && (request.nextUrl.pathname.startsWith("/api") || request.nextUrl.pathname.startsWith("/dashboard"))) {
    const { success, limit, reset, remaining } = await ratelimit.limit(ip);

    if (!success) {
      return NextResponse.json(
        { error: "Too Many Requests", retryAfter: reset },
        { 
          status: 429,
          headers: {
            "X-RateLimit-Limit": limit.toString(),
            "X-RateLimit-Remaining": remaining.toString(),
            "X-RateLimit-Reset": reset.toString()
          }
        }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
