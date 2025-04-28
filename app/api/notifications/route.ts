import { createSupabaseServerClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const url = new URL(request.url);
  const limit = parseInt(url.searchParams.get('limit') || '20');
  const offset = parseInt(url.searchParams.get('offset') || '0');
  const unreadOnly = url.searchParams.get('unread_only') === 'true';
  
  try {
    let query = supabase
      .from('notifications')
      .select(`
        *,
        sender:sender_id (
          name,
          avatar_url
        )
      `)
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });
    
    if (unreadOnly) {
      query = query.eq('read', false);
    }
    
    const { data, error, count } = await query
      .range(offset, offset + limit - 1)
      .limit(limit);
    
    if (error) throw error;
    
    // Get total count for pagination
    const { count: totalCount, error: countError } = await supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', session.user.id)
      .eq('read', unreadOnly ? false : null);
      
    if (countError) throw countError;
    
    return NextResponse.json({
      notifications: data,
      pagination: {
        total: totalCount,
        offset,
        limit
      }
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' }, 
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Get notification IDs and read status from request
  const { notificationIds, read = true } = await request.json();
  
  // Validate request
  if (!notificationIds || !Array.isArray(notificationIds)) {
    return NextResponse.json(
      { error: 'Invalid request. Expected notificationIds array.' }, 
      { status: 400 }
    );
  }
  
  try {
    const { data, error } = await supabase
      .from('notifications')
      .update({ read })
      .eq('user_id', session.user.id)
      .in('id', notificationIds)
      .select();
    
    if (error) throw error;
    
    return NextResponse.json({ updated: data });
  } catch (error) {
    console.error('Error updating notifications:', error);
    return NextResponse.json(
      { error: 'Failed to update notifications' }, 
      { status: 500 }
    );
  }
} 