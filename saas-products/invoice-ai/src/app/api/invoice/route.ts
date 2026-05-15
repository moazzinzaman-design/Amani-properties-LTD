import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { user_id, client_name, amount, items, status, due_date } = body;

    const { data, error } = await supabase
      .from('invoices')
      .insert({
        user_id,
        client_name,
        amount,
        items,
        status: status || 'pending',
        due_date
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, invoice: data });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
