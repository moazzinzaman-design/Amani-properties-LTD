import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import util from 'util';
import path from 'path';
import os from 'os';

const execAsync = util.promisify(exec);

export async function GET() {
  try {
    const dbPath = path.join(os.homedir(), '.openclaw', 'tasks', 'runs.sqlite');
    
    // Query active and recent tasks
    const query = `
      SELECT task_id, status, agent_id, task, progress_summary, created_at, started_at, ended_at 
      FROM task_runs 
      ORDER BY created_at DESC 
      LIMIT 20;
    `;
    
    const command = `sqlite3 -json "${dbPath}" "${query}"`;
    
    const { stdout } = await execAsync(command);
    
    let tasks = [];
    if (stdout && stdout.trim() !== '') {
      tasks = JSON.parse(stdout);
    }
    
    return NextResponse.json({ success: true, count: tasks.length, tasks });

  } catch (error: any) {
    console.error('API Error (Tasks):', error);
    return NextResponse.json({ success: false, error: error.message, tasks: [] }, { status: 500 });
  }
}
