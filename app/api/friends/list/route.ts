import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { TABLES } from '@/utils/constants/tables';
import { ApiError, formatErrorResponse } from '@/lib/api-utils';

// Define a minimal type for friendship record
interface Friendship {
  id: string;
  user_id_1: string;
  user_id_2: string;
  created_at: string;
  user_1: {
    id: string;
    name: string;
    avatar_url?: string | null;
  };
  user_2: {
    id: string;
    name: string;
    avatar_url?: string | null;
  };
}

// GET /api/friends/list - Get a user's friends list
export async function GET(request: NextRequest) {
  try {
    console.log('Friends list API called');
    const supabase = await createRouteHandlerClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('Auth error in friends/list:', authError);
      return formatErrorResponse(new ApiError('Unauthorized', 401));
    }

    console.log('User authenticated:', user.id);

    // Get friend records where the user is either user_id_1 or user_id_2
    const { data: friendships, error: friendshipsError } = await supabase
      .from('friends')
      .select(
        `
        *,
        user_1:profiles!friends_user_id_1_fkey(id, name, avatar_url),
        user_2:profiles!friends_user_id_2_fkey(id, name, avatar_url)
      `
      )
      .or(`user_id_1.eq.${user.id},user_id_2.eq.${user.id}`);

    if (friendshipsError) {
      console.error('Database error fetching friends:', friendshipsError);
      return formatErrorResponse(
        new ApiError(`Failed to fetch friends: ${friendshipsError.message}`, 500)
      );
    }

    console.log(`Found ${friendships?.length || 0} friendships`);

    // Process friendships to return the friend profile
    const friendsList = friendships.map((friendship: Friendship) => {
      // Determine which user is the friend (not the current user)
      const friendProfile =
        friendship.user_id_1 === user.id ? friendship.user_2 : friendship.user_1;

      return {
        id: friendship.id,
        friend_id: friendship.user_id_1 === user.id ? friendship.user_id_2 : friendship.user_id_1,
        created_at: friendship.created_at,
        friend_profile: {
          id: friendProfile.id,
          full_name: friendProfile.name, // Map 'name' to 'full_name' for compatibility
          avatar_url: friendProfile.avatar_url,
        },
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        friends: friendsList,
        count: friendsList.length,
      },
    });
  } catch (error: any) {
    console.error('Error fetching friends list:', error);
    return formatErrorResponse(new ApiError(`Internal server error: ${error.message}`, 500));
  }
}
