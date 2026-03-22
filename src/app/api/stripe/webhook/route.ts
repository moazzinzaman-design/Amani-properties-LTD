import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!secretKey || secretKey === 'sk_test_PLACEHOLDER' || !webhookSecret || webhookSecret === 'whsec_PLACEHOLDER') {
      return NextResponse.json({ received: false, error: 'Stripe not configured' }, { status: 503 });
    }

    const rawBody = await req.text();
    const sig = req.headers.get('stripe-signature');

    if (!sig) {
      return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
    }

    const event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);

    switch (event.type) {
      case 'checkout.session.completed': {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const session = event.data.object as any;
        console.log('[Stripe] Checkout completed:', session.id);
        
        // Add Billing Event to Supabase for the Finance Agent to process
        const { data: dbData } = await supabase.from('openclaw_memory').select('id, memory').single();
        if (dbData) {
            const mem = dbData.memory;
            if (!mem.billing_events) mem.billing_events = [];
            mem.billing_events.push({
                id: session.id,
                status: 'pending_invoice',
                amount: session.amount_total,
                customer_email: session.customer_details?.email,
                plan: session.metadata?.plan,
                date: new Date().toISOString()
            });
            await supabase.from('openclaw_memory').update({ memory: mem }).eq('id', dbData.id);
        }
        break;
      }
      case 'customer.subscription.updated': {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sub = event.data.object as any;
        console.log('[Stripe] Subscription updated:', sub.id, sub.status);
        break;
      }
      case 'customer.subscription.deleted': {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sub = event.data.object as any;
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
