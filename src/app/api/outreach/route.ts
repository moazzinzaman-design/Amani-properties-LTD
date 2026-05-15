/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

export async function GET() {
  try {
    const memPath = path.join(os.homedir(), '.openclaw', 'workspace', 'memory.json');
    const raw = await fs.readFile(memPath, 'utf-8');
    const mem = JSON.parse(raw);
    const leads = (mem.leads || []).filter((l: any) => l.email && l.company);
    // Deduplicate by email
    const seen = new Set();
    const unique = leads.filter((l: any) => {
      if (seen.has(l.email)) return false;
      seen.add(l.email);
      return true;
    });
    return NextResponse.json({ success: true, leads: unique, count: unique.length });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message, leads: [] }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { lead } = await req.json();

    // Auto-select pricing tier based on lead score
    const tiers = [
      { min: 80, label: '£800', name: 'Premium Website Build & Digital Strategy', link: 'https://www.paypal.com/ncp/payment/CA33ZAJ79BDSY' },
      { min: 60, label: '£500', name: 'Website Design & Development', link: 'https://www.paypal.com/ncp/payment/A2KVSJ2XWG6JG' },
      { min: 0,  label: '£300', name: 'Website Refresh & Optimisation', link: 'https://www.paypal.com/ncp/payment/SL5S9DW2G6KXG' },
    ];
    const tier = tiers.find(t => (lead.score || 0) >= t.min) || tiers[2];

    const subject = `Quick question about ${lead.company}'s online presence`;
    const body = `Hi ${lead.name?.split(' ')[0] || 'there'},

I came across ${lead.company} while researching businesses in the Yorkshire area and wanted to reach out personally.

I specialise in building modern, high-converting websites and digital tools for local businesses — and I think there's a real opportunity to help ${lead.company} stand out online and bring in more customers.

I'd love to offer you a free 15-minute website audit, no obligation whatsoever. I can show you exactly what's working, what isn't, and what a quick refresh could do for your enquiry rate.

Our packages:
• Website Refresh & Optimisation — £300
• Full Website Design & Development — £500
• Premium Build & Digital Strategy — £800

Based on what I can see, I'd recommend our ${tier.name} package (${tier.label}). If you'd like to go ahead after our chat, you can pay securely here:
👉 ${tier.link}

Would you be open to a quick call this week?

Best regards,
Moazzin Zaman
Founder, Digital Solutions
📱 07456522980
🌐 https://summitforgeai.vercel.app/`;

    return NextResponse.json({ success: true, subject, body, lead, tier: tier.label });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
