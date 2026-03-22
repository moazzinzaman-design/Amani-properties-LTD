-- Create the memory table for OpenClaw
CREATE TABLE IF NOT EXISTS public.openclaw_memory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    memory JSONB NOT NULL DEFAULT '{"tasks": [], "leads": [], "logs": [], "agentStatus": {}, "settings": {"isPaused": false, "manualApproval": true}, "targets": [], "research_tasks": [], "system_alerts": [], "tickets": [], "billing_events": []}'::jsonb
);

-- Note: In a production Supabase instance, this only inserts one row to act as the global memory state
INSERT INTO public.openclaw_memory (memory) 
SELECT '{"tasks": [], "leads": [], "logs": [], "agentStatus": {}, "settings": {"isPaused": false, "manualApproval": true}, "targets": [], "research_tasks": [], "system_alerts": [], "tickets": [], "billing_events": []}'::jsonb
WHERE NOT EXISTS (
    SELECT 1 FROM public.openclaw_memory
);

-- Create the agent tasks table for direct task logging
CREATE TABLE IF NOT EXISTS public.agent_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT,
    task_description TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
