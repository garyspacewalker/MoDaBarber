// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  if (!req.nextUrl.pathname.startsWith('/barber')) return NextResponse.next();

  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Basic ')) {
    return new NextResponse('Auth required', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="MoDeBarber"' },
    });
  }

  const [, base64] = auth.split(' ');
  const [user, pass] = Buffer.from(base64, 'base64').toString().split(':');

  if (user === process.env.BARBER_USER && pass === process.env.BARBER_PASS) {
    return NextResponse.next();
  }

  return new NextResponse('Unauthorized', { status: 401 });
}

export const config = {
  matcher: ['/barber/:path*'],
};
