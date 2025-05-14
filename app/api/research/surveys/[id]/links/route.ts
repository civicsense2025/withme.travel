import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/ssr';
import { v4 as uuidv4 } from 'uuid';
import { cookies } from 'next/headers';

// GET: Retrieve all links for a survey
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient({ cookies });
  
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
    
    // Get all links for the survey
    const { data: links, error: linksError } = await supabase
      .from('survey_links')
      .select(`
        *,
        survey_responses(count)
      `)
      .eq('survey_id', params.id)
      .order('created_at', { ascending: false });
      
    if (linksError) {
      console.error('Error fetching survey links:', linksError);
      return NextResponse.json({ error: 'Failed to fetch survey links' }, { status: 500 });
    }
    
    // Process the data to include response count
    const processedLinks = links.map(link => ({
      ...link,
      response_count: link.survey_responses?.[0]?.count || 0
    }));
    
    return NextResponse.json({ links: processedLinks });
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
  const supabase = createRouteHandlerClient({ cookies });
  
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
    
    // Handle bulk link generation
    if (body.bulk_count && typeof body.bulk_count === 'number') {
      const count = Math.min(Math.max(1, body.bulk_count), 100); // Limit between 1-100
      const bulkLinks = Array.from({ length: count }, () => ({
        id: uuidv4(),
        survey_id: params.id,
        token: uuidv4(),
        status: 'active',
        created_by: user.id,
        user_info: null
      }));
      
      const { data: createdLinks, error: bulkError } = await supabase
        .from('survey_links')
        .insert(bulkLinks)
        .select();
        
      if (bulkError) {
        console.error('Error creating bulk survey links:', bulkError);
        return NextResponse.json({ error: 'Failed to create survey links' }, { status: 500 });
      }
      
      return NextResponse.json({ links: createdLinks });
    } 
    // Handle single link generation
    else {
      // Create single link
      const newLink = {
        id: uuidv4(),
        survey_id: params.id,
        token: uuidv4(),
        status: 'active',
        created_by: user.id,
        user_info: body.user_info || null
      };
      
      const { data: createdLink, error: linkError } = await supabase
        .from('survey_links')
        .insert([newLink])
        .select()
        .single();
        
      if (linkError) {
        console.error('Error creating survey link:', linkError);
        return NextResponse.json({ error: 'Failed to create survey link' }, { status: 500 });
      }
      
      return NextResponse.json({ link: createdLink });
    }
  } catch (error) {
    console.error('Error in survey links POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 