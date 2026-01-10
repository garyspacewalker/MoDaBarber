// app/api/invoice/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sendMail, renderInvoiceHTML } from '../../../lib/email';
import catalog from '../../../lib/sampleCatalog';
import { verifyTurnstile } from '../../../lib/turnstile';
import { newRef } from '../../../lib/refs';
import { z } from 'zod';

const CartLineZ = z.object({
  id: z.string().min(1),
  qty: z.number().int().min(1).max(999),
});

const CustomerZ = z.object({
  email: z.string().trim().email().max(120),
  name: z.string().trim().max(80).optional(),
  phone: z.string().trim().max(30).optional(),
  address: z.string().trim().max(500).optional(),
});

const BodyZ = z.object({
  cart: z.array(CartLineZ).min(1),
  customer: CustomerZ,
  note: z.string().max(1000).optional(),
});

const VAT_PERCENT = 0;
const normalizeId = (s: string) => String(s).trim().toLowerCase().replace(/\s+/g, '-');

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
      return NextResponse.json({ error: 'Invalid data', details: parsed.error.flatten() }, { status: 400 });
    }
    const { cart, customer, note } = parsed.data;

    // Build lines from catalog
    const products = new Map(catalog.map((p) => [p.id, p]));
    const lines = cart.map(({ id, qty }) => {
      const p = products.get(id) || products.get(normalizeId(id));
      if (!p) throw new Error(`Unknown product: ${id}`);
      const unit = Number(p.price);
      return { id: p.id, name: p.name, unit, qty, lineTotal: +(unit * qty).toFixed(2) };
    });

    const subTotal = lines.reduce((s, l) => s + l.lineTotal, 0);
    const vat = VAT_PERCENT > 0 ? +(subTotal * (VAT_PERCENT / 100)).toFixed(2) : 0;
    const total = +(subTotal + vat).toFixed(2);

    const reference = newRef('INV'); // ← 6-digit numeric suffix
    const issuedAt = new Date().toISOString();

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
      note: note || '',
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
    await sendMail({ to: customer.email, subject: `Invoice ${reference} — Total R${total.toFixed(2)}`, html });

    return NextResponse.json({ ok: true, reference, amount: total });
  } catch (err: any) {
    console.error('Invoice error:', err);
    return NextResponse.json({ error: err.message || 'Invoice failed' }, { status: 500 });
  }
}
