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
  // Upsert group_members row
  const { error } = await supabase.from('group_members').upsert(
    {
      group_id: groupId,
      user_id: session.user.id,
      status: 'invited',
      role: 'member',
    },
    { onConflict: 'group_id,user_id' }
  );
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.redirect(`/groups/${groupId}`);
}
