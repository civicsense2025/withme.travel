import { createServerSupabaseClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const supabase = createServerSupabaseClient();
  const { data, error: authError } = await supabase.auth.getSession();

  if (authError || !data.session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Use the stored function to get unread count
    const { data: countData, error } = await supabase.rpc('get_unread_notification_count', {
      user_id_param: data.session.user.id,
    });

    if (error) throw error;

    return NextResponse.json({ count: countData });
  } catch (error) {
    console.error('Error fetching notification count:', error);
    return NextResponse.json({ error: 'Failed to fetch notification count' }, { status: 500 });
  }
}
