import { NextRequest, NextResponse } from 'next/server';
import { dispatchAgentTask } from '@/services/agentService';

export async function POST(req: NextRequest) {
  try {
    const { payload, userId } = await req.json();

    if (!payload?.description) {
      return NextResponse.json({ error: 'Payload must contain a description for the autonomous agent.' }, { status: 400 });
    }

    // In a production app, verify the user session/authentication here
    // e.g. const user = await getSession(req);

    // Hardcode generic ID if none provided by the UI
    const resolvedUserId = userId || 'mission-control-user';

    const result = await dispatchAgentTask(resolvedUserId, payload.description);

    return NextResponse.json({
      success: true,
      message: 'Task successfully dispatched to the OpenClaw orchestration loop.',
      data: result,
    });

  } catch (err: unknown) {
    console.error('Agent Dispatch Error:', err);
    return NextResponse.json({ error: 'Failed to process agent dispatch.', details: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
