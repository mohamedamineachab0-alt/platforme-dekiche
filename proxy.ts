import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { kv } from "@vercel/kv";

const ratelimit = process.env.KV_REST_API_URL 
  ? new Ratelimit({
      redis: kv,
      limiter: Ratelimit.slidingWindow(20, "10 s"),
      analytics: true,
    })
  : null;

export async function proxy(request: NextRequest) {
  const ip = request.ip ?? request.headers.get("x-forwarded-for") ?? "127.0.0.1";
  const geo = request.headers.get("x-vercel-ip-country");

  // 1. GEO-BLOCKING (Only allow DZ)
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
