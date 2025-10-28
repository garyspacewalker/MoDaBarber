// app/api/bookings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { sendBookingEmails } from '../../../lib/email';

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const { services = [], date, time, customer = {} } = payload || {};

    const booking = await prisma.booking.create({
      data: {
        date,
        time,
        services: JSON.stringify(services),
        first: customer.first ?? '',
        last: customer.last ?? null,
        phone: customer.phone ?? '',
        email: customer.email ?? null,
      },
    });

    // fire-and-forget email (don’t block request if email vendor hiccups)
    sendBookingEmails({
      bookingId: booking.id,
      customer,
      date,
      time,
      services,
    }).catch(console.error);

    return NextResponse.json({ ok: true, id: booking.id });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ ok: false, error: 'Failed to create booking' }, { status: 500 });
  }
}
