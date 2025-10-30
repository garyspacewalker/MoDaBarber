import { NextResponse } from 'next/server';
export async function GET() {
  return NextResponse.json({
    barber: (process.env.BARBER_EMAIL || '').trim(),
    hasResendKey: !!process.env.RESEND_API_KEY,
  });
}
