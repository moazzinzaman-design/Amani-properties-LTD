/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import util from 'util';
import path from 'path';
import os from 'os';
import fs from 'fs/promises';

const execAsync = util.promisify(exec);

export async function GET() {
  try {
    const dbPath = path.join(os.homedir(), '.openclaw', 'tasks', 'runs.sqlite');
    const memPath = path.join(os.homedir(), '.openclaw', 'workspace', 'memory.json');
    const logsDir = path.join(os.homedir(), '.openclaw', 'logs');

    // --- Tasks from SQLite ---
    let tasks: any[] = [];
    try {
      const taskQuery = `SELECT task_id, status, agent_id, task, progress_summary, created_at, started_at, ended_at FROM task_runs ORDER BY created_at DESC LIMIT 25;`;
      const { stdout } = await execAsync(`sqlite3 -json "${dbPath}" "${taskQuery}"`);
      if (stdout && stdout.trim()) tasks = JSON.parse(stdout);
    } catch { /* ignore */ }

    // --- Stats from memory.json ---
    let agentXP: any = {};
    let leads: any[] = [];
    let logs: any[] = [];
    let agentStatus: any = {};

    try {
      const raw = await fs.readFile(memPath, 'utf-8');
      const mem = JSON.parse(raw);
      agentXP = mem.agentXP || {};
      leads = mem.leads || [];
      logs = (mem.logs || []).slice(-30); // last 30 log entries
      agentStatus = mem.agentStatus || {};
    } catch { /* ignore */ }

    // --- Status counts ---
    const statusCounts = tasks.reduce((acc: any, t: any) => {
      acc[t.status] = (acc[t.status] || 0) + 1;
      return acc;
    }, {});

    // --- Cron job info ---
    let cronJobs: any[] = [];
    try {
      const cronPath = path.join(os.homedir(), '.openclaw', 'cron', 'jobs.json');
      const raw = await fs.readFile(cronPath, 'utf-8');
      cronJobs = JSON.parse(raw).jobs || [];
    } catch { /* ignore */ }

    // --- Log files ---
    let logFiles: string[] = [];
    try {
      const files = await fs.readdir(logsDir);
      logFiles = files.filter(f => f.endsWith('.log') || f.endsWith('.jsonl')).slice(-5);
    } catch { /* ignore */ }

    // Completion rate
    const total = tasks.length;
    const succeeded = statusCounts['succeeded'] || 0;
    const completionRate = total > 0 ? Math.round((succeeded / total) * 100) : 0;

    return NextResponse.json({
      success: true,
      tasks,
      statusCounts,
      completionRate,
      totalLeads: leads.length,
      agentXP,
      agentStatus,
      logs,
      cronJobs,
      logFiles,
    });

  } catch (error: any) {
    console.error('API Error (analytics):', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
