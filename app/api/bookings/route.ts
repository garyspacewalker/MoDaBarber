import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { sendBookingEmails } from '../../../lib/email';

export async function POST(req: NextRequest) {
  try {
    const { services = [], date, time, customer = {} } = await req.json();

    // Basic validation
    if (!services?.length) return NextResponse.json({ error: 'No services selected' }, { status: 400 });
    if (!date || !time)   return NextResponse.json({ error: 'Date and time required' }, { status: 400 });

    const booking = await prisma.booking.create({
      data: {
        date,
        time,
        services: JSON.stringify(services),
        first: customer.first ?? '',
        last:  customer.last  ?? null,
        phone: customer.phone ?? '',
        email: customer.email ?? null,
      },
    });

    // Send emails (non-blocking)
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
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}
