import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import os from 'os';

const execAsync = promisify(exec);
const MEMORY_PATH = path.join(os.homedir(), '.openclaw/workspace/memory.json');

// Helper to log to memory
function logAction(agent, message) {
  let memory = getMemory();
  memory.logs.push({ timestamp: new Date().toISOString(), agent, message });
  // keep last 50
  if (memory.logs.length > 50) memory.logs = memory.logs.slice(-50);
  saveMemory(memory);
  console.log(`[${agent}] ${message}`);
}

function getMemory() {
  if (!fs.existsSync(MEMORY_PATH)) return { 
    tasks: [], leads: [], logs: [], agentStatus: {}, 
    settings: { isPaused: false, manualApproval: true } 
  };
  return JSON.parse(fs.readFileSync(MEMORY_PATH, 'utf-8'));
}

function saveMemory(data) {
  fs.writeFileSync(MEMORY_PATH, JSON.stringify(data, null, 2));
}

function setAgentStatus(agent, status) {
  let memory = getMemory();
  if (!memory.agentStatus) memory.agentStatus = {};
  memory.agentStatus[agent] = status;
  saveMemory(memory);
}

// Ensure OpenClaw writes JSON we can parse
// FIXED: Using -m flag for the message/prompt
async function extractJSONFromAgent(agentName, promptText) {
  setAgentStatus(agentName, 'working');
  logAction('orchestrator', `Dispatching ${agentName}...`);
  try {
    const escaped = promptText.replace(/"/g, '\\"').replace(/\$/g, '\\$');
    const sessionId = `swarm-${agentName}-${Date.now()}`;
    
    // UPDATED: Correct CLI syntax for OpenClaw 2026.3.8
    // We specify the agent role with --agent and provide a unique session ID
    const cmd = `openclaw agent --agent "${agentName}" --session-id "${sessionId}" -m "Use the ${agentName} skill. ${escaped}. RETURN ONLY VALID JSON AT THE END."`;
    
    logAction('orchestrator', `Running: ${cmd}`);

    // Increased timeout for complex builds
    const { stdout } = await execAsync(cmd, { 
      timeout: 300000,
      env: { ...process.env, PATH: `/usr/local/bin:/opt/homebrew/bin:${process.env.PATH}` }
    });
    
    // Attempt to extract json block
    const match = stdout.match(/```json\n([\s\S]*?)\n```/);
    if (match) {
      setAgentStatus(agentName, 'idle');
      return JSON.parse(match[1]);
    }
    // Fallback block
    const fallbackMatch = stdout.match(/\{[\s\S]*\}$/);
    if (fallbackMatch) {
       setAgentStatus(agentName, 'idle');
       return JSON.parse(fallbackMatch[0]);
    }
    throw new Error('No valid JSON block found in output.');
  } catch (err) {
    setAgentStatus(agentName, 'error');
    logAction('orchestrator', `Agent ${agentName} failed: ${err.message}`);
    return null;
  }
}

// ---- The Event Loop ----
async function loop() {
  const memory = getMemory();
  
  // GLOBAL PAUSE CHECK
  if (memory.settings?.isPaused) return;

  // 1. Copywriter Trigger: Look for found leads with no email draft
  const pendingLeads = (memory.leads || []).filter(l => l.status === 'found' && !l.email_draft);
  if (pendingLeads.length > 0) {
    const lead = pendingLeads[0];
    const prompt = `Analyze this lead: ${JSON.stringify(lead)}. Draft an outreach email.`;
    const res = await extractJSONFromAgent('copywriter', prompt);
    if (res && res.status === 'drafted') {
      let m = getMemory();
      const idx = m.leads.findIndex(x => x.business === lead.business);
      if (idx > -1) {
        m.leads[idx].email_draft = res.email_draft;
        m.leads[idx].status = 'drafted';
        saveMemory(m);
        logAction('copywriter', `Drafted email for ${lead.business}`);
      }
    }
  }

  // 2. Swarm Task Pipeline: NEW -> Architect -> [Approval] -> Builder -> QA
  let m = getMemory();
  const tasks = m.tasks || [];
  
  for (let i = 0; i < tasks.length; i++) {
    const t = tasks[i];
    
    // Step A: New Task -> Architect
    if (t.status === 'planned' && !t.blueprint) {
       const prompt = `Task: ${t.description}. Analyze codebase and create a blueprint.`;
       const res = await extractJSONFromAgent('architect', prompt);
       if (res && res.status === 'planned') {
          let mem = getMemory();
          mem.tasks[i].blueprint = res.blueprint;
          mem.tasks[i].type = res.type || 'FEATURE';
          mem.tasks[i].slug = res.slug;
          mem.tasks[i].props = res.props;
          
          // SUPERVISOR UPGRADE: Require manual approval if enabled
          if (mem.settings.manualApproval) {
            mem.tasks[i].status = 'waiting_for_approval';
            mem.tasks[i].assignedTo = 'admin';
            logAction('architect', `Blueprint created for '${t.description}'. Waiting for human approval.`);
          } else {
            mem.tasks[i].status = 'approved';
            mem.tasks[i].assignedTo = 'builder';
            logAction('architect', `Blueprint created for '${t.description}'. Auto-approved for Builder.`);
          }
          saveMemory(mem);
       }
       break;
    }

    // Step B: Approved -> Builder
    if (t.status === 'approved' && t.assignedTo === 'builder' && t.blueprint) {
       const prompt = `Blueprint: ${t.blueprint}. Type: ${t.type}. Slug: ${t.slug}. Props: ${JSON.stringify(t.props)}. Execute changes.`;
       const res = await extractJSONFromAgent('builder', prompt);
       if (res && res.status === 'built') {
          let mem = getMemory();
          mem.tasks[i].status = 'built';
          mem.tasks[i].assignedTo = 'qa';
          saveMemory(mem);
          logAction('builder', `Wrote code for '${t.description}'. Handing off to QA.`);
       }
       break;
       
    } else if (t.status === 'built' && t.assignedTo === 'qa') {
       // Send to QA
       const prompt = `Verify code for task: ${t.description}. Run lint/build.`;
       const res = await extractJSONFromAgent('qa', prompt);
       let mem = getMemory();
       
       if (res && res.status === 'done') {
          mem.tasks[i].status = 'done';
          mem.tasks[i].assignedTo = 'none';
          logAction('qa', `Passed QA for '${t.description}'!`);
       } else if (res && res.status === 'qa_failed') {
          mem.tasks[i].retry_count = (mem.tasks[i].retry_count || 0) + 1;
          if (mem.tasks[i].retry_count >= 3) {
            mem.tasks[i].status = 'failed';
            mem.tasks[i].assignedTo = 'admin';
            logAction('orchestrator', `Dropped '${t.description}' after 3 QA fails.`);
          } else {
            mem.tasks[i].status = 'approved'; // Send back to builder
            mem.tasks[i].assignedTo = 'builder';
            mem.tasks[i].blueprint += `\n[QA FAILURE FIX]: ${res.error_log}`;
            logAction('qa', `Failed QA. Retrying Builder with logs.`);
          }
       }
       saveMemory(mem);
       break;
    }
  }
}

logAction('orchestrator', 'Claw Control Powerhouse online. Polling memory buffer...');
setInterval(loop, 10000); // Check every 10 seconds
