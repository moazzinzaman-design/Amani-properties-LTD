/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import os from 'os';

const MEMORY_PATH = path.join(os.homedir(), '.openclaw/workspace/memory.json');

function readMemory() {
  if (!fs.existsSync(MEMORY_PATH)) {
    return {
      tasks: [], leads: [], logs: [],
      agentStatus: { architect: 'idle', builder: 'idle', qa: 'idle', hunter: 'idle', copywriter: 'idle' },
      settings: { isPaused: false, manualApproval: true }
    };
  }
  return JSON.parse(fs.readFileSync(MEMORY_PATH, 'utf-8'));
}

export async function GET() {
  try {
    const memory = readMemory();
    return NextResponse.json(memory);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to read memory buffer', message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, payload } = body;

    let memory = readMemory();

    if (action === 'ADD_TASK') {
      memory.tasks.push({
        id: Date.now().toString(),
        description: payload.description,
        status: 'planned',
        assignedTo: 'none',
        createdAt: new Date().toISOString()
      });
      memory.logs.push({
        timestamp: new Date().toISOString(),
        agent: 'admin',
        message: `Injected new task: ${payload.description}`
      });
    } else if (action === 'APPROVE_TASK') {
      const idx = memory.tasks.findIndex((t: any) => t.id === payload.id);
      if (idx > -1) {
        memory.tasks[idx].status = 'approved';
        memory.tasks[idx].assignedTo = 'builder';
        memory.logs.push({
          timestamp: new Date().toISOString(),
          agent: 'admin',
          message: `Approved blueprint for: ${memory.tasks[idx].description}`
        });
      }
    } else if (action === 'TOGGLE_PAUSE') {
      memory.settings.isPaused = !memory.settings.isPaused;
      memory.logs.push({
        timestamp: new Date().toISOString(),
        agent: 'admin',
        message: `Swarm ${memory.settings.isPaused ? 'PAUSED' : 'RESUMED'}`
      });
    } else if (action === 'CLEAR_LOGS') {
      memory.logs = [];
    } else if (action === 'RESET_AGENTS') {
      // Reset all agent statuses back to idle
      const swarmAgents = ['architect', 'builder', 'qa', 'hunter', 'copywriter'];
      if (!memory.agentStatus) memory.agentStatus = {};
      for (const agent of swarmAgents) {
        memory.agentStatus[agent] = 'idle';
      }
      memory.logs.push({
        timestamp: new Date().toISOString(),
        agent: 'admin',
        message: '🔄 All agents reset to IDLE — Swarm standing by'
      });
    } else if (action === 'LAUNCH_PIPELINE') {
      const pipelineId = `pipeline-${Date.now()}`;
      const pipelineName = payload.title || 'Unnamed Pipeline';
      const subAgents = [
        { id: `${pipelineId}-researcher`, name: 'Researcher', role: 'Market analysis & validation', status: 'active', progress: 0 },
        { id: `${pipelineId}-builder`, name: 'Builder', role: 'Code scaffolding & development', status: 'active', progress: 0 },
        { id: `${pipelineId}-marketer`, name: 'Marketer', role: 'Copy, SEO & launch strategy', status: 'active', progress: 0 },
        { id: `${pipelineId}-deployer`, name: 'Deployer', role: 'CI/CD, hosting & go-live', status: 'active', progress: 0 },
      ];

      // Auto-generate step checklist from pipeline steps
      const stepsChecklist = (payload.steps || []).map((step: string, idx: number) => ({
        id: `step-${idx}`,
        label: step,
        done: false,
        assignedTo: idx === 0 ? 'Researcher' : idx < 3 ? 'Builder' : idx < 4 ? 'Marketer' : 'Deployer',
        notes: ''
      }));
      // Add generic milestones if none provided
      if (stepsChecklist.length === 0) {
        ['Market Research & Validation', 'Core Product Build', 'Landing Page & Copy', 'Payment Integration', 'Deployment & Launch'].forEach((s, i) => {
          stepsChecklist.push({ id: `step-${i}`, label: s, done: false, assignedTo: ['Researcher','Builder','Marketer','Builder','Deployer'][i], notes: '' });
        });
      }

      // Auto-join all idle swarm agents as collaborators
      const swarmAgents = ['architect', 'builder', 'qa', 'hunter', 'copywriter'];
      const autoCollaborators: string[] = [];
      if (memory.agentStatus) {
        for (const agent of swarmAgents) {
          const status = memory.agentStatus[agent] || 'idle';
          if (status === 'idle') {
            memory.agentStatus[agent] = `collab:${pipelineId}`;
            autoCollaborators.push(agent);
          }
        }
      }

      if (!memory.pipelines) memory.pipelines = [];
      memory.pipelines.push({
        id: pipelineId,
        title: pipelineName,
        description: payload.description || '',
        roi: payload.roi || '',
        status: 'active',
        createdAt: new Date().toISOString(),
        subAgents,
        collaborators: autoCollaborators,
        steps: stepsChecklist,
        config: {
          niche: '',
          techStack: ['Next.js', 'Supabase', 'Stripe'],
          pricingModel: 'subscription',
          deployTarget: 'Vercel',
          domain: '',
          customNotes: ''
        },
        budget: {
          items: [
            { label: 'Domain Registration', estimated: 12, actual: 0 },
            { label: 'Hosting (monthly)', estimated: 20, actual: 0 },
            { label: 'API Costs (monthly)', estimated: 50, actual: 0 },
            { label: 'Marketing', estimated: 100, actual: 0 },
          ],
          projectedRevenue: payload.roi || '$0/mo',
        },
        outputs: []
      });

      memory.logs.push({
        timestamp: new Date().toISOString(),
        agent: 'orchestrator',
        message: `🚀 Pipeline "${pipelineName}" launched — ALL 4 sub-agents active + ${autoCollaborators.length} swarm agents deployed (${autoCollaborators.join(', ')})`
      });
    } else if (action === 'JOIN_PIPELINE') {
      const pipeline = memory.pipelines?.find((p: any) => p.id === payload.pipelineId);
      if (pipeline) {
        const agentName = payload.agentName || 'unknown';
        if (!pipeline.collaborators.includes(agentName)) {
          pipeline.collaborators.push(agentName);
        }
        if (memory.agentStatus) {
          memory.agentStatus[agentName] = `collab:${pipeline.id}`;
        }
        memory.logs.push({
          timestamp: new Date().toISOString(),
          agent: agentName,
          message: `Joined pipeline "${pipeline.title}" as collaborator`
        });
      }
    } else if (action === 'DELETE_PIPELINE') {
      if (memory.pipelines && Array.isArray(memory.pipelines)) {
        const idx = memory.pipelines.findIndex((p: any) => p.id === payload.pipelineId);
        if (idx > -1) {
          const removed = memory.pipelines.splice(idx, 1)[0];
          // Free collaborating agents back to idle
          if (memory.agentStatus) {
            for (const key of Object.keys(memory.agentStatus)) {
              if (memory.agentStatus[key]?.includes(payload.pipelineId)) {
                memory.agentStatus[key] = 'idle';
              }
            }
          }
          memory.logs.push({ timestamp: new Date().toISOString(), agent: 'admin', message: `🗑 Pipeline "${removed.title}" DELETED` });
        }
      }
    } else if (action === 'PAUSE_PIPELINE') {
      const pipeline = memory.pipelines?.find((p: any) => p.id === payload.pipelineId);
      if (pipeline) {
        pipeline.status = 'paused';
        pipeline.subAgents.forEach((sa: any) => { if (sa.status === 'active') sa.status = 'paused'; });
        memory.logs.push({ timestamp: new Date().toISOString(), agent: 'admin', message: `⏸ Pipeline "${pipeline.title}" PAUSED` });
      }
    } else if (action === 'RESUME_PIPELINE') {
      const pipeline = memory.pipelines?.find((p: any) => p.id === payload.pipelineId);
      if (pipeline) {
        pipeline.status = 'active';
        pipeline.subAgents.forEach((sa: any) => { if (sa.status === 'paused') sa.status = 'active'; });
        memory.logs.push({ timestamp: new Date().toISOString(), agent: 'admin', message: `▶ Pipeline "${pipeline.title}" RESUMED` });
      }
    } else if (action === 'UPDATE_PIPELINE_CONFIG') {
      const pipeline = memory.pipelines?.find((p: any) => p.id === payload.pipelineId);
      if (pipeline) {
        pipeline.config = { ...pipeline.config, ...payload.config };
        memory.logs.push({ timestamp: new Date().toISOString(), agent: 'admin', message: `⚙ Pipeline "${pipeline.title}" config updated` });
      }
    } else if (action === 'UPDATE_PIPELINE_STEPS') {
      const pipeline = memory.pipelines?.find((p: any) => p.id === payload.pipelineId);
      if (pipeline && payload.stepId !== undefined) {
        const step = pipeline.steps.find((s: any) => s.id === payload.stepId);
        if (step) {
          if (payload.done !== undefined) step.done = payload.done;
          if (payload.notes !== undefined) step.notes = payload.notes;
          if (payload.label !== undefined) step.label = payload.label;
        }
      }
    } else if (action === 'ADD_PIPELINE_OUTPUT') {
      const pipeline = memory.pipelines?.find((p: any) => p.id === payload.pipelineId);
      if (pipeline) {
        pipeline.outputs.push({
          id: `out-${Date.now()}`,
          title: payload.title || 'Untitled',
          type: payload.type || 'file',
          url: payload.url || '',
          agent: payload.agent || 'unknown',
          createdAt: new Date().toISOString()
        });
      }
    } else if (action === 'ADVANCE_PIPELINE') {
      const pipeline = memory.pipelines?.find((p: any) => p.id === payload.pipelineId);
      if (pipeline) {
        const subAgent = pipeline.subAgents.find((sa: any) => sa.id === payload.subAgentId);
        if (subAgent) {
          subAgent.progress = Math.min(100, (subAgent.progress || 0) + (payload.increment || 25));
          if (subAgent.progress >= 100) {
            subAgent.status = 'complete';
            const nextQueued = pipeline.subAgents.find((sa: any) => sa.status === 'queued');
            if (nextQueued) nextQueued.status = 'active';
            if (pipeline.subAgents.every((sa: any) => sa.status === 'complete')) {
              pipeline.status = 'complete';
              memory.logs.push({ timestamp: new Date().toISOString(), agent: 'orchestrator', message: `✅ Pipeline "${pipeline.title}" COMPLETED` });
            }
          }
        }
      }
    }

    fs.writeFileSync(MEMORY_PATH, JSON.stringify(memory, null, 2));
    
    return NextResponse.json({ success: true, memory });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to mutate memory buffer', message }, { status: 500 });
  }
}
