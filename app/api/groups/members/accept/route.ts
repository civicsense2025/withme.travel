import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/utils/supabase-server';

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
  const { error } = await supabase.rpc('accept_group_invitation', { p_group_id: groupId });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.redirect(`/groups/${groupId}`);
}
