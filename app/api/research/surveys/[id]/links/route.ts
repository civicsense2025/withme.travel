import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { v4 as uuidv4 } from 'uuid';
import { FORM_TABLES } from '@/utils/constants/tables';

// GET: Retrieve all links for a survey
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createRouteHandlerClient();
    
    // Check admin authorization
    const { data } = await supabase.auth.getSession();
    if (!data?.session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Verify user is admin
    const { data: adminData, error: adminError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', data.session.user.id)
      .single();
      
    if (adminError || !adminData?.is_admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get survey to verify it exists
    const { data: survey, error: surveyError } = await supabase
      .from(FORM_TABLES.FORMS)
      .select('*')
      .eq('id', params.id)
      .single();
      
    if (surveyError || !survey) {
      return NextResponse.json({ error: 'Survey not found' }, { status: 404 });
    }
    
    // For now, just return a success message as we're still implementing survey links
    return NextResponse.json({ links: [] });
  } catch (error) {
    console.error('Error in survey links GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Create new survey link(s)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createRouteHandlerClient();
    
    // Check admin authorization
    const { data } = await supabase.auth.getSession();
    if (!data?.session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Verify user is admin
    const { data: adminData, error: adminError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', data.session.user.id)
      .single();
      
    if (adminError || !adminData?.is_admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get survey to verify it exists
    const { data: survey, error: surveyError } = await supabase
      .from(FORM_TABLES.FORMS)
      .select('*')
      .eq('id', params.id)
      .single();
      
    if (surveyError || !survey) {
      return NextResponse.json({ error: 'Survey not found' }, { status: 404 });
    }
    
    // Create a basic link record for now
    const link = {
      id: uuidv4(),
      survey_id: params.id,
      token: uuidv4(),
      created_at: new Date().toISOString(),
      created_by: data.session.user.id,
    };
    
    return NextResponse.json({ link });
  } catch (error) {
    console.error('Error in survey links POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 