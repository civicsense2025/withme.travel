import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { FORM_TABLES } from '@/utils/constants/tables';
import { z } from 'zod';
import { EventType } from '@/types/research';

// POST /api/research/milestone-triggers/validate
export async function POST(request: NextRequest) {
  const supabase = await createRouteHandlerClient();
  try {
    const body = await request.json();
    const schema = z.object({
      event_type: z.custom<EventType>(),
      session_id: z.string().optional(),
    });
    const result = schema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: 'Invalid request', details: result.error.flatten() }, { status: 400 });
    }
    const { event_type } = result.data;
    // Find active triggers for this event type
    const { data: triggers, error } = await supabase
      .from(FORM_TABLES.MILESTONE_TRIGGERS)
      .select('*, form:forms(*)')
      .eq('event_type', event_type)
      .eq('active', true)
      .order('priority', { ascending: false })
      .limit(1);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (triggers && triggers.length > 0) {
      return NextResponse.json({ survey: triggers[0].form });
    }
    return NextResponse.json({ survey: null });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 