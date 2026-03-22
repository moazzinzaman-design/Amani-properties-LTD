import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { topic, url } = await req.json();

    if (!topic) {
      return NextResponse.json({ error: 'Topic is required to generate an SEO report.' }, { status: 400 });
    }

    // 1. Fetch current OpenClaw memory state from Supabase
    const { data: dbData, error } = await supabase
      .from('openclaw_memory')
      .select('id, memory')
      .limit(1)
      .single();

    if (error || !dbData) {
      return NextResponse.json({ error: 'Database connection failed.' }, { status: 500 });
    }

    const memory = dbData.memory;
    if (!memory.research_tasks) memory.research_tasks = [];

    // 2. Inject the SEO Research Task into the event loop
    const taskId = `seo-${Date.now()}`;
    memory.research_tasks.push({
      id: taskId,
      topic: topic,
      target_url: url || 'general',
      status: 'pending',
      created_at: new Date().toISOString()
    });

    // 3. Save back to Supabase (Orchestrator will pick this up automatically)
    await supabase.from('openclaw_memory').update({ memory }).eq('id', dbData.id);

    return NextResponse.json({ 
      success: true, 
      message: 'SEO Report task scheduled successfully.',
      task_id: taskId
    });

  } catch (err: unknown) {
    return NextResponse.json({ error: 'Internal Server Error', details: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
