import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST() {
  // Stripe disabled (no-op). Keeps build green.
  return NextResponse.json({ ok: true });
}
