import { exec } from 'child_process';
import { promisify } from 'util';
import { createClient } from '@supabase/supabase-js';

const execAsync = promisify(exec);

// Initialize Supabase Client directly (reading from the environment)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://lixbxptixwqdktbbatvh.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_kwLSeabK1r6zqv3y6YUYHg_sACFwy9S';

if (!supabaseUrl || !supabaseKey) {
  console.error('[Orchestrator] CRITICAL: Missing Supabase credentials in .env.local. OpenClaw requires full DB access.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Async Memory Handlers
async function getMemory() {
  const { data, error } = await supabase
    .from('openclaw_memory')
    .select('id, memory')
    .limit(1)
    .single();

  if (error || !data) {
    console.error('[Orchestrator] Error reading memory from Supabase:', error);
    return { 
      tasks: [], leads: [], logs: [], agentStatus: {}, 
      settings: { isPaused: false, manualApproval: true },
      targets: [], research_tasks: [], system_alerts: [], tickets: [], billing_events: []
    };
  }
  
  return { _db_id: data.id, ...data.memory };
}

async function saveMemory(data) {
  const dbId = data._db_id;
  delete data._db_id; // Remove before saving back
  
  if (dbId) {
    const { error } = await supabase
      .from('openclaw_memory')
      .update({ memory: data, updated_at: new Date().toISOString() })
      .eq('id', dbId);
      
    if (error) console.error('[Orchestrator] Error saving memory:', error);
  } else {
    // Fallback if no row existed
    await supabase.from('openclaw_memory').insert([{ memory: data }]);
  }
}

async function logAction(agent, message) {
  let memory = await getMemory();
  if (!memory.logs) memory.logs = [];
  memory.logs.push({ timestamp: new Date().toISOString(), agent, message });
  // keep last 50
  if (memory.logs.length > 50) memory.logs = memory.logs.slice(-50);
  
  await saveMemory({...memory, _db_id: memory._db_id});
  console.log(`[${agent}] ${message}`);
}

async function setAgentStatus(agent, status) {
  let memory = await getMemory();
  if (!memory.agentStatus) memory.agentStatus = {};
  memory.agentStatus[agent] = status;
  await saveMemory({...memory, _db_id: memory._db_id});
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
  const memory = await getMemory();
  
  // GLOBAL PAUSE CHECK
  if (memory.settings?.isPaused) return;

  // 1. Copywriter Trigger: Look for found leads with no email draft
  const pendingLeads = (memory.leads || []).filter(l => l.status === 'found' && !l.email_draft);
  if (pendingLeads.length > 0) {
    const lead = pendingLeads[0];
    const prompt = `Analyze this lead: ${JSON.stringify(lead)}. Draft an outreach email.`;
    const res = await extractJSONFromAgent('copywriter', prompt);
    if (res && res.status === 'drafted') {
      let m = await getMemory();
      const idx = m.leads.findIndex(x => x.business === lead.business);
      if (idx > -1) {
        m.leads[idx].email_draft = res.email_draft;
        m.leads[idx].status = 'drafted';
        await saveMemory(m);
        await logAction('copywriter', `Drafted email for ${lead.business}`);
      }
    }
  }

  // 2. Swarm Task Pipeline: NEW -> Architect -> [Approval] -> Builder -> QA
  let m = await getMemory();
  const tasks = m.tasks || [];
  
  for (let i = 0; i < tasks.length; i++) {
    const t = tasks[i];
    
    // Step A: New Task -> Architect
    if (t.status === 'planned' && !t.blueprint) {
       const prompt = `Task: ${t.description}. Analyze codebase and create a blueprint.`;
       const res = await extractJSONFromAgent('architect', prompt);
       if (res && res.status === 'planned') {
          let mem = await getMemory();
          mem.tasks[i].blueprint = res.blueprint;
          mem.tasks[i].type = res.type || 'FEATURE';
          mem.tasks[i].slug = res.slug;
          mem.tasks[i].props = res.props;
          
          // SUPERVISOR UPGRADE: Require manual approval if enabled
          if (mem.settings.manualApproval) {
            mem.tasks[i].status = 'waiting_for_approval';
            mem.tasks[i].assignedTo = 'admin';
            await logAction('architect', `Blueprint created for '${t.description}'. Waiting for human approval.`);
          } else {
            mem.tasks[i].status = 'approved';
            mem.tasks[i].assignedTo = 'builder';
            await logAction('architect', `Blueprint created for '${t.description}'. Auto-approved for Builder.`);
          }
          await saveMemory(mem);
       }
       break;
    }

    // Step B: Approved -> Builder
    if (t.status === 'approved' && t.assignedTo === 'builder' && t.blueprint) {
       const prompt = `Blueprint: ${t.blueprint}. Type: ${t.type}. Slug: ${t.slug}. Props: ${JSON.stringify(t.props)}. Execute changes.`;
       const res = await extractJSONFromAgent('builder', prompt);
       if (res && res.status === 'built') {
          let mem = await getMemory();
          mem.tasks[i].status = 'built';
          mem.tasks[i].assignedTo = 'qa';
          await saveMemory(mem);
          await logAction('builder', `Wrote code for '${t.description}'. Handing off to QA.`);
       }
       break;
       
    } else if (t.status === 'built' && t.assignedTo === 'qa') {
       // Send to QA
       const prompt = `Verify code for task: ${t.description}. Run lint/build.`;
       const res = await extractJSONFromAgent('qa', prompt);
       let mem = await getMemory();
       
       if (res && res.status === 'done') {
          mem.tasks[i].status = 'done';
          mem.tasks[i].assignedTo = 'none';
          await logAction('qa', `Passed QA for '${t.description}'!`);
       } else if (res && res.status === 'qa_failed') {
          mem.tasks[i].retry_count = (mem.tasks[i].retry_count || 0) + 1;
          if (mem.tasks[i].retry_count >= 3) {
            mem.tasks[i].status = 'failed';
            mem.tasks[i].assignedTo = 'admin';
            await logAction('orchestrator', `Dropped '${t.description}' after 3 QA fails.`);
          } else {
            mem.tasks[i].status = 'approved'; // Send back to builder
            mem.tasks[i].assignedTo = 'builder';
            mem.tasks[i].blueprint += `\n[QA FAILURE FIX]: ${res.error_log}`;
            await logAction('qa', `Failed QA. Retrying Builder with logs.`);
          }
       }
       await saveMemory(mem);
       break;
    }
  }

  // 3. Prospector Trigger: Identify new targets for scraping
  const pendingTargets = (memory.targets || []).filter(t => t.status === 'new');
  if (pendingTargets.length > 0) {
    const target = pendingTargets[0];
    const prompt = `Prospecting target: ${JSON.stringify(target)}. Identify leads and scrape data.`;
    const res = await extractJSONFromAgent('prospector', prompt);
    if (res && res.status === 'prospecting_complete') {
        let m = await getMemory();
        if (!m.leads) m.leads = [];
        m.leads.push(...(res.new_leads || []));
        const idx = (m.targets || []).findIndex(t => t.id === target.id);
        if (idx > -1) m.targets[idx].status = 'prospected';
        await saveMemory(m);
        await logAction('prospector', `Found ${res.new_leads?.length || 0} leads for target ${target.id}`);
    }
  }

  // 4. Dealmaker Trigger: Send drafted emails and negotiate
  const draftedLeads = (memory.leads || []).filter(l => l.status === 'drafted' && !l.contacted);
  if (draftedLeads.length > 0) {
    const lead = draftedLeads[0];
    const prompt = `Lead: ${JSON.stringify(lead)}. Finalize and send the outreach email. Start negotiation protocol.`;
    const res = await extractJSONFromAgent('dealmaker', prompt);
    if (res && res.status === 'contacted') {
        let m = await getMemory();
        const idx = m.leads.findIndex(x => x.business === lead.business);
        if (idx > -1) {
            m.leads[idx].status = 'contacted';
            m.leads[idx].contacted = true;
            m.leads[idx].deal_stage = res.deal_stage || 'outreach_sent';
            await saveMemory(m);
            await logAction('dealmaker', `Sent outreach to ${lead.business}`);
        }
    }
  }

  // 5. Analyst Trigger: Market research and SEO data synthesis
  const pendingResearch = (memory.research_tasks || []).filter(r => r.status === 'pending');
  if (pendingResearch.length > 0) {
    const task = pendingResearch[0];
    const prompt = `Research Topic: ${task.topic}. Generate SEO report and competitor analysis.`;
    const res = await extractJSONFromAgent('analyst', prompt);
    if (res && res.status === 'analyzed') {
        let m = await getMemory();
        const idx = (m.research_tasks || []).findIndex(r => r.id === task.id);
        if (idx > -1) {
            m.research_tasks[idx].status = 'analyzed';
            m.research_tasks[idx].report = res.report;
            await saveMemory(m);
            await logAction('analyst', `Completed research report for ${task.topic}`);
        }
    }
  }

  // 6. DevOps Trigger: Server monitoring and system health
  const alerts = (memory.system_alerts || []).filter(a => a.status === 'unresolved');
  if (alerts.length > 0) {
    const alert = alerts[0];
    const prompt = `System Alert: ${JSON.stringify(alert)}. Diagnose and provide auto-healing remediation.`;
    const res = await extractJSONFromAgent('devops', prompt);
    if (res && res.status === 'resolved') {
        let m = await getMemory();
        const idx = (m.system_alerts || []).findIndex(a => a.id === alert.id);
        if (idx > -1) {
            m.system_alerts[idx].status = 'resolved';
            m.system_alerts[idx].fix_applied = res.fix_applied;
            await saveMemory(m);
            await logAction('devops', `Resolved system alert ${alert.id}: ${res.fix_applied}`);
        }
    }
  }

  // 7. Support Trigger: Automated ticket resolution
  const openTickets = (memory.tickets || []).filter(t => t.status === 'open');
  if (openTickets.length > 0) {
    const ticket = openTickets[0];
    const prompt = `Customer Ticket: ${JSON.stringify(ticket)}. Generate response and attempt resolution.`;
    const res = await extractJSONFromAgent('support', prompt);
    if (res && res.status === 'answered') {
        let m = await getMemory();
        const idx = (m.tickets || []).findIndex(t => t.id === ticket.id);
        if (idx > -1) {
            m.tickets[idx].status = res.resolved ? 'closed' : 'waiting_on_customer';
            m.tickets[idx].last_response = res.response;
            await saveMemory(m);
            await logAction('support', `Answered ticket ${ticket.id}`);
        }
    }
  }

  // 8. Finance Trigger: Invoicing and billing operations
  const pendingInvoices = (memory.billing_events || []).filter(b => b.status === 'pending_invoice');
  if (pendingInvoices.length > 0) {
    const event = pendingInvoices[0];
    const prompt = `Billing Event: ${JSON.stringify(event)}. Generate invoice and sync with Stripe/accounting.`;
    const res = await extractJSONFromAgent('finance', prompt);
    if (res && res.status === 'invoiced') {
        let m = await getMemory();
        const idx = (m.billing_events || []).findIndex(b => b.id === event.id);
        if (idx > -1) {
            m.billing_events[idx].status = 'invoiced';
            m.billing_events[idx].invoice_metadata = res.invoice_metadata;
            await saveMemory(m);
            await logAction('finance', `Generated invoice for event ${event.id}`);
        }
    }
  }
}

logAction('orchestrator', 'Claw Control Powerhouse online. Polling remote Supabase memory...');
setInterval(loop, 10000); // Check every 10 seconds
