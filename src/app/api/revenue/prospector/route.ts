import { NextRequest, NextResponse } from 'next/server';
import { dispatchAgentTask } from '@/services/agentService';

export async function POST(req: NextRequest) {
  try {
    const { target_niche, target_location } = await req.json();

    if (!target_niche || !target_location) {
      return NextResponse.json({ error: 'target_niche and target_location are required.' }, { status: 400 });
    }

    const sysPrompt = `
      [PIPELINE START: PROSPECTOR LEAD GEN]
      Target Niche: ${target_niche}
      Location: ${target_location}
      Objective: Launch the Lead Snipper operations. 
      Steps:
      1. Execute Google Maps scraping for businesses missing websites or having < 5 reviews.
      2. Cross-reference Apollo.io / Hunter.io to find decision-maker emails.
      3. Format the final output into a CSV payload and store in Supabase leads.
      4. Alert the Marketer agent to begin cold outbound sequences.
    `;

    // Dispatch specialized prompt directly into the agent swarm securely via the agentService
    const result = await dispatchAgentTask('mission-control-user', sysPrompt.trim());

    return NextResponse.json({ 
      success: true, 
      message: 'Prospector task scheduled for Lead Generation.',
      data: result
    });

  } catch (err: unknown) {
    return NextResponse.json({ error: 'Internal Server Error', details: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
