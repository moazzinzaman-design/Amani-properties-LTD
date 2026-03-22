import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  apiVersion: '2026-02-25.clover' as any,
  appInfo: {
    name: 'Mission Control Revenue Engine',
    version: '1.0.0',
  },
});
