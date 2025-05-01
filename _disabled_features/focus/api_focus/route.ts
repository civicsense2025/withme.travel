import { createSupabaseServerClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// GET - Get active focus session for a trip
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  const { tripId } = await params;

  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check if user is a member of this trip
  const { data: isMember, error: memberError } = await supabase
    .from('trip_members')
    .select()
    .eq('trip_id', tripId)
    .eq('user_id', session.user.id)
    .maybeSingle();

  if (memberError || !isMember) {
    return NextResponse.json({ error: "You don't have access to this trip" }, { status: 403 });
  }

  try {
    // Get the active focus session for this trip
    const { data, error } = await supabase
      .from('focus_sessions')
      .select(
        `
        *,
        initiator:initiated_by (
          name,
          avatar_url
        )
      `
      )
      .eq('trip_id', tripId)
      .eq('active', true)
      .order('created_at', { ascending: false })
      .maybeSingle();

    if (error) throw error;

    return NextResponse.json({ session: data });
  } catch (error) {
    console.error('Error fetching focus session:', error);
    return NextResponse.json({ error: 'Failed to fetch focus session' }, { status: 500 });
  }
}

// POST - Start a new focus session
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  const { tripId } = await params;
  const { section_id, section_path, section_name, message, expires_at } = await request.json();

  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check if user has permission to start focus sessions (admin/editor)
  const { data: member, error: memberError } = await supabase
    .from('trip_members')
    .select('role')
    .eq('trip_id', tripId)
    .eq('user_id', session.user.id)
    .single();

  if (memberError || !member || !['admin', 'editor'].includes(member.role)) {
    return NextResponse.json(
      { error: "You don't have permission to start focus sessions" },
      { status: 403 }
    );
  }

  // Validate required fields
  if (!section_id || !section_path || !section_name) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    // First, end any active focus sessions for this trip
    await supabase
      .from('focus_sessions')
      .update({ active: false })
      .eq('trip_id', tripId)
      .eq('active', true);

    // Create a new focus session
    const { data, error } = await supabase
      .from('focus_sessions')
      .insert({
        trip_id: tripId,
        initiated_by: session.user.id,
        section_id,
        section_path,
        section_name,
        message,
        active: true,
        expires_at: expires_at || new Date(Date.now() + 30 * 60 * 1000).toISOString(), // Default 30 minutes
      })
      .select(
        `
        *,
        initiator:initiated_by (
          name,
          avatar_url
        )
      `
      )
      .single();

    if (error) throw error;

    return NextResponse.json({ session: data });
  } catch (error) {
    console.error('Error creating focus session:', error);
    return NextResponse.json({ error: 'Failed to create focus session' }, { status: 500 });
  }
}

// PATCH - End a focus session
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  const { tripId } = await params;
  const { session_id } = await request.json();

  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check if user has permission to end focus sessions (admin/editor)
  const { data: member, error: memberError } = await supabase
    .from('trip_members')
    .select('role')
    .eq('trip_id', tripId)
    .eq('user_id', session.user.id)
    .single();

  if (memberError || !member || !['admin', 'editor'].includes(member.role)) {
    return NextResponse.json(
      { error: "You don't have permission to end focus sessions" },
      { status: 403 }
    );
  }

  try {
    // End the focus session
    const { data, error } = await supabase
      .from('focus_sessions')
      .update({ active: false })
      .eq('id', session_id)
      .eq('trip_id', tripId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, session: data });
  } catch (error) {
    console.error('Error ending focus session:', error);
    return NextResponse.json({ error: 'Failed to end focus session' }, { status: 500 });
  }
}
