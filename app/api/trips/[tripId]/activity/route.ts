import { createServerSupabaseClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// Define interfaces for type-safety
interface TripHistoryRecord {
  id: number;
  trip_id: string;
  created_at: string;
  user_id: string | null;
  action_type: string;
  details: any | null;
  profiles?: {
    id: string;
    name: string | null;
    avatar_url: string | null;
  } | null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  const { tripId } = await params;
  const url = new URL(request.url);
  const limit = parseInt(url.searchParams.get('limit') || '5');
  const offset = parseInt(url.searchParams.get('offset') || '0');

  const supabase = await createServerSupabaseClient();
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
    console.log(`[API DEBUG /activity] Fetching history for trip: ${tripId}, limit: ${limit}, offset: ${offset}`);
    
    // Get all members of the trip to check if the current user is the only member
    const { data: tripMembers, error: tripMembersError } = await supabase
      .from('trip_members')
      .select('user_id')
      .eq('trip_id', tripId);

    if (tripMembersError) {
      console.error('[API DEBUG /activity] Error fetching trip members:', JSON.stringify(tripMembersError, null, 2));
    }
    
    // Check if current user is the only member of the trip
    const isOnlyMember = tripMembers && tripMembers.length === 1 && tripMembers[0].user_id === session.user.id;
    
    // Get current user's profile info for activity attribution
    const { data: currentUserProfile, error: currentUserProfileError } = await supabase
      .from('profiles')
      .select('id, name, avatar_url')
      .eq('id', session.user.id)
      .single();
      
    if (currentUserProfileError) {
      console.log(`[API DEBUG /activity] Error fetching current user profile:`, currentUserProfileError);
    }
    
    // Step 1: Fetch trip history records without trying to use a join
    const { data: historyData, error: historyError } = await supabase
      .from('trip_history')
      .select('*')
      .eq('trip_id', tripId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (historyError) {
      console.error('[API DEBUG /activity] Error fetching trip history:', JSON.stringify(historyError, null, 2));
      throw new Error(`Supabase query failed: ${historyError.message} (Code: ${historyError.code})`); 
    }

    console.log(`[API DEBUG /activity] Fetched ${historyData?.length || 0} history records.`);
    
    // Step 2: For each history record, get the profile info if user_id is available
    const enrichedData = await Promise.all((historyData || []).map(async (historyItem) => {
      // If no user_id, return the item as is
      if (!historyItem.user_id) {
        console.log(`[API DEBUG /activity] History item has no user_id: ${historyItem.id}`);
        return {
          ...historyItem,
          profile: null
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
        console.log(`[API DEBUG /activity] Error finding profile for user_id: ${historyItem.user_id}`, profileError);
        return {
          ...historyItem,
          profile: null
        };
      }
      
      console.log(`[API DEBUG /activity] Found profile for user_id: ${historyItem.user_id}`, 
        profileData ? { id: profileData.id, name: profileData.name } : 'null');
      
      return {
        ...historyItem,
        profile: profileData
      };
    }));
    
    if (enrichedData && enrichedData.length > 0) {
      console.log('[API DEBUG /activity] First record with profile:', JSON.stringify({
        id: enrichedData[0].id,
        user_id: enrichedData[0].user_id,
        profile: enrichedData[0].profile ? {
          id: enrichedData[0].profile.id,
          name: enrichedData[0].profile.name
        } : null
      }, null, 2));
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
      let userName, userAvatar;
      
      if (item.user_id) {
        // Regular user activity
        userName = item.profile?.name || 'User';
        userAvatar = item.profile?.avatar_url;
      } else if (isOnlyMember && currentUserProfile) {
        // System activity in a single-member trip - attribute to the current user
        userName = currentUserProfile.name || 'You';
        userAvatar = currentUserProfile.avatar_url;
      } else {
        // System activity in a multi-member trip
        userName = 'System';
        userAvatar = null;
      }
      
      return {
        id: item.id.toString(),
        trip_id: item.trip_id,
        created_at: item.created_at,
        action_type: item.action_type,
        actor_id: item.user_id,
        actor_name: userName,
        actor_avatar: userAvatar,
        details: item.details || {},
      };
    });

    return NextResponse.json({
      activity: transformedData,
      pagination: {
        total: count || 0,
        offset,
        limit,
        hasMore: offset + limit < (count || 0)
      },
    });
  } catch (error) {
    console.error('Error fetching trip activity:', error);
    return NextResponse.json({ error: 'Failed to fetch trip activity' }, { status: 500 });
  }
}
