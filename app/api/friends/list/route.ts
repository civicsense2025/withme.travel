import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { TABLES } from '@/utils/constants/database';
import { ApiError, formatErrorResponse } from '@/lib/api-utils';

// GET /api/friends/list - Get a user's friends list
export async function GET(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return formatErrorResponse(new ApiError('Unauthorized', 401));
    }
    
    // Get friend records where the user is either user_id_1 or user_id_2
    const { data: friendships, error: friendshipsError } = await supabase
      .from(TABLES.FRIENDS)
      .select(`
        *,
        user_1:profiles!${TABLES.FRIENDS}_user_id_1_fkey(id, full_name, avatar_url),
        user_2:profiles!${TABLES.FRIENDS}_user_id_2_fkey(id, full_name, avatar_url)
      `)
      .or(`user_id_1.eq.${user.id},user_id_2.eq.${user.id}`);
    
    if (friendshipsError) {
      return formatErrorResponse(new ApiError('Failed to fetch friends', 500));
    }
    
    // Process friendships to return the friend profile
    const friendsList = friendships.map(friendship => {
      // Determine which user is the friend (not the current user)
      const friendProfile = friendship.user_id_1 === user.id
        ? friendship.user_2
        : friendship.user_1;
        
      return {
        id: friendship.id,
        friend_id: friendship.user_id_1 === user.id ? friendship.user_id_2 : friendship.user_id_1,
        created_at: friendship.created_at,
        friend_profile: friendProfile
      };
    });
    
    return NextResponse.json({
      success: true,
      data: {
        friends: friendsList,
        count: friendsList.length
      }
    });
  } catch (error: any) {
    console.error('Error fetching friends list:', error);
    return formatErrorResponse(error);
  }
} 