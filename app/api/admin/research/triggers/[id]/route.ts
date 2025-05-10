import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { TABLES } from '@/utils/constants/database';

/**
 * PATCH /api/admin/research/triggers/[id]
 * Update a trigger
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createRouteHandlerClient();
  
  // Check admin permissions
  const { data } = await supabase.auth.getSession();
  const user = data.session?.user;
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const { data: profile } = await supabase
    .from(TABLES.PROFILES)
    .select('role')
    .eq('id', user.id)
    .single();
    
  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  
  // Get trigger ID from path
  const id = params.id;
  
  if (!id) {
    return NextResponse.json({ error: 'Missing trigger ID' }, { status: 400 });
  }
  
  // Update trigger
  const body = await request.json();
  const {
    trigger_event,
    survey_id,
    min_delay_ms,
    max_triggers,
    active
  } = body;
  
  // Create update object with only fields that are provided
  const updateData: any = {};
  
  if (trigger_event !== undefined) updateData.trigger_event = trigger_event;
  if (survey_id !== undefined) updateData.survey_id = survey_id;
  if (min_delay_ms !== undefined) updateData.min_delay_ms = min_delay_ms;
  if (max_triggers !== undefined) updateData.max_triggers = max_triggers;
  if (active !== undefined) updateData.active = active;
  
  // Make sure we have something to update
  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
  }
  
  // Update the trigger
  const { data: trigger, error } = await supabase
    .from(TABLES.RESEARCH_TRIGGERS)
    .update(updateData)
    .eq('id', id)
    .select()
    .single();
    
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json(trigger);
}

/**
 * DELETE /api/admin/research/triggers/[id]
 * Delete a trigger
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createRouteHandlerClient();
  
  // Check admin permissions
  const { data } = await supabase.auth.getSession();
  const user = data.session?.user;
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const { data: profile } = await supabase
    .from(TABLES.PROFILES)
    .select('role')
    .eq('id', user.id)
    .single();
    
  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  
  // Get trigger ID from path
  const id = params.id;
  
  if (!id) {
    return NextResponse.json({ error: 'Missing trigger ID' }, { status: 400 });
  }
  
  // Delete the trigger
  const { error } = await supabase
    .from(TABLES.RESEARCH_TRIGGERS)
    .delete()
    .eq('id', id);
    
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json({ success: true });
} 