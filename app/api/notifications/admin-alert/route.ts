import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { createGroupNotification } from '../service';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient();
    // Admin authentication check
    const { data: userData, error: authError } = await supabase.auth.getUser();
    if (authError || !userData?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = userData.user.id;
    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();
    if (profileError || !profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admins only' }, { status: 403 });
    }
    const { title, content } = await req.json();
    if (!title || !content) {
      return NextResponse.json({ error: 'Missing title or content' }, { status: 400 });
    }
    // Get all user IDs
    const { data: users, error } = await supabase
      .from('users')
      .select('id');
    if (error || !users) {
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
    const userIds = users.map((u: { id: string }) => u.id);
    if (!userIds.length) {
      return NextResponse.json({ error: 'No users found' }, { status: 404 });
    }
    const result = await createGroupNotification(userIds, {
      notificationType: 'admin_alert',
      title,
      content,
      priority: 'high',
    });
    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Failed to send notifications' }, { status: 500 });
    }
    return NextResponse.json({ success: true, count: result.count });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Error sending admin alert' }, { status: 500 });
  }
} 