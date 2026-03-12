/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

// Store active processes (simple implementation, ideally use a more robust task manager)
const activeProcesses: Record<string, any> = {};

export async function POST(req: Request) {
  try {
    const { projectId, projectPath, action, args } = await req.json();

    if (!projectPath || !fs.existsSync(projectPath)) {
      return NextResponse.json({ error: 'Invalid project path' }, { status: 400 });
    }

    let command = '';
    let cmdArgs: string[] = [];

    switch (action) {
      case 'git_pull':
        command = 'git';
        cmdArgs = ['pull'];
        break;
      case 'git_commit_push':
        command = 'bash';
        cmdArgs = ['-c', `git add . && git commit -m "${args?.message || 'Update'}" && git push`];
        break;
      case 'npm_install':
        command = 'npm';
        cmdArgs = ['install'];
        break;
      case 'npm_build':
        command = 'npm';
        cmdArgs = ['run', 'build'];
        break;
      case 'npm_dev':
        command = 'npm';
        cmdArgs = ['run', 'dev'];
        // Note: npm run dev is long-running, we might want to handle it differently 
        // if we want to stream output, but for now we'll just spawn and detach or return early.
        break;
      case 'custom':
        if (!args?.script) return NextResponse.json({ error: 'No script provided' }, { status: 400 });
        command = 'bash';
        cmdArgs = ['-c', args.script];
        break;
      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }

    // Spawn the process
    return new Promise<NextResponse>((resolve) => {
      const child = spawn(command, cmdArgs, { cwd: projectPath, shell: true });
      let output = '';
      
      child.stdout.on('data', (data) => {
        output += data.toString();
        // Here you could send chunks via SSE or websockets if implemented
      });

      child.stderr.on('data', (data) => {
        output += data.toString();
      });

      // For long running tasks like npm run dev, we don't want to wait for close
      if (action === 'npm_dev') {
        const procId = `${projectId}_dev`;
        activeProcesses[procId] = child;
        setTimeout(() => {
          resolve(NextResponse.json({ status: 'started', message: 'Dev server started in background', output }));
        }, 2000); // Give it a couple seconds to output initial startup logs
        return;
      }

      child.on('close', (code) => {
        if (code === 0) {
          resolve(NextResponse.json({ status: 'success', output }));
        } else {
          resolve(NextResponse.json({ status: 'error', error: `Process exited with code ${code}`, output }, { status: 500 }));
        }
      });
      
      child.on('error', (err) => {
          resolve(NextResponse.json({ status: 'error', error: err.message, output }, { status: 500 }));
      });
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
