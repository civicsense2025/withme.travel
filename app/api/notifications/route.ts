import { createRouteHandlerClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createRouteHandlerClient();
    
    // Get user information
    const { data, error: authError } = await supabase.auth.getUser();
    if (authError) {
      console.error('Authentication error:', authError);
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
    }
    
    if (!data.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    const userId = data.user.id;

    // Parse query parameters
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams?.get('limit') || '20');
    const offset = parseInt(url.searchParams?.get('offset') || '0');
    const unreadOnly = url.searchParams?.get('unread_only') === 'true';

    // Defensive fallback - provide empty notifications if anything fails
    let notifications = [];
    let totalCount = 0;

    try {
      // First attempt - with sender join
      const query = supabase
        .from('notifications')
        .select(`*, sender:sender_id (name, avatar_url)`)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (unreadOnly) {
        query.eq('read', false);
      }

      const result = await query.range(offset, offset + limit - 1).limit(limit);
      
      if (result.error) {
        console.error('Error in first query attempt:', result.error);
        
        // Second attempt - without join if first one fails
        const fallbackResult = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1)
          .limit(limit);
        
        if (fallbackResult.error) {
          console.error('Error in fallback query:', fallbackResult.error);
          // Continue with empty notifications
        } else {
          notifications = fallbackResult.data || [];
        }
      } else {
        notifications = result.data || [];
      }

      // Get total count for pagination
      const countQuery = supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId);
      
      if (unreadOnly) {
        countQuery.eq('read', false);
      }
      
      const { count, error: countError } = await countQuery;
      
      if (countError) {
        console.error('Error fetching count:', countError);
      } else {
        totalCount = count || 0;
      }
    } catch (e) {
      console.error('Unexpected error in notifications query:', e);
      // Continue with empty notifications
    }

    // Always return a valid response, even if queries failed
    return NextResponse.json({
      notifications,
      pagination: {
        total: totalCount,
        offset,
        limit,
      },
    });
  } catch (error) {
    console.error('Top-level error in notifications API:', error);
    return NextResponse.json({ 
      error: 'An unexpected error occurred',
      notifications: [],
      pagination: {
        total: 0,
        offset: 0,
        limit: 20,
      }
    }, { status: 200 }); // Return 200 with empty data instead of 500
  }
}

export async function PATCH(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createRouteHandlerClient();
    
    // Get user information
    const { data, error: authError } = await supabase.auth.getUser();
    if (authError) {
      console.error('Authentication error:', authError);
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
    }
    
    if (!data.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (error) {
      console.error('Error parsing request body:', error);
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
    
    const { notificationIds, read = true } = body;
    
    if (!notificationIds || !Array.isArray(notificationIds) || notificationIds.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request. Expected non-empty notificationIds array.' },
        { status: 400 }
      );
    }
    
    // Update notifications
    const { data: updatedData, error } = await supabase
      .from('notifications')
      .update({ read })
      .eq('user_id', data.user.id)
      .in('id', notificationIds)
      .select();
    
    if (error) {
      console.error('Error updating notifications:', error);
      return NextResponse.json({ error: 'Failed to update notifications', updated: [] }, { status: 200 });
    }
    
    return NextResponse.json({ updated: updatedData || [] });
  } catch (error) {
    console.error('Top-level error in PATCH notifications API:', error);
    return NextResponse.json({ 
      error: 'An unexpected error occurred',
      updated: [] 
    }, { status: 200 }); // Return 200 with empty data instead of 500
  }
}
