import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { TABLES } from '@/utils/constants/database';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
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
  
  try {
    // Parse request body
    const body = await request.json();
    const { studyId, baseUrl = 'https://withme.travel' } = body;
    
    if (!studyId) {
      return NextResponse.json({ error: 'Study ID is required' }, { status: 400 });
    }
    
    // Check if study exists
    const { data: study, error: studyError } = await supabase
      .from(TABLES.RESEARCH_STUDIES)
      .select('*')
      .eq('id', studyId)
      .single();
      
    if (studyError || !study) {
      return NextResponse.json({ error: 'Study not found' }, { status: 404 });
    }
    
    // Create a new participant
    const participantId = uuidv4();
    
    const { error: participantError } = await supabase
      .from(TABLES.RESEARCH_PARTICIPANTS)
      .insert({
        id: participantId,
        study_id: studyId,
        status: 'invited'
      });
      
    if (participantError) {
      return NextResponse.json({ error: participantError.message }, { status: 500 });
    }
    
    // Generate the link
    const url = new URL(baseUrl);
    url.searchParams.append('research', 'true');
    url.searchParams.append('pid', participantId);
    url.searchParams.append('sid', studyId);
    
    return NextResponse.json({
      link: url.toString(),
      participantId
    });
  } catch (error) {
    console.error('Error generating research link:', error);
    return NextResponse.json(
      { error: 'Failed to generate research link' },
      { status: 500 }
    );
  }
} 