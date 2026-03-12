import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, channel, deliver } = body;

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Missing "prompt" field' }, { status: 400 });
    }

    const escapedPrompt = prompt.replace(/"/g, '\\"').replace(/\$/g, '\\$');
    let cmd = `openclaw agent --prompt "${escapedPrompt}"`;

    if (deliver && channel) {
      cmd += ` --deliver "${deliver}" --channel "${channel}"`;
    }

    const { stdout, stderr } = await execAsync(cmd, {
      timeout: 120000,
      env: { ...process.env, PATH: `/usr/local/bin:/opt/homebrew/bin:${process.env.PATH}` },
    });

    return NextResponse.json({
      status: 'completed',
      output: stdout.trim(),
      stderr: stderr?.trim() || null,
    });
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : 'Agent execution failed';
    const stderr = (err as { stderr?: string })?.stderr?.trim() || null;
    return NextResponse.json({ status: 'error', error, stderr }, { status: 500 });
  }
}
