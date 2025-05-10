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
  const { data, error } = await supabase
    .from(TABLES.RESEARCH_PARTICIPANTS)
    .select('*')
    .eq('study_id', studyId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}

export async function DELETE(request: NextRequest) {
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
  const id = request.nextUrl.searchParams.get('id');
  if (!studyId || !id) return NextResponse.json({ error: 'Missing studyId or id' }, { status: 400 });
  const { error } = await supabase
    .from(TABLES.RESEARCH_PARTICIPANTS)
    .delete()
    .eq('id', id)
    .eq('study_id', studyId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
