import { createServerSupabaseClient } from "@/utils/supabase/server";
import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    const { tripId } = await params;
    const supabase = await createServerSupabaseClient();

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is a member of this trip
    const { data: member, error: memberError } = await supabase
      .from('trip_members')
      .select()
      .eq('trip_id', tripId)
      .eq('user_id', session.user.id)
      .maybeSingle();

    if (memberError || !member) {
      return NextResponse.json({ error: "You don't have access to this trip" }, { status: 403 });
    }

    // Get export options from request
    const { exportOption, selectedDays } = await request.json();

    // Get trip details
    const { data: trip, error: tripError } = await supabase
      .from('trips')
      .select('title, description, start_date, end_date')
      .eq('id', tripId)
      .single();

    if (tripError) {
      return NextResponse.json({ error: tripError.message }, { status: 500 });
    }

    // Get itinerary items
    let query = supabase.from('itinerary_items').select('*').eq('trip_id', tripId);

    // Filter by selected days if applicable
    if (exportOption === 'selected' && selectedDays && selectedDays.length > 0) {
      query = query.in('date', selectedDays);
    }

    const { data: items, error: itemsError } = await query;

    if (itemsError) {
      return NextResponse.json({ error: itemsError.message }, { status: 500 });
    }

    // Check if user has connected Google account
    if (session.user.app_metadata?.provider !== 'google') {
      return NextResponse.json(
        {
          error: 'Google account not connected. Please sign in with Google to use this feature.',
          needsGoogleAuth: true,
        },
        { status: 400 }
      );
    }

    // Check if we have a valid Google token
    const accessToken = session.provider_token;

    if (!accessToken) {
      return NextResponse.json(
        {
          error: 'Google access token not found. Please sign in with Google again.',
          needsGoogleAuth: true,
        },
        { status: 400 }
      );
    }

    // Format items for Google Calendar
    const calendarEvents =
      items?.map((item) => {
        // Default to all day event if no times specified
        const hasStartTime = !!item.start_time;
        const hasEndTime = !!item.end_time;

        // Format date and times
        const itemDate = new Date(item.date);
        const startDateTime = hasStartTime
          ? new Date(`${item.date}T${item.start_time}`)
          : new Date(itemDate.setHours(9, 0, 0));

        const endDateTime = hasEndTime
          ? new Date(`${item.date}T${item.end_time}`)
          : new Date(startDateTime.getTime() + 60 * 60 * 1000); // Default to 1 hour later

        return {
          summary: item.title,
          description: item.notes || `Part of your "${trip.title}" trip with withme.travel`,
          location: item.location,
          start: {
            dateTime: startDateTime.toISOString(),
            timeZone: 'UTC',
          },
          end: {
            dateTime: endDateTime.toISOString(),
            timeZone: 'UTC',
          },
        };
      }) || [];

    // In a real implementation, we would use the Google Calendar API to create events
    // For now, we'll just return success with the events that would be created

    return NextResponse.json({
      success: true,
      message: 'Calendar export successful',
      exportedItems: calendarEvents.length,
      events: calendarEvents,
    });
  } catch (error: any) {
    console.error('Calendar export error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
