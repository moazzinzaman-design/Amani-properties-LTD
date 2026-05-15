/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';

export async function GET() {
  const key = process.env.STRIPE_SECRET_KEY || '';
  const isReal = (key.startsWith('sk_live_') || key.startsWith('sk_test_')) && key !== 'sk_test_PLACEHOLDER';
  
  if (!isReal) {
    return NextResponse.json({
      success: true,
      source: 'simulated',
      available: 0,
      pending: 0,
      currency: 'gbp',
      message: 'Using simulated balance. Add real Stripe key to see live balance.',
    });
  }

  try {
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(key);
    const balance = await stripe.balance.retrieve();
    
    const gbpAvail = balance.available.find(b => b.currency === 'gbp');
    const gbpPend = balance.pending.find(b => b.currency === 'gbp');
    
    // Also check recent payouts
    const payouts = await stripe.payouts.list({ limit: 5 });
    
    return NextResponse.json({
      success: true,
      source: 'stripe_live',
      available: gbpAvail ? gbpAvail.amount / 100 : 0,
      pending: gbpPend ? gbpPend.amount / 100 : 0,
      currency: 'gbp',
      recentPayouts: payouts.data.map(p => ({
        id: p.id,
        amount: p.amount / 100,
        status: p.status,
        arrival_date: new Date(p.arrival_date * 1000).toISOString(),
      })),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
