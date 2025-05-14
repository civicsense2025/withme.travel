import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { TABLE_NAMES } from '@/utils/constants/tables';

export async function POST(request: NextRequest) {
  const supabase = await createRouteHandlerClient();

  try {
    // Get JSON data from request
    const data = await request.json();
    const { trip_id, user_id, role } = data;

    // Validate required fields
    if (!trip_id || !user_id || !role) {
      return NextResponse.json(
        { error: 'Missing required fields: trip_id, user_id, role' },
        { status: 400 }
      );
    }

    // Check if user is already a member
    const { data: existingMember, error: checkError } = await supabase
      .from(TABLE_NAMES.TRIP_MEMBERS)
      .select('*')
      .eq('trip_id', trip_id)
      .eq('user_id', user_id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 is "No rows returned" error, which is expected if not a member
      console.error('Error checking membership:', checkError);
      return NextResponse.json({ error: 'Failed to check membership' }, { status: 500 });
    }

    if (existingMember) {
      return NextResponse.json({ error: 'User is already a member of this trip' }, { status: 400 });
    }

    // Add user as a member
    const { data: newMember, error: insertError } = await supabase
      .from(TABLE_NAMES.TRIP_MEMBERS)
      .insert([
        {
          trip_id,
          user_id,
          role,
        },
      ])
      .select()
      .single();

    if (insertError) {
      console.error('Error adding member:', insertError);
      return NextResponse.json({ error: 'Failed to add member to trip' }, { status: 500 });
    }

    return NextResponse.json({ member: newMember });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
