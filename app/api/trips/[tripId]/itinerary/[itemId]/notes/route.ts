import { createSupabaseServerClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string; itemId: string }> }
) {
  try {
    const { tripId, itemId } = await params;
    const supabase = await createSupabaseServerClient();
    const { content } = await request.json();

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify the user is a member of this trip
    const { data: membership, error: membershipError } = await supabase
      .from('trip_members')
      .select('role')
      .eq('trip_id', tripId)
      .eq('user_id', session.user.id)
      .maybeSingle();

    if (membershipError || !membership) {
      return NextResponse.json({ error: "You don't have access to this trip" }, { status: 403 });
    }

    // Verify the item exists and belongs to the trip
    const { data: item, error: itemError } = await supabase
      .from('itinerary_items')
      .select('id')
      .eq('id', itemId)
      .eq('trip_id', tripId)
      .single();

    if (itemError || !item) {
      return NextResponse.json(
        { error: "Item not found or doesn't belong to this trip" },
        { status: 404 }
      );
    }

    // Update the item notes
    const { data: updatedItem, error: updateError } = await supabase
      .from('itinerary_items')
      .update({ notes: content })
      .eq('id', itemId)
      .eq('trip_id', tripId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating notes:', updateError);
      return NextResponse.json({ error: 'Failed to update notes' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      item: updatedItem,
    });
  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
