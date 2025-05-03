import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
): Promise<NextResponse> {
  try {
    const { token } = await params;
    const supabase = createRouteHandlerClient();

    const { data: invitation, error } = await supabase
      .from('invitations')
      .select('*')
      .eq('token', token)
      .single();

    if (error) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }

    return NextResponse.json({ invitation });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch invitation', details: error.message },
      { status: 500 }
    );
  }
}
