import { createApiClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createApiClient();

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!id || !uuidRegex.test(id)) {
      return NextResponse.json({ error: 'Invalid destination ID format' }, { status: 400 });
    }

    const { data, error } = await supabase.from('destinations').select('*').eq('id', id).single();

    if (error) {
      return NextResponse.json({ error: 'Error fetching destination' }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'Destination not found' }, { status: 404 });
    }

    return NextResponse.json({ destination: data });
  } catch (error: any) {
    console.error('Unexpected error in destination fetch:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
