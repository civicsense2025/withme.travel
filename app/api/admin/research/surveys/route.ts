import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { TABLES } from '@/utils/constants/database';

/**
 * GET /api/admin/research/surveys
 * List all surveys that can be used for research triggers
 */
export async function GET(request: NextRequest) {
  const supabase = await createRouteHandlerClient();
  
  // Check admin permissions
  const { data: { user } } = await supabase.auth.getUser();
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
  
  // First try to get surveys from the surveys table (if it exists)
  let surveysData;
  let surveysError;
  
  try {
    // Check if we have a standalone surveys table
    const { data, error } = await supabase
      .from(TABLES.SURVEYS)
      .select('id, title, description, created_at')
      .order('created_at', { ascending: false });
      
    surveysData = data;
    surveysError = error;
    
    // If we have data from the surveys table, return it
    if (surveysData && surveysData.length > 0) {
      return NextResponse.json(surveysData);
    }
  } catch (error) {
    console.log('No surveys table found, trying survey_definitions instead');
  }
  
  // If no data from surveys table, try the survey_definitions table
  try {
    const { data, error } = await supabase
      .from(TABLES.SURVEY_DEFINITIONS)
      .select('id, survey_id, title, description, created_at')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
      
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    // Map the response to match the surveys table format
    const mappedData = data.map(survey => ({
      id: survey.id,
      survey_id: survey.survey_id,
      title: survey.title,
      description: survey.description,
      created_at: survey.created_at
    }));
    
    return NextResponse.json(mappedData);
  } catch (error) {
    // If both approaches fail, return any error from the first attempt
    if (surveysError) {
      return NextResponse.json({ error: surveysError.message }, { status: 500 });
    }
    
    return NextResponse.json({ error: 'Failed to fetch surveys' }, { status: 500 });
  }
} 