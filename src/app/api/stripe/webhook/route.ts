import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(req: NextRequest) {
  try {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!secretKey || secretKey === 'sk_test_PLACEHOLDER' || !webhookSecret || webhookSecret === 'whsec_PLACEHOLDER') {
      return NextResponse.json({ received: false, error: 'Stripe not configured' }, { status: 503 });
    }

    const stripe = new Stripe(secretKey);

    const rawBody = await req.text();
    const sig = req.headers.get('stripe-signature');

    if (!sig) {
      return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
    }

    const event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        console.log('[Stripe] Checkout completed:', session.id);
        break;
      }
      case 'customer.subscription.updated': {
        const sub = event.data.object;
        console.log('[Stripe] Subscription updated:', sub.id, sub.status);
        break;
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object;
        console.log('[Stripe] Subscription cancelled:', sub.id);
        break;
      }
      default:
        console.log('[Stripe] Unhandled event:', event.type);
    }

    return NextResponse.json({ received: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Webhook error';
    console.error('[Stripe Webhook Error]', message);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
