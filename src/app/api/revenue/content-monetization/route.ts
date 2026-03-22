import { NextRequest, NextResponse } from 'next/server';
import { dispatchAgentTask } from '@/services/agentService';

export async function POST(req: NextRequest) {
  try {
    const { target_niche, pricing_model } = await req.json();

    if (!target_niche) {
      return NextResponse.json({ error: 'target_niche is required.' }, { status: 400 });
    }

    const sysPrompt = `
      [PIPELINE START: CONTENT MONETIZATION & SEO FARM]
      Target Niche: ${target_niche}
      Monetization: ${pricing_model || 'Display ads + affiliate links'}
      Objective: Build a programmatic SEO content farm targeting long tail keywords.
      Steps:
      1. Researcher: Query Ahrefs/SEMrush data to find high-CPC, low competition keywords in ${target_niche}.
      2. Architect: Design content clusters and an internal linking strategy.
      3. Copywriter: Generate 2000+ word SEO-optimized articles with schema markup.
      4. Deployer: Provision a Next.js static blog or Ghost CMS and auto-publish.
      5. Marketer: Setup email list lead magnets and begin backlink outreach.
    `;

    // Dispatch specialized prompt directly into the agent swarm securely via the agentService
    const result = await dispatchAgentTask('mission-control-user', sysPrompt.trim());

    return NextResponse.json({ 
      success: true, 
      message: 'Content Monetization pipeline initialized successfully.',
      data: result
    });

  } catch (err: unknown) {
    return NextResponse.json(
      { error: 'Internal Server Error', details: err instanceof Error ? err.message : String(err) }, 
      { status: 500 }
    );
  }
}
