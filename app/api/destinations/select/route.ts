import { createServerSupabaseClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { destinationId } = await request.json();

    if (!destinationId) {
      return NextResponse.json({ error: 'Destination ID is required' }, { status: 400 });
    }

    const supabase = await createServerSupabaseClient();

    // First, call the increment_counter RPC
    const { data: newCounter, error: rpcError } = await supabase.rpc('increment_counter', {
      row_id: destinationId,
    });

    if (rpcError) {
      console.error('Error incrementing counter:', rpcError);
      // Continue with the update but log the error
    }

    // Then update the destination with the new timestamp and possibly the counter value
    const { error } = await supabase
      .from('destinations')
      .update({
        updated_at: new Date().toISOString(),
        // Only set popularity if we successfully got a new counter value
        ...(newCounter !== undefined && { popularity: newCounter }),
      })
      .eq('id', destinationId);

    if (error) {
      console.error('Error updating destination popularity:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Unexpected error in destination selection:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
