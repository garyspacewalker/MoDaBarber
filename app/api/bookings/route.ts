// app/api/bookings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { sendBookingEmails, type EmailServiceItem, sendMail, renderInvoiceHTML } from '../../../lib/email';
import { verifyTurnstile } from '../../../lib/turnstile';
import { z } from 'zod';

/** ==== ZOD SCHEMAS ==== */
const ServiceZ = z.object({
  name: z.string().min(1).max(100),
  price: z.number().nonnegative(),
  duration: z.number().int().nonnegative().optional(),
});

const CustomerZ = z.object({
  first: z.string().trim().min(1).max(80).optional(),
  last: z.string().trim().max(80).optional(),
  phone: z.string().trim().max(30).optional(),
  email: z.string().trim().email().max(120).optional(),
  address: z.string().trim().max(500).optional(),
});

const BookingZ = z.object({
  services: z.array(ServiceZ).min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD
  time: z.string().regex(/^\d{2}:\d{2}$/),       // HH:mm
  customer: CustomerZ,
});

/** ==== SIMPLE REFERENCE ==== */
function makeVerySimpleRef(bookingId: string | number, prefix = 'MB') {
  const d = new Date();
  const yy = String(d.getFullYear()).slice(-2);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const idNum = String(bookingId).replace(/\D/g, '');
  const last4 = idNum.slice(-4).padStart(4, '0');
  return `${prefix}${yy}${mm}${dd}${last4}`;
}

/** Build a minimal invoice object our template expects */
function buildDepositInvoice(opts: {
  customer: { email: string; name?: string; phone?: string; address?: string };
  bookingId: string | number;
  date: string;
  time: string;
  amountRands: number;
  reference: string;
}) {
  const { customer, bookingId, date, time, amountRands, reference } = opts;

  const bank = {
    accountName: process.env.SHOP_BANK_ACCOUNT_NAME || 'YOUR BUSINESS NAME',
    bankName: process.env.SHOP_BANK_BANK_NAME || 'Your Bank',
    accountNumber: process.env.SHOP_BANK_ACCOUNT_NUMBER || '0000000000',
    branchCode: process.env.SHOP_BANK_BRANCH_CODE || '000000',
    swiftBic: process.env.SHOP_BANK_SWIFT || 'XXXXXX',
    paymentRef: reference,
  };

  const business = {
    name: process.env.BUSINESS_NAME || 'ModeBarber',
    phone: process.env.BUSINESS_PHONE || '',
    email: process.env.BUSINESS_EMAIL || '',
    address: process.env.BUSINESS_ADDRESS || '',
  };

  return {
    reference,
    issuedAt: new Date().toISOString(),
    currency: 'ZAR' as const,
    vatPercent: 0,
    note: `Booking deposit to confirm your appointment (Booking #${bookingId}) for ${date} @ ${time}. Please pay within 48 hours using the exact reference.`,
    customer,
    lines: [
      {
        id: 'booking-deposit',
        name: `Booking deposit — ${date} ${time}`,
        unit: amountRands,
        qty: 1,
        lineTotal: amountRands,
      },
    ],
    subTotal: amountRands,
    vat: 0,
    total: amountRands,
    bank,
    status: 'Pending Payment' as const,
    business,
  };
}

export async function POST(req: NextRequest) {
  try {
    /** 1) (Optional) BOT check via Cloudflare Turnstile */
    if (process.env.TURNSTILE_SECRET_KEY) {
      const token = req.headers.get('x-turnstile-token') ?? undefined;
      const ok = await verifyTurnstile(token, req.ip);
      if (!ok) {
        return NextResponse.json({ error: 'Bot verification failed.' }, { status: 400 });
      }
    }

    /** 2) VALIDATE BODY with Zod */
    const payload = await req.json();
    const parsed = BookingZ.safeParse(payload);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const { services, date, time, customer } = parsed.data;

    /** 3) Persist booking */
    const booking = await prisma.booking.create({
      data: {
        date,
        time,
        services: JSON.stringify(services as EmailServiceItem[]),
        first: customer.first ?? '',
        last: customer.last ?? null,
        phone: customer.phone ?? '',
        email: customer.email ?? null,
      },
    });

    /** 4) Email customer + admin */
    sendBookingEmails({
      bookingId: booking.id,
      customer,
      date,
      time,
      services: services as EmailServiceItem[],
    }).catch(console.error);

    /** 5) Send R100 deposit invoice (configurable) if email provided */
    const amount = Math.max(1, Number(process.env.BOOKING_DEPOSIT_RANDS || 100));

    if (customer.email) {
      const reference = makeVerySimpleRef(booking.id, 'MB');
      const invoice = buildDepositInvoice({
        customer: {
          email: customer.email,
          name: [customer.first, customer.last].filter(Boolean).join(' ') || undefined,
          phone: customer.phone,
          address: customer.address,
        },
        bookingId: booking.id,
        date,
        time,
        amountRands: amount,
        reference,
      });

      const html = renderInvoiceHTML(invoice);
      await sendMail({
        to: customer.email,
        subject: `Booking deposit ${reference} — R${amount.toFixed(2)}`,
        html,
      });
    }

    return NextResponse.json({ ok: true, id: booking.id });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}
