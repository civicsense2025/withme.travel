import { createRouteHandlerClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// GET - Retrieve notification history for the current user
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createRouteHandlerClient();
    
    // Check if user is authenticated
    const { data, error: authError } = await supabase.auth.getSession();
    
    if (authError || !data.session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const userId = data.session.user.id;
    
    // Get query parameters
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10');
    const startFrom = (page - 1) * pageSize;
    
    // Get notification history for the user
    const { data: history, error, count } = await supabase
      .from('notification_history_details')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('archived_at', { ascending: false })
      .range(startFrom, startFrom + pageSize - 1);
    
    if (error) {
      console.error('Error fetching notification history:', error);
      return NextResponse.json(
        { error: 'Failed to fetch notification history' },
        { status: 500 }
      );
    }
    
    // Get user's notification stats
    const { data: stats, error: statsError } = await supabase
      .rpc('get_notification_stats', { p_user_id: userId });
    
    if (statsError) {
      console.error('Error fetching notification stats:', statsError);
    }
    
    return NextResponse.json({
      history,
      pagination: {
        page,
        pageSize,
        totalItems: count || 0,
        totalPages: count ? Math.ceil(count / pageSize) : 0,
      },
      stats: stats || null,
    });
  } catch (error) {
    console.error('Unexpected error in notifications history API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Archive notifications (move them to history)
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createRouteHandlerClient();
    
    // Check if user is authenticated
    const { data, error: authError } = await supabase.auth.getSession();
    
    if (authError || !data.session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const userId = data.session.user.id;
    
    // Parse request body
    const body = await request.json();
    const { notificationIds, archiveAll } = body;
    
    let archivedCount = 0;
    
    if (archiveAll) {
      // Archive all read notifications
      const { data: archiveData, error } = await supabase
        .rpc('archive_all_read_notifications', { p_user_id: userId });
      
      if (error) {
        console.error('Error archiving all notifications:', error);
        return NextResponse.json(
          { error: 'Failed to archive notifications' },
          { status: 500 }
        );
      }
      
      archivedCount = archiveData;
    } else if (notificationIds && Array.isArray(notificationIds) && notificationIds.length > 0) {
      // Archive specific notifications
      const { data: archiveData, error } = await supabase
        .rpc('batch_archive_notifications', { 
          user_id: userId,
          notification_ids: notificationIds
        });
      
      if (error) {
        console.error('Error archiving notifications:', error);
        return NextResponse.json(
          { error: 'Failed to archive notifications' },
          { status: 500 }
        );
      }
      
      archivedCount = archiveData;
    } else {
      return NextResponse.json(
        { error: 'Invalid request parameters' },
        { status: 400 }
      );
    }
    
    // Get updated notification stats
    const { data: stats } = await supabase
      .rpc('get_notification_stats', { p_user_id: userId });
    
    return NextResponse.json({
      success: true,
      archivedCount,
      stats: stats || null,
    });
  } catch (error) {
    console.error('Unexpected error in notifications archive API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Clear notification history
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createRouteHandlerClient();
    
    // Check if user is authenticated
    const { data, error: authError } = await supabase.auth.getSession();
    
    if (authError || !data.session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const userId = data.session.user.id;
    
    // Parse request body to check if we should delete specific IDs
    let historyIds: string[] = [];
    
    try {
      const body = await request.json();
      if (body.historyIds && Array.isArray(body.historyIds)) {
        historyIds = body.historyIds;
      }
    } catch (e) {
      // If no body or invalid JSON, assume we're deleting all
      historyIds = [];
    }
    
    let query = supabase
      .from('notification_history')
      .delete()
      .eq('user_id', userId);
    
    // If specific IDs are provided, only delete those
    if (historyIds.length > 0) {
      query = query.in('id', historyIds);
    }
    
    const { error } = await query;
    
    if (error) {
      console.error('Error clearing notification history:', error);
      return NextResponse.json(
        { error: 'Failed to clear notification history' },
        { status: 500 }
      );
    }
    
    // Get updated notification stats
    const { data: stats } = await supabase
      .rpc('get_notification_stats', { p_user_id: userId });
    
    return NextResponse.json({
      success: true,
      message: historyIds.length > 0 
        ? `Deleted ${historyIds.length} notifications from history` 
        : 'Notification history cleared',
      stats: stats || null,
    });
  } catch (error) {
    console.error('Unexpected error in notifications history delete API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 