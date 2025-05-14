import { createRouteHandlerClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { TABLES } from '@/utils/constants/tables';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const id = params.id;
  const supabase = await createRouteHandlerClient();

  try {
    // Check if user is authenticated and has admin role
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', session.user.id)
      .single();

    if (profileError || !profile || !profile.is_admin) {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 403 });
    }

    // Delete the feedback item
    const { error } = await supabase.from(TABLES.FEEDBACK).delete().eq('id', id);

    if (error) {
      console.error('Error deleting feedback:', error);
      return NextResponse.json({ error: 'Failed to delete feedback' }, { status: 500 });
    }

    return NextResponse.redirect(new URL('/admin/feedback', request.url));
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
