import { getRouteHandlerClient } from '@/utils/supabase/unified';
import { NextRequest, NextResponse } from 'next/server';
import { TABLES } from '@/utils/constants/database';


// Define a more complete type for TABLES that includes missing properties
type ExtendedTables = {
  TRIP_MEMBERS: string;
  TRIPS: string;
  USERS: string;
  ITINERARY_ITEMS: string;
  ITINERARY_SECTIONS: string;
  [key: string]: string;
};

// Use the extended type with the existing TABLES constant
const Tables = TABLES as unknown as ExtendedTables;

export async function GET(request: NextRequest) {
  try {
    const supabase = await getRouteHandlerClient();

    // Check if user is authenticated
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile data
    const { data: profile, error } = await supabase
      .from(Tables.PROFILES)
      .select('*')
      .eq('id', userData.user.id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Ensure interests is an array
    if (!Array.isArray(profile.interests)) {
      profile.interests = profile.interests ? [profile.interests] : [];
    }

    return NextResponse.json(profile);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await getRouteHandlerClient();

    // Check if user is authenticated
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get update data from request
    const updateData = await request.json();

    // Ensure interests is an array
    const interests = Array.isArray(updateData.interests) ? updateData.interests : [];

    // Update user profile
    const { data, error } = await supabase
      .from(Tables.PROFILES)
      .update({
        name: updateData.name,
        bio: updateData.bio,
        location: updateData.location,
        avatar_url: updateData.avatar_url,
        interests: interests,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userData.user.id)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Also update auth metadata
    await supabase.auth.updateUser({
      data: {
        name: updateData.name,
      },
    });

    return NextResponse.json(data[0]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
