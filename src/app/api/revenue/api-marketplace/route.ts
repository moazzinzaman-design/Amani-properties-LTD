import { NextRequest, NextResponse } from 'next/server';
import { dispatchAgentTask } from '@/services/agentService';

export async function POST(req: NextRequest) {
  try {
    const { target_niche, pricing_model } = await req.json();

    if (!target_niche) {
      return NextResponse.json({ error: 'target_niche is required.' }, { status: 400 });
    }

    const sysPrompt = `
      [PIPELINE START: API MARKETPLACE WRAPPER]
      Target Niche: ${target_niche}
      Pricing Model: ${pricing_model || 'Usage-based'}
      Objective: Wrap AI models or dataset scrapers into a monetizable API.
      Steps:
      1. Researcher: Identify in-demand API endpoints for ${target_niche}.
      2. Architect: Design serverless architecture with rate limiting and Redis.
      3. Builder: Scaffold FastAPI/Express routes and integrate Stripe metering.
      4. QA: Run artillery load tests and security scans.
      5. Deployer: Publish OpenAPI docs and deploy to RapidAPI and Vercel.
    `;

    // Dispatch specialized prompt directly into the agent swarm securely via the agentService
    const result = await dispatchAgentTask('mission-control-user', sysPrompt.trim());

    return NextResponse.json({ 
      success: true, 
      message: 'API Marketplace pipeline initialized successfully.',
      data: result
    });

  } catch (err: unknown) {
    return NextResponse.json(
      { error: 'Internal Server Error', details: err instanceof Error ? err.message : String(err) }, 
      { status: 500 }
    );
  }
}
