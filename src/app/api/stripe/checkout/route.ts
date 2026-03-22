import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  try {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey || secretKey === 'sk_test_PLACEHOLDER') {
      return NextResponse.json({
        error: 'Stripe not configured',
        message: 'Add your STRIPE_SECRET_KEY to .env.local',
      }, { status: 503 });
    }

    const body = await req.json();
    const { plan, email } = body;

    const priceMap: Record<string, { name: string; amount: number }> = {
      pro: { name: 'Mission Control Pro', amount: 2900 },
      enterprise: { name: 'Mission Control Enterprise', amount: 9900 },
    };

    const selected = priceMap[plan];
    if (!selected) {
      return NextResponse.json({ error: 'Invalid plan. Use "pro" or "enterprise".' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: email, // Associate payment with a specific email
      line_items: [{
        price_data: {
          currency: 'gbp',
          product_data: { name: selected.name },
          unit_amount: selected.amount,
          recurring: { interval: 'month' },
        },
        quantity: 1,
      }],
      metadata: {
         plan: plan, // Keep track of which plan was purchased
      },
      success_url: `${req.nextUrl.origin}/?billing=success`,
      cancel_url: `${req.nextUrl.origin}/?billing=cancelled`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Checkout session failed';
    return NextResponse.json({ error: 'Checkout session failed', message }, { status: 500 });
  }
}
