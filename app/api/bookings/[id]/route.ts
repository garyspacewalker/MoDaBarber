// app/api/bookings/[id]/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

type BookingStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
const ALLOWED: BookingStatus[] = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();

    const {
      date,
      time,
      services, // expecting array -> stored as JSON string
      first,
      last,
      phone,
      email,
      notes,
      status,   // 'COMPLETED' | 'CANCELLED' | 'CONFIRMED' | 'PENDING'
      archived,
    } = body ?? {};

    const data: any = {};
    if (date !== undefined) data.date = String(date);
    if (time !== undefined) data.time = String(time);
    if (services !== undefined) data.services = JSON.stringify(services);
    if (first !== undefined) data.first = String(first);
    if (last !== undefined) data.last = last ? String(last) : null;
    if (phone !== undefined) data.phone = phone ? String(phone) : null;
    if (email !== undefined) data.email = email ? String(email) : null;
    if (notes !== undefined) data.notes = notes ? String(notes) : null;

    if (status !== undefined) {
      const s = String(status).toUpperCase() as BookingStatus;
      if (!ALLOWED.includes(s)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
      }
      data.status = s;
      if (s === 'COMPLETED') data.completedAt = new Date();
      if (s === 'CANCELLED') data.canceledAt = new Date();
      if (s === 'CONFIRMED' || s === 'PENDING') {
        data.completedAt = null;
        data.canceledAt = null;
      }
    }

    if (archived !== undefined) data.archived = !!archived;

    const booking = await prisma.booking.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json(booking);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Update failed' }, { status: 400 });
  }
}

// Soft delete by default; pass ?hard=1 to really delete.
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { searchParams } = new URL(req.url);
  const hard = searchParams.get('hard') === '1';

  try {
    if (hard) {
      await prisma.booking.delete({ where: { id: params.id } });
      return NextResponse.json({ ok: true, hard: true });
    }
    const b = await prisma.booking.update({
      where: { id: params.id },
      data: { archived: true },
    });
    return NextResponse.json({ ok: true, archived: true, id: b.id });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Delete failed' }, { status: 400 });
  }
}
