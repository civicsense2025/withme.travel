import { z } from 'zod';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { TABLES } from '@/utils/constants/tables';
import { NextRequest, NextResponse } from 'next/server';

// Zod schema for a milestone trigger
const MilestoneTriggerSchema = z.object({
  event_type: z.string(),
  form_id: z.string(),
  active: z.boolean().default(true),
  metadata: z.record(z.any()).optional(),
});

// GET /api/research/milestone-triggers
export async function GET(request: NextRequest) {
  const supabase = await createRouteHandlerClient();
  
  // Parse query params for filtering
  const url = new URL(request.url);
  const eventType = url.searchParams.get('event_type');
  const formId = url.searchParams.get('form_id');
  const active = url.searchParams.get('active') === 'true';
  
  // Build query
  let query = supabase.from(TABLES.MILESTONE_TRIGGERS).select('*');
  
  if (eventType) {
    query = query.eq('event_type', eventType);
  }
  
  if (formId) {
    query = query.eq('form_id', formId);
  }
  
  if (url.searchParams.has('active')) {
    query = query.eq('active', active);
  }
  
  const { data, error } = await query;
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json({ triggers: data });
}

// POST /api/research/milestone-triggers
export async function POST(request: NextRequest) {
  const supabase = await createRouteHandlerClient();
  const body = await request.json();
  
  // Validate trigger data
  const result = MilestoneTriggerSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: 'Invalid trigger data', details: result.error.flatten() },
      { status: 400 }
    );
  }
  
  // Insert trigger
  const { data, error } = await supabase
    .from(TABLES.MILESTONE_TRIGGERS)
    .insert([result.data])
    .select()
    .single();
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json({ success: true, trigger: data });
}
