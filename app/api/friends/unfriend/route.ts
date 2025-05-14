import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { TABLES } from '@/utils/constants/tables';
import { z } from 'zod';
import { ApiError, formatErrorResponse } from '@/lib/api-utils';

const unfriendSchema = z.object({
  friend_id: z.string().uuid(),
});

// POST /api/friends/unfriend - Remove a friend
export async function POST(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return formatErrorResponse(new ApiError('Unauthorized', 401));
    }

    // Parse request body
    const body = await request.json();
    const validatedData = unfriendSchema.parse(body);
    const { friend_id } = validatedData;

    // Find the friendship record
    const { data: friendship, error: friendshipError } = await supabase
      .from(TABLES.FRIENDS)
      .select('id')
      .or(
        `(user_id_1.eq.${user.id}.and.user_id_2.eq.${friend_id}).or.(user_id_1.eq.${friend_id}.and.user_id_2.eq.${user.id})`
      )
      .maybeSingle();

    if (friendshipError) {
      return formatErrorResponse(new ApiError('Failed to check friendship', 500));
    }

    if (!friendship) {
      return formatErrorResponse(new ApiError('Friendship not found', 404));
    }

    // Delete the friendship
    const { error: deleteError } = await supabase
      .from(TABLES.FRIENDS)
      .delete()
      .eq('id', friendship.id);

    if (deleteError) {
      return formatErrorResponse(new ApiError('Failed to remove friend', 500));
    }

    // Also delete any pending friend requests between these users
    await supabase
      .from(TABLES.FRIEND_REQUESTS)
      .delete()
      .or(
        `(sender_id.eq.${user.id}.and.receiver_id.eq.${friend_id}).or.(sender_id.eq.${friend_id}.and.receiver_id.eq.${user.id})`
      );

    return NextResponse.json({
      success: true,
      message: 'Friend removed successfully',
    });
  } catch (error: any) {
    console.error('Error removing friend:', error);
    return formatErrorResponse(error);
  }
}
