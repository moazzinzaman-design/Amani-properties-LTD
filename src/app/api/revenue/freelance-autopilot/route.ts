import { NextRequest, NextResponse } from 'next/server';
import { dispatchAgentTask } from '@/services/agentService';

export async function POST(req: NextRequest) {
  try {
    const { target_niche, pricing_model } = await req.json();

    if (!target_niche) {
      return NextResponse.json({ error: 'target_niche is required.' }, { status: 400 });
    }

    const sysPrompt = `
      [PIPELINE START: FREELANCE AUTOPILOT]
      Target Niche: ${target_niche}
      Pricing Model: ${pricing_model || 'Per-project or hourly'}
      Objective: Automate Upwork/Fiverr proposal generation and project scaffolding.
      Steps:
      1. Researcher: Set criteria and scrape freelance platforms for ${target_niche} projects.
      2. Hunter: Score opportunities by win probability and value.
      3. Copywriter: Generate tailored cover letters with relevant portfolio samples.
      4. Marketer: Submit proposals and automate follow-ups.
      5. Builder: Scaffold baseline project repository for won contracts.
      6. QA: Validate deliverables before client handoff.
    `;

    // Dispatch specialized prompt directly into the agent swarm securely via the agentService
    const result = await dispatchAgentTask('mission-control-user', sysPrompt.trim());

    return NextResponse.json({ 
      success: true, 
      message: 'Freelance Autopilot pipeline initialized successfully.',
      data: result
    });

  } catch (err: unknown) {
    return NextResponse.json(
      { error: 'Internal Server Error', details: err instanceof Error ? err.message : String(err) }, 
      { status: 500 }
    );
  }
}
