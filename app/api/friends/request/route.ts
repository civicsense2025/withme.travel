import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { TABLES } from '@/utils/constants/tables';
import { z } from 'zod';
import { ApiError, formatErrorResponse } from '@/lib/api-utils';

const requestSchema = z.object({
  receiver_id: z.string().uuid(),
});

// POST /api/friends/request - Send a friend request
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
    const validatedData = requestSchema.parse(body);
    const { receiver_id } = validatedData;

    // Prevent self-requests
    if (receiver_id === user.id) {
      return formatErrorResponse(new ApiError('Cannot send friend request to yourself', 400));
    }

    // Check if receiver profile exists
    const { data: receiverProfile, error: profileError } = await supabase
      .from(TABLES.PROFILES)
      .select('id, full_name')
      .eq('id', receiver_id)
      .maybeSingle();

    if (profileError || !receiverProfile) {
      return formatErrorResponse(new ApiError('User not found', 404));
    }

    // Check for existing requests
    const { data: existingRequest, error: checkError } = await supabase
      .from(TABLES.FRIEND_REQUESTS)
      .select('*')
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .or(`sender_id.eq.${receiver_id},receiver_id.eq.${receiver_id}`)
      .maybeSingle();

    if (checkError) {
      return formatErrorResponse(new ApiError('Failed to check existing requests', 500));
    }

    if (existingRequest) {
      return formatErrorResponse(
        new ApiError('A friend request already exists between these users', 400)
      );
    }

    // Check if already friends
    const { data: existingFriendship, error: friendshipError } = await supabase
      .from(TABLES.FRIENDS)
      .select('*')
      .or(
        `(user_id_1.eq.${user.id}.and.user_id_2.eq.${receiver_id}).or.(user_id_1.eq.${receiver_id}.and.user_id_2.eq.${user.id})`
      )
      .maybeSingle();

    if (friendshipError) {
      return formatErrorResponse(new ApiError('Failed to check existing friendship', 500));
    }

    if (existingFriendship) {
      return formatErrorResponse(new ApiError('You are already friends with this user', 400));
    }

    // Create the friend request
    const { data: newRequest, error: insertError } = await supabase
      .from(TABLES.FRIEND_REQUESTS)
      .insert({
        sender_id: user.id,
        receiver_id,
        status: 'pending',
      })
      .select()
      .single();

    if (insertError) {
      return formatErrorResponse(new ApiError('Failed to create friend request', 500));
    }

    return NextResponse.json({ success: true, data: newRequest });
  } catch (error: any) {
    console.error('Error sending friend request:', error);
    return formatErrorResponse(error);
  }
}
