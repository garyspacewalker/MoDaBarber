import { NextResponse } from 'next/server';
import { sendBookingEmails } from '../../../lib/email';

export const runtime = 'nodejs';

export async function GET() {
  const to = process.env.BARBER_EMAIL || 'you@example.com';
  const now = new Date();
  const date = now.toISOString().slice(0, 10);
  const time = now.toTimeString().slice(0, 5);

  const res = await sendBookingEmails({
    bookingId: 'TEST-' + Math.random().toString(36).slice(2, 8),
    customer: { first: 'Test', last: 'User', email: to },
    date,
    time,
    services: [{ name: 'Test Cut', price: 150, duration: 45 }],
  });

  return NextResponse.json({ sent: true, to, results: res });
}
