import { createServerSupabaseClient } from "@/utils/supabase/server";
import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  const { tripId } = await params;

  try {
    const supabase = await createServerSupabaseClient();

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's role in the trip
    const { data: member, error } = await supabase
      .from('trip_members')
      .select('role')
      .eq('trip_id', tripId)
      .eq('user_id', session.user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ role: null });
      }
      throw error;
    }

    return NextResponse.json({ role: member.role });
  } catch (error: any) {
    console.error('Error checking member role:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
