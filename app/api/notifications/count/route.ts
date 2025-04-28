import { createSupabaseServerClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    // Use the stored function to get unread count
    const { data, error } = await supabase
      .rpc('get_unread_notification_count', {
        user_id_param: session.user.id
      });
    
    if (error) throw error;
    
    return NextResponse.json({ count: data });
  } catch (error) {
    console.error('Error fetching notification count:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notification count' }, 
      { status: 500 }
    );
  }
} 