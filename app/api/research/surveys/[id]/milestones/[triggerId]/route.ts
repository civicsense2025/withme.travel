import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

// GET: Retrieve a specific milestone trigger
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; triggerId: string } }
) {
  const supabase = await createRouteHandlerClient();
  
  try {
    // Check admin authorization
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Verify user is admin
    const { data: adminData, error: adminError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();
      
    if (adminError || !adminData?.is_admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get the specific trigger
    const { data: trigger, error: triggerError } = await supabase
      .from('survey_milestone_triggers')
      .select(`
        *,
        milestone:milestone_id(*)
      `)
      .eq('id', params.triggerId)
      .eq('survey_id', params.id)
      .single();
      
    if (triggerError) {
      return NextResponse.json({ error: 'Milestone trigger not found' }, { status: 404 });
    }
    
    return NextResponse.json({ trigger });
  } catch (error) {
    console.error('Error in milestone trigger GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH: Update a milestone trigger
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; triggerId: string } }
) {
  const supabase = await createRouteHandlerClient();
  
  try {
    // Check admin authorization
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Verify user is admin
    const { data: adminData, error: adminError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();
      
    if (adminError || !adminData?.is_admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    
    // Validate what can be updated
    const updateData: any = {};
    
    if (['high', 'medium', 'low'].includes(body.priority)) {
      updateData.priority = body.priority;
    }
    
    if (body.is_required !== undefined) {
      updateData.is_required = !!body.is_required;
    }
    
    if (['immediately', 'delay_24h', 'delay_1w'].includes(body.show_survey_after)) {
      updateData.show_survey_after = body.show_survey_after;
    }
    
    // Ensure there's something to update
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }
    
    // Update the trigger
    const { data: updatedTrigger, error: updateError } = await supabase
      .from('survey_milestone_triggers')
      .update(updateData)
      .eq('id', params.triggerId)
      .eq('survey_id', params.id)
      .select(`
        *,
        milestone:milestone_id(*)
      `)
      .single();
      
    if (updateError) {
      console.error('Error updating milestone trigger:', updateError);
      return NextResponse.json({ error: 'Failed to update milestone trigger' }, { status: 500 });
    }
    
    return NextResponse.json({ trigger: updatedTrigger });
  } catch (error) {
    console.error('Error in milestone trigger PATCH:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: Delete a milestone trigger
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; triggerId: string } }
) {
  const supabase = await createRouteHandlerClient();
  
  try {
    // Check admin authorization
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Verify user is admin
    const { data: adminData, error: adminError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();
      
    if (adminError || !adminData?.is_admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Delete the trigger
    const { error: deleteError } = await supabase
      .from('survey_milestone_triggers')
      .delete()
      .eq('id', params.triggerId)
      .eq('survey_id', params.id);
      
    if (deleteError) {
      console.error('Error deleting milestone trigger:', deleteError);
      return NextResponse.json({ error: 'Failed to delete milestone trigger' }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in milestone trigger DELETE:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 