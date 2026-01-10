// app/api/prepay/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { sendMail, renderInvoiceHTML } from '../../../lib/email';
import { verifyTurnstile } from '../../../lib/turnstile';
import { newRef } from '../../../lib/refs';
import { lockOnce } from '../../../lib/inflight';

const CustomerZ = z.object({
  email: z.string().trim().email().max(120),
  name: z.string().trim().max(80).optional(),
  phone: z.string().trim().max(30).optional(),
  address: z.string().trim().max(500).optional(),
});

const BodyZ = z.object({
  amount: z.number().finite().positive(),
  note: z.string().max(1000).optional(),
  customer: CustomerZ,
});

const VAT_PERCENT = 0;
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    if (process.env.TURNSTILE_SECRET_KEY) {
      const token = req.headers.get('x-turnstile-token') ?? undefined;
      const ok = await verifyTurnstile(token, req.ip);
      if (!ok) return NextResponse.json({ error: 'Bot verification failed.' }, { status: 400 });
    }

    const raw = await req.json();
    const parsed = BodyZ.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Please enter your details (email & amount) before creating the invoice.' }, { status: 400 });
    }
    const { amount: rawAmount, customer, note } = parsed.data;

    const PRICE = Math.max(1, Number(process.env.PREPAY_CUT_PRICE || 250));
    const PRODUCT = process.env.PREPAY_PRODUCT_NAME || 'Haircut';
    const amount = Math.round(Number(rawAmount) * 100) / 100;

    if (amount < PRICE) {
      return NextResponse.json(
        { error: `Minimum amount is R${PRICE.toFixed(2)} (1 ${PRODUCT.toLowerCase()}).` },
        { status: 400 },
      );
    }

    const cuts = Math.floor(amount / PRICE);
    const remainder = +(amount - cuts * PRICE).toFixed(2);

    const lines = [
      { id: 'prepaid-haircut', name: `Prepaid ${PRODUCT} credit`, unit: PRICE, qty: cuts, lineTotal: +(PRICE * cuts).toFixed(2) },
      ...(remainder > 0 ? [{ id: 'wallet-credit', name: 'Wallet credit (remaining balance)', unit: remainder, qty: 1, lineTotal: remainder }] : []),
    ];

    const subTotal = lines.reduce((s, l) => s + l.lineTotal, 0);
    const vat = VAT_PERCENT > 0 ? +(subTotal * (VAT_PERCENT / 100)).toFixed(2) : 0;
    const total = +(subTotal + vat).toFixed(2);

    const reference = newRef('PR'); // 6-digit suffix
    const issuedAt = new Date().toISOString();

    // 🔒 prevent rapid duplicate emails for same user/amount
    const lockKey = `prepay:${customer.email}:${total}`;
    if (!lockOnce(lockKey)) {
      return NextResponse.json({ ok: true, duplicate: true, reference, amount: total });
    }

    const bank = {
      accountName: process.env.SHOP_BANK_ACCOUNT_NAME || 'YOUR BUSINESS NAME',
      bankName: process.env.SHOP_BANK_BANK_NAME || 'Your Bank',
      accountNumber: process.env.SHOP_BANK_ACCOUNT_NUMBER || '0000000000',
      branchCode: process.env.SHOP_BANK_BRANCH_CODE || '000000',
      paymentRef: reference,
    };

    const invoice = {
      reference,
      issuedAt,
      currency: 'ZAR' as const,
      vatPercent: VAT_PERCENT,
      note:
        note ||
        `Prepaid ${PRODUCT.toLowerCase()} credit: ${cuts} × R${PRICE.toFixed(2)}${
          remainder > 0 ? ` + wallet credit R${remainder.toFixed(2)}` : ''
        }.`,
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
    await sendMail({ to: customer.email, subject: `Prepay invoice ${reference} — Total R${total.toFixed(2)}`, html });

    return NextResponse.json({ ok: true, reference, amount: total, cuts, pricePerCut: PRICE, remainder });
  } catch (err: any) {
    console.error('Prepay error:', err);
    return NextResponse.json({ error: err.message || 'Prepay failed' }, { status: 500 });
  }
}
