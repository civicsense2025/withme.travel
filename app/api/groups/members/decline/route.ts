import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/utils/supabase-server';
import { FIELDS } from '@/utils/constants/tables';

export async function POST(request: Request) {
  const supabase = await getServerSupabase();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.redirect('/login');
  }
  const formData = await request.formData();
  const groupId = formData.get('groupId') as string;
  if (!groupId) {
    return NextResponse.json({ error: 'Group ID is required' }, { status: 400 });
  }
  // Set status to 'left' for this user
  const { error } = await supabase
    .from('group_members')
    .update({ status: 'left' })
    .eq('GROUP_ID', groupId)
    .eq('USER_ID', session.user.id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.redirect('/groups');
}
