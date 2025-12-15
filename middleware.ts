import { NextRequest, NextResponse } from 'next/server';

const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_REQ = 50;               // per IP per window
const bucket = new Map<string, { count: number; reset: number }>();

function hit(ip: string) {
  const now = Date.now();
  const entry = bucket.get(ip);
  if (!entry || now > entry.reset) {
    bucket.set(ip, { count: 1, reset: now + WINDOW_MS });
    return { ok: true };
  }
  entry.count++;
  return { ok: entry.count <= MAX_REQ, retryAfter: Math.ceil((entry.reset - now) / 1000) };
}

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.pathname;

  // Protect API endpoints that accept user input
  if (url.startsWith('/api/bookings') || url.startsWith('/api/invoice')) {
    const ip = req.ip ?? req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '0.0.0.0';
    const res = hit(ip);
    if (!res.ok) {
      return new NextResponse(JSON.stringify({ error: 'Too many requests, slow down.' }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(res.retryAfter ?? 60),
        },
      });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*'],
};
