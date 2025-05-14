import { z } from 'zod';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { TABLES } from '@/utils/constants/tables';
import { NextRequest, NextResponse } from 'next/server';

// Zod schema for a user testing event
const UserTestingEventSchema = z.object({
  session_id: z.string(),
  event_type: z.string(),
  event_data: z.record(z.any()).optional(),
  timestamp: z.string().optional(),
});

// POST /api/research/events
export async function POST(request: NextRequest) {
  const supabase = await createRouteHandlerClient();
  const body = await request.json();
  
  // Validate event
  const result = UserTestingEventSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: 'Invalid event', details: result.error.flatten() },
      { status: 400 }
    );
  }
  
  // Default timestamp if not provided
  if (!body.timestamp) {
    body.timestamp = new Date().toISOString();
  }
  
  // Insert event
  const { data, error } = await supabase
    .from(TABLES.USER_TESTING_EVENTS)
    .insert([body])
    .select()
    .single();
    
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  
  // Check if this event should trigger any surveys (milestone_triggers)
  const { data: triggerData, error: triggerError } = await supabase
    .from(TABLES.MILESTONE_TRIGGERS)
    .select('*')
    .eq('event_type', body.event_type)
    .eq('active', true)
    .limit(1);
    
  if (triggerError) {
    console.error('Error checking for triggers:', triggerError);
    // Continue without failing the request
  }
  
  // If we found a trigger, include the form ID in the response
  if (triggerData && triggerData.length > 0) {
    return NextResponse.json({ 
      event: data,
      triggerFormId: triggerData[0].form_id 
    });
  }
  
  // Alternative: check forms with milestone_triggers array
  const { data: formData, error: formError } = await supabase
    .from(TABLES.FORMS)
    .select('id')
    .contains('milestone_triggers', [body.event_type])
    .eq('is_active', true)
    .limit(1);
    
  if (formError) {
    console.error('Error checking for forms with milestone triggers:', formError);
    // Continue without failing the request
  }
  
  // If we found a form with this event in its milestone_triggers, include it
  if (formData && formData.length > 0) {
    return NextResponse.json({ 
      event: data,
      triggerFormId: formData[0].id 
    });
  }
  
  // Return the event data without any triggers
  return NextResponse.json({ event: data });
}
