import { createRouteHandlerClient } from '@/utils/supabase/server';
import { NextResponse, type NextRequest } from 'next/server';
import { TABLES } from '@/utils/constants/tables';
import { TRIP_ROLES } from '@/utils/constants/status';
import { nanoid } from 'nanoid';

// POST /api/trips/create-from-template/[templateId]
export async function POST(
  request: NextRequest,
  { params }: { params: { templateId: string } }
): Promise<NextResponse> {
  const { templateId } = params;

  if (!templateId) {
    return NextResponse.json({ error: 'Template ID is required' }, { status: 400 });
  }

  try {
    // Create the Supabase client - must be awaited
    const supabase = await createRouteHandlerClient();

    // Verify authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const userId = user.id;

    // Parse request body
    const body = await request.json();
    const tripName = body.name || 'New Trip';

    // 1. Fetch the template details
    const { data: template, error: templateError } = await supabase
      .from(TABLES.ITINERARY_TEMPLATES)
      .select(
        `
        id,
        title,
        description,
        destination_id,
        duration_days,
        tags
      `
      )
      .eq('id', templateId)
      .single();

    if (templateError || !template) {
      console.error('Error fetching template:', templateError);
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    // 2. Create a new trip
    const { data: trip, error: tripError } = await supabase
      .from(TABLES.TRIPS)
      .insert({
        name: tripName,
        description: template.description,
        primary_city_id: template.destination_id,
        created_by: userId,
        // No start/end dates initially
      })
      .select('*')
      .single();

    if (tripError || !trip) {
      console.error('Error creating trip:', tripError);
      return NextResponse.json({ error: 'Failed to create trip' }, { status: 500 });
    }

    // Insert into trip_cities for multi-city support
    if (template.destination_id) {
      await supabase.from('trip_cities').insert({
        trip_id: trip.id,
        city_id: template.destination_id,
        position: 1,
      });
    }

    // 3. Add the user as a trip member with admin role
    const { error: memberError } = await supabase.from(TABLES.TRIP_MEMBERS).insert({
      trip_id: trip.id,
      user_id: userId,
      role: TRIP_ROLES.ADMIN,
      joined_at: new Date().toISOString(),
    });

    if (memberError) {
      console.error('Error adding trip member:', memberError);
      // Continue anyway since the trip was created
    }

    // 4. Fetch template sections and items
    const { data: templateSections, error: sectionsError } = await supabase
      .from('itinerary_template_sections')
      .select(
        `
        id,
        day_number,
        title,
        position,
        itinerary_template_items (*)
      `
      )
      .eq('template_id', templateId)
      .order('day_number', { ascending: true });

    if (sectionsError) {
      console.error('Error fetching template sections:', sectionsError);
      // Return the trip even if we couldn't fetch items
      return NextResponse.json({
        trip,
        message: 'Trip created, but failed to copy template items',
      });
    }

    // 5. Create trip sections
    if (templateSections && templateSections.length > 0) {
      const tripSections = templateSections.map((section: any) => ({
        trip_id: trip.id,
        day_number: section.day_number,
        title: section.title,
        position: section.position,
      }));

      const { error: insertSectionsError } = await supabase
        .from('itinerary_sections')
        .insert(tripSections);

      if (insertSectionsError) {
        console.error('Error creating trip sections:', insertSectionsError);
      }

      // 6. Process items from all sections
      const allItems = templateSections.flatMap((section: any) => {
        // TypeScript doesn't handle nested properties from Supabase queries well
        // We need to cast to access the nested property
        const items = (section.itinerary_template_items as any[]) || [];

        return items.map((item) => ({
          trip_id: trip.id,
          day_number: section.day_number,
          title: item.title,
          description: item.description,
          location: item.location,
          category: item.category,
          start_time: item.start_time,
          end_time: item.end_time,
          duration_minutes: item.duration_minutes,
          position: item.position || item.item_order,
          status: 'suggested',
          created_by: userId,
        }));
      });

      if (allItems.length > 0) {
        const { error: itemsError } = await supabase.from(TABLES.ITINERARY_ITEMS).insert(allItems);

        if (itemsError) {
          console.error('Error creating trip items:', itemsError);
        }
      }
    }

    // 7. Return the created trip
    return NextResponse.json({
      success: true,
      tripId: trip.id,
      message: 'Trip created successfully from template',
    });
  } catch (error) {
    console.error('Error creating trip from template:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
