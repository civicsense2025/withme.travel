import { getTypedDbClient } from '@/utils/supabase/server';
import { handleQueryResult } from '@/utils/type-safety';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const db = await getTypedDbClient();

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!id || !uuidRegex.test(id)) {
      return NextResponse.json({ error: 'Invalid destination ID format' }, { status: 400 });
    }

    const { data, error } = await db.from('destinations').select('*').eq('id', id).single();
    const destination = handleQueryResult({ data, error });

    if (!destination) {
      return NextResponse.json({ error: 'Destination not found' }, { status: 404 });
    }

    return NextResponse.json({ destination });
  } catch (error: any) {
    console.error('Unexpected error in destination fetch:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
