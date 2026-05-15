import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const key = process.env.STRIPE_SECRET_KEY || '';
  const isReal = (key.startsWith('sk_live_') || key.startsWith('sk_test_')) && key !== 'sk_test_PLACEHOLDER';
  
  if (!isReal) {
    return NextResponse.json({
      success: false,
      error: 'Stripe is not fully configured. Cannot process withdrawal. Add real STRIPE_SECRET_KEY to .env.local to enable real payouts.',
    }, { status: 400 });
  }

  try {
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(key);
    
    // Check available balance
    const balance = await stripe.balance.retrieve();
    const gbpAvail = balance.available.find((b: any) => b.currency === 'gbp');
    
    if (!gbpAvail || gbpAvail.amount <= 0) {
      return NextResponse.json({
        success: false,
        error: 'No available GBP balance to withdraw.',
      }, { status: 400 });
    }

    // Attempt payout
    const payout = await stripe.payouts.create({
      amount: gbpAvail.amount,
      currency: 'gbp',
    });

    return NextResponse.json({
      success: true,
      message: `Successfully initiated withdrawal of £${(gbpAvail.amount / 100).toFixed(2)} to your bank account.`,
      payoutId: payout.id,
      expectedArrival: new Date(payout.arrival_date * 1000).toISOString()
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
