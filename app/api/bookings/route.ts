import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { sendBookingEmails, type EmailServiceItem } from '../../../lib/email';

function coerceServices(input: unknown): EmailServiceItem[] {
  if (!Array.isArray(input)) return [];
  return input
    .map((x) => ({
      name: String((x as any)?.name ?? ''),
      price: Number((x as any)?.price ?? 0),
      duration: Number((x as any)?.duration ?? 0),
    }))
    .filter((s) => !!s.name);
}

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const services = coerceServices(payload?.services);
    const date = String(payload?.date || '');
    const time = String(payload?.time || '');
    const customer = (payload?.customer || {}) as {
      first?: string;
      last?: string;
      phone?: string;
      email?: string;
    };

    if (!services.length) return NextResponse.json({ error: 'No services selected' }, { status: 400 });
    if (!date || !time) return NextResponse.json({ error: 'Date and time required' }, { status: 400 });

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

    // Fire-and-forget
    sendBookingEmails({
      bookingId: booking.id,
      customer,
      date,
      time,
      services,
    }).catch(console.error);

    return NextResponse.json({ ok: true, id: booking.id });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}
