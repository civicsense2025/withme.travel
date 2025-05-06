import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; planId: string } }
) {
  try {
    const supabase = await createRouteHandlerClient();
    const { data: session } = await supabase.auth.getSession();

    if (!session?.session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id: groupId, planId } = params;
    const { tripId, destinationId } = await request.json();

    // Check if user is member of the group
    const { data: membership, error: membershipError } = await supabase
      .from('group_members')
      .select('user_id')
      .eq('group_id', groupId)
      .eq('user_id', session.session.user.id)
      .single();

    if (membershipError || !membership) {
      return NextResponse.json(
        { error: 'You are not a member of this group' },
        { status: 403 }
      );
    }

    // Check if plan exists and belongs to the group
    const { data: plan, error: planError } = await supabase
      .from('group_idea_plans')
      .select('id')
      .eq('id', planId)
      .eq('group_id', groupId)
      .single();

    if (planError || !plan) {
      return NextResponse.json(
        { error: 'Plan not found or does not belong to this group' },
        { status: 404 }
      );
    }

    // If no tripId is provided, create a new trip
    let newTripId = tripId;
    if (!newTripId) {
      // Get plan name to use as trip title
      const { data: planData } = await supabase
        .from('group_idea_plans')
        .select('name')
        .eq('id', planId)
        .single();

      // Get destination ID from the group if not provided
      let destId = destinationId;
      if (!destId) {
        const { data: groupData } = await supabase
          .from('groups')
          .select('destination_id')
          .eq('id', groupId)
          .single();

        destId = groupData?.destination_id;
      }

      // Create a new trip
      const { data: newTrip, error: newTripError } = await supabase.rpc(
        'create_trip_with_owner',
        {
          p_title: planData?.name || 'Trip from Ideas',
          p_description: 'Created from group idea board',
          p_destination_id: destId,
          p_user_id: session.session.user.id
        }
      );

      if (newTripError || !newTrip?.id) {
        return NextResponse.json(
          { error: 'Failed to create trip' },
          { status: 500 }
        );
      }

      newTripId = newTrip.id;
    }

    // Call the database function to convert ideas to itinerary items
    const { data: itineraryItems, error: conversionError } = await supabase.rpc(
      'convert_ideas_to_itinerary_items',
      {
        p_trip_id: newTripId,
        p_plan_id: planId
      }
    );

    if (conversionError) {
      return NextResponse.json(
        { error: 'Failed to convert ideas to itinerary items' },
        { status: 500 }
      );
    }

    // Get the created trip details to return
    const { data: trip, error: tripError } = await supabase
      .from('trips')
      .select(`
        id, 
        title, 
        description, 
        destination:destination_id(id, name)
      `)
      .eq('id', newTripId)
      .single();

    if (tripError) {
      return NextResponse.json(
        { error: 'Failed to retrieve trip details' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      trip,
      itemsCount: itineraryItems?.length || 0
    });
  } catch (error) {
    console.error('Error converting ideas to trip:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 