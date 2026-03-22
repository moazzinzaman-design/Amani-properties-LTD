import { NextRequest, NextResponse } from 'next/server';
import { dispatchAgentTask } from '@/services/agentService';

export async function POST(req: NextRequest) {
  try {
    const { extension_idea, competitor_url } = await req.json();

    if (!extension_idea) {
      return NextResponse.json({ error: 'extension_idea is required to begin the generation pipeline.' }, { status: 400 });
    }

    const sysPrompt = `
      [PIPELINE START: CHROME EXTENSION FACTORY]
      Topic: ${extension_idea}
      Competitor Ref: ${competitor_url || 'N/A'}
      Objective: Scaffold a Manifest V3 Chrome Extension and deploy to a zip bundle.
      Steps:
      1. Hunter/Researcher: Analyze the idea and refine features against top Chrome Store results.
      2. Architect: Build manifest.json and service worker architecture.
      3. Builder: Scaffold the React Popup UI and content script logic.
      4. QA: Verify permissions and test injectability using headless Puppeteer.
      5. Save final ZIP payload locally and notify dashboard of deployment readiness.
    `;

    // Dispatch specialized prompt directly into the agent swarm securely via the agentService
    const result = await dispatchAgentTask('mission-control-user', sysPrompt.trim());

    return NextResponse.json({ 
      success: true, 
      message: 'Chrome Extension Factory pipeline initialized.',
      data: result
    });

  } catch (err: unknown) {
    return NextResponse.json({ error: 'Internal Server Error', details: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
