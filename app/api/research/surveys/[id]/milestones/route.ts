import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';

// GET: Retrieve all milestone triggers for a survey
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
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
    
    // Get survey to verify it exists
    const { data: survey, error: surveyError } = await supabase
      .from('surveys')
      .select('*')
      .eq('id', params.id)
      .single();
      
    if (surveyError || !survey) {
      return NextResponse.json({ error: 'Survey not found' }, { status: 404 });
    }
    
    // Get all milestone triggers for the survey
    const { data: milestones, error: milestonesError } = await supabase
      .from('survey_milestone_triggers')
      .select(`
        *,
        milestone:milestone_id(*)
      `)
      .eq('survey_id', params.id)
      .order('created_at', { ascending: false });
      
    if (milestonesError) {
      console.error('Error fetching survey milestone triggers:', milestonesError);
      return NextResponse.json({ error: 'Failed to fetch survey milestone triggers' }, { status: 500 });
    }
    
    return NextResponse.json({ milestones });
  } catch (error) {
    console.error('Error in survey milestones GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Create a new milestone trigger for the survey
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
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
    
    // Get survey to verify it exists
    const { data: survey, error: surveyError } = await supabase
      .from('surveys')
      .select('*')
      .eq('id', params.id)
      .single();
      
    if (surveyError || !survey) {
      return NextResponse.json({ error: 'Survey not found' }, { status: 404 });
    }
    
    const body = await request.json();
    
    // Validate required fields
    if (!body.milestone_id) {
      return NextResponse.json({ error: 'Milestone ID is required' }, { status: 400 });
    }
    
    // Check if milestone exists
    const { data: milestone, error: milestoneError } = await supabase
      .from('research_milestones')
      .select('*')
      .eq('id', body.milestone_id)
      .single();
      
    if (milestoneError || !milestone) {
      return NextResponse.json({ error: 'Milestone not found' }, { status: 404 });
    }
    
    // Check if this milestone is already used for this survey
    const { data: existingTrigger, error: existingError } = await supabase
      .from('survey_milestone_triggers')
      .select('*')
      .eq('survey_id', params.id)
      .eq('milestone_id', body.milestone_id)
      .maybeSingle();
      
    if (existingTrigger) {
      return NextResponse.json({ 
        error: 'This milestone is already configured for this survey' 
      }, { status: 400 });
    }
    
    // Create new milestone trigger
    const newTrigger = {
      id: uuidv4(),
      survey_id: params.id,
      milestone_id: body.milestone_id,
      priority: ['high', 'medium', 'low'].includes(body.priority) ? body.priority : 'medium',
      is_required: !!body.is_required,
      show_survey_after: ['immediately', 'delay_24h', 'delay_1w'].includes(body.show_survey_after) 
        ? body.show_survey_after 
        : 'immediately',
      created_by: user.id
    };
    
    const { data: createdTrigger, error: createError } = await supabase
      .from('survey_milestone_triggers')
      .insert([newTrigger])
      .select(`
        *,
        milestone:milestone_id(*)
      `)
      .single();
      
    if (createError) {
      console.error('Error creating survey milestone trigger:', createError);
      return NextResponse.json({ error: 'Failed to create survey milestone trigger' }, { status: 500 });
    }
    
    return NextResponse.json({ trigger: createdTrigger });
  } catch (error) {
    console.error('Error in survey milestones POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 