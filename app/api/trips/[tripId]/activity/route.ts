import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { checkTripAccess } from '@/lib/trip-access';
import { Database } from '@/types/database.types';

// Define table names directly
const TRIP_MEMBERS_TABLE = 'trip_members';
const PROFILES_TABLE = 'profiles';

// Define interfaces for type-safety
interface TripHistoryRecord {
  id: number;
  trip_id: string;
  created_at: string;
  user_id: string | null;
  action_type: string;
  details: any | null;
  profile?: {
    id: string;
    name: string | null;
    avatar_url: string | null;
  } | null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
): Promise<NextResponse> {
  const { tripId } = await params;
  const url = new URL(request.url);
  const limit = parseInt(url.searchParams?.get('limit') || '5');
  const offset = parseInt(url.searchParams?.get('offset') || '0');

  const supabase = await createRouteHandlerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: isMember, error: memberError } = await supabase
    .from(TRIP_MEMBERS_TABLE)
    .select('id')
    .eq('trip_id', tripId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (memberError || !isMember) {
    return NextResponse.json({ error: "You don't have access to this trip" }, { status: 403 });
  }

  try {
    console.log(
      `[API DEBUG /activity] Fetching history for trip: ${tripId}, limit: ${limit}, offset: ${offset}`
    );

    const { data: tripMembers, error: tripMembersError } = await supabase
      .from(TRIP_MEMBERS_TABLE)
      .select('user_id')
      .eq('trip_id', tripId);

    if (tripMembersError) {
      console.error(
        '[API DEBUG /activity] Error fetching trip members:',
        JSON.stringify(tripMembersError, null, 2)
      );
    }

    const isOnlyMember =
      tripMembers && tripMembers.length === 1 && tripMembers[0].user_id === user.id;

    const { data: currentUserProfile, error: currentUserProfileError } = await supabase
      .from(PROFILES_TABLE)
      .select('id, name, avatar_url')
      .eq('id', user.id)
      .single();

    if (currentUserProfileError) {
      console.log(
        `[API DEBUG /activity] Error fetching current user profile:`,
        currentUserProfileError
      );
    }

    // Step 1: Fetch trip history records without trying to use a join
    const { data: historyData, error: historyError } = await supabase
      .from('trip_history')
      .select('*')
      .eq('trip_id', tripId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (historyError) {
      console.error(
        '[API DEBUG /activity] Error fetching trip history:',
        JSON.stringify(historyError, null, 2)
      );
      throw new Error(
        `Supabase query failed: ${historyError.message} (Code: ${historyError.code})`
      );
    }

    console.log(`[API DEBUG /activity] Fetched ${historyData?.length || 0} history records.`);

    // Step 2: For each history record, get the profile info if user_id is available
    const enrichedData = await Promise.all(
      (historyData || []).map(async (historyItem) => {
        // If no user_id, return the item as is
        if (!historyItem.user_id) {
          console.log(`[API DEBUG /activity] History item has no user_id: ${historyItem.id}`);
          return {
            ...historyItem,
            profile: null,
          };
        }

        console.log(`[API DEBUG /activity] Looking up profile for user_id: ${historyItem.user_id}`);

        // Fetch the profile for this user_id
        const { data: profileData, error: profileError } = await supabase
          .from('profiles') // Assumes there's a table named 'profiles' linked to auth.users
          .select('id, name, avatar_url')
          .eq('id', historyItem.user_id)
          .single();

        if (profileError) {
          console.log(
            `[API DEBUG /activity] Error finding profile for user_id: ${historyItem.user_id}`,
            profileError
          );
          return {
            ...historyItem,
            profile: null,
          };
        }

        console.log(
          `[API DEBUG /activity] Found profile for user_id: ${historyItem.user_id}`,
          profileData ? { id: profileData.id, name: profileData.name } : 'null'
        );

        return {
          ...historyItem,
          profile: profileData,
        };
      })
    );

    if (enrichedData && enrichedData.length > 0) {
      console.log(
        '[API DEBUG /activity] First record with profile:',
        JSON.stringify(
          {
            id: enrichedData[0].id,
            user_id: enrichedData[0].user_id,
            profile: enrichedData[0].profile
              ? {
                  id: enrichedData[0].profile.id,
                  name: enrichedData[0].profile.name,
                }
              : null,
          },
          null,
          2
        )
      );
    }

    // Get total count for pagination
    const { count, error: countError } = await supabase
      .from('trip_history')
      .select('id', { count: 'exact', head: true })
      .eq('trip_id', tripId);

    if (countError) {
      console.error('Error getting history count:', countError);
      throw countError;
    }

    // Transform the data to match the expected format by the frontend
    const transformedData = enrichedData.map((item) => {
      // Handle null user_id with current user when they're the only member
      const effectiveProfile =
        !item.user_id && isOnlyMember
          ? {
              id: user.id,
              name: currentUserProfile?.name || 'You',
              avatar_url: currentUserProfile?.avatar_url,
            }
          : item.profile;

      return {
        id: item.id,
        tripId: item.trip_id,
        userId: item.user_id,
        actionType: item.action_type,
        details: item.details,
        createdAt: item.created_at,
        user: effectiveProfile
          ? {
              id: effectiveProfile.id,
              name: effectiveProfile.name || 'Unknown User',
              avatarUrl: effectiveProfile.avatar_url,
            }
          : null,
      };
    });

    return NextResponse.json({
      data: transformedData,
      count: count || 0,
      hasMore: offset + limit < (count || 0),
      nextOffset: offset + limit,
    });
  } catch (error: any) {
    console.error('[API ERROR /activity]', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
