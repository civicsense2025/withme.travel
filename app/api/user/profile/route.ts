import { createRouteHandlerClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { FIELDS } from '@/utils/constants/database';
import { TABLES } from '@/utils/constants/tables';
// Define a more complete type for TABLES that includes missing properties
type ExtendedTables = {
  TRIP_MEMBERS: string;
  TRIPS: string;
  USERS: string;
  ITINERARY_ITEMS: string;
  ITINERARY_SECTIONS: string;
  PROFILES: string;
  [key: string]: string;
};

// Use the extended type with the existing TABLES constant
const Tables = TABLES as unknown as ExtendedTables;

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createRouteHandlerClient();

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

export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    console.log('[ProfileAPI] Starting PUT request');
    const supabase = await createRouteHandlerClient();
    console.log('[ProfileAPI] Created Supabase client');

    // Check if user is authenticated
    const { data: userData, error: userError } = await supabase.auth.getUser();
    console.log('[ProfileAPI] Auth check result:', userData ? 'User found' : 'No user', userError ? `Error: ${userError.message}` : 'No auth error');

    if (userError || !userData.user) {
      console.log('[ProfileAPI] Authentication failed');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get update data from request
    let updateData;
    try {
      updateData = await request.json();
      console.log('[ProfileAPI] Request body parsed:', JSON.stringify(updateData));
    } catch (parseError) {
      console.error('[ProfileAPI] Failed to parse request body:', parseError);
      return NextResponse.json({ error: 'Invalid request format' }, { status: 400 });
    }

    // Check if the travel_personality and travel_squad columns exist
    const { data: profilesSchema, error: schemaError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', Tables.PROFILES)
      .in('column_name', ['travel_personality', 'travel_squad']);
    
    console.log('[ProfileAPI] Schema check result:', JSON.stringify(profilesSchema), schemaError ? `Error: ${schemaError.message}` : 'No schema error');
    
    // Create a map of column existence
    const columnsExist = {
      travel_personality: profilesSchema?.some(col => col.column_name === 'travel_personality') || false,
      travel_squad: profilesSchema?.some(col => col.column_name === 'travel_squad') || false
    };
    
    console.log('[ProfileAPI] Columns exist check:', JSON.stringify(columnsExist));

    // Ensure interests is an array
    const interests = Array.isArray(updateData.interests) ? updateData.interests : [];
    console.log('[ProfileAPI] Processed interests:', interests);

    // Build update object
    const updateObj: Record<string, any> = {
      name: updateData.name,
      bio: updateData.bio,
      location: updateData.location,
      avatar_url: updateData.avatar_url,
      interests: interests,
      updated_at: new Date().toISOString(),
    };

    // Add travel personality and squad fields if present AND if the corresponding columns exist
    if (updateData.travel_personality !== undefined && columnsExist.travel_personality) {
      console.log('[ProfileAPI] Setting travel_personality:', updateData.travel_personality);
      updateObj.travel_personality = updateData.travel_personality === 'none' ? null : updateData.travel_personality;
    }

    if (updateData.travel_squad !== undefined && columnsExist.travel_squad) {
      console.log('[ProfileAPI] Setting travel_squad:', updateData.travel_squad);
      updateObj.travel_squad = updateData.travel_squad === 'none' ? null : updateData.travel_squad;
    }

    // Add onboarding fields if present
    if (typeof updateData['ONBOARDING_COMPLETED'] !== 'undefined') {
      updateObj['ONBOARDING_COMPLETED'] = updateData['ONBOARDING_COMPLETED'];
    }
    if (typeof updateData['ONBOARDING_COMPLETED_AT'] !== 'undefined') {
      updateObj['ONBOARDING_COMPLETED_AT'] = updateData['ONBOARDING_COMPLETED_AT'];
    }
    if (typeof updateData['ONBOARDING_STEP'] !== 'undefined') {
      updateObj['ONBOARDING_STEP'] = updateData['ONBOARDING_STEP'];
    }

    console.log('[ProfileAPI] Final update object:', JSON.stringify(updateObj));
    console.log('[ProfileAPI] User ID for update:', userData.user.id);

    // Update user profile
    console.log('[ProfileAPI] Attempting to update profile in table:', Tables.PROFILES);
    const { data, error } = await supabase
      .from(Tables.PROFILES)
      .update(updateObj)
      .eq('id', userData.user.id)
      .select();

    if (error) {
      console.error('[ProfileAPI] Database update error:', error.message, error.code, error.details, error.hint);
      return NextResponse.json({ 
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      }, { status: 500 });
    }

    console.log('[ProfileAPI] Profile updated successfully, data:', data ? JSON.stringify(data) : 'No data returned');

    // Also update auth metadata
    try {
      const authUpdate = await supabase.auth.updateUser({
        data: {
          name: updateData.name,
        },
      });
      console.log('[ProfileAPI] Auth metadata update result:', authUpdate.error ? `Error: ${authUpdate.error.message}` : 'Success');
    } catch (authUpdateError) {
      console.error('[ProfileAPI] Failed to update auth metadata:', authUpdateError);
      // Continue anyway since the profile was updated successfully
    }

    return NextResponse.json(data && data.length > 0 ? data[0] : { success: true });
  } catch (error: any) {
    console.error('[ProfileAPI] Unexpected error in PUT endpoint:', error.message, error.stack);
    return NextResponse.json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}
