import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { TABLE_NAMES } from '@/utils/constants/tables';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createRouteHandlerClient();
  const { id } = params;

  try {
    // Get the destination
    const { data, error } = await supabase
      .from(TABLE_NAMES.DESTINATIONS)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching destination:', error);
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Destination not found' }, { status: 404 });
      }
      return NextResponse.json({ error: 'Failed to fetch destination' }, { status: 500 });
    }

    // Return the destination data
    return NextResponse.json({ destination: data });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
