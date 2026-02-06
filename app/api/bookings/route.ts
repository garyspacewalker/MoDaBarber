import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import {
  sendBookingEmails,
  type EmailServiceItem,
  sendMail,
  renderInvoiceHTML,
} from '../../../lib/email';
import { verifyTurnstile } from '../../../lib/turnstile';
import { z } from 'zod';

/** ==== CANONICAL SHOP (IN-STORE) PRICE LIST (SERVER-TRUSTED) ==== */
const SHOP_SERVICES = [
  { name: 'Edge Up (Trim)', price: 10, duration: 10 },
  { name: 'Edge Up + Black Dye', price: 20, duration: 15 },

  { name: 'Shave', price: 10, duration: 15 },
  { name: 'Shave + Steam', price: 60, duration: 25 },

  { name: 'Blade Shave', price: 20, duration: 15 },
  { name: 'Blade Shave + Steam', price: 70, duration: 25 },

  { name: 'Clipper Chiskop & Wash', price: 25, duration: 30 },
  { name: 'Chiskop Shave', price: 35, duration: 40 },
  { name: 'Chiskop + Hot Towel/Steam', price: 85, duration: 60 },

  { name: 'Blade Chiskop & Wash', price: 50, duration: 40 },
  { name: 'Blade Chiskop Shave', price: 60, duration: 50 },
  { name: 'Blade Chiskop + Hot Towel/Steam', price: 110, duration: 70 },

  { name: 'Haircut & Wash', price: 100, duration: 60 },
  { name: 'Haircut & Shave', price: 110, duration: 70 },
  { name: 'Haircut + Hot Towel/Steam', price: 160, duration: 90 },

  { name: 'Haircut & Shave + Black Dye (with Wash)', price: 150, duration: 120 },

  { name: "Kids Cut (3–12) + Wash", price: 80, duration: 40 },
  { name: "Kids Cut (3–12) + Dye", price: 110, duration: 60 },
] as const;

function norm(s: string) {
  return String(s)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[’']/g, "'")
    .replace(/[–—]/g, '-')
    .replace(/\s*\/\s*/g, '/');
}

const SHOP_MAP = new Map(
  SHOP_SERVICES.map((s) => [norm(s.name), { ...s }])
);

/** ==== ZOD SCHEMAS ==== */
const ServiceZ = z.object({
  name: z.string().min(1).max(150),
  price: z.number().nonnegative(), // will be overridden for shop bookings
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
  time: z.string().regex(/^\d{2}:\d{2}$/), // HH:mm
  location: z.enum(['house', 'shop']).default('house'),
  customer: CustomerZ,
});

/** ==== SIMPLE REFERENCE (6-digit numeric suffix) ==== */
function makeVerySimpleRef(prefix = 'MB') {
  const d = new Date();
  const yy = String(d.getFullYear()).slice(-2);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const rnd = Math.floor(Math.random() * 1_000_000)
    .toString()
    .padStart(6, '0');
  return `${prefix}${yy}${mm}${dd}${rnd}`;
}

/** Build a minimal invoice object our template expects */
function buildDepositInvoice(opts: {
  customer: { email: string; name?: string; phone?: string; address?: string };
  bookingId: string | number;
  date: string;
  time: string;
  amountRands: number;
  reference: string;
  locationLabel: string;
}) {
  const { customer, bookingId, date, time, amountRands, reference, locationLabel } = opts;

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
    note: `Booking deposit to confirm your appointment (${locationLabel}) (Booking #${bookingId}) for ${date} @ ${time}. Please pay within 48 hours using the exact reference.`,
    customer,
    lines: [
      {
        id: 'booking-deposit',
        name: `Booking deposit — ${locationLabel} — ${date} ${time}`,
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
    if (process.env.TURNSTILE_SECRET_KEY) {
      const token = req.headers.get('x-turnstile-token') ?? undefined;
      const ok = await verifyTurnstile(token, req.ip);
      if (!ok) return NextResponse.json({ error: 'Bot verification failed.' }, { status: 400 });
    }

    const payload = await req.json();
    const parsed = BookingZ.safeParse(payload);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { date, time, customer, location } = parsed.data;
    let services = parsed.data.services as EmailServiceItem[];

    // ✅ Enforce canonical prices for IN-STORE bookings (server-trusted)
    if (location === 'shop') {
      const normalized = services.map((s) => {
        const hit = SHOP_MAP.get(norm(s.name));
        if (!hit) return null;
        return {
          name: hit.name,
          price: hit.price,
          duration: hit.duration,
        } as EmailServiceItem;
      });

      if (normalized.some((x) => x === null)) {
        return NextResponse.json(
          {
            error:
              'One or more selected services are not valid for in-store bookings. Please choose from the in-store price list.',
          },
          { status: 400 }
        );
      }

      services = normalized as EmailServiceItem[];
    }

    // (Optional but helpful) For house calls, you can enforce a minimum/maximum price if you want.
    // For now we keep house-call services as sent by the UI.

    // Save booking
    const booking = await prisma.booking.create({
      data: {
        date,
        time,
        services: JSON.stringify(services),
        first: customer.first ?? '',
        last: customer.last ?? null,
        phone: customer.phone ?? '',
        email: customer.email ?? null,
        location: location === 'shop' ? 'SHOP' : 'HOUSE',
      },
    });

    // Email confirmations
    sendBookingEmails({
      bookingId: booking.id,
      customer,
      date,
      time,
      services,
    }).catch(console.error);

    // Optional deposit invoice (only when we have an email)
    const amount = Math.max(1, Number(process.env.BOOKING_DEPOSIT_RANDS || 100));
    let deposit: { reference: string; amount: number } | undefined;

    if (customer.email) {
      const reference = makeVerySimpleRef('MB');
      const locationLabel = location === 'shop' ? 'In-Store' : 'House Call';

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
        locationLabel,
      });

      const html = renderInvoiceHTML(invoice);
      await sendMail({
        to: customer.email,
        subject: `Booking deposit ${reference} — R${amount.toFixed(2)}`,
        html,
      });
      deposit = { reference, amount };
    }

    return NextResponse.json({ ok: true, id: booking.id, location, deposit });
  } catch (e) {
    console.error('Booking route error:', e);
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}
