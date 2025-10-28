
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const date = url.searchParams.get('date');
  const slots = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];
  return NextResponse.json({ date, slots });
}
