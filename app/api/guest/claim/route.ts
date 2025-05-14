import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { TABLES } from '@/utils/constants/tables';

export async function POST(request: Request) {
  try {
    const supabase = await createRouteHandlerClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = user.id;
    const { guest_token, group_id } = await request.json();
    if (!guest_token || !group_id) {
      return NextResponse.json({ error: 'Missing guest_token or group_id' }, { status: 400 });
    }
    // 1. Update group_members: set user_id where guest_token matches
    const { error: memberError } = await supabase
      .from('group_members')
      .update({ user_id: userId, guest_token: null })
      .eq('group_id', group_id)
      .eq('guest_token', guest_token);
    if (memberError) {
      return NextResponse.json({ error: memberError.message }, { status: 500 });
    }
    // 2. Update group_ideas: set created_by where guest_token matches
    await supabase
      .from('group_plan_ideas')
      .update({ created_by: userId, guest_token: null })
      .eq('group_id', group_id)
      .eq('guest_token', guest_token);
    // 3. Update comments: set user_id where guest_token matches
    await supabase
      .from('comments')
      .update({ user_id: userId, guest_token: null })
      .eq('group_id', group_id)
      .eq('guest_token', guest_token);
    // 4. If only one member, set role to owner
    const { data: members } = await supabase
      .from('group_members')
      .select('*')
      .eq('group_id', group_id)
      .eq('status', 'active');
    if (members && members.length === 1) {
      await supabase
        .from('group_members')
        .update({ role: 'owner' })
        .eq('group_id', group_id)
        .eq('user_id', userId);
    }
    // Optionally: clear guest token cookie
    const cookieStore = await cookies();
    cookieStore.delete('guest_group_token');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API] Error in guest claim:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
