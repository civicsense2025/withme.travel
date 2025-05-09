import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { TABLES, ENUMS } from '@/utils/constants/database';
import { z } from 'zod';
import { ApiError, formatErrorResponse } from '@/lib/api-utils';
import { NOTIFICATION_TYPES } from '@/utils/constants/status';

const responseSchema = z.object({
  request_id: z.string().uuid(),
  action: z.enum(['accept', 'decline']),
});

// POST /api/friends/respond - Accept or decline a friend request
export async function POST(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return formatErrorResponse(new ApiError('Unauthorized', 401));
    }
    
    // Parse request body
    const body = await request.json();
    const validatedData = responseSchema.parse(body);
    const { request_id, action } = validatedData;
    
    // Find the friend request
    const { data: friendRequest, error: requestError } = await supabase
      .from(TABLES.FRIEND_REQUESTS)
      .select('id, sender_id, receiver_id, status')
      .eq('id', request_id)
      .single();
    
    if (requestError || !friendRequest) {
      return formatErrorResponse(new ApiError('Friend request not found', 404));
    }
    
    // Verify that the current user is the receiver
    if (friendRequest.receiver_id !== user.id) {
      return formatErrorResponse(new ApiError('You are not authorized to respond to this request', 403));
    }
    
    // Verify that the request is still pending
    if (friendRequest.status !== ENUMS.FRIEND_REQUEST_STATUS.PENDING) {
      return formatErrorResponse(new ApiError('This request has already been processed', 400));
    }
    
    // Update the request status based on the action
    const status = action === 'accept' 
      ? ENUMS.FRIEND_REQUEST_STATUS.ACCEPTED 
      : ENUMS.FRIEND_REQUEST_STATUS.DECLINED;
    
    const { error: updateError } = await supabase
      .from(TABLES.FRIEND_REQUESTS)
      .update({ 
        status, 
        responded_at: new Date().toISOString() 
      })
      .eq('id', request_id);
    
    if (updateError) {
      return formatErrorResponse(new ApiError('Failed to update friend request', 500));
    }
    
    // If accepted, create the friendship record
    if (action === 'accept') {
      // Ensure user_id_1 is the smaller ID to maintain consistency
      const user_id_1 = friendRequest.sender_id < user.id 
        ? friendRequest.sender_id 
        : user.id;
      
      const user_id_2 = friendRequest.sender_id < user.id 
        ? user.id 
        : friendRequest.sender_id;
      
      const { error: friendshipError } = await supabase
        .from(TABLES.FRIENDS)
        .insert({
          user_id_1,
          user_id_2,
        });
      
      if (friendshipError) {
        return formatErrorResponse(new ApiError('Failed to create friendship', 500));
      }
      
      // Get receiver (current user) profile for notification
      const { data: receiverProfile } = await supabase
        .from(TABLES.PROFILES)
        .select('full_name')
        .eq('id', user.id)
        .single();
        
      // Create notification for the sender that the request was accepted
      await supabase.from(TABLES.NOTIFICATIONS).insert({
        user_id: friendRequest.sender_id,
        type: NOTIFICATION_TYPES.FRIEND_REQUEST_ACCEPTED,
        data: {
          receiver_id: user.id,
          receiver_name: receiverProfile?.full_name || 'Someone',
          request_id,
        },
        read: false,
      });
    }
    
    return NextResponse.json({ 
      success: true, 
      data: { 
        request_id,
        action,
        status
      } 
    });
  } catch (error: any) {
    console.error('Error responding to friend request:', error);
    return formatErrorResponse(error);
  }
} 