// app/api/debug-email/route.ts
import { NextResponse } from 'next/server';
import { sendMail } from '../../../lib/email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic'; // do not prerender
export const revalidate = 0;

export async function GET() {
  // Block in production / on Vercel builds
  if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
    return NextResponse.json({ error: 'Not available in production' }, { status: 404 });
  }

  try {
    await sendMail({
      to: process.env.BARBER_EMAIL || 'test@example.com',
      subject: 'Debug email test',
      html: '<p>It works.</p>',
    });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}
