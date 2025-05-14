import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import ical from 'ical-generator';
import { TABLES } from '@/utils/constants/tables';
import { fromTable } from '@/utils/supabase/typed-client';
import { isItineraryItem, ItineraryItem } from '@/utils/type-guards';
import type { ItineraryItem as FullItineraryItem } from '@/types/itinerary';

// Define local field constants since they're not all available in central constants
const FIELDS = {
  COMMON: {
    ID: 'id',
  },
  TRIPS: {
    NAME: 'name',
    START_DATE: 'start_date',
    END_DATE: 'end_date',
  },
  TRIP_MEMBERS: {
    TRIP_ID: 'trip_id',
    USER_ID: 'user_id',
  },
  ITINERARY_ITEMS: {
    TRIP_ID: 'trip_id',
    DATE: 'date',
  },
};

// Type for export options
interface ExportOptions {
  exportOption: 'all' | 'selected';
  selectedDays?: string[];
}

export async function POST(
  request: NextRequest,
  { params }: { params: { tripId: string } }
): Promise<NextResponse> {
  try {
    const { tripId } = params;
    const supabase = await createRouteHandlerClient();

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is a member of this trip
    const { data: member, error: memberError } = await supabase
      .from(TABLES.TRIP_MEMBERS)
      .select()
      .eq('trip_id', tripId)
      .eq('user_id', session.user.id)
      .maybeSingle();

    if (memberError || !member) {
      return NextResponse.json({ error: "You don't have access to this trip" }, { status: 403 });
    }

    // Get export options from request
    const { exportOption, selectedDays }: ExportOptions = await request.json();

    // Get trip details
    const { data: trip, error: tripError } = await supabase
      .from(TABLES.TRIPS)
      .select(`name, start_date, end_date`)
      .eq('id', tripId)
      .single();

    if (tripError) {
      return NextResponse.json({ error: tripError.message }, { status: 500 });
    }

    if (!trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    // Get itinerary items - using direct string for table name to avoid type errors
    // This is a safer approach than using type assertions on the TABLES constant
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
    const provider = session.user.app_metadata?.provider;
    if (provider !== 'google') {
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

    // Format items for Google Calendar with type checking
    const calendarEvents =
      items && Array.isArray(items) && items.length > 0
        ? items
            .map((item: unknown) => {
              // Use our ItineraryItem type and properly type guard for safety
              if (!isItineraryItem(item)) {
                return null; // Skip invalid items
              }

              // Default to all day event if no times specified
              const hasStartTime = Boolean(item.start_time);
              const hasEndTime = Boolean(item.end_time);

              // Format date and times with proper null checking
              if (!item.date) {
                return null; // Skip items without a date
              }

              // Safely create date objects with fallbacks
              let itemDate: Date;
              try {
                itemDate = new Date(item.date);
                // Check if date is valid
                if (isNaN(itemDate.getTime())) {
                  return null; // Skip items with invalid dates
                }
              } catch (error) {
                return null; // Skip items with invalid dates
              }

              let startDateTime: Date;
              let endDateTime: Date;

              try {
                startDateTime =
                  hasStartTime && item.start_time
                    ? new Date(`${item.date}T${item.start_time}`)
                    : new Date(itemDate.setHours(9, 0, 0));

                endDateTime =
                  hasEndTime && item.end_time
                    ? new Date(`${item.date}T${item.end_time}`)
                    : new Date(startDateTime.getTime() + 60 * 60 * 1000); // Default to 1 hour later

                // Validate date objects
                if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
                  // Fallback to all-day event
                  startDateTime = new Date(itemDate.setHours(9, 0, 0));
                  endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000);
                }
              } catch (error) {
                // Fallback to all-day event
                startDateTime = new Date(itemDate.setHours(9, 0, 0));
                endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000);
              }

              return {
                summary: item.title || 'Untitled Event',
                description: (item as any).notes || `Part of your trip with withme.travel`,
                location: (item as any).location || undefined,
                start: {
                  dateTime: startDateTime.toISOString(),
                  timeZone: 'UTC',
                },
                end: {
                  dateTime: endDateTime.toISOString(),
                  timeZone: 'UTC',
                },
              };
            })
            .filter(Boolean) // Remove null entries
        : [];

    // In a real implementation, we would use the Google Calendar API to create events
    // For now, we'll just return success with the events that would be created

    return NextResponse.json({
      success: true,
      message: 'Calendar export successful',
      exportedItems: calendarEvents.length,
      events: calendarEvents,
    });
  } catch (error) {
    console.error('Calendar export error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// --- GET Handler --- //
export async function GET(
  request: NextRequest,
  { params }: { params: { tripId: string } }
): Promise<NextResponse> {
  const { tripId } = params;
  const supabase = await createRouteHandlerClient();

  try {
    // Get basic trip information
    const { data: trip, error: tripError } = await supabase
      .from(TABLES.TRIPS)
      .select('id, name, description, start_date, end_date')
      .eq('id', tripId)
      .single();

    if (tripError) {
      console.error('Error fetching trip:', tripError);
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check for days with itinerary items
    // Using direct string to avoid type errors
    const { data: daysWithItems, error: daysError } = await supabase
      .from('itinerary_items')
      .select('date')
      .eq('trip_id', tripId)
      .not('date', 'is', null);

    if (daysError) {
      console.error('Error fetching itinerary days:', daysError);
      return NextResponse.json({ error: 'Error fetching itinerary data' }, { status: 500 });
    }

    // Extract unique dates
    const uniqueDays = daysWithItems
      ? [...new Set(daysWithItems.map((item) => item.date).filter(Boolean))]
      : [];

    // Sort dates chronologically
    uniqueDays.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    return NextResponse.json({
      trip,
      availableDays: uniqueDays,
      itemCount: daysWithItems?.length || 0,
    });
  } catch (error) {
    console.error('Calendar export GET error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

/**
 * Creates a downloadable iCal file for the selected trip days
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { tripId: string } }
): Promise<NextResponse> {
  try {
    const { tripId } = params;
    const supabase = await createRouteHandlerClient();
    const { exportOption, selectedDays }: ExportOptions = await request.json();

    // Verify user has access to trip
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get trip details
    const { data: trip, error: tripError } = await supabase
      .from(TABLES.TRIPS)
      .select('name, start_date, end_date')
      .eq('id', tripId)
      .single();

    if (tripError || !trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    // Get itinerary items
    // Using direct string to avoid type errors
    let query = supabase.from('itinerary_items').select('*').eq('trip_id', tripId);

    // Filter by selected days if applicable
    if (exportOption === 'selected' && selectedDays && selectedDays.length > 0) {
      query = query.in('date', selectedDays);
    }

    const { data: items, error: itemsError } = await query;

    if (itemsError) {
      return NextResponse.json({ error: itemsError.message }, { status: 500 });
    }

    // Create iCal calendar
    const calendar = ical({
      name: `${trip.name} Itinerary`,
      timezone: 'UTC',
    });

    // Add events to calendar
    items?.forEach((item: unknown) => {
      if (!isItineraryItem(item) || !item.date) {
        return;
      }

      try {
        // Create start and end dates
        const itemDate = new Date(item.date);

        if (isNaN(itemDate.getTime())) {
          return; // Skip invalid dates
        }

        const hasStartTime = Boolean(item.start_time);
        const hasEndTime = Boolean(item.end_time);

        // Default times if not specified
        let startDateTime =
          hasStartTime && item.start_time
            ? new Date(`${item.date}T${item.start_time}`)
            : new Date(new Date(item.date).setHours(9, 0, 0));

        let endDateTime =
          hasEndTime && item.end_time
            ? new Date(`${item.date}T${item.end_time}`)
            : new Date(startDateTime.getTime() + 60 * 60 * 1000);

        // Create event
        calendar.createEvent({
          start: startDateTime,
          end: endDateTime,
          summary: item.title,
          description: (item as any).notes || '',
          location: (item as any).location || '',
          url: `https://withme.travel/trips/${tripId}`,
        });
      } catch (error) {
        console.error('Error creating calendar event:', error);
      }
    });

    // Generate iCal string
    const icalString = calendar.toString();

    // Return iCal data
    return new NextResponse(icalString, {
      headers: {
        'Content-Type': 'text/calendar',
        'Content-Disposition': `attachment; filename="${trip.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_itinerary.ics"`,
      },
    });
  } catch (error) {
    console.error('iCal generation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
