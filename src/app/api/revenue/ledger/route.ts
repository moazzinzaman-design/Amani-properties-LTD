/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

export async function GET() {
  try {
    const memPath = path.join(os.homedir(), '.openclaw', 'workspace', 'memory.json');
    
    let leads: any[] = [];
    let logs: any[] = [];
    let agentXP: any = {};
    
    try {
      const raw = await fs.readFile(memPath, 'utf-8');
      const mem = JSON.parse(raw);
      leads = mem.leads || [];
      logs = mem.logs || [];
      agentXP = mem.agentXP || {};
    } catch { /* ignore */ }

    // Calculate total simulated revenue from agent XP (£5 per lead scraped)
    const totalLeads = leads.length;
    const highValueLeads = leads.filter((l: any) => l.score >= 80).length;
    const revenueFromLeads = totalLeads * 5; // £5 per lead

    // Revenue events from logs
    const revenueEvents = logs.filter((l: any) => 
      l.message?.includes('XP') || l.message?.includes('revenue')
    );

    // Build daily revenue chart from leads scraped per day
    const dailyMap: Record<string, number> = {};
    leads.forEach((lead: any) => {
      const day = new Date(lead.scrapedAt).toLocaleDateString('en-GB', { weekday: 'short' });
      dailyMap[day] = (dailyMap[day] || 0) + 5;
    });

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const dailyRevenue = days.map(d => ({ label: d, value: dailyMap[d] || 0 }));

    // Agent revenue breakdown
    const agentRevenue = Object.entries(agentXP).map(([name, data]: [string, any]) => ({
      name,
      tasksCompleted: data.tasksCompleted || 0,
      xp: data.xp || 0,
      level: data.level || 1,
      estimatedRevenue: (data.tasksCompleted || 0) * 12,
    }));

    return NextResponse.json({
      success: true,
      totalLeads,
      highValueLeads,
      revenueFromLeads,
      totalRevenue: revenueFromLeads,
      revenueEvents: revenueEvents.length,
      dailyRevenue,
      agentRevenue,
      leads: leads.slice(-10), // last 10 leads
    });

  } catch (error: any) {
    console.error('API Error (ledger):', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
