import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { target, message } = body;

    if (!target || typeof target !== 'string') {
      return NextResponse.json({ error: 'Missing "target" field' }, { status: 400 });
    }
    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Missing "message" field' }, { status: 400 });
    }

    const escapedMessage = message.replace(/"/g, '\\"').replace(/\$/g, '\\$');
    const escapedTarget = target.replace(/"/g, '\\"');

    const cmd = `openclaw message send --target "${escapedTarget}" --message "${escapedMessage}"`;

    const { stdout, stderr } = await execAsync(cmd, {
      timeout: 30000,
      env: { ...process.env, PATH: `/usr/local/bin:/opt/homebrew/bin:${process.env.PATH}` },
    });

    return NextResponse.json({
      status: 'sent',
      output: stdout.trim(),
      stderr: stderr?.trim() || null,
    });
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : 'Message send failed';
    const stderr = (err as { stderr?: string })?.stderr?.trim() || null;
    return NextResponse.json({ status: 'error', error, stderr }, { status: 500 });
  }
}
