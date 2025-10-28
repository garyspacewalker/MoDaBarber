import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '../../../lib/prisma';

function bad(msg: string, code = 400) {
  return NextResponse.json({ error: msg }, { status: code });
}

export async function POST(req: NextRequest) {
  try {
    const { cart = [], customer = {} } = await req.json();

    if (!process.env.DATABASE_URL) return bad('Server not configured: DATABASE_URL missing', 500);
    if (!process.env.STRIPE_SECRET_KEY) return bad('Payments not configured: set STRIPE_SECRET_KEY');

    if (!Array.isArray(cart) || cart.length === 0) return bad('Cart is empty');

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' });

    const amount = cart.reduce((sum: number, p: any) => sum + Math.round(p.price * 100), 0);

    const order = await prisma.order.create({
      data: {
        email: customer.email || 'unknown@example.com',
        name: customer.name || null,
        phone: customer.phone || null,
        amount,
        currency: 'zar',
        status: 'pending',
        items: {
          create: cart.map((p: any) => ({
            name: p.name,
            unitAmount: Math.round(p.price * 100),
            quantity: 1,
          })),
        },
      },
    });

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      success_url: (process.env.NEXT_PUBLIC_SUCCESS_URL || 'http://localhost:3000/shop/success') + `?order=${order.id}`,
      cancel_url: process.env.NEXT_PUBLIC_CANCEL_URL || 'http://localhost:3000/shop?status=cancelled',
      customer_email: customer.email || undefined,
      phone_number_collection: { enabled: true },
      shipping_address_collection: { allowed_countries: ['ZA'] },
      shipping_options: [
        {
          shipping_rate_data: {
            display_name: 'Standard Shipping',
            delivery_estimate: {
              minimum: { unit: 'business_day', value: 3 },
              maximum: { unit: 'business_day', value: 7 },
            },
            type: 'fixed_amount',
            fixed_amount: { amount: 6000, currency: 'zar' },
          },
        },
      ],
      line_items: cart.map((p: any) => ({
        price_data: { currency: 'zar', product_data: { name: p.name }, unit_amount: Math.round(p.price * 100) },
        quantity: 1,
      })),
      metadata: { orderId: order.id },
    });

    await prisma.order.update({ where: { id: order.id }, data: { stripeSessionId: session.id } });
    return NextResponse.json({ url: session.url });
  } catch (e: any) {
    console.error('Checkout error:', e);
    return NextResponse.json({ error: e?.message || 'Checkout failed' }, { status: 500 });
  }
}
