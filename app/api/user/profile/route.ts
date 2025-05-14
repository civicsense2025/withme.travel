import { createRouteHandlerClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { TABLES } from '@/utils/constants/tables';

type ProfileUpdateData = {
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  interests?: string[];
  travelPersonality?: string | null;
  travelSquad?: string | null;
  homeLocationId?: string | null;
  homeLocationName?: string | null;
  homeLocationData?: Record<string, any> | null;
  onboardingCompleted?: boolean;
  onboardingCompletedAt?: string | null;
  onboardingStep?: number;
};

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createRouteHandlerClient();

    // Check if user is authenticated
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile data
    let { data: profile, error } = await supabase
      .from(TABLES.PROFILES)
      .select('*')
      .eq('id', userData.user.id)
      .single();

    if (error) {
      // If the profile doesn't exist, create it
      if (error.code === 'PGRST116') {
        // Create a new profile
        const { data: newProfile, error: createError } = await supabase
          .from(TABLES.PROFILES)
          .insert([
            {
              id: userData.user.id,
              email: userData.user.email,
              first_name: userData.user.user_metadata?.first_name || '',
              last_name: userData.user.user_metadata?.last_name || '',
              interests: [],
              onboarding_completed: false,
              onboarding_step: 1,
            },
          ])
          .select('*')
          .single();

        if (createError) {
          return NextResponse.json({ error: createError.message }, { status: 500 });
        }

        profile = newProfile;
      } else {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Ensure interests is an array
    if (!Array.isArray(profile.interests)) {
      profile.interests = profile.interests ? [profile.interests] : [];
    }

    // Map snake_case to camelCase for API response
    const apiProfile = {
      ...profile,
      onboardingCompleted: profile.onboarding_completed,
      onboardingCompletedAt: profile.onboarding_completed_at,
      onboardingStep: profile.onboarding_step,
      travelPersonality: profile.travel_personality,
      travelSquad: profile.travel_squad,
      homeLocationId: profile.home_location_id,
      homeLocationName: profile.home_location_name,
      homeLocationData: profile.home_location_data,
    };
    return NextResponse.json(apiProfile);
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
    console.log(
      '[ProfileAPI] Auth check result:',
      userData ? 'User found' : 'No user',
      userError ? `Error: ${userError.message}` : 'No auth error'
    );

    if (userError || !userData.user) {
      console.log('[ProfileAPI] Authentication failed');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get update data from request
    let updateData: ProfileUpdateData;
    try {
      updateData = await request.json();
      console.log('[ProfileAPI] Request body parsed:', JSON.stringify(updateData));
    } catch (parseError) {
      console.error('[ProfileAPI] Failed to parse request body:', parseError);
      return NextResponse.json({ error: 'Invalid request format' }, { status: 400 });
    }

    // Ensure interests is an array
    const interests = Array.isArray(updateData.interests) ? updateData.interests : [];
    console.log('[ProfileAPI] Processed interests:', interests);

    // Build update object
    const updateObj: Record<string, any> = {
      first_name: updateData.firstName,
      last_name: updateData.lastName,
      avatar_url: updateData.avatarUrl,
      interests: interests,
      updated_at: new Date().toISOString(),
    };

    // Map camelCase fields to snake_case for database
    if (updateData.travelPersonality !== undefined) {
      console.log('[ProfileAPI] Setting travel_personality:', updateData.travelPersonality);
      updateObj.travel_personality = updateData.travelPersonality || null;
    }

    if (updateData.travelSquad !== undefined) {
      console.log('[ProfileAPI] Setting travel_squad:', updateData.travelSquad);
      updateObj.travel_squad = updateData.travelSquad || null;
    }

    if (updateData.homeLocationId !== undefined) {
      console.log('[ProfileAPI] Setting home_location_id:', updateData.homeLocationId);
      updateObj.home_location_id = updateData.homeLocationId || null;
    }

    if (updateData.homeLocationName !== undefined) {
      console.log('[ProfileAPI] Setting home_location_name:', updateData.homeLocationName);
      updateObj.home_location_name = updateData.homeLocationName || null;
    }

    if (updateData.homeLocationData !== undefined) {
      console.log('[ProfileAPI] Setting home_location_data');
      updateObj.home_location_data = updateData.homeLocationData || null;
    }

    // Add onboarding fields if present
    if (typeof updateData.onboardingCompleted !== 'undefined') {
      console.log('[ProfileAPI] Setting onboarding_completed:', updateData.onboardingCompleted);
      updateObj.onboarding_completed = updateData.onboardingCompleted;
    }
    if (typeof updateData.onboardingCompletedAt !== 'undefined') {
      let val = updateData.onboardingCompletedAt;
      if (val === '') val = null;
      console.log('[ProfileAPI] Setting onboarding_completed_at:', val);
      updateObj.onboarding_completed_at = val;
    }
    if (typeof updateData.onboardingStep !== 'undefined') {
      console.log('[ProfileAPI] Setting onboarding_step:', updateData.onboardingStep);
      updateObj.onboarding_step = updateData.onboardingStep;
    }

    console.log('[ProfileAPI] Final update object:', JSON.stringify(updateObj));
    console.log('[ProfileAPI] User ID for update:', userData.user.id);

    // First check if profile exists
    const { data: existingProfile } = await supabase
      .from(TABLES.PROFILES)
      .select('id')
      .eq('id', userData.user.id)
      .single();

    let result;

    if (!existingProfile) {
      // Create new profile if it doesn't exist
      console.log('[ProfileAPI] Profile does not exist, creating new profile');
      result = await supabase
        .from(TABLES.PROFILES)
        .insert({
          id: userData.user.id,
          email: userData.user.email,
          ...updateObj,
        })
        .select();
    } else {
      // Update existing profile
      console.log('[ProfileAPI] Updating existing profile');
      result = await supabase
        .from(TABLES.PROFILES)
        .update(updateObj)
        .eq('id', userData.user.id)
        .select();
    }

    const { data, error } = result;

    if (error) {
      console.error(
        '[ProfileAPI] Database update error:',
        error.message,
        error.code,
        error.details,
        error.hint
      );
      return NextResponse.json(
        {
          error: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        },
        { status: 500 }
      );
    }

    console.log(
      '[ProfileAPI] Profile updated successfully, data:',
      data ? JSON.stringify(data) : 'No data returned'
    );

    // Also update auth metadata
    try {
      const authUpdate = await supabase.auth.updateUser({
        data: {
          first_name: updateData.firstName,
          last_name: updateData.lastName,
        },
      });
      console.log(
        '[ProfileAPI] Auth metadata update result:',
        authUpdate.error ? `Error: ${authUpdate.error.message}` : 'Success'
      );
    } catch (authUpdateError) {
      console.error('[ProfileAPI] Failed to update auth metadata:', authUpdateError);
      // Continue anyway since the profile was updated successfully
    }

    return NextResponse.json(data && data.length > 0 ? data[0] : { success: true });
  } catch (error: any) {
    console.error('[ProfileAPI] Unhandled error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
