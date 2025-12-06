// app/api/invoice/route.ts
import { NextRequest, NextResponse } from 'next/server';

// ✅ use relative paths so TS can resolve them without a path alias
import { sendMail, renderInvoiceHTML } from '../../../lib/email';
import catalog from '../../../lib/sampleCatalog';

type Body = {
  cart:
    | { id: string; qty?: number }[]
    | ({ id: string; name?: string; price?: number }[]);
  customer: { email: string; name?: string; phone?: string; address?: string };
  note?: string;
};

const VAT_PERCENT = 0;

const normalizeId = (s: string) =>
  String(s).trim().toLowerCase().replace(/\s+/g, '-');

function toIdQtyArray(raw: unknown): { id: string; qty: number }[] {
  if (!Array.isArray(raw)) return [];
  return (raw as any[])
    .map((x) => {
      const id = (x as any)?.id;
      if (!id) return null;
      const qty = Number((x as any)?.qty ?? 1);
      return { id: String(id), qty: isFinite(qty) && qty > 0 ? qty : 1 };
    })
    .filter(Boolean) as { id: string; qty: number }[];
}

// SIMPLER reference like "MDB-123456"
function makeReference() {
  const n = Math.floor(100000 + Math.random() * 900000); // 100000–999999
  return `MDB-${n}`;
}

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Body;

    if (!body?.customer?.email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const wanted = toIdQtyArray(body.cart);
    if (!wanted.length) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    // typing is fine once import works
    const products = new Map(catalog.map((p) => [p.id, p]));

    const lines = wanted.map(({ id, qty }) => {
      const pid = products.get(id) || products.get(normalizeId(id));
      if (!pid) throw new Error(`Unknown product: ${id}`);
      const quantity = Math.max(1, Math.min(999, Number(qty || 1)));
      const unit = Number(pid.price);
      return {
        id: pid.id,
        name: pid.name,
        unit,
        qty: quantity,
        lineTotal: +(unit * quantity).toFixed(2),
      };
    });

    const subTotal = lines.reduce((s, l) => s + l.lineTotal, 0);
    const vat = VAT_PERCENT > 0 ? +(subTotal * (VAT_PERCENT / 100)).toFixed(2) : 0;
    const grandTotal = +(subTotal + vat).toFixed(2);

    const reference = makeReference();
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
      note: body.note || '',
      customer: body.customer,
      lines,
      subTotal,
      vat,
      total: grandTotal,
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
      to: body.customer.email,
      subject: `Invoice ${reference} — Total R${grandTotal.toFixed(2)}`,
      html,
    });

    return NextResponse.json({ ok: true, reference, amount: grandTotal });
  } catch (err: any) {
    console.error('Invoice error:', err);
    return NextResponse.json({ error: err.message || 'Invoice failed' }, { status: 500 });
  }
}
