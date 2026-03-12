import { supabase } from '@/lib/supabase';

/**
 * Inserts a new task array into Supabase and fires it to the local OpenClaw socket.
 */
export async function dispatchAgentTask(userId: string, taskDescription: string) {
  // If no Supabase connection, bypass and use local-only mock ID for sandbox testing
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.warn("Bypassing Supabase: No URL provided");
    return fireToSocket(`mock-task-${Date.now()}`, taskDescription);
  }

  // 1. Log the task to Supabase
  const { data, error } = await supabase
    .from('agent_tasks')
    .insert({
      user_id: userId,
      task_description: taskDescription,
      status: 'pending'
    })
    .select()
    .single();

  if (error || !data) {
    console.error("Supabase Insert Error:", error);
    throw new Error('Failed to log task in database.');
  }

  // 2. Fire payload to local OpenClaw Gateway Orchestrator API
  try {
    return await fireToSocket(data.id, taskDescription);
  } catch (socketError) {
    console.error("OpenClaw Dispatch Error:", socketError);
    
    // Fallback: Update Supabase to mark task as failed connection
    await supabase.from('agent_tasks').update({ status: 'failed_dispatch' }).eq('id', data.id);
    throw new Error('Task logged, but failed to reach local agent.');
  }
}

async function fireToSocket(taskId: string, description: string) {
    const res = await fetch("/api/openclaw/orchestrator", { 
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ 
          action: "ADD_TASK", 
          payload: { 
            id: taskId, 
            description: description 
          } 
        }) 
      });
      
      if (!res.ok) throw new Error("Gateway rejected task");
      
      const result = await res.json();
      return { dbTask: { id: taskId, description }, response: result };
}
