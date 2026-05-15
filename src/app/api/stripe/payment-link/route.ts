/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';

export async function GET() {
  // Check if Stripe keys are configured
  const key = process.env.STRIPE_SECRET_KEY || '';
  const isConfigured = key.startsWith('sk_live_') || key.startsWith('sk_test_');
  const isLive = key.startsWith('sk_live_');

  if (!isConfigured || key === 'sk_test_PLACEHOLDER') {
    return NextResponse.json({
      success: false,
      configured: false,
      mode: 'unconfigured',
      message: 'Stripe keys not configured. Add your real STRIPE_SECRET_KEY to .env.local to enable payment links.',
      setup_steps: [
        '1. Go to https://dashboard.stripe.com/apikeys',
        '2. Copy your Secret Key (starts with sk_live_ or sk_test_)',
        '3. Paste it in ~/mission-control/.env.local as STRIPE_SECRET_KEY=sk_live_...',
        '4. Restart the dev server (it will auto-restart via launchd)',
      ]
    });
  }

  // If keys are real, try to create a payment link
  try {
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(key);
    
    // Get existing products
    const products = await stripe.products.list({ limit: 10, active: true });
    const prices = await stripe.prices.list({ limit: 10, active: true });
    
    // Get balance
    const balance = await stripe.balance.retrieve();
    const gbpBalance = balance.available.find(b => b.currency === 'gbp');
    const pendingBalance = balance.pending.find(b => b.currency === 'gbp');
    
    return NextResponse.json({
      success: true,
      configured: true,
      mode: isLive ? 'live' : 'test',
      balance: {
        available: gbpBalance ? gbpBalance.amount / 100 : 0,
        pending: pendingBalance ? pendingBalance.amount / 100 : 0,
        currency: 'gbp',
      },
      products: products.data.map(p => ({ id: p.id, name: p.name, active: p.active })),
      prices: prices.data.map(p => ({ id: p.id, product: p.product, amount: (p.unit_amount || 0) / 100, currency: p.currency, recurring: p.recurring })),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, configured: true, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const key = process.env.STRIPE_SECRET_KEY || '';
  if (!key.startsWith('sk_live_') && !key.startsWith('sk_test_')) {
    return NextResponse.json({ success: false, error: 'Stripe not configured' }, { status: 400 });
  }
  if (key === 'sk_test_PLACEHOLDER') {
    return NextResponse.json({ success: false, error: 'Replace STRIPE_SECRET_KEY placeholder with real key' }, { status: 400 });
  }

  try {
    const { name, amount, description } = await req.json();
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(key);
    
    // Create product
    const product = await stripe.products.create({ name, description: description || `Payment for ${name}` });
    
    // Create price
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: Math.round(amount * 100),
      currency: 'gbp',
    });
    
    // Create payment link
    const link = await stripe.paymentLinks.create({
      line_items: [{ price: price.id, quantity: 1 }],
    });

    return NextResponse.json({
      success: true,
      paymentLink: link.url,
      product: { id: product.id, name: product.name },
      price: { id: price.id, amount },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
