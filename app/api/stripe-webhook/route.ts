// app/api/stripe-webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '../../../lib/prisma';
import { sendOrderPaidEmail } from '../../../lib/email';

export const runtime = 'nodejs';           // raw body needed
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature') as string;
  const whSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2024-06-20' });

  const rawBody = await req.text();

  let evt: Stripe.Event;
  try {
    evt = stripe.webhooks.constructEvent(rawBody, sig, whSecret);
  } catch (err: any) {
    console.error('Webhook signature verify failed', err.message);
    return new NextResponse('Invalid signature', { status: 400 });
  }

  try {
    if (evt.type === 'checkout.session.completed') {
      const session = evt.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.orderId!;
      const amountTotal = session.amount_total || 0;

      // Pull shipping/contact details from session
      const address = session.shipping_details?.address;
      const name = session.shipping_details?.name || null;
      const phone = session.customer_details?.phone || null;
      const email = session.customer_details?.email || undefined;

      // Update order
      const order = await prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'paid',
          email: email || undefined,
          name,
          phone,
          shippingName: name || undefined,
          shippingPhone: phone || undefined,
          shippingAddr1: address?.line1 || undefined,
          shippingAddr2: address?.line2 || undefined,
          shippingCity: address?.city || undefined,
          shippingState: address?.state || undefined,
          shippingZip: address?.postal_code || undefined,
          shippingCountry: address?.country || undefined,
        },
      });

      // Send receipt/notice to customer & barber
      if (order.email) {
        await sendOrderPaidEmail({ orderId, email: order.email, amount: amountTotal });
      }
    }
  } catch (e) {
    console.error('Webhook handling failed', e);
    return new NextResponse('Webhook error', { status: 500 });
  }

  return NextResponse.json({ received: true });
}
