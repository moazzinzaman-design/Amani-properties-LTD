import { NextRequest, NextResponse } from 'next/server';
import { dispatchAgentTask } from '@/services/agentService';

export async function POST(req: NextRequest) {
  try {
    const { target_niche, domain_name, pricing_model } = await req.json();

    if (!target_niche) {
      return NextResponse.json({ error: 'target_niche is required to generate the SaaS boilerplate.' }, { status: 400 });
    }

    const sysPrompt = `
      [PIPELINE START: SAAS BLUEPRINT FACTORY]
      Target Niche: ${target_niche}
      Domain Name: ${domain_name || 'TBD'}
      Pricing Model: ${pricing_model || 'Subscription ($19/mo)'}
      Objective: Scaffold a complete Next.js micro-SaaS architecture and prepare for deployment.
      
      Steps:
      1. Researcher: Analyze ${target_niche} to determine essential SaaS features and database models.
      2. Architect: Design the Next.js page structure, Supabase schema (users, subscriptions), and Stripe webhook flow.
      3. Builder: Scaffold the Next.js repository with Tailwind CSS components, Supabase client integration, and Stripe checkout logic.
      4. Deployer: Push the generated codebase to a new GitHub repository and trigger a Vercel deployment.
      5. Finalize: Return the deployed URL and GitHub repo link.
    `;

    // Dispatch specialized prompt directly into the agent swarm securely via the agentService
    // Because we use Basic Auth globally on the Mission Control, we assume caller is authorized.
    // Replace with explicit session check in production if needed.
    const result = await dispatchAgentTask('mission-control-user', sysPrompt.trim());

    return NextResponse.json({ 
      success: true, 
      message: 'SaaS Blueprint pipeline initialized successfully.',
      data: result
    });

  } catch (err: unknown) {
    return NextResponse.json(
      { error: 'Internal Server Error', details: err instanceof Error ? err.message : String(err) }, 
      { status: 500 }
    );
  }
}
