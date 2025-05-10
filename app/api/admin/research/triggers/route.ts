import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { TABLES } from '@/utils/constants/database';
import { rateLimit } from '@/lib/rate-limit';
import { ResearchTrigger } from '@/types/research';
import { researchTriggersTableHelper } from '@/utils/supabase/table-helpers';

// Cache responses for 10 seconds
export const revalidate = 10;

/**
 * GET /api/admin/research/triggers
 * List all triggers for a specific study
 */
export async function GET(request: NextRequest) {
  const supabase = await createRouteHandlerClient();
  
  // No rate limiting for admin panel endpoints
  
  try {
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
    
    // Check for both parameter naming conventions for backward compatibility
    const studyId = request.nextUrl.searchParams.get('studyId') || 
                   request.nextUrl.searchParams.get('study_id');
    
    if (!studyId) {
      return NextResponse.json({ error: 'Missing studyId' }, { status: 400 });
    }
    
    // Get all triggers for this study using the helper
    const { data: triggers, error } = await researchTriggersTableHelper(supabase)
      .select('*')
      .eq('study_id', studyId);
      
    if (error) {
      console.error('Error fetching triggers:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    // Always return an array, even if empty
    return NextResponse.json(triggers || []);
  } catch (error) {
    console.error('Unexpected error in triggers API:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' }, 
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/research/triggers
 * Create a new trigger
 */
export async function POST(request: NextRequest) {
  const supabase = await createRouteHandlerClient();
  
  // No rate limiting for admin panel endpoints
  
  try {
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
    
    // Get request body
    const body = await request.json();
    
    // Log the request body for debugging
    console.log('Creating trigger with data:', body);
    
    // Validate required fields
    const {
      study_id,
      trigger_event,
      survey_id,
      min_delay_ms,
      max_triggers,
      active
    } = body;
    
    if (!study_id) {
      return NextResponse.json({ error: 'study_id is required' }, { status: 400 });
    }
    
    if (!trigger_event) {
      return NextResponse.json({ error: 'trigger_event is required' }, { status: 400 });
    }
    
    if (!survey_id) {
      return NextResponse.json({ error: 'survey_id is required' }, { status: 400 });
    }
    
    // Create the trigger using the helper
    const { data: trigger, error } = await researchTriggersTableHelper(supabase)
      .insert({
        study_id,
        trigger_event,
        survey_id,
        min_delay_ms: min_delay_ms || 2000,
        max_triggers: max_triggers || 1,
        active: active !== undefined ? active : true
      })
      .select()
      .single();
      
    if (error) {
      console.error('Error creating trigger:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json(trigger);
  } catch (error) {
    console.error('Unexpected error in triggers API:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' }, 
      { status: 500 }
    );
  }
} 