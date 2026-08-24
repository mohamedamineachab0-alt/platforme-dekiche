import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// إعداد الاتصال بقاعدة بيانات Redis
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// إنشاء نظامين للـ Rate Limit (واحد للـ Auth وواحد لباقي الـ API)
const authRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(15, '1 m'), // 15 طلب في الدقيقة لتسجيل الدخول (كافية ومريحة)
  analytics: true,
});

export async function proxy(request: NextRequest) {
  // 1. استخراج الـ IP الحقيقي للمستخدم (تم تجنب request.ip لتفادي أخطاء TypeScript في proxy.ts)
  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';

  // تنظيف الـ IP إذا كان فيه عدة عناوين (يحدث مع بعض الـ Proxies)
  const realIp = ip.split(',')[0].trim();

  // 2. التحقق إذا كان المسار يخص تسجيل الدخول أو فتح الحساب
  if (request.nextUrl.pathname.startsWith('/api/auth') || request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/register')) {
    const { success, pending, limit, reset, remaining } = await authRateLimit.limit(
      `ratelimit_auth_${realIp}`
    );

    if (!success) {
      return NextResponse.json(
        { error: 'تم تجاوز الحد المسموح به. يرجى المحاولة بعد قليل.' },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString(),
          }
        }
      );
    }
  }

  return NextResponse.next();
}

// تحديد المسارات اللي يخدم فيها الميدل وير
export const config = {
  matcher: [
    '/api/:path*',
    '/login',
    '/register'
  ],
};
