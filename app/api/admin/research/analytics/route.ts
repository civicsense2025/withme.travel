import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { TABLES } from '@/utils/constants/database';

export async function GET(request: NextRequest) {
  const supabase = await createRouteHandlerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { data: profile } = await supabase
    .from(TABLES.PROFILES)
    .select('role')
    .eq('id', user.id)
    .single();
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const studyId = request.nextUrl.searchParams.get('studyId');
  if (!studyId) return NextResponse.json({ error: 'Missing studyId' }, { status: 400 });

  // Get participant count
  const { count: participantCount } = await supabase
    .from(TABLES.RESEARCH_PARTICIPANTS)
    .select('*', { count: 'exact', head: true })
    .eq('study_id', studyId);

  // Get completed surveys count
  const { count: completedSurveys } = await supabase
    .from(TABLES.SURVEY_RESPONSES)
    .select('*', { count: 'exact', head: true })
    .eq('study_id', studyId);

  // Get event count
  const { count: eventCount } = await supabase
    .from(TABLES.RESEARCH_EVENTS)
    .select('*', { count: 'exact', head: true })
    .eq('study_id', studyId);

  return NextResponse.json({
    analytics: {
      participantCount: participantCount || 0,
      completedSurveys: completedSurveys || 0,
      eventCount: eventCount || 0,
    }
  });
}
