import { NextRequest, NextResponse } from 'next/server';
import { dispatchAgentTask } from '@/services/agentService';

export async function POST(req: NextRequest) {
  try {
    const { target_niche, pricing_model } = await req.json();

    if (!target_niche) {
      return NextResponse.json({ error: 'target_niche is required.' }, { status: 400 });
    }

    const sysPrompt = `
      [PIPELINE START: SOFTWARE ARBITRAGE FACTORY]
      Target Niche: ${target_niche}
      Pricing Model: ${pricing_model || 'One-time purchase'}
      Objective: Scaffold a digital software template (e.g. SaaS dashboard, landing page) for arbitrage.
      Steps:
      1. Researcher: Identify top selling categories on Envato/Gumroad for ${target_niche}.
      2. Architect: Design system architecture for the template generator.
      3. Builder: Scaffold Next.js + Tailwind React components and boilerplate repo.
      4. Copywriter: Write product documentation, setup guides, and Gumroad copy.
      5. Deployer: Package the boilerplate into a ZIP and provision demo sites.
    `;

    // Dispatch specialized prompt directly into the agent swarm securely via the agentService
    const result = await dispatchAgentTask('mission-control-user', sysPrompt.trim());

    return NextResponse.json({ 
      success: true, 
      message: 'Software Arbitrage pipeline initialized successfully.',
      data: result
    });

  } catch (err: unknown) {
    return NextResponse.json(
      { error: 'Internal Server Error', details: err instanceof Error ? err.message : String(err) }, 
      { status: 500 }
    );
  }
}
