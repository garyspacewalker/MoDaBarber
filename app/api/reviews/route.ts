import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { z } from 'zod';
import { verifyTurnstile } from '../../../lib/turnstile';

const ReviewZ = z.object({
  name: z.string().trim().max(80).optional(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().min(10).max(1000),
});

export const runtime = 'nodejs';

export async function GET() {
  // latest approved + avg
  const [rows, agg] = await Promise.all([
    prisma.review.findMany({
      where: { approved: true },
      orderBy: { createdAt: 'desc' },
      take: 12,
    }),
    prisma.review.aggregate({
      where: { approved: true },
      _avg: { rating: true },
      _count: true,
    }),
  ]);
  return NextResponse.json({
    ok: true,
    items: rows,
    average: Number(agg._avg.rating || 0),
    count: agg._count,
  });
}

export async function POST(req: NextRequest) {
  try {
    if (process.env.TURNSTILE_SECRET_KEY) {
      const token = req.headers.get('x-turnstile-token') ?? undefined;
      const ok = await verifyTurnstile(token, req.ip);
      if (!ok) return NextResponse.json({ error: 'Bot verification failed.' }, { status: 400 });
    }

    const body = await req.json();
    const parsed = ReviewZ.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid review', details: parsed.error.flatten() }, { status: 400 });
    }
    const { name, rating, comment } = parsed.data;

    const row = await prisma.review.create({
      data: { name: name || null, rating, comment, approved: true },
    });

    return NextResponse.json({ ok: true, id: row.id });
  } catch (e: any) {
    console.error('Review POST error:', e);
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
  }
}
