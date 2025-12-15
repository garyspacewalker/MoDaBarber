// app/api/prepay/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { sendMail, renderInvoiceHTML } from '../../../lib/email';
// Optional bot check (safe to keep even if you don't have the file yet)
import { verifyTurnstile } from '../../../lib/turnstile';

const CustomerZ = z.object({
  email: z.string().trim().email().max(120),
  name: z.string().trim().max(80).optional(),
  phone: z.string().trim().max(30).optional(),
  address: z.string().trim().max(500).optional(),
});

const BodyZ = z.object({
  amount: z.number().finite().positive(), // we’ll enforce minimum server-side per-cut below
  note: z.string().max(1000).optional(),
  customer: CustomerZ,
});

const VAT_PERCENT = 0;

function simpleRef(prefix = 'PREPAY') {
  const d = new Date();
  const yy = String(d.getFullYear()).slice(-2);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const rnd = Math.floor(Math.random() * 9000 + 1000); // 4 digits
  return `${prefix}${yy}${mm}${dd}${rnd}`;
}

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    // Optional bot check with Cloudflare Turnstile (only runs if secret exists)
    if (process.env.TURNSTILE_SECRET_KEY) {
      const token = req.headers.get('x-turnstile-token') ?? undefined;
      const ok = await verifyTurnstile(token, req.ip);
      if (!ok) {
        return NextResponse.json({ error: 'Bot verification failed.' }, { status: 400 });
      }
    }

    const raw = await req.json();
    const parsed = BodyZ.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const { amount: rawAmount, customer, note } = parsed.data;

    const PRICE = Math.max(1, Number(process.env.PREPAY_CUT_PRICE || 250));
    const PRODUCT = process.env.PREPAY_PRODUCT_NAME || 'Haircut';
    const amount = Math.round(Number(rawAmount) * 100) / 100; // 2dp

    if (amount < PRICE) {
      return NextResponse.json(
        { error: `Minimum amount is R${PRICE.toFixed(2)} (1 ${PRODUCT.toLowerCase()}).` },
        { status: 400 }
      );
    }

    // Calculate credits
    const cuts = Math.floor(amount / PRICE);
    const remainder = +(amount - cuts * PRICE).toFixed(2); // wallet credit remainder (if any)

    // Build invoice lines
    const lines: {
      id: string;
      name: string;
      unit: number;
      qty: number;
      lineTotal: number;
    }[] = [];

    lines.push({
      id: 'prepaid-haircut',
      name: `Prepaid ${PRODUCT} credit`,
      unit: PRICE,
      qty: cuts,
      lineTotal: +(PRICE * cuts).toFixed(2),
    });

    if (remainder > 0) {
      lines.push({
        id: 'wallet-credit',
        name: 'Wallet credit (remaining balance)',
        unit: remainder,
        qty: 1,
        lineTotal: remainder,
      });
    }

    const subTotal = lines.reduce((s, l) => s + l.lineTotal, 0);
    const vat = VAT_PERCENT > 0 ? +(subTotal * (VAT_PERCENT / 100)).toFixed(2) : 0;
    const total = +(subTotal + vat).toFixed(2);

    const reference = simpleRef('PR');
    const issuedAt = new Date().toISOString();

    const bank = {
      accountName: process.env.SHOP_BANK_ACCOUNT_NAME || 'YOUR BUSINESS NAME',
      bankName: process.env.SHOP_BANK_BANK_NAME || 'Your Bank',
      accountNumber: process.env.SHOP_BANK_ACCOUNT_NUMBER || '0000000000',
      branchCode: process.env.SHOP_BANK_BRANCH_CODE || '000000',
      swiftBic: process.env.SHOP_BANK_SWIFT || 'XXXXXX',
      paymentRef: reference,
    };

    const invoice = {
      reference,
      issuedAt,
      currency: 'ZAR' as const,
      vatPercent: VAT_PERCENT,
      note:
        note ||
        `Prepaid ${PRODUCT.toLowerCase()} credit: ${cuts} × R${PRICE.toFixed(
          2
        )}${remainder > 0 ? ` + wallet credit R${remainder.toFixed(2)}` : ''}.`,
      customer,
      lines,
      subTotal,
      vat,
      total,
      bank,
      status: 'Pending Payment' as const,
      business: {
        name: process.env.BUSINESS_NAME || 'ModeBarber',
        phone: process.env.BUSINESS_PHONE || '',
        email: process.env.BUSINESS_EMAIL || '',
        address: process.env.BUSINESS_ADDRESS || '',
      },
    };

    const html = renderInvoiceHTML(invoice);

    await sendMail({
      to: customer.email,
      subject: `Prepay invoice ${reference} — Total R${total.toFixed(2)}`,
      html,
    });

    // (Optional) Persist an Order/OrderItem here if you want a DB trail

    return NextResponse.json({
      ok: true,
      reference,
      amount: total,
      cuts,
      pricePerCut: PRICE,
      remainder,
    });
  } catch (err: any) {
    console.error('Prepay error:', err);
    return NextResponse.json({ error: err.message || 'Prepay failed' }, { status: 500 });
  }
}
