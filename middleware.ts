import { NextResponse, type NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const country = req.geo?.country;
  
  // Drop connection instantly if origin is not Algeria (DZ)
  if (country && country !== 'DZ') {
    return new NextResponse('Access restricted to local region.', { status: 403 });
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/register/:path*',
  ]
};
