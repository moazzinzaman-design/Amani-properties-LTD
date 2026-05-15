import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) return NextResponse.json({ error: "Prompt required" }, { status: 400 });

    // Mock AI logic: In a real app, this would call OpenAI GPT-4o
    // to parse the prompt into line items.
    
    const mockItems = [
      { description: "Strategic Consulting", quantity: 2, rate: 450 },
      { description: "React Frontend Development", quantity: 15, rate: 85 },
      { description: "Supabase Database Integration", quantity: 5, rate: 90 },
      { description: "Unit Testing & QA", quantity: 3, rate: 75 }
    ];

    return NextResponse.json({ 
      success: true, 
      items: mockItems,
      usage: "0.02 tokens" 
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
