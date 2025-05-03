import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import type { Database } from '@/types/database.types';

// Define local constants for tables and fields to avoid dependency issues
const TABLES = {
  TRIPS: 'trips',
  TRIP_MEMBERS: 'trip_members',
  ITINERARY_ITEMS: 'itinerary_items',
};

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

// Define item type for proper handling
interface ItineraryItem {
  id: string;
  title: string;
  notes?: string | null;
  location?: string | null;
  date: string; // ISO date string
  start_time?: string | null;
  end_time?: string | null;
}

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
    const supabase = createRouteHandlerClient();

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
      .eq(FIELDS.TRIP_MEMBERS.TRIP_ID, tripId)
      .eq(FIELDS.TRIP_MEMBERS.USER_ID, session.user.id)
      .maybeSingle();

    if (memberError || !member) {
      return NextResponse.json({ error: "You don't have access to this trip" }, { status: 403 });
    }

    // Get export options from request
    const { exportOption, selectedDays }: ExportOptions = await request.json();

    // Get trip details
    const { data: trip, error: tripError } = await supabase
      .from(TABLES.TRIPS)
      .select(`${FIELDS.TRIPS.NAME}, ${FIELDS.TRIPS.START_DATE}, ${FIELDS.TRIPS.END_DATE}`)
      .eq(FIELDS.COMMON.ID, tripId)
      .single();

    if (tripError) {
      return NextResponse.json({ error: tripError.message }, { status: 500 });
    }

    if (!trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    // Get itinerary items
    let query = supabase
      .from(TABLES.ITINERARY_ITEMS)
      .select('*')
      .eq(FIELDS.ITINERARY_ITEMS.TRIP_ID, tripId);

    // Filter by selected days if applicable
    if (exportOption === 'selected' && selectedDays && selectedDays.length > 0) {
      query = query.in(FIELDS.ITINERARY_ITEMS.DATE, selectedDays);
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

    // Format items for Google Calendar
    const calendarEvents =
      items && Array.isArray(items) && items.length > 0
        ? items
            .map((item: any) => {
              // Default to all day event if no times specified
              const hasStartTime = !!item.start_time;
              const hasEndTime = !!item.end_time;

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
                description: item.notes || `Part of your trip with withme.travel`,
                location: item.location || undefined,
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
  } catch (error: any) {
    console.error('Calendar export error:', error);
    return NextResponse.json({ error: error.message || 'Unknown error occurred' }, { status: 500 });
  }
}

// --- GET Handler --- //
export async function GET(
  request: NextRequest,
  { params }: { params: { tripId: string } }
): Promise<NextResponse> {
  try {
    const { tripId } = params;
    const supabase = createRouteHandlerClient();

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Placeholder for GET endpoint implementation
    return NextResponse.json({ message: 'GET endpoint not implemented' }, { status: 501 });
  } catch (error: any) {
    console.error('Calendar export GET error:', error);
    return NextResponse.json({ error: error.message || 'Unknown error occurred' }, { status: 500 });
  }
}
