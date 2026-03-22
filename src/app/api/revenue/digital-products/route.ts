import { NextRequest, NextResponse } from 'next/server';
import { dispatchAgentTask } from '@/services/agentService';

export async function POST(req: NextRequest) {
  try {
    const { target_niche, pricing_model } = await req.json();

    if (!target_niche) {
      return NextResponse.json({ error: 'target_niche is required.' }, { status: 400 });
    }

    const sysPrompt = `
      [PIPELINE START: DIGITAL PRODUCTS FACTORY]
      Target Niche: ${target_niche}
      Pricing Model: ${pricing_model || 'One-time + bundles'}
      Objective: Mass generate premium digital products (UI kits, templates, eBooks) and sell on Gumroad.
      Steps:
      1. Researcher: Identify trending digital product niches on Gumroad or Twitter.
      2. Copywriter: Generate content for eBooks or notion templates.
      3. Builder: Assemble Notion templates or Figma UI kits based on specs.
      4. Builder: Auto-create cover art, mockups, and promo graphics.
      5. Deployer: Setup Gumroad storefront with tiers and bundles.
      6. Marketer: Build email funnels and launch on Product Hunt.
    `;

    // Dispatch specialized prompt directly into the agent swarm securely via the agentService
    const result = await dispatchAgentTask('mission-control-user', sysPrompt.trim());

    return NextResponse.json({ 
      success: true, 
      message: 'Digital Products pipeline initialized successfully.',
      data: result
    });

  } catch (err: unknown) {
    return NextResponse.json(
      { error: 'Internal Server Error', details: err instanceof Error ? err.message : String(err) }, 
      { status: 500 }
    );
  }
}
