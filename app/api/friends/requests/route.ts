import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { TABLES } from '@/utils/constants/tables';
import { ApiError, formatErrorResponse } from '@/lib/api-utils';

type RequestType = 'received' | 'sent' | 'all';

// GET /api/friends/requests - List friend requests
export async function GET(request: NextRequest) {
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

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const type = (searchParams.get('type') as RequestType) || 'all';
    const status = searchParams.get('status') || 'pending';

    // Build the query based on the request type
    let query = supabase.from(TABLES.FRIEND_REQUESTS).select(`
      *,
      sender_profile:profiles!${TABLES.FRIEND_REQUESTS}_sender_id_fkey(id, full_name, avatar_url),
      receiver_profile:profiles!${TABLES.FRIEND_REQUESTS}_receiver_id_fkey(id, full_name, avatar_url)
    `);

    // Filter by request type
    if (type === 'received') {
      query = query.eq('receiver_id', user.id);
    } else if (type === 'sent') {
      query = query.eq('sender_id', user.id);
    } else {
      // For 'all', get both sent and received
      query = query.or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);
    }

    // Filter by status if provided
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    // Order by creation date
    query = query.order('created_at', { ascending: false });

    const { data: requests, error: requestsError } = await query;

    if (requestsError) {
      return formatErrorResponse(new ApiError('Failed to fetch friend requests', 500));
    }

    return NextResponse.json({
      success: true,
      data: {
        requests: requests || [],
        count: requests?.length || 0,
      },
    });
  } catch (error: any) {
    console.error('Error fetching friend requests:', error);
    return formatErrorResponse(error);
  }
}
