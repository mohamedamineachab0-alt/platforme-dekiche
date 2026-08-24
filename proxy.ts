import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Initialize Upstash Redis client safely
const redisUrl = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

// Create Redis instance if credentials exist
const redis = redisUrl && redisToken ? new Redis({ url: redisUrl, token: redisToken }) : null;

// Configure Ratelimit using a sliding window algorithm (100 reqs per 10 seconds)
const ratelimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(100, "10 s"),
      analytics: true,
      // Ephemeral cache helps with performance and fail-open strategies
      ephemeralCache: new Map(),
    })
  : null;

export async function proxy(request: NextRequest) {
  try {
    if (!ratelimit) {
      // If no Redis configured, fail-open to prevent app crash
      return NextResponse.next();
    }

    // Extract user IP (accurately handling proxies/Vercel)
    const ip = request.headers.get("x-forwarded-for") ?? "127.0.0.1";

    // Check rate limit for this IP
    const { success, limit, reset, remaining } = await ratelimit.limit(ip);
    
    if (!success) {
      // Return standard 429 Too Many Requests as JSON
      return NextResponse.json(
        { 
          error: "Too Many Requests", 
          message: "Rate limit exceeded. Please try again later." 
        },
        { 
          status: 429,
          headers: {
            "X-RateLimit-Limit": limit.toString(),
            "X-RateLimit-Remaining": remaining.toString(),
            "X-RateLimit-Reset": reset.toString(),
            "Retry-After": Math.ceil((reset - Date.now()) / 1000).toString(),
          }
        }
      );
    }

    const response = NextResponse.next();
    
    // Add standard rate limit headers to successful requests
    response.headers.set("X-RateLimit-Limit", limit.toString());
    response.headers.set("X-RateLimit-Remaining", remaining.toString());
    response.headers.set("X-RateLimit-Reset", reset.toString());
    
    return response;
  } catch (error) {
    console.error("Rate Limiter Error:", error);
    // Fail-open strategy: if Redis connection fails temporarily, allow traffic
    return NextResponse.next();
  }
}

export const config = {
  // Target API routes and high-risk paths, excluding static files and images
  matcher: [
    "/api/:path*",
    "/login",
    "/register",
  ],
};
